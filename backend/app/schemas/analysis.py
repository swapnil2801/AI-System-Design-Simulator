from pydantic import BaseModel


class AnalysisRequest(BaseModel):
    architecture_id: int


class AnalysisResponse(BaseModel):
    warnings: list[str]
    suggestions: list[str]


class AIAnalysisResponse(BaseModel):
    warnings: list[str]
    suggestions: list[str]
    scalability_assessment: str
    reliability_score: int
    detailed_analysis: str


class CostRequest(BaseModel):
    architecture_id: int
    cloud_provider: str = "aws"


class CostResponse(BaseModel):
    total_monthly_cost: float
    breakdown: dict
    cloud_provider: str
    comparison: dict
