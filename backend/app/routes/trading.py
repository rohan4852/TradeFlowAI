"""
Trading API Routes
Real trading operations with broker integration
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import logging
from ..services.trading_service import trading_service, TradingOrder, OrderSide, OrderType, BrokerType
from ..services.notification_service import notification_service
from ..routes.auth import get_current_user
from ..middleware.rate_limiting import rate_limit_dependency

logger = logging.getLogger(__name__)
router = APIRouter()

class PlaceOrderRequest(BaseModel):
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: float
    price: Optional[float] = None
    stop_price: Optional[float] = None
    broker_type: BrokerType = BrokerType.PAPER_TRADING

class CancelOrderRequest(BaseModel):
    order_id: str
    broker_type: BrokerType = BrokerType.PAPER_TRADING

class AddBrokerRequest(BaseModel):
    broker_type: BrokerType
    credentials: Dict[str, str]

@router.post("/brokers/add")
async def add_broker_account(
    request: AddBrokerRequest,
    current_user = Depends(get_current_user),
    _rate_limit = Depends(rate_limit_dependency("trading_order"))
):
    """Add a broker account for trading"""
    try:
        success = trading_service.add_broker_client(
            current_user["user_id"],
            request.broker_type,
            request.credentials
        )
        
        if success:
            return {
                "success": True,
                "message": f"{request.broker_type} account added successfully"
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to add broker account")
            
    except Exception as e:
        logger.error(f"Error adding broker account: {e}")
        raise HTTPException(status_code=500, detail="Failed to add broker account")

@router.get("/account/{broker_type}")
async def get_account_info(
    broker_type: BrokerType,
    current_user = Depends(get_current_user)
):
    """Get trading account information"""
    try:
        account_info = await trading_service.get_account_info(
            current_user["user_id"],
            broker_type
        )
        
        if account_info:
            return {
                "success": True,
                "account": account_info
            }
        else:
            raise HTTPException(status_code=404, detail="Account not found or not configured")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting account info: {e}")
        raise HTTPException(status_code=500, detail="Failed to get account information")

@router.get("/positions/{broker_type}")
async def get_positions(
    broker_type: BrokerType,
    current_user = Depends(get_current_user)
):
    """Get current trading positions"""
    try:
        positions = await trading_service.get_positions(
            current_user["user_id"],
            broker_type
        )
        
        return {
            "success": True,
            "positions": positions
        }
        
    except Exception as e:
        logger.error(f"Error getting positions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get positions")

@router.get("/orders/{broker_type}")
async def get_orders(
    broker_type: BrokerType,
    status: str = "all",
    current_user = Depends(get_current_user)
):
    """Get trading orders"""
    try:
        orders = await trading_service.get_orders(
            current_user["user_id"],
            broker_type,
            status
        )
        
        return {
            "success": True,
            "orders": orders
        }
        
    except Exception as e:
        logger.error(f"Error getting orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to get orders")

@router.post("/orders/place")
async def place_order(
    request: PlaceOrderRequest,
    current_user = Depends(get_current_user),
    _rate_limit = Depends(rate_limit_dependency("trading_order"))
):
    """Place a trading order"""
    try:
        order = TradingOrder(
            symbol=request.symbol,
            side=request.side,
            order_type=request.order_type,
            quantity=request.quantity,
            price=request.price,
            stop_price=request.stop_price
        )
        
        result = await trading_service.place_order(
            current_user["user_id"],
            request.broker_type,
            order
        )
        
        if result.success:
            # Send notification for successful order placement
            await notification_service.send_notification({
                "user_id": current_user["user_id"],
                "title": "Order Placed",
                "message": f"Your {request.side} order for {request.quantity} shares of {request.symbol} has been placed",
                "type": "order_placed",
                "channels": ["in_app"],
                "data": {
                    "order_id": result.order_id,
                    "symbol": request.symbol,
                    "side": request.side,
                    "quantity": request.quantity
                }
            })
            
            return {
                "success": True,
                "order_id": result.order_id,
                "message": result.message,
                "data": result.data
            }
        else:
            return {
                "success": False,
                "message": result.message
            }
            
    except Exception as e:
        logger.error(f"Error placing order: {e}")
        raise HTTPException(status_code=500, detail="Failed to place order")

@router.post("/orders/cancel")
async def cancel_order(
    request: CancelOrderRequest,
    current_user = Depends(get_current_user),
    _rate_limit = Depends(rate_limit_dependency("trading_cancel"))
):
    """Cancel a trading order"""
    try:
        result = await trading_service.cancel_order(
            current_user["user_id"],
            request.broker_type,
            request.order_id
        )
        
        if result.success:
            # Send notification for order cancellation
            await notification_service.send_notification({
                "user_id": current_user["user_id"],
                "title": "Order Cancelled",
                "message": f"Order {request.order_id} has been cancelled",
                "type": "order_cancelled",
                "channels": ["in_app"],
                "data": {
                    "order_id": request.order_id
                }
            })
            
            return {
                "success": True,
                "message": result.message
            }
        else:
            return {
                "success": False,
                "message": result.message
            }
            
    except Exception as e:
        logger.error(f"Error cancelling order: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel order")

@router.get("/brokers/supported")
async def get_supported_brokers():
    """Get list of supported brokers"""
    return {
        "brokers": [
            {
                "type": "paper_trading",
                "name": "Paper Trading",
                "description": "Simulated trading for practice",
                "requires_credentials": False
            },
            {
                "type": "alpaca",
                "name": "Alpaca Markets",
                "description": "Commission-free stock trading",
                "requires_credentials": True,
                "credentials": ["api_key", "api_secret"]
            }
        ]
    }

@router.post("/paper-trading/setup")
async def setup_paper_trading(
    current_user = Depends(get_current_user)
):
    """Set up paper trading account"""
    try:
        success = trading_service.add_broker_client(
            current_user["user_id"],
            BrokerType.PAPER_TRADING,
            {}
        )
        
        if success:
            return {
                "success": True,
                "message": "Paper trading account set up successfully",
                "initial_balance": 100000.0
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to set up paper trading")
            
    except Exception as e:
        logger.error(f"Error setting up paper trading: {e}")
        raise HTTPException(status_code=500, detail="Failed to set up paper trading")

@router.get("/performance/{broker_type}")
async def get_trading_performance(
    broker_type: BrokerType,
    current_user = Depends(get_current_user)
):
    """Get trading performance metrics"""
    try:
        # Get account info and positions
        account_info = await trading_service.get_account_info(
            current_user["user_id"],
            broker_type
        )
        
        positions = await trading_service.get_positions(
            current_user["user_id"],
            broker_type
        )
        
        orders = await trading_service.get_orders(
            current_user["user_id"],
            broker_type,
            "filled"
        )
        
        if not account_info:
            raise HTTPException(status_code=404, detail="Account not found")
        
        # Calculate performance metrics
        total_value = float(account_info.get("portfolio_value", 0))
        cash = float(account_info.get("cash", 0))
        equity = float(account_info.get("equity", 0))
        
        # Calculate P&L from positions
        total_unrealized_pnl = sum(
            float(pos.get("unrealized_pl", 0)) for pos in positions
        )
        
        # Count trades
        total_trades = len(orders)
        winning_trades = len([o for o in orders if float(o.get("filled_avg_price", 0)) > 0])
        
        return {
            "success": True,
            "performance": {
                "total_value": total_value,
                "cash": cash,
                "equity": equity,
                "unrealized_pnl": total_unrealized_pnl,
                "total_trades": total_trades,
                "winning_trades": winning_trades,
                "win_rate": (winning_trades / total_trades * 100) if total_trades > 0 else 0,
                "positions_count": len(positions)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting performance: {e}")
        raise HTTPException(status_code=500, detail="Failed to get performance metrics")