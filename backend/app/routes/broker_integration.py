from fastapi import APIRouter, HTTPException, Depends, Body
from typing import Dict, List, Any, Optional
import logging
from ..services.broker_integration_agent import broker_agent, Order, OrderType, OrderSide
from ..services.security_agent import security_agent

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/connect")
async def connect_broker(
    broker_name: str,
    credentials: Dict[str, str] = Body(..., description="Broker API credentials")
):
    """Connect to a broker for live trading"""
    try:
        success = await broker_agent.connect_broker(broker_name, credentials)
        
        if success:
            return {
                'success': True,
                'message': f'Successfully connected to {broker_name}',
                'broker': broker_name
            }
        else:
            raise HTTPException(status_code=400, detail=f'Failed to connect to {broker_name}')
            
    except Exception as e:
        logger.error(f"Error connecting to broker: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/account")
async def get_account_info():
    """Get current account information from connected broker"""
    try:
        if not broker_agent.active_broker:
            raise HTTPException(status_code=400, detail="No active broker connection")
        
        account = await broker_agent.active_broker.get_account()
        
        return {
            'success': True,
            'account': {
                'id': account.id,
                'buying_power': account.buying_power,
                'cash': account.cash,
                'portfolio_value': account.portfolio_value,
                'day_trade_count': account.day_trade_count,
                'positions_count': len(account.positions)
            },
            'broker': broker_agent.active_broker_name
        }
        
    except Exception as e:
        logger.error(f"Error getting account info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/positions")
async def get_positions():
    """Get current positions from connected broker"""
    try:
        if not broker_agent.active_broker:
            raise HTTPException(status_code=400, detail="No active broker connection")
        
        positions = await broker_agent.active_broker.get_positions()
        
        return {
            'success': True,
            'positions': [
                {
                    'symbol': pos.symbol,
                    'quantity': pos.quantity,
                    'average_price': pos.average_price,
                    'market_value': pos.market_value,
                    'unrealized_pnl': pos.unrealized_pnl,
                    'side': pos.side
                }
                for pos in positions
            ],
            'total_positions': len(positions),
            'broker': broker_agent.active_broker_name
        }
        
    except Exception as e:
        logger.error(f"Error getting positions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute-ai-recommendation")
async def execute_ai_recommendation(
    symbol: str,
    recommendation: Dict[str, Any] = Body(..., description="AI recommendation data"),
    position_size: float = Body(0.05, description="Position size as percentage of portfolio")
):
    """Execute trade based on AI recommendation"""
    try:
        if not broker_agent.active_broker:
            raise HTTPException(status_code=400, detail="No active broker connection")
        
        # Validate position size
        if not 0.001 <= position_size <= 0.2:
            raise HTTPException(status_code=400, detail="Position size must be between 0.1% and 20%")
        
        # Execute recommendation
        order = await broker_agent.execute_ai_recommendation(symbol, recommendation, position_size)
        
        if order:
            return {
                'success': True,
                'message': 'AI recommendation executed successfully',
                'order': {
                    'id': order.id,
                    'symbol': order.symbol,
                    'side': order.side,
                    'quantity': order.quantity,
                    'type': order.type,
                    'status': order.status
                },
                'recommendation': recommendation
            }
        else:
            return {
                'success': False,
                'message': 'Trade was blocked by risk management or market conditions',
                'recommendation': recommendation
            }
            
    except Exception as e:
        logger.error(f"Error executing AI recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/place-order")
async def place_manual_order(
    symbol: str,
    side: str,
    quantity: float,
    order_type: str = "market",
    price: Optional[float] = None,
    stop_price: Optional[float] = None
):
    """Place manual trading order"""
    try:
        if not broker_agent.active_broker:
            raise HTTPException(status_code=400, detail="No active broker connection")
        
        # Validate inputs
        if side.lower() not in ['buy', 'sell']:
            raise HTTPException(status_code=400, detail="Side must be 'buy' or 'sell'")
        
        if order_type.lower() not in ['market', 'limit', 'stop', 'stop_limit']:
            raise HTTPException(status_code=400, detail="Invalid order type")
        
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be positive")
        
        # Create order
        order = Order(
            id="",
            symbol=symbol.upper(),
            side=OrderSide(side.lower()),
            type=OrderType(order_type.lower()),
            quantity=quantity,
            price=price,
            stop_price=stop_price
        )
        
        # Place order
        placed_order = await broker_agent.active_broker.place_order(order)
        
        return {
            'success': True,
            'message': 'Order placed successfully',
            'order': {
                'id': placed_order.id,
                'symbol': placed_order.symbol,
                'side': placed_order.side,
                'quantity': placed_order.quantity,
                'type': placed_order.type,
                'status': placed_order.status,
                'created_at': placed_order.created_at.isoformat() if placed_order.created_at else None
            }
        }
        
    except Exception as e:
        logger.error(f"Error placing manual order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cancel-order/{order_id}")
