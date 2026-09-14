"""
LangGraph Agent — orchestrates the 4 tools in a structured legal analysis workflow.

StateGraph with tool nodes:
  agent (LLM decision) → tools (execute) → agent (next decision) → ... → END

Uses Groq + Llama 3 70B for the agent's reasoning (routing decisions).
Individual tools use their own model configs (70B for legal reasoning, 8B for formatting).
"""

import os
import json
from typing import TypedDict, Annotated, Sequence

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from dotenv import load_dotenv

from agent.tools import ALL_TOOLS
from agent.prompts import SYSTEM_PROMPT, ANALYZE_INSTRUCTION

load_dotenv()


# ─────────────────────────────────────────────
# State Definition
# ─────────────────────────────────────────────
class AgentState(TypedDict):
    """State that flows through the LangGraph nodes."""
    messages: Annotated[Sequence[BaseMessage], add_messages]


# ─────────────────────────────────────────────
# Graph Construction
# ─────────────────────────────────────────────
def create_graph():
    """
    Build and compile the LangGraph agent.

    Flow:
        START → agent → should_continue? → tools → agent → ... → END

    The agent node calls the LLM which decides whether to invoke a tool
    or produce a final response. The tools node executes whichever tool
    the LLM selected.
    """

    # LLM with tool bindings — uses 70B for routing decisions
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.1,
        api_key=os.getenv("GROQ_API_KEY"),
    )
    llm_with_tools = llm.bind_tools(ALL_TOOLS)

    # --- Node: agent ---
    def agent_node(state: AgentState) -> dict:
        """LLM decides: call a tool or produce final answer."""
        messages = state["messages"]
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}

    # --- Node: tools ---
    tool_node = ToolNode(ALL_TOOLS)

    # --- Conditional edge ---
    def should_continue(state: AgentState) -> str:
        """If the last message has tool_calls, route to tools. Otherwise END."""
        last_message = state["messages"][-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        return END

    # --- Build graph ---
    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)

    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
    graph.add_edge("tools", "agent")

    return graph.compile()


# ─────────────────────────────────────────────
# Convenience runner
# ─────────────────────────────────────────────
def run_analysis(fir_text: str, perspective: str = "defense") -> dict:
    """
    Run the full legal analysis pipeline.

    Args:
        fir_text: Raw FIR text or case description
        perspective: "defense" or "prosecution"

    Returns:
        dict with keys: messages, final_response
    """
    graph = create_graph()

    instruction = ANALYZE_INSTRUCTION.format(
        fir_text=fir_text,
        perspective=perspective,
    )

    initial_state = {
        "messages": [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=instruction),
        ]
    }

    # Execute the graph
    result = graph.invoke(initial_state)

    # Extract the final response (last AI message without tool calls)
    final_message = result["messages"][-1]

    return {
        "messages": result["messages"],
        "final_response": final_message.content,
        "num_steps": len(result["messages"]),
    }


# ─────────────────────────────────────────────
# Quick test
# ─────────────────────────────────────────────
if __name__ == "__main__":
    test_fir = """
    FIR No. 234/2024
    Police Station: Sadar Bazaar, Delhi
    Under Sections 302, 120B IPC

    The complainant states that on 15.03.2024, the accused Rajesh Kumar
    along with two unknown persons entered the house of the deceased
    Mohan Lal and attacked him with sharp weapons. The deceased sustained
    multiple injuries and was declared dead on arrival at AIIMS hospital.
    The accused had a prior dispute over property with the deceased.
    Witnesses include the deceased's wife and a neighbor.
    """

    print("=" * 60)
    print("CourtroomAI — Legal Analysis Agent")
    print("=" * 60)

    result = run_analysis(test_fir, perspective="defense")

    print(f"\nTotal steps: {result['num_steps']}")
    print(f"\n{'='*60}")
    print("FINAL RESPONSE:")
    print("=" * 60)
    print(result["final_response"])
