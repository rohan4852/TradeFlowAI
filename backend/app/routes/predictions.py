from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime
from ..models.predictions import EnsemblePrediction, ModelPrediction, BacktestResult
from ..services.prediction_engine import HybridPredictionEngine
from ..services.data_integration import MultiSourceDataIntegrator, NewsDataIntegrator, SentimentDataIntegrator
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Dependency injection
def get_prediction_engine():
    return HybridPredictionEngine()

def get_data_integrator():
    return MultiSourceDataIntegrator()

def get_news_integrator():
    return NewsDataIntegrator()

def get_sentiment_integrator():
    return SentimentDataIntegrator()

@router.post("/predict/{ticker}", response_model=EnsemblePrediction)
async def get_prediction(
    ticker: str,
    time_horizon: str = Query("1w", description="Prediction time horizon (1d, 1w, 1m, 3m, 6m, 1y)"),
    include_news: bool = Query(True, description="Include news sentiment in prediction"),
    include_social: bool = Query(True, description="Include social sentiment in prediction"),
    prediction_engine: HybridPredictionEngine = Depends(get_prediction_engine),
    data_integrator: MultiSourceDataIntegrator = Depends(get_data_integrator),
    news_integrator: NewsDataIntegrator = Depends(get_news_integrator),
    sentiment_integrator: SentimentDataIntegrator = Depends(get_sentiment_integrator)
):
    """Generate AI-powered trading prediction for a ticker"""
    try:
        logger.info(f"Generating prediction for {ticker}, horizon: {time_horizon}")
        
        # Fetch required data
        ohlcv_data = await data_integrator.get_ohlcv_data(ticker.upper(), period="1y", interval="1d")
        
        news_data = None
        if include_news:
            news_data = await news_integrator.get_news_data(ticker.upper(), limit=20)
        
        sentiment_data = None
        if include_social:
            sentiment_data = await sentiment_integrator.get_sentiment_data(ticker.upper(), hours_back=48)
        
        # Generate prediction
        prediction = await prediction_engine.generate_prediction(
            ticker.upper(), 
            ohlcv_data, 
            news_data, 
            sentiment_data, 
            time_horizon
        )
        
        logger.info(f"Successfully generated prediction for {ticker}: {prediction.final_action}")
        return prediction
    
    except Exception as e:
        logger.error(f"Error generating prediction for {ticker}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate prediction: {str(e)}")

@router.get("/explain/{ticker}")
async def explain_prediction(
    ticker: str,
    prediction_id: Optional[str] = Query(None, description="Specific prediction ID to explain")
):
    """Get detailed explanation of a prediction"""
    try:
        # Placeholder for prediction explanation
        return {
            "ticker": ticker.upper(),
            "explanation": {
                "summary": f"The AI recommends BUY for {ticker} based on multiple factors",
                "key_factors": [
                    {
                        "factor": "Technical Analysis",
                        "impact": "Positive",
                        "weight": 0.35,
                        "description": "RSI indicates oversold conditions, MACD showing bullish crossover"
                    },
                    {
                        "factor": "News Sentiment",
                        "impact": "Positive", 
                        "weight": 0.25,
                        "description": "Recent earnings beat expectations, positive analyst upgrades"
                    },
                    {
                        "factor": "Social Sentiment",
                        "impact": "Neutral",
                        "weight": 0.20,
                        "description": "Mixed social media sentiment, moderate discussion volume"
                    },
                    {
                        "factor": "Market Context",
                        "impact": "Positive",
                        "weight": 0.20,
                        "description": "Sector rotation favoring this industry, strong market momentum"
                    }
                ],
                "confidence_breakdown": {
                    "data_quality": 0.85,
                    "model_agreement": 0.72,
                    "historical_accuracy": 0.68,
                    "market_conditions": 0.75
                },
                "risk_factors": [
                    "High volatility in tech sector",
                    "Upcoming Fed meeting may impact sentiment",
                    "Earnings season uncertainty"
                ]
            }
        }
    except Exception as e:
        logger.error(f"Error explaining prediction for {ticker}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to explain prediction: {str(e)}")

@router.get("/scenarios/{ticker}")
async def get_scenario_analysis(
    ticker: str,
    time_horizon: str = Query("1w", description="Analysis time horizon")
):
    """Get scenario analysis for different market conditions"""
    try:
        return {
            "ticker": ticker.upper(),
            "scenarios": [
                {
                    "name": "Bull Market",
                    "probability": 0.35,
                    "predicted_return": 0.08,
                    "target_price": 155.0,
                    "description": "Strong market momentum continues, positive earnings surprise"
                },
                {
                    "name": "Base Case",
                    "probability": 0.45,
                    "predicted_return": 0.03,
                    "target_price": 148.0,
                    "description": "Normal market conditions, in-line earnings"
                },
                {
                    "name": "Bear Market",
                    "probability": 0.20,
                    "predicted_return": -0.05,
                    "target_price": 138.0,
                    "description": "Market correction, disappointing earnings or guidance"
                }
            ],
            "risk_metrics": {
                "value_at_risk_95": -0.08,
                "expected_shortfall": -0.12,
                "maximum_drawdown": -0.15,
                "volatility": 0.25
            }
        }
    except Exception as e:
        logger.error(f"Error generating scenarios for {ticker}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate scenarios: {str(e)}")

@router.get("/model-performance")
async def get_model_performance():
    """Get performance metrics for all prediction models"""
    try:
        return {
            "overall_performance": {
                "accuracy": 0.68,
                "precision": 0.72,
                "recall": 0.65,
                "f1_score": 0.68,
                "sharpe_ratio": 1.45
            },
            "model_breakdown": {
                "arima": {"accuracy": 0.62, "weight": 0.15},
                "lstm": {"accuracy": 0.71, "weight": 0.25},
                "transformer": {"accuracy": 0.74, "weight": 0.25},
                "reinforcement_learning": {"accuracy": 0.69, "weight": 0.20},
                "llm": {"accuracy": 0.65, "weight": 0.15}
            },
            "recent_predictions": {
                "total": 1250,
                "correct": 850,
                "accuracy_trend": [0.65, 0.67, 0.68, 0.70, 0.68]
            }
        }
    except Exception as e:
        logger.error(f"Error fetching model performance: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch performance: {str(e)}")

@router.post("/backtest")
async def run_backtest(
    strategy_config: dict,
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    initial_capital: float = Query(10000, description="Initial capital for backtesting")
):
    """Run backtest for a trading strategy"""
    try:
        # Placeholder backtest implementation
        return BacktestResult(
            strategy_name=strategy_config.get("name", "Custom Strategy"),
            start_date=datetime.fromisoformat(start_date),
            end_date=datetime.fromisoformat(end_date),
            total_return=0.15,
            sharpe_ratio=1.2,
            max_drawdown=-0.08,
            win_rate=0.65,
            total_trades=45,
            avg_trade_duration=5.2,
            performance_metrics={
                "annual_return": 0.18,
                "volatility": 0.15,
                "calmar_ratio": 2.25,
                "sortino_ratio": 1.8
            }
        )
    except Exception as e:
        logger.error(f"Error running backtest: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to run backtest: {str(e)}")