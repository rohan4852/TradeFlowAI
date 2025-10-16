from typing import List, Dict, Optional, Any
from datetime import datetime
import logging

# Import lightweight local models & types
from ..models.predictions import (
    ModelPrediction,
    EnsemblePrediction,
    PredictionAction,
    ModelType,
    PredictionExplanation,
    ScenarioAnalysis,
)
from ..models.market_data import OHLCVData, NewsArticle, SocialSentiment

logger = logging.getLogger(__name__)


class HybridPredictionEngine:
    """Hybrid AI prediction engine combining multiple model types.

    This implementation avoids heavy top-level imports (pandas/numpy/etc.) by
    importing them only inside methods that actually need them. It also
    provides small, deterministic model stubs suitable for unit tests and for
    running the app without large ML dependencies installed.
    """

    def __init__(self) -> None:
        # instantiate lightweight model wrappers (stubs)
        self.models = {
            ModelType.ARIMA: ARIMAModel(),
            ModelType.LSTM: LSTMModel(),
            ModelType.TRANSFORMER: TransformerModel(),
            ModelType.REINFORCEMENT_LEARNING: RLModel(),
            ModelType.LLM: LLMModel(),
        }

        # ensemble weights sum to 1.0 (not strictly required here but kept
        # for clarity)
        self.ensemble_weights = {
            ModelType.ARIMA: 0.15,
            ModelType.LSTM: 0.25,
            ModelType.TRANSFORMER: 0.25,
            ModelType.REINFORCEMENT_LEARNING: 0.20,
            ModelType.LLM: 0.15,
        }

    async def generate_prediction(
        self,
        ticker: str,
        ohlcv_data: List[OHLCVData],
        news_data: Optional[List[NewsArticle]] = None,
        sentiment_data: Optional[List[SocialSentiment]] = None,
        time_horizon: str = "1w",
    ) -> EnsemblePrediction:
        """Generate an ensemble prediction from multiple models.

        The individual models are called asynchronously; model implementations
        are lightweight stubs that return a `ModelPrediction` instance.
        """
        features = self._prepare_features(ohlcv_data, news_data, sentiment_data)

        individual_predictions: List[ModelPrediction] = []
        for model_type, model in self.models.items():
            try:
                prediction = await model.predict(ticker, features, time_horizon)
                individual_predictions.append(prediction)
            except Exception as e:  # pragma: no cover - defensive
                logger.exception("Model %s failed", model_type)

        if not individual_predictions:
            raise RuntimeError("All models failed to generate predictions")

        return self._create_ensemble_prediction(ticker, individual_predictions)

    def _prepare_features(
        self,
        ohlcv_data: List[OHLCVData],
        news_data: Optional[List[NewsArticle]] = None,
        sentiment_data: Optional[List[SocialSentiment]] = None,
    ) -> Dict[str, Any]:
        """Prepare a consistent, small feature dict for model inputs.

        Heavy libs (pandas/numpy) are imported lazily here. If those libs are
        not available, use very small Python-only fallbacks so the service still
        runs in environments without pandas.
        """
        try:
            import pandas as pd  # type: ignore
            import numpy as np  # type: ignore
        except Exception:
            pd = None  # type: ignore
            np = None  # type: ignore

        if not ohlcv_data:
            return {
                "price_data": None,
                "news_sentiment": 0.0,
                "news_count": 0,
                "social_sentiment": 0.0,
                "social_volume": 0,
                "current_price": 0.0,
            }

        # Convert to a lightweight structure. Prefer pandas.DataFrame when
        # available because downstream feature calcs expect DataFrame-like
        # behaviour; otherwise keep a list-of-dicts.
        if pd is not None:
            df = pd.DataFrame([
                {
                    "timestamp": d.timestamp,
                    "open": d.open,
                    "high": d.high,
                    "low": d.low,
                    "close": d.close,
                    "volume": d.volume,
                }
                for d in ohlcv_data
            ])
            df = df.sort_values("timestamp").reset_index(drop=True)

            # Basic technicals (try/except to be defensive if series are short)
            try:
                df["sma_20"] = df["close"].rolling(20).mean()
                df["sma_50"] = df["close"].rolling(50).mean()
                df["volatility"] = df["close"].rolling(20).std()
                df["returns"] = df["close"].pct_change()
                df["high_low_ratio"] = df["high"] / df["low"].replace(0, 1)
                df["volume_sma"] = df["volume"].rolling(20).mean()
                # RSI / MACD helper methods use pandas Series-style operations
                df["rsi"] = self._calculate_rsi(df["close"])  # type: ignore
                df["macd"] = self._calculate_macd(df["close"])  # type: ignore
            except Exception:
                # If any of the rolling ops fail (too few datapoints), ignore
                logger.debug("Could not compute full technicals; using partial features")

            current_price = float(df["close"].iloc[-1]) if not df.empty else 0.0
            price_data = df
        else:
            # Minimal fallback: list of close prices and last known price
            closes = [getattr(d, "close", 0.0) for d in ohlcv_data]
            current_price = float(closes[-1]) if closes else 0.0
            price_data = [{
                "timestamp": getattr(d, "timestamp", None),
                "close": getattr(d, "close", None),
            } for d in ohlcv_data]

        # News sentiment
        news_sentiment = 0.0
        news_count = 0
        if news_data:
            scores = [getattr(n, "sentiment_score", 0.0) for n in news_data]
            if scores:
                if np is not None:
                    news_sentiment = float(np.mean(scores))
                else:
                    news_sentiment = float(sum(scores) / len(scores))
                news_count = len(scores)

        # Social sentiment
        social_sentiment = 0.0
        social_volume = 0
        if sentiment_data:
            scores = [getattr(s, "sentiment_score", 0.0) for s in sentiment_data]
            if scores:
                if np is not None:
                    social_sentiment = float(np.mean(scores))
                else:
                    social_sentiment = float(sum(scores) / len(scores))
                social_volume = len(scores)

        return {
            "price_data": price_data,
            "news_sentiment": news_sentiment,
            "news_count": news_count,
            "social_sentiment": social_sentiment,
            "social_volume": social_volume,
            "current_price": float(current_price),
        }

    def _calculate_rsi(self, prices, period: int = 14):
        """Calculate RSI using pandas Series when available; otherwise return 50."""
        try:
            # prices expected to be pandas.Series
            delta = prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            rs = gain / loss.replace(0, 1)
            return 100 - (100 / (1 + rs))
        except Exception:
            return 50

    def _calculate_macd(self, prices):
        try:
            ema12 = prices.ewm(span=12).mean()
            ema26 = prices.ewm(span=26).mean()
            return ema12 - ema26
        except Exception:
            return 0

    def _create_ensemble_prediction(self, ticker: str, predictions: List[ModelPrediction]) -> EnsemblePrediction:
        """Combine individual predictions into an ensemble result."""
        try:
            import numpy as np  # type: ignore
        except Exception:
            np = None  # type: ignore

        weighted_prices = []
        weighted_confidences = []
        action_votes: Dict[PredictionAction, float] = {
            PredictionAction.BUY: 0.0,
            PredictionAction.SELL: 0.0,
            PredictionAction.HOLD: 0.0,
        }

        for pred in predictions:
            weight = self.ensemble_weights.get(pred.model_type, 0.1)
            weighted_prices.append(pred.target_price * weight * (pred.confidence_score or 1.0))
            weighted_confidences.append((pred.confidence_score or 0.0) * weight)
            action_votes[pred.action] += weight * (pred.confidence_score or 0.0)

        total_conf = sum(weighted_confidences)
        final_price = float(sum(weighted_prices) / total_conf) if total_conf > 0 else 0.0
        if np is not None:
            final_confidence = float(np.mean(weighted_confidences)) if weighted_confidences else 0.0
        else:
            final_confidence = float(sum(weighted_confidences) / len(weighted_confidences)) if weighted_confidences else 0.0

        total_votes = sum(action_votes.values())
        consensus_strength = (max(action_votes.values()) / total_votes) if total_votes > 0 else 0.0
        final_action = max(action_votes, key=action_votes.get)

        return EnsemblePrediction(
            ticker=ticker,
            final_action=final_action,
            final_target_price=final_price,
            final_confidence=final_confidence,
            individual_predictions=predictions,
            consensus_strength=consensus_strength,
            risk_assessment={
                "volatility_risk": 0.5,
                "sentiment_risk": 0.3,
                "technical_risk": 0.4,
            },
            created_at=datetime.now(),
        )


