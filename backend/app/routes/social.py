from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Social trading models
class TradingStrategy(BaseModel):
    id: str
    name: str
    description: str
    creator: str
    performance_metrics: Dict[str, float]
    followers: int
    rating: float
    created_at: datetime
    is_premium: bool = False

class TraderProfile(BaseModel):
    username: str
    display_name: str
    bio: Optional[str] = None
    performance_metrics: Dict[str, float]
    followers: int
    following: int
    strategies_shared: int
    reputation_score: float
    verified: bool = False

class CommunityPost(BaseModel):
    id: str
    author: str
    content: str
    ticker: Optional[str] = None
    sentiment: Optional[str] = None
    likes: int
    comments: int
    created_at: datetime
    tags: List[str] = []

@router.get("/strategies", response_model=List[TradingStrategy])
async def get_community_strategies(
    category: Optional[str] = Query(None, description="Strategy category filter"),
    min_rating: float = Query(0.0, description="Minimum strategy rating"),
    limit: int = Query(20, ge=1, le=100)
):
    """Get community trading strategies"""
    try:
        # Placeholder strategy data
        strategies = [
            TradingStrategy(
                id="strat_001",
                name="Momentum Breakout Strategy",
                description="Identifies stocks breaking out of consolidation patterns with high volume",
                creator="ProTrader123",
                performance_metrics={
                    "total_return": 0.24,
                    "sharpe_ratio": 1.8,
                    "max_drawdown": -0.12,
                    "win_rate": 0.68
                },
                followers=1250,
                rating=4.6,
                created_at=datetime.now(),
                is_premium=False
            ),
            TradingStrategy(
                id="strat_002", 
                name="AI Sentiment Swing Trading",
                description="Uses AI sentiment analysis for swing trading opportunities",
                creator="AITrader_Pro",
                performance_metrics={
                    "total_return": 0.31,
                    "sharpe_ratio": 2.1,
                    "max_drawdown": -0.08,
                    "win_rate": 0.72
                },
                followers=2100,
                rating=4.8,
                created_at=datetime.now(),
                is_premium=True
            )
        ]
        
        # Apply filters
        if min_rating > 0:
            strategies = [s for s in strategies if s.rating >= min_rating]
        
        return strategies[:limit]
    
    except Exception as e:
        logger.error(f"Error fetching community strategies: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch strategies: {str(e)}")

@router.get("/leaderboard", response_model=List[TraderProfile])
async def get_leaderboard(
    metric: str = Query("total_return", description="Ranking metric (total_return, sharpe_ratio, consistency)"),
    timeframe: str = Query("1m", description="Timeframe for ranking (1w, 1m, 3m, 1y)"),
    limit: int = Query(10, ge=1, le=50)
):
    """Get trader leaderboard"""
    try:
        # Placeholder leaderboard data
        traders = [
            TraderProfile(
                username="QuantMaster",
                display_name="Quant Master",
                bio="Algorithmic trading specialist with 10+ years experience",
                performance_metrics={
                    "total_return": 0.45,
                    "sharpe_ratio": 2.3,
                    "max_drawdown": -0.06,
                    "consistency_score": 0.89
                },
                followers=5200,
                following=150,
                strategies_shared=12,
                reputation_score=4.9,
                verified=True
            ),
            TraderProfile(
                username="TechAnalyst_Pro",
                display_name="Tech Analyst Pro",
                bio="Technical analysis expert focusing on growth stocks",
                performance_metrics={
                    "total_return": 0.38,
                    "sharpe_ratio": 1.9,
                    "max_drawdown": -0.11,
                    "consistency_score": 0.82
                },
                followers=3800,
                following=200,
                strategies_shared=8,
                reputation_score=4.7,
                verified=True
            )
        ]
        
        return traders[:limit]
    
    except Exception as e:
        logger.error(f"Error fetching leaderboard: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch leaderboard: {str(e)}")