async def cancel_order(order_id: str):
    """Cancel an existing order"""
    try:
        if not broker_agent.active_broker:
            raise HTTPException(status_code=400, detail="No active broker connection")
        
        success = await broker_agent.active_broker.cancel_order(order_id)
        
        if success:
            return {
                'success': True,
                'message': f'Order {order_id} cancelled successfully'
            }
        else:
            raise HTTPException(status_code=400, detail=f'Failed to cancel order {order_id}')
            
    except Exception as e:
        logger.error(f"Error cancelling order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/order-status/{order_id}")
async def get_order_status(order_id: str):
    """Get status of a specific order"""
    try:
        if not broker_agent.active_broker:
            raise HTTPException(status_code=400, detail="No active broker connection")
        
        order = await broker_agent.active_broker.get_order_status(order_id)
        
        return {
            'success': True,
            'order': {
                'id': order.id,
                'symbol': order.symbol,
                'side': order.side,
                'quantity': order.quantity,
                'type': order.type,
                'status': order.status,
                'filled_quantity': order.filled_quantity,
                'average_fill_price': order.average_fill_price,
                'created_at': order.created_at.isoformat() if order.created_at else None,
                'updated_at': order.updated_at.isoformat() if order.updated_at else None
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting order status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync-portfolio")
async def sync_portfolio():
    """Synchronize portfolio data with broker"""
    try:
        portfolio_data = await broker_agent.sync_portfolio()
        
        if portfolio_data:
            return {
                'success': True,
                'message': 'Portfolio synchronized successfully',
                'portfolio': portfolio_data
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to sync portfolio")
            
    except Exception as e:
        logger.error(f"Error syncing portfolio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance")
async def get_trading_performance():
    """Get trading performance metrics"""
    try:
        performance = await broker_agent.get_trading_performance()
        
        return {
            'success': True,
            'performance': performance
        }
        
    except Exception as e:
        logger.error(f"Error getting trading performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/risk-limits")
async def update_risk_limits(
    risk_limits: Dict[str, float] = Body(..., description="New risk management limits")
):
    """Update risk management limits"""
    try:
        result = await broker_agent.set_risk_limits(risk_limits)
        
        if result['success']:
            return {
                'success': True,
                'message': 'Risk limits updated successfully',
                'limits': result['updated_limits']
            }
        else:
            raise HTTPException(status_code=400, detail=result['error'])
            
    except Exception as e:
        logger.error(f"Error updating risk limits: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/market-data/{symbol}")
async def get_market_data(symbol: str):
    """Get real-time market data for a symbol"""
    try:
        if not broker_agent.active_broker:
            raise HTTPException(status_code=400, detail="No active broker connection")
        
        market_data = await broker_agent.active_broker.get_market_data(symbol.upper())
        
        return {
            'success': True,
            'market_data': market_data
        }
        
    except Exception as e:
        logger.error(f"Error getting market data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/supported-brokers")
async def get_supported_brokers():
    """Get list of supported brokers"""
    return {
        'success': True,
        'brokers': [
            {
                'name': 'alpaca',
                'display_name': 'Alpaca Markets',
                'description': 'Commission-free stock trading API',
                'supported_features': ['stocks', 'paper_trading', 'live_trading'],
                'credentials_required': ['api_key', 'secret_key']
            },
            {
                'name': 'interactive_brokers',
                'display_name': 'Interactive Brokers',
                'description': 'Professional trading platform (coming soon)',
                'supported_features': ['stocks', 'options', 'futures', 'forex'],
                'credentials_required': ['username', 'password', 'account_id'],
                'status': 'coming_soon'
            }
        ]
    }