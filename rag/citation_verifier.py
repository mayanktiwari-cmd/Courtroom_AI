"""
Citation Verifier — The Core Moat of CourtroomAI.
LLM-as-judge pattern: verifies that a retrieved judgment passage
actually supports the legal argument being made.
Prevents hallucinated or irrelevant citations from reaching the lawyer.
"""

import json
import logging
import os
from typing import List
from dataclasses import dataclass

from groq import Groq
from langchain_core.documents import Document
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


@dataclass
class VerificationResult:
    verdict: str          # "VERIFIED" or "REJECTED"
    reason: str           # one line explanation
    confidence: float     # 0.0 to 1.0
    passage: str          # the passage that was checked
    doc_metadata: dict    # court, date, doc_id


VERIFICATION_PROMPT = """You are a strict legal verification assistant.

Your job: determine if a retrieved judgment passage GENUINELY supports a legal argument.
Be strict. If the passage is tangentially related but doesn't directly support the argument, REJECT it.
Hallucinated or misleading citations in legal advice cause real harm.

Legal Argument: {argument}

Retrieved Judgment Passage:
{passage}

Source: {source} ({court}, {date})

Does this passage directly and genuinely support the legal argument above?

Respond ONLY in this exact JSON format, nothing else:
{{
    "verdict": "VERIFIED" or "REJECTED",
    "reason": "one sentence explanation of why",
    "confidence": 0.0 to 1.0
}}"""


class CitationVerifier:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "openai/gpt-oss-120b"  # 120B for accuracy — citation verification is critical

    def verify_single(self, argument: str, document: Document) -> VerificationResult:
        """Verify one passage against one argument."""
        meta = document.metadata
        prompt = VERIFICATION_PROMPT.format(
            argument=argument,
            passage=document.page_content[:800],  # cap to avoid token overflow
            source=meta.get("title", "Unknown"),
            court=meta.get("court", "Unknown Court"),
            date=meta.get("date", "Unknown Date"),
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,  # deterministic for verification tasks
                max_tokens=4000,
            )
            raw = response.choices[0].message.content.strip()
            if raw.startswith("```json"):
                raw = raw[7:-3].strip()
            elif raw.startswith("```"):
                raw = raw[3:-3].strip()

            # Parse JSON response
            result = json.loads(raw)
            return VerificationResult(
                verdict=result.get("verdict", "REJECTED"),
                reason=result.get("reason", "Could not parse reason"),
                confidence=float(result.get("confidence", 0.0)),
                passage=document.page_content,
                doc_metadata=meta,
            )

        except json.JSONDecodeError as e:
            logger.error(f"JSONDecodeError: {e}. Raw response: {raw}")
            # If LLM doesn't return valid JSON, default to REJECTED
            return VerificationResult(
                verdict="REJECTED",
                reason="Verification failed — could not parse LLM response",
                confidence=0.0,
                passage=document.page_content,
                doc_metadata=meta,
            )
        except Exception as e:
            return VerificationResult(
                verdict="REJECTED",
                reason=f"Verification error: {str(e)}",
                confidence=0.0,
                passage=document.page_content,
                doc_metadata=meta,
            )

    def verify_batch(
        self,
        argument: str,
        documents: List[Document],
        min_confidence: float = 0.6,
    ) -> List[VerificationResult]:
        """
        Verify multiple retrieved passages against an argument.
        Returns only VERIFIED results above confidence threshold.
        This is called by the LangGraph agent after retrieval + reranking.
        """
        results = []
        rejected_count = 0

        for doc in documents:
            result = self.verify_single(argument, doc)
            if result.verdict == "VERIFIED" and result.confidence >= min_confidence:
                results.append(result)
                logger.info(
                    f"VERIFIED: {doc.metadata.get('title', 'Unknown')[:50]} | "
                    f"confidence: {result.confidence}"
                )
            else:
                rejected_count += 1
                logger.info(
                    f"REJECTED: {doc.metadata.get('title', 'Unknown')[:50]} | "
                    f"{result.reason}"
                )

        logger.info(f"Verification complete: {len(results)} verified, {rejected_count} rejected")
        return results


if __name__ == "__main__":
    # Quick test
    verifier = CitationVerifier()

    test_doc = Document(
        page_content="""The Supreme Court held that bail cannot be denied merely 
        on the basis of the severity of the charge. The court must consider 
        flight risk, evidence tampering possibility, and criminal antecedents.""",
        metadata={
            "title": "State vs Ramesh Kumar 2019",
            "court": "Supreme Court of India",
            "date": "2019-03-15",
            "doc_id": "test_001",
        }
    )

    result = verifier.verify_single(
        argument="Bail should be granted as the accused has no prior criminal record",
        document=test_doc,
    )
    print(f"Verdict: {result.verdict}")
    print(f"Reason: {result.reason}")
    print(f"Confidence: {result.confidence}")
