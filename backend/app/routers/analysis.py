"""Analysis router -- architecture analysis and cost estimation."""

import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.architecture import Architecture
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.analysis import (
    AIAnalysisResponse,
    AnalysisRequest,
    AnalysisResponse,
    CostRequest,
    CostResponse,
)
from app.services.ai_analyzer import ai_analyze_architecture
from app.services.analyzer import analyze_architecture
from app.services.cost_estimator import estimate_cost

router = APIRouter(tags=["analysis"])


def _get_architecture_or_404(arch_id: int, user: User, db: Session) -> Architecture:
    arch = (
        db.query(Architecture)
        .filter(Architecture.id == arch_id, Architecture.user_id == user.id)
        .first()
    )
    if not arch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Architecture not found",
        )
    return arch


def _prepare_nodes(arch: Architecture) -> list[dict]:
    nodes = []
    for n in arch.nodes:
        config = {}
        if n.configuration_json:
            try:
                config = json.loads(n.configuration_json)
            except (json.JSONDecodeError, TypeError):
                pass
        nodes.append(
            {
                "id": n.id,
                "node_type": n.node_type,
                "label": n.label,
                "config": config,
            }
        )
    return nodes


def _prepare_edges(arch: Architecture) -> list[dict]:
    return [
        {"source_node": e.source_node, "target_node": e.target_node}
        for e in arch.edges
    ]


@router.post("/analyze", response_model=AnalysisResponse)
def analyze(
    payload: AnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Analyze an architecture and return warnings and suggestions."""
    arch = _get_architecture_or_404(payload.architecture_id, current_user, db)
    nodes = _prepare_nodes(arch)
    edges = _prepare_edges(arch)
    result = analyze_architecture(nodes, edges)
    return AnalysisResponse(**result)


@router.post("/ai-analyze", response_model=AIAnalysisResponse)
async def ai_analyze(
    payload: AnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Analyze an architecture using Azure OpenAI for deeper insights."""
    arch = _get_architecture_or_404(payload.architecture_id, current_user, db)
    nodes = _prepare_nodes(arch)
    edges = _prepare_edges(arch)
    result = await ai_analyze_architecture(nodes, edges)
    return AIAnalysisResponse(**result)


@router.post("/estimate-cost", response_model=CostResponse)
def cost_estimate(
    payload: CostRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Estimate monthly infrastructure cost for an architecture."""
    arch = _get_architecture_or_404(payload.architecture_id, current_user, db)
    nodes = _prepare_nodes(arch)
    result = estimate_cost(nodes, cloud_provider=payload.cloud_provider)
    return CostResponse(**result)
