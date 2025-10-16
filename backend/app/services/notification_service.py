"""
Push Notifications Service
Real-time notifications for trading events, price alerts, etc.
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from enum import Enum
import aiohttp
from dataclasses import dataclass, asdict
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

logger = logging.getLogger(__name__)

class NotificationType(str, Enum):
    PRICE_ALERT = "price_alert"
    ORDER_FILL = "order_fill"
    ORDER_CANCELLED = "order_cancelled"
    ACCOUNT_UPDATE = "account_update"
    NEWS_ALERT = "news_alert"
    SYSTEM_ALERT = "system_alert"
    MARKET_OPEN = "market_open"
    MARKET_CLOSE = "market_close"

class NotificationChannel(str, Enum):
    PUSH = "push"
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"
    WEBHOOK = "webhook"

@dataclass
class Notification:
    user_id: str
    title: str
    message: str
    type: NotificationType
    channels: List[NotificationChannel]
    data: Optional[Dict[str, Any]] = None
    priority: str = "normal"  # low, normal, high, urgent
    expires_at: Optional[datetime] = None
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.expires_at is None:
            self.expires_at = self.created_at + timedelta(hours=24)

class WebSocketManager:
    """Manage WebSocket connections for real-time notifications"""
    
    def __init__(self):
        self.connections: Dict[str, List[Any]] = {}  # user_id -> [websockets]
    
    def add_connection(self, user_id: str, websocket):
        """Add WebSocket connection for user"""
        if user_id not in self.connections:
            self.connections[user_id] = []
        self.connections[user_id].append(websocket)
        logger.info(f"Added WebSocket connection for user {user_id}")
    
    def remove_connection(self, user_id: str, websocket):
        """Remove WebSocket connection"""
        if user_id in self.connections:
            try:
                self.connections[user_id].remove(websocket)
                if not self.connections[user_id]:
                    del self.connections[user_id]
                logger.info(f"Removed WebSocket connection for user {user_id}")
            except ValueError:
                pass
    
    async def send_to_user(self, user_id: str, message: Dict[str, Any]):
        """Send message to all user's WebSocket connections"""
        if user_id not in self.connections:
            return
        
        disconnected = []
        for websocket in self.connections[user_id]:
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.warning(f"Failed to send WebSocket message: {e}")
                disconnected.append(websocket)
        
        # Remove disconnected websockets
        for ws in disconnected:
            self.remove_connection(user_id, ws)

class EmailService:
    """Email notification service"""
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@tradeflowai.com")
    
    async def send_email(self, to_email: str, subject: str, body: str, html_body: str = None):
        """Send email notification"""
        if not self.smtp_username or not self.smtp_password:
            logger.warning("SMTP credentials not configured")
            return False
        
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            # Add text part
            text_part = MIMEText(body, 'plain')
            msg.attach(text_part)
            
            # Add HTML part if provided
            if html_body:
                html_part = MIMEText(html_body, 'html')
                msg.attach(html_part)
            
            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email sent to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

class PushNotificationService:
    """Push notification service (Firebase, OneSignal, etc.)"""
    
    def __init__(self):
        self.firebase_key = os.getenv("FIREBASE_SERVER_KEY")
        self.onesignal_app_id = os.getenv("ONESIGNAL_APP_ID")
        self.onesignal_api_key = os.getenv("ONESIGNAL_API_KEY")
    
    async def send_firebase_push(self, device_token: str, title: str, body: str, data: Dict[str, Any] = None):
        """Send push notification via Firebase"""
        if not self.firebase_key:
            logger.warning("Firebase key not configured")
            return False
        
        try:
            url = "https://fcm.googleapis.com/fcm/send"
            headers = {
                "Authorization": f"key={self.firebase_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "to": device_token,
                "notification": {
                    "title": title,
                    "body": body,
                    "icon": "/icon-192x192.png",
                    "badge": "/icon-192x192.png"
                }
            }
            
            if data:
                payload["data"] = data
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    if response.status == 200:
                        logger.info(f"Firebase push sent to {device_token[:10]}...")
                        return True
                    else:
                        logger.error(f"Firebase push failed: {response.status}")
                        return False
                        
        except Exception as e:
            logger.error(f"Firebase push error: {e}")
            return False
    
    async def send_onesignal_push(self, user_id: str, title: str, body: str, data: Dict[str, Any] = None):
        """Send push notification via OneSignal"""
        if not self.onesignal_app_id or not self.onesignal_api_key:
            logger.warning("OneSignal credentials not configured")
            return False
        
        try:
            url = "https://onesignal.com/api/v1/notifications"
            headers = {
                "Authorization": f"Basic {self.onesignal_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "app_id": self.onesignal_app_id,
                "include_external_user_ids": [user_id],
                "headings": {"en": title},
                "contents": {"en": body},
                "web_url": "https://tradeflowai.com/dashboard"
            }
            
            if data:
                payload["data"] = data
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    if response.status == 200:
                        logger.info(f"OneSignal push sent to user {user_id}")
                        return True
                    else:
                        logger.error(f"OneSignal push failed: {response.status}")
                        return False
                        
        except Exception as e:
            logger.error(f"OneSignal push error: {e}")
            return False

