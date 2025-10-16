from pydantic import BaseModel
from typing import Optional

class PredictResponse(BaseModel):
    signal: str
    confidence: float
    target: Optional[float]
    rationale: str
