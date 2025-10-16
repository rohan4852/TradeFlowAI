from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.model_loader import get_prediction, initialize_model

router = APIRouter()

class PredictRequest(BaseModel):
    ticker: str
    timeframe: str = "1d"
    lookback: int = 50
    risk_profile: str = "moderate"
    # optionally frontend can pass recent price window to avoid backend fetch
    recent_window: list = None

@router.on_event("startup")
async def startup_event():
    # initialize model (will choose GPT-5 via API if key present, else local)
    initialize_model()

@router.post("/predict")
async def predict(req: PredictRequest):
    try:
        result = await get_prediction(req.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
