"""AI-powered architecture analyzer using Azure OpenAI."""

from __future__ import annotations

import json
import os
from typing import Any

from openai import AzureOpenAI

from app.services.analyzer import analyze_architecture

SYSTEM_PROMPT = (
    "You are an expert distributed systems architect. Analyze the following "
    "system architecture and provide:\n"
    "1) warnings about potential issues\n"
    "2) suggestions for improvements\n"
    "3) scalability assessment\n"
    "4) reliability score (1-10)\n\n"
    "Return ONLY valid JSON with keys: warnings (list of strings), "
    "suggestions (list of strings), scalability_assessment (string), "
    "reliability_score (number), detailed_analysis (string)"
)


def _build_architecture_description(
    nodes: list[dict[str, Any]],
    edges: list[dict[str, Any]],
) -> str:
    """Convert nodes and edges into a human-readable text description."""
    lines: list[str] = ["Architecture Components:"]
    for node in nodes:
        label = node.get("label", "Unknown")
        node_type = node.get("node_type", "Unknown")
        config = node.get("config", {})
        line = f"- {label} (type: {node_type})"
        if config:
            line += f" [config: {json.dumps(config)}]"
        lines.append(line)

    lines.append("\nConnections:")
    if edges:
        for edge in edges:
            lines.append(
                f"- Node {edge.get('source_node')} -> Node {edge.get('target_node')}"
            )
    else:
        lines.append("- No connections defined")

    return "\n".join(lines)


def _get_azure_client() -> AzureOpenAI:
    """Create and return an AzureOpenAI client from environment variables."""
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")

    if not endpoint or not api_key:
        raise ValueError(
            "Azure OpenAI credentials are not configured. "
            "Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY "
            "environment variables."
        )

    # Extract base endpoint if a full URL with /openai/deployments/... was provided
    if "/openai/deployments/" in endpoint:
        endpoint = endpoint.split("/openai/deployments/")[0]

    return AzureOpenAI(
        azure_endpoint=endpoint,
        api_key=api_key,
        api_version=api_version,
    )


async def ai_analyze_architecture(
    nodes: list[dict[str, Any]],
    edges: list[dict[str, Any]],
) -> dict[str, Any]:
    """Analyze architecture using Azure OpenAI, with rule-based fallback.

    Returns a dict with keys:
        warnings, suggestions, scalability_assessment,
        reliability_score, detailed_analysis
    """
    try:
        client = _get_azure_client()
        deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")

        description = _build_architecture_description(nodes, edges)

        response = client.chat.completions.create(
            model=deployment,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": description},
            ],
            temperature=0.3,
            max_tokens=2000,
        )

        content = response.choices[0].message.content
        # Strip markdown code fences if present
        if content.strip().startswith("```"):
            content = content.strip()
            content = content.split("\n", 1)[1]  # remove opening fence line
            if content.endswith("```"):
                content = content[: -len("```")]

        result = json.loads(content)

        # Validate expected keys
        return {
            "warnings": result.get("warnings", []),
            "suggestions": result.get("suggestions", []),
            "scalability_assessment": result.get("scalability_assessment", ""),
            "reliability_score": int(result.get("reliability_score", 5)),
            "detailed_analysis": result.get("detailed_analysis", ""),
        }

    except ValueError as exc:
        # Credentials not configured -- fall back to rule-based
        fallback = analyze_architecture(nodes, edges)
        return {
            "warnings": fallback["warnings"],
            "suggestions": fallback["suggestions"],
            "scalability_assessment": "AI analysis unavailable -- credentials not configured.",
            "reliability_score": 5,
            "detailed_analysis": str(exc),
        }

    except Exception as exc:
        # Any other error (network, parsing, etc.) -- fall back to rule-based
        fallback = analyze_architecture(nodes, edges)
        return {
            "warnings": fallback["warnings"],
            "suggestions": fallback["suggestions"],
            "scalability_assessment": "AI analysis unavailable -- falling back to rule-based analysis.",
            "reliability_score": 5,
            "detailed_analysis": (
                f"AI analysis failed ({type(exc).__name__}: {exc}). "
                "Results below are from the rule-based analyzer."
            ),
        }
