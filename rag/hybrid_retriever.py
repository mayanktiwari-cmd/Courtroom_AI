"""
Hybrid Retriever — BM25 + Dense (Chroma) combined.
Uses rank_bm25 directly and Reciprocal Rank Fusion (RRF) for zero pydantic conflicts.
BM25 handles exact statutory references (IPC 302, Section 438 CrPC).
Dense handles semantic similarity for contextual legal arguments.
"""

import re
from typing import List, Dict

import numpy as np
from rank_bm25 import BM25Okapi
from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from langchain_chroma import Chroma
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings

CHROMA_DIR = "data/chroma_db"
COLLECTION_NAME = "courtroom_judgments"
EMBEDDING_MODEL = "BAAI/bge-base-en-v1.5"


class BGEEmbeddings:
    """Wrapper to use SentenceTransformer with LangChain Chroma."""
    def __init__(self, model):
        self.model = model

    def embed_documents(self, texts):
        prefixed = [f"Represent this legal document: {t}" for t in texts]
        return self.model.encode(prefixed).tolist()

    def embed_query(self, text):
        prefixed = f"Represent this legal query for retrieving relevant documents: {text}"
        return self.model.encode([prefixed])[0].tolist()


class DirectBM25Retriever(BaseRetriever):
    """
    BM25 retriever using rank_bm25 directly.
    """
    docs: List[Document] = []
    k: int = 10
    _bm25: BM25Okapi = None

    class Config:
        arbitrary_types_allowed = True
        underscore_attrs_are_private = True

    def __init__(self, docs: List[Document], k: int = 10, **kwargs):
        super().__init__(docs=docs, k=k, **kwargs)
        tokenized = [doc.page_content.lower().split() for doc in docs]
        self._bm25 = BM25Okapi(tokenized)

    def _get_relevant_documents(
        self, query: str, *, run_manager: CallbackManagerForRetrieverRun = None
    ) -> List[Document]:
        """Retrieve top-k documents ranked by BM25 score."""
        tokens = query.lower().split()
        scores = self._bm25.get_scores(tokens)
        top_indices = np.argsort(scores)[::-1][:self.k]
        return [self.docs[i] for i in top_indices if scores[i] > 0]


class ReciprocalRankEnsemble:
    """
    Combines BM25 and Dense retriever results using Reciprocal Rank Fusion (RRF).
    RRF score = sum(weight / (c + rank)) for each retriever.
    """
    def __init__(self, retrievers: list, weights: list = None, c: int = 60):
        self.retrievers = retrievers
        self.weights = weights or [0.5] * len(retrievers)
        self.c = c

    def invoke(self, query: str) -> List[Document]:
        rrf_scores: Dict[str, float] = {}
        doc_map: Dict[str, Document] = {}

        for retriever, weight in zip(self.retrievers, self.weights):
            if hasattr(retriever, 'invoke'):
                docs = retriever.invoke(query)
            else:
                docs = retriever._get_relevant_documents(query)

            for rank, doc in enumerate(docs):
                doc_id = doc.metadata.get("doc_id") or doc.page_content[:100]
                doc_map[doc_id] = doc

                score = weight / (self.c + rank + 1)
                rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + score

        # Sort by combined RRF score descending
        sorted_doc_ids = sorted(rrf_scores.keys(), key=lambda k: rrf_scores[k], reverse=True)
        return [doc_map[doc_id] for doc_id in sorted_doc_ids]


class LegalHybridRetriever:
    """
    Combines BM25 + semantic retrieval for legal queries.
    BM25 weight 0.4, Dense weight 0.6
    """

    def __init__(self, bm25_weight: float = 0.4, dense_weight: float = 0.6, k: int = 10):
        self.k = k
        self.bm25_weight = bm25_weight
        self.dense_weight = dense_weight
        print("[RETRIEVER] Loading embedding model...")
        self.model = SentenceTransformer(EMBEDDING_MODEL)
        self.embedding_fn = BGEEmbeddings(self.model)
        print("[RETRIEVER] Setting up retrievers...")
        self._setup_retrievers()
        print("[RETRIEVER] Ready.")

    def _setup_retrievers(self):
        # Load all docs from Chroma for BM25
        client = chromadb.PersistentClient(path=CHROMA_DIR)
        collection = client.get_collection(COLLECTION_NAME)
        data = collection.get(include=["documents", "metadatas"])

        if not data["documents"]:
            raise ValueError("Chroma DB is empty. Run embedder.py first.")

        print(f"[RETRIEVER] Loaded {len(data['documents'])} documents from Chroma")

        # Build LangChain Documents
        all_docs = [
            Document(page_content=text, metadata=meta or {})
            for text, meta in zip(data["documents"], data["metadatas"])
        ]

        # BM25
        self.bm25_retriever = DirectBM25Retriever(docs=all_docs, k=self.k)

        # Dense via Chroma
        self.dense_vectorstore = Chroma(
            client=client,
            collection_name=COLLECTION_NAME,
            embedding_function=self.embedding_fn,
        )
        self.dense_retriever = self.dense_vectorstore.as_retriever(
            search_kwargs={"k": self.k}
        )

        # RRF Ensemble
        self.ensemble = ReciprocalRankEnsemble(
            retrievers=[self.bm25_retriever, self.dense_retriever],
            weights=[self.bm25_weight, self.dense_weight],
        )

    def _clean_html(self, text: str) -> str:
        """Strip HTML tags from Indian Kanoon text."""
        clean = re.sub(r'<[^>]+>', '', text)
        clean = re.sub(r'&amp;', '&', clean)
        clean = re.sub(r'&nbsp;', ' ', clean)
        clean = re.sub(r'\s+', ' ', clean).strip()
        return clean

    def retrieve(self, query: str) -> List[Document]:
        docs = self.ensemble.invoke(query)
        # Clean HTML from all retrieved docs
        for doc in docs:
            doc.page_content = self._clean_html(doc.page_content)
        return docs
if __name__ == "__main__":
    retriever = LegalHybridRetriever()
    test_queries = [
        "bail application murder case IPC 302",
        "dowry harassment wife Section 498A",
        "cheating fraud IPC 420 conviction",
    ]
    for query in test_queries:
        print(f"\n{'='*50}")
        print(f"QUERY: {query}")
        results = retriever.retrieve(query)
        print(f"Retrieved: {len(results)} documents")
        for i, doc in enumerate(results[:2]):
            print(f"\n  [{i+1}] {doc.metadata.get('title', 'N/A')[:60]}")
            print(f"       Court: {doc.metadata.get('court', 'N/A')}")
            print(f"       Text: {doc.page_content[:120]}...")