class NotificationService:
    """Main notification service"""
    
    def __init__(self):
        self.websocket_manager = WebSocketManager()
        self.email_service = EmailService()
        self.push_service = PushNotificationService()
        self.notification_queue = asyncio.Queue()
        self.user_preferences = {}  # In production, load from database
        self.device_tokens = {}  # user_id -> device_token
        self.is_running = False
    
    async def start(self):
        """Start the notification service"""
        self.is_running = True
        asyncio.create_task(self._process_notifications())
        logger.info("Notification service started")
    
    async def stop(self):
        """Stop the notification service"""
        self.is_running = False
        logger.info("Notification service stopped")
    
    async def _process_notifications(self):
        """Process notification queue"""
        while self.is_running:
            try:
                notification = await asyncio.wait_for(
                    self.notification_queue.get(), 
                    timeout=1.0
                )
                await self._send_notification(notification)
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Error processing notification: {e}")
    
    async def send_notification(self, notification: Notification):
        """Queue a notification for sending"""
        await self.notification_queue.put(notification)
    
    async def _send_notification(self, notification: Notification):
        """Send notification through specified channels"""
        try:
            # Get user preferences (in production, load from database)
            user_prefs = self.user_preferences.get(notification.user_id, {
                "email_enabled": True,
                "push_enabled": True,
                "in_app_enabled": True
            })
            
            # Send through each requested channel
            for channel in notification.channels:
                if channel == NotificationChannel.IN_APP:
                    await self._send_in_app_notification(notification)
                
                elif channel == NotificationChannel.PUSH and user_prefs.get("push_enabled", True):
                    await self._send_push_notification(notification)
                
                elif channel == NotificationChannel.EMAIL and user_prefs.get("email_enabled", True):
                    await self._send_email_notification(notification)
            
            # Store notification in database (for notification history)
            await self._store_notification(notification)
            
        except Exception as e:
            logger.error(f"Error sending notification: {e}")
    
    async def _send_in_app_notification(self, notification: Notification):
        """Send in-app notification via WebSocket"""
        message = {
            "type": "notification",
            "notification": {
                "id": str(notification.created_at.timestamp()),
                "title": notification.title,
                "message": notification.message,
                "type": notification.type,
                "priority": notification.priority,
                "data": notification.data,
                "created_at": notification.created_at.isoformat()
            }
        }
        
        await self.websocket_manager.send_to_user(notification.user_id, message)
    
    async def _send_push_notification(self, notification: Notification):
        """Send push notification"""
        device_token = self.device_tokens.get(notification.user_id)
        if device_token:
            await self.push_service.send_firebase_push(
                device_token,
                notification.title,
                notification.message,
                notification.data
            )
        else:
            # Try OneSignal with user ID
            await self.push_service.send_onesignal_push(
                notification.user_id,
                notification.title,
                notification.message,
                notification.data
            )
    
    async def _send_email_notification(self, notification: Notification):
        """Send email notification"""
        # In production, get user email from database
        user_email = f"user_{notification.user_id}@example.com"  # Placeholder
        
        # Create HTML email template
        html_body = f"""
        <html>
        <body>
            <h2>{notification.title}</h2>
            <p>{notification.message}</p>
            <hr>
            <p><small>TradeFlowAI - AI Trading Platform</small></p>
        </body>
        </html>
        """
        
        await self.email_service.send_email(
            user_email,
            f"TradeFlowAI: {notification.title}",
            notification.message,
            html_body
        )
    
    async def _store_notification(self, notification: Notification):
        """Store notification in database"""
        # In production, save to database
        logger.info(f"Stored notification for user {notification.user_id}: {notification.title}")
    
    def add_websocket_connection(self, user_id: str, websocket):
        """Add WebSocket connection for real-time notifications"""
        self.websocket_manager.add_connection(user_id, websocket)
    
    def remove_websocket_connection(self, user_id: str, websocket):
        """Remove WebSocket connection"""
        self.websocket_manager.remove_connection(user_id, websocket)
    
    def register_device_token(self, user_id: str, device_token: str):
        """Register device token for push notifications"""
        self.device_tokens[user_id] = device_token
        logger.info(f"Registered device token for user {user_id}")
    
    async def send_price_alert(self, user_id: str, symbol: str, current_price: float, target_price: float, condition: str):
        """Send price alert notification"""
        notification = Notification(
            user_id=user_id,
            title=f"Price Alert: {symbol}",
            message=f"{symbol} has {condition} ${target_price:.2f}. Current price: ${current_price:.2f}",
            type=NotificationType.PRICE_ALERT,
            channels=[NotificationChannel.IN_APP, NotificationChannel.PUSH],
            data={
                "symbol": symbol,
                "current_price": current_price,
                "target_price": target_price,
                "condition": condition
            },
            priority="high"
        )
        
        await self.send_notification(notification)
    
    async def send_order_fill_notification(self, user_id: str, order_data: Dict[str, Any]):
        """Send order fill notification"""
        notification = Notification(
            user_id=user_id,
            title="Order Filled",
            message=f"Your {order_data['side']} order for {order_data['quantity']} shares of {order_data['symbol']} has been filled at ${order_data['price']:.2f}",
            type=NotificationType.ORDER_FILL,
            channels=[NotificationChannel.IN_APP, NotificationChannel.PUSH, NotificationChannel.EMAIL],
            data=order_data,
            priority="high"
        )
        
        await self.send_notification(notification)
    
    async def send_market_alert(self, message: str, priority: str = "normal"):
        """Send market-wide alert to all users"""
        # In production, get all active users from database
        active_users = ["user1", "user2"]  # Placeholder
        
        for user_id in active_users:
            notification = Notification(
                user_id=user_id,
                title="Market Alert",
                message=message,
                type=NotificationType.SYSTEM_ALERT,
                channels=[NotificationChannel.IN_APP],
                priority=priority
            )
            
            await self.send_notification(notification)

# Global notification service instance
notification_service = NotificationService()