# --- lightweight model stubs -------------------------------------------------
class ARIMAModel:
    async def predict(self, ticker: str, features: Dict[str, Any], time_horizon: str) -> ModelPrediction:
        # deterministic, simple heuristic based on last price
        current_price = float(features.get("current_price", 0.0))
        predicted_change = 0.005  # small positive drift
        target_price = current_price * (1 + predicted_change)
        action = (
            PredictionAction.BUY if predicted_change > 0.01 else PredictionAction.HOLD
        )
        return ModelPrediction(
            model_type=ModelType.ARIMA,
            ticker=ticker,
            action=action,
            target_price=target_price,
            confidence_score=0.6,
            time_horizon=time_horizon,
            rationale="ARIMA heuristic",
            explanations=[PredictionExplanation(factor="Historical Price Trend", importance=0.8, description="Time series heuristic")],
            created_at=datetime.now(),
            model_version="1.0",
        )


class LSTMModel:
    async def predict(self, ticker: str, features: Dict[str, Any], time_horizon: str) -> ModelPrediction:
        current_price = float(features.get("current_price", 0.0))
        predicted_change = 0.01
        target_price = current_price * (1 + predicted_change)
        action = PredictionAction.BUY if predicted_change > 0.02 else PredictionAction.HOLD
        return ModelPrediction(
            model_type=ModelType.LSTM,
            ticker=ticker,
            action=action,
            target_price=target_price,
            confidence_score=0.7,
            time_horizon=time_horizon,
            rationale="LSTM stub",
            explanations=[PredictionExplanation(factor="Sequential Pattern", importance=0.9, description="LSTM stub")],
            created_at=datetime.now(),
            model_version="1.0",
        )