@router.get("/feed", response_model=List[CommunityPost])
async def get_community_feed(
    ticker: Optional[str] = Query(None, description="Filter by ticker symbol"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment (bullish, bearish, neutral)"),
    limit: int = Query(20, ge=1, le=100)
):
    """Get community discussion feed"""
    try:
        # Placeholder feed data
        posts = [
            CommunityPost(
                id="post_001",
                author="TechAnalyst_Pro",
                content="AAPL showing strong momentum after earnings beat. RSI still has room to run. Target $160.",
                ticker="AAPL",
                sentiment="bullish",
                likes=45,
                comments=12,
                created_at=datetime.now(),
                tags=["earnings", "momentum", "technical-analysis"]
            ),
            CommunityPost(
                id="post_002",
                author="ValueInvestor",
                content="Market seems overextended here. Looking for pullback opportunities in quality names.",
                ticker=None,
                sentiment="bearish",
                likes=23,
                comments=8,
                created_at=datetime.now(),
                tags=["market-outlook", "value-investing"]
            )
        ]
        
        # Apply filters
        if ticker:
            posts = [p for p in posts if p.ticker == ticker.upper()]
        if sentiment:
            posts = [p for p in posts if p.sentiment == sentiment.lower()]
        
        return posts[:limit]
    
    except Exception as e:
        logger.error(f"Error fetching community feed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch feed: {str(e)}")

@router.get("/sentiment-overview")
async def get_sentiment_overview():
    """Get overall community sentiment analysis"""
    try:
        return {
            "overall_sentiment": {
                "score": 0.15,
                "direction": "slightly_bullish",
                "confidence": 0.72
            },
            "trending_tickers": [
                {"ticker": "AAPL", "mentions": 245, "sentiment": 0.25},
                {"ticker": "TSLA", "mentions": 189, "sentiment": -0.12},
                {"ticker": "NVDA", "mentions": 156, "sentiment": 0.31},
                {"ticker": "MSFT", "mentions": 134, "sentiment": 0.18}
            ],
            "trending_topics": [
                {"topic": "earnings", "mentions": 89, "sentiment": 0.22},
                {"topic": "fed-meeting", "mentions": 67, "sentiment": -0.08},
                {"topic": "ai-stocks", "mentions": 54, "sentiment": 0.35}
            ],
            "sentiment_distribution": {
                "bullish": 0.45,
                "neutral": 0.32,
                "bearish": 0.23
            }
        }
    except Exception as e:
        logger.error(f"Error fetching sentiment overview: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch sentiment: {str(e)}")

@router.post("/follow-trader/{username}")
async def follow_trader(username: str):
    """Follow a trader to get their updates"""
    try:
        # Placeholder follow implementation
        return {
            "message": f"Successfully followed {username}",
            "following": True,
            "follower_count": 1251  # Updated count
        }
    except Exception as e:
        logger.error(f"Error following trader {username}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to follow trader: {str(e)}")

@router.post("/copy-strategy/{strategy_id}")
async def copy_strategy(strategy_id: str, allocation_percent: float = Query(10.0, ge=1.0, le=100.0)):
    """Copy a community trading strategy"""
    try:
        # Placeholder copy implementation
        return {
            "message": f"Successfully copied strategy {strategy_id}",
            "allocation_percent": allocation_percent,
            "estimated_capital": 1000.0,  # Based on allocation
            "status": "active"
        }
    except Exception as e:
        logger.error(f"Error copying strategy {strategy_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to copy strategy: {str(e)}")

@router.get("/competitions")
async def get_trading_competitions():
    """Get active trading competitions"""
    try:
        return {
            "active_competitions": [
                {
                    "id": "comp_001",
                    "name": "Monthly Stock Picking Challenge",
                    "description": "Pick 5 stocks for the month, highest return wins",
                    "participants": 1250,
                    "prize_pool": "$5000",
                    "start_date": "2024-01-01",
                    "end_date": "2024-01-31",
                    "entry_fee": 0,
                    "status": "active"
                },
                {
                    "id": "comp_002", 
                    "name": "AI vs Human Trading Battle",
                    "description": "Compete against AI models in live trading",
                    "participants": 500,
                    "prize_pool": "$10000",
                    "start_date": "2024-01-15",
                    "end_date": "2024-02-15",
                    "entry_fee": 25,
                    "status": "registration_open"
                }
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching competitions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch competitions: {str(e)}")