class TransformerModel:
    async def predict(self, ticker: str, features: Dict[str, Any], time_horizon: str) -> ModelPrediction:
        current_price = float(features.get("current_price", 0.0))
        sentiment_boost = float(features.get("news_sentiment", 0.0)) * 0.01
        predicted_change = sentiment_boost
        target_price = current_price * (1 + predicted_change)
        action = (
            PredictionAction.BUY if predicted_change > 0.015 else PredictionAction.HOLD
        )
        return ModelPrediction(
            model_type=ModelType.TRANSFORMER,
            ticker=ticker,
            action=action,
            target_price=target_price,
            confidence_score=0.75,
            time_horizon=time_horizon,
            rationale="Transformer stub",
            explanations=[PredictionExplanation(factor="Multi-Modal", importance=0.85, description="Transformer stub")],
            created_at=datetime.now(),
            model_version="1.0",
        )


class RLModel:
    async def predict(self, ticker: str, features: Dict[str, Any], time_horizon: str) -> ModelPrediction:
        current_price = float(features.get("current_price", 0.0))
        price_data = features.get("price_data")
        rsi = 50
        try:
            if hasattr(price_data, "empty") and not price_data.empty:
                rsi_val = price_data.get("rsi")
                if rsi_val is not None:
                    # pandas Series-like
                    rsi = float(rsi_val.iloc[-1])
        except Exception:
            rsi = 50

        if rsi > 70:
            predicted_change = -0.02
            action = PredictionAction.SELL
        elif rsi < 30:
            predicted_change = 0.02
            action = PredictionAction.BUY
        else:
            predicted_change = 0.0
            action = PredictionAction.HOLD

        target_price = current_price * (1 + predicted_change)
        return ModelPrediction(
            model_type=ModelType.REINFORCEMENT_LEARNING,
            ticker=ticker,
            action=action,
            target_price=target_price,
            confidence_score=0.65,
            time_horizon=time_horizon,
            rationale="RL stub",
            explanations=[PredictionExplanation(factor="RL Strategy", importance=0.7, description="RL stub")],
            created_at=datetime.now(),
            model_version="1.0",
        )


class LLMModel:
    async def predict(self, ticker: str, features: Dict[str, Any], time_horizon: str) -> ModelPrediction:
        # Lightweight heuristic based on aggregated sentiment
        current_price = float(features.get("current_price", 0.0))
        news_sentiment = float(features.get("news_sentiment", 0.0))
        social_sentiment = float(features.get("social_sentiment", 0.0))

        combined_sentiment = (news_sentiment + social_sentiment) / 2 if (news_sentiment or social_sentiment) else 0.0
        predicted_change = combined_sentiment * 0.03
        target_price = current_price * (1 + predicted_change)

        action = (
            PredictionAction.BUY
            if combined_sentiment > 0.1
            else PredictionAction.SELL
            if combined_sentiment < -0.1
            else PredictionAction.HOLD
        )

        return ModelPrediction(
            model_type=ModelType.LLM,
            ticker=ticker,
            action=action,
            target_price=target_price,
            confidence_score=0.6,
            time_horizon=time_horizon,
            rationale="LLM sentiment heuristic",
            explanations=[PredictionExplanation(factor="Sentiment", importance=0.75, description="LLM heuristic")],
            created_at=datetime.now(),
            model_version="1.0",
        )