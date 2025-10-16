"""
Computer Vision Agent for chart pattern recognition and technical analysis
"""
import cv2
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
import logging
from datetime import datetime
import base64
import io
from PIL import Image, ImageDraw
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from sklearn.cluster import DBSCAN
from scipy.signal import find_peaks, argrelextrema
import plotly.graph_objects as go
from plotly.subplots import make_subplots

logger = logging.getLogger(__name__)

class ChartPatternRecognitionAgent:
    """AI agent for recognizing chart patterns using computer vision"""
    
    def __init__(self):
        self.pattern_templates = self._load_pattern_templates()
        self.confidence_threshold = 0.7
        
    def _load_pattern_templates(self) -> Dict[str, Any]:
        """Load pre-trained pattern recognition templates"""
        return {
            'head_and_shoulders': {
                'description': 'Head and shoulders reversal pattern',
                'bullish': False,
                'min_points': 5
            },
            'double_top': {
                'description': 'Double top reversal pattern',
                'bullish': False,
                'min_points': 4
            },
            'double_bottom': {
                'description': 'Double bottom reversal pattern',
                'bullish': True,
                'min_points': 4
            },
            'triangle_ascending': {
                'description': 'Ascending triangle continuation pattern',
                'bullish': True,
                'min_points': 6
            },
            'triangle_descending': {
                'description': 'Descending triangle continuation pattern',
                'bullish': False,
                'min_points': 6
            },
            'flag_bull': {
                'description': 'Bullish flag continuation pattern',
                'bullish': True,
                'min_points': 4
            },
            'flag_bear': {
                'description': 'Bearish flag continuation pattern',
                'bullish': False,
                'min_points': 4
            },
            'wedge_rising': {
                'description': 'Rising wedge reversal pattern',
                'bullish': False,
                'min_points': 6
            },
            'wedge_falling': {
                'description': 'Falling wedge reversal pattern',
                'bullish': True,
                'min_points': 6
            }
        }
    
    async def analyze_chart_image(self, image_data: str) -> Dict[str, Any]:
        """Analyze uploaded chart image for patterns"""
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to OpenCV format
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Extract price line from chart
            price_line = self._extract_price_line(cv_image)
            
            if price_line is None:
                return {'error': 'Could not extract price line from chart'}
            
            # Detect patterns
            patterns = self._detect_patterns(price_line)
            
            # Analyze support and resistance
            support_resistance = self._find_support_resistance(price_line)
            
            # Generate insights
            insights = self._generate_chart_insights(patterns, support_resistance)
            
            return {
                'patterns_detected': patterns,
                'support_resistance': support_resistance,
                'insights': insights,
                'confidence_score': self._calculate_overall_confidence(patterns)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing chart image: {e}")
            return {'error': f'Chart analysis failed: {str(e)}'}
    
    def _extract_price_line(self, image: np.ndarray) -> Optional[List[Tuple[int, int]]]:
        """Extract price line coordinates from chart image"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply edge detection
            edges = cv2.Canny(gray, 50, 150, apertureSize=3)
            
            # Find lines using Hough transform
            lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, minLineLength=50, maxLineGap=10)
            
            if lines is None:
                return None
            
            # Filter and connect lines to form price path
            price_points = []
            for line in lines:
                x1, y1, x2, y2 = line[0]
                price_points.extend([(x1, y1), (x2, y2)])
            
            # Sort by x-coordinate and remove duplicates
            price_points = sorted(list(set(price_points)), key=lambda p: p[0])
            
            return price_points
            
        except Exception as e:
            logger.error(f"Error extracting price line: {e}")
            return None
    
    def _detect_patterns(self, price_line: List[Tuple[int, int]]) -> List[Dict[str, Any]]:
        """Detect chart patterns in price line"""
        patterns = []
        
        if len(price_line) < 10:
            return patterns
        
        # Convert to price array
        prices = np.array([p[1] for p in price_line])
        x_coords = np.array([p[0] for p in price_line])
        
        # Normalize prices (invert y-axis since image coordinates are inverted)
        prices = np.max(prices) - prices
        
        # Find peaks and troughs
        peaks, _ = find_peaks(prices, distance=len(prices)//10)
        troughs, _ = find_peaks(-prices, distance=len(prices)//10)
        
        # Detect specific patterns
        patterns.extend(self._detect_head_and_shoulders(prices, peaks, troughs))
        patterns.extend(self._detect_double_top_bottom(prices, peaks, troughs))
        patterns.extend(self._detect_triangles(prices, peaks, troughs))
        patterns.extend(self._detect_flags(prices, peaks, troughs))
        patterns.extend(self._detect_wedges(prices, peaks, troughs))
        
        return patterns
    
    def _detect_head_and_shoulders(self, prices: np.ndarray, peaks: np.ndarray, troughs: np.ndarray) -> List[Dict[str, Any]]:
        """Detect head and shoulders patterns"""
        patterns = []
        
        if len(peaks) >= 3 and len(troughs) >= 2:
            for i in range(len(peaks) - 2):
                left_shoulder = peaks[i]
                head = peaks[i + 1]
                right_shoulder = peaks[i + 2]
                
                # Check if head is higher than shoulders
                if (prices[head] > prices[left_shoulder] and 
                    prices[head] > prices[right_shoulder] and
                    abs(prices[left_shoulder] - prices[right_shoulder]) < prices[head] * 0.05):
                    
                    patterns.append({
                        'type': 'head_and_shoulders',
                        'description': 'Head and shoulders reversal pattern',
                        'bullish': False,
                        'confidence': 0.8,
                        'coordinates': [left_shoulder, head, right_shoulder],
                        'target_price': prices[head] - (prices[head] - min(prices[left_shoulder], prices[right_shoulder])),
                        'stop_loss': prices[head] * 1.02
                    })
        
        return patterns
    
    def _detect_double_top_bottom(self, prices: np.ndarray, peaks: np.ndarray, troughs: np.ndarray) -> List[Dict[str, Any]]:
        """Detect double top and double bottom patterns"""
        patterns = []
        
        # Double top
        if len(peaks) >= 2:
            for i in range(len(peaks) - 1):
                peak1 = peaks[i]
                peak2 = peaks[i + 1]
                
                if abs(prices[peak1] - prices[peak2]) < prices[peak1] * 0.03:
                    patterns.append({
                        'type': 'double_top',
                        'description': 'Double top reversal pattern',
                        'bullish': False,
                        'confidence': 0.75,
                        'coordinates': [peak1, peak2],
                        'target_price': prices[peak1] * 0.95,
                        'stop_loss': prices[peak1] * 1.02
                    })
        
        # Double bottom
        if len(troughs) >= 2:
            for i in range(len(troughs) - 1):
                trough1 = troughs[i]
                trough2 = troughs[i + 1]
                
                if abs(prices[trough1] - prices[trough2]) < prices[trough1] * 0.03:
                    patterns.append({
                        'type': 'double_bottom',
                        'description': 'Double bottom reversal pattern',
                        'bullish': True,
                        'confidence': 0.75,
                        'coordinates': [trough1, trough2],
                        'target_price': prices[trough1] * 1.05,
                        'stop_loss': prices[trough1] * 0.98
                    })
        
        return patterns
    
    def _detect_triangles(self, prices: np.ndarray, peaks: np.ndarray, troughs: np.ndarray) -> List[Dict[str, Any]]:
        """Detect triangle patterns"""
        patterns = []
        
        if len(peaks) >= 2 and len(troughs) >= 2:
            # Ascending triangle (horizontal resistance, rising support)
            peak_trend = np.polyfit(peaks, prices[peaks], 1)[0]
            trough_trend = np.polyfit(troughs, prices[troughs], 1)[0]
            
            if abs(peak_trend) < 0.001 and trough_trend > 0.001:
                patterns.append({
                    'type': 'triangle_ascending',
                    'description': 'Ascending triangle continuation pattern',
                    'bullish': True,
                    'confidence': 0.7,
                    'coordinates': list(peaks) + list(troughs),
                    'target_price': np.mean(prices[peaks]) * 1.03,
                    'stop_loss': np.mean(prices[troughs]) * 0.98
                })
            
            # Descending triangle (declining resistance, horizontal support)
            elif peak_trend < -0.001 and abs(trough_trend) < 0.001:
                patterns.append({
                    'type': 'triangle_descending',
                    'description': 'Descending triangle continuation pattern',
                    'bullish': False,
                    'confidence': 0.7,
                    'coordinates': list(peaks) + list(troughs),
                    'target_price': np.mean(prices[troughs]) * 0.97,
                    'stop_loss': np.mean(prices[peaks]) * 1.02
                })
        
        return patterns
    
    def _detect_flags(self, prices: np.ndarray, peaks: np.ndarray, troughs: np.ndarray) -> List[Dict[str, Any]]:
        """Detect flag patterns"""
        patterns = []
        
        # Look for consolidation after strong moves
        if len(prices) >= 20:
            for i in range(10, len(prices) - 10):
                # Check for strong move before flag
                pre_move = (prices[i] - prices[i-10]) / prices[i-10]
                
                # Check for consolidation (flag)
                flag_prices = prices[i:i+10]
                flag_volatility = np.std(flag_prices) / np.mean(flag_prices)
                
                if abs(pre_move) > 0.05 and flag_volatility < 0.02:
                    patterns.append({
                        'type': 'flag_bull' if pre_move > 0 else 'flag_bear',
                        'description': f'{"Bullish" if pre_move > 0 else "Bearish"} flag continuation pattern',
                        'bullish': pre_move > 0,
                        'confidence': 0.65,
                        'coordinates': list(range(i-10, i+10)),
                        'target_price': prices[i] * (1 + pre_move),
                        'stop_loss': prices[i] * (1 - abs(pre_move) * 0.5)
                    })
        
        return patterns
    
    def _detect_wedges(self, prices: np.ndarray, peaks: np.ndarray, troughs: np.ndarray) -> List[Dict[str, Any]]:
        """Detect wedge patterns"""
        patterns = []
        
        if len(peaks) >= 2 and len(troughs) >= 2:
            peak_trend = np.polyfit(peaks, prices[peaks], 1)[0]
            trough_trend = np.polyfit(troughs, prices[troughs], 1)[0]
            
            # Rising wedge (both lines rising, but resistance rises slower)
            if peak_trend > 0 and trough_trend > 0 and trough_trend > peak_trend:
                patterns.append({
                    'type': 'wedge_rising',
                    'description': 'Rising wedge reversal pattern',
                    'bullish': False,
                    'confidence': 0.6,
                    'coordinates': list(peaks) + list(troughs),
                    'target_price': np.mean(prices[troughs]) * 0.95,
                    'stop_loss': np.mean(prices[peaks]) * 1.02
                })
            
            # Falling wedge (both lines falling, but support falls slower)
            elif peak_trend < 0 and trough_trend < 0 and abs(trough_trend) < abs(peak_trend):
                patterns.append({
                    'type': 'wedge_falling',
                    'description': 'Falling wedge reversal pattern',
                    'bullish': True,
                    'confidence': 0.6,
                    'coordinates': list(peaks) + list(troughs),
                    'target_price': np.mean(prices[peaks]) * 1.05,
                    'stop_loss': np.mean(prices[troughs]) * 0.98
                })
        
        return patterns
    
    def _find_support_resistance(self, price_line: List[Tuple[int, int]]) -> Dict[str, Any]:
        """Find support and resistance levels"""
        if len(price_line) < 10:
            return {'support_levels': [], 'resistance_levels': []}
        
        prices = np.array([p[1] for p in price_line])
        prices = np.max(prices) - prices  # Invert y-axis
        
        # Find local maxima and minima
        resistance_indices = argrelextrema(prices, np.greater, order=5)[0]
        support_indices = argrelextrema(prices, np.less, order=5)[0]
        
        # Cluster similar levels
        resistance_levels = self._cluster_levels(prices[resistance_indices])
        support_levels = self._cluster_levels(prices[support_indices])
        
        return {
            'support_levels': [{'price': level, 'strength': strength} for level, strength in support_levels],
            'resistance_levels': [{'price': level, 'strength': strength} for level, strength in resistance_levels]
        }
    
    def _cluster_levels(self, levels: np.ndarray, tolerance: float = 0.02) -> List[Tuple[float, int]]:
        """Cluster similar price levels"""
        if len(levels) == 0:
            return []
        
        # Use DBSCAN clustering
        levels_reshaped = levels.reshape(-1, 1)
        clustering = DBSCAN(eps=np.mean(levels) * tolerance, min_samples=2).fit(levels_reshaped)
        
        clustered_levels = []
        for cluster_id in set(clustering.labels_):
            if cluster_id != -1:  # Ignore noise points
                cluster_points = levels[clustering.labels_ == cluster_id]
                cluster_center = np.mean(cluster_points)
                cluster_strength = len(cluster_points)
                clustered_levels.append((cluster_center, cluster_strength))
        
        # Add individual points that weren't clustered
        noise_points = levels[clustering.labels_ == -1]
        for point in noise_points:
            clustered_levels.append((point, 1))
        
        return sorted(clustered_levels, key=lambda x: x[1], reverse=True)
    
    def _generate_chart_insights(self, patterns: List[Dict[str, Any]], support_resistance: Dict[str, Any]) -> List[str]:
        """Generate actionable insights from pattern analysis"""
        insights = []
        
        # Pattern-based insights
        bullish_patterns = [p for p in patterns if p.get('bullish', False)]
        bearish_patterns = [p for p in patterns if not p.get('bullish', True)]
        
        if bullish_patterns:
            insights.append(f"Detected {len(bullish_patterns)} bullish pattern(s): {', '.join([p['type'] for p in bullish_patterns])}")
        
        if bearish_patterns:
            insights.append(f"Detected {len(bearish_patterns)} bearish pattern(s): {', '.join([p['type'] for p in bearish_patterns])}")
        
        # Support/Resistance insights
        strong_support = [level for level in support_resistance['support_levels'] if level['strength'] >= 3]
        strong_resistance = [level for level in support_resistance['resistance_levels'] if level['strength'] >= 3]
        
        if strong_support:
            insights.append(f"Strong support identified at {len(strong_support)} level(s)")
        
        if strong_resistance:
            insights.append(f"Strong resistance identified at {len(strong_resistance)} level(s)")
        
        # Overall bias
        if len(bullish_patterns) > len(bearish_patterns):
            insights.append("Overall technical bias: BULLISH")
        elif len(bearish_patterns) > len(bullish_patterns):
            insights.append("Overall technical bias: BEARISH")
        else:
            insights.append("Overall technical bias: NEUTRAL")
        
        return insights
    
    def _calculate_overall_confidence(self, patterns: List[Dict[str, Any]]) -> float:
        """Calculate overall confidence score for the analysis"""
        if not patterns:
            return 0.0
        
        total_confidence = sum(p.get('confidence', 0) for p in patterns)
        return min(total_confidence / len(patterns), 1.0)

class MultimodalAnalysisAgent:
    """Agent for analyzing multiple data types simultaneously"""
    
    def __init__(self):
        self.chart_agent = ChartPatternRecognitionAgent()
        
    async def analyze_multimodal_data(self, 
                                    chart_image: Optional[str] = None,
                                    news_text: Optional[str] = None,
                                    earnings_transcript: Optional[str] = None,
                                    social_posts: Optional[List[str]] = None) -> Dict[str, Any]:
        """Analyze multiple data modalities and provide unified insights"""
        
        analysis_results = {}
        
        # Chart analysis
        if chart_image:
            chart_analysis = await self.chart_agent.analyze_chart_image(chart_image)
            analysis_results['technical_analysis'] = chart_analysis
        
        # Text analysis
        if news_text or earnings_transcript or social_posts:
            text_analysis = await self._analyze_text_data(news_text, earnings_transcript, social_posts)
            analysis_results['sentiment_analysis'] = text_analysis
        
        # Cross-modal correlation
        if len(analysis_results) > 1:
            correlation_analysis = self._correlate_modalities(analysis_results)
            analysis_results['cross_modal_insights'] = correlation_analysis
        
        # Generate unified recommendation
        unified_recommendation = self._generate_unified_recommendation(analysis_results)
        analysis_results['unified_recommendation'] = unified_recommendation
        
        return analysis_results
    
    async def _analyze_text_data(self, 
                               news_text: Optional[str] = None,
                               earnings_transcript: Optional[str] = None,
                               social_posts: Optional[List[str]] = None) -> Dict[str, Any]:
        """Analyze text data for sentiment and key themes"""
        
        sentiment_scores = []
        key_themes = []
        
        # Analyze news
        if news_text:
            news_sentiment = self._calculate_text_sentiment(news_text)
            sentiment_scores.append(('news', news_sentiment))
            key_themes.extend(self._extract_key_themes(news_text))
        
        # Analyze earnings transcript
        if earnings_transcript:
            earnings_sentiment = self._calculate_text_sentiment(earnings_transcript)
            sentiment_scores.append(('earnings', earnings_sentiment))
            key_themes.extend(self._extract_key_themes(earnings_transcript))
        
        # Analyze social posts
        if social_posts:
            social_sentiment = np.mean([self._calculate_text_sentiment(post) for post in social_posts])
            sentiment_scores.append(('social', social_sentiment))
            for post in social_posts:
                key_themes.extend(self._extract_key_themes(post))
        
        return {
            'sentiment_scores': sentiment_scores,
            'overall_sentiment': np.mean([score for _, score in sentiment_scores]) if sentiment_scores else 0,
            'key_themes': list(set(key_themes))
        }
    
    def _calculate_text_sentiment(self, text: str) -> float:
        """Calculate sentiment score for text (simplified implementation)"""
        positive_words = ['growth', 'profit', 'beat', 'exceed', 'strong', 'bullish', 'positive', 'gain', 'rise']
        negative_words = ['loss', 'decline', 'miss', 'weak', 'bearish', 'negative', 'fall', 'drop', 'concern']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count + negative_count == 0:
            return 0.0
        
        return (positive_count - negative_count) / (positive_count + negative_count)
    
    def _extract_key_themes(self, text: str) -> List[str]:
        """Extract key themes from text (simplified implementation)"""
        themes = []
        theme_keywords = {
            'earnings': ['earnings', 'revenue', 'profit', 'eps'],
            'growth': ['growth', 'expansion', 'increase', 'rising'],
            'market_share': ['market', 'competition', 'share', 'competitive'],
            'innovation': ['innovation', 'technology', 'development', 'research'],
            'regulation': ['regulation', 'compliance', 'legal', 'government']
        }
        
        text_lower = text.lower()
        for theme, keywords in theme_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                themes.append(theme)
        
        return themes
    
    def _correlate_modalities(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Find correlations between different analysis modalities"""
        correlations = {}
        
        # Technical vs Sentiment correlation
        if 'technical_analysis' in analysis_results and 'sentiment_analysis' in analysis_results:
            tech_bias = self._get_technical_bias(analysis_results['technical_analysis'])
            sentiment_bias = analysis_results['sentiment_analysis']['overall_sentiment']
            
            correlation_strength = abs(tech_bias * sentiment_bias)
            agreement = (tech_bias > 0) == (sentiment_bias > 0)
            
            correlations['technical_sentiment'] = {
                'agreement': agreement,
                'strength': correlation_strength,
                'description': f"Technical and sentiment analysis {'agree' if agreement else 'disagree'} with {correlation_strength:.2f} strength"
            }
        
        return correlations
    
    def _get_technical_bias(self, technical_analysis: Dict[str, Any]) -> float:
        """Extract technical bias from chart analysis"""
        if 'patterns_detected' not in technical_analysis:
            return 0.0
        
        patterns = technical_analysis['patterns_detected']
        bullish_count = sum(1 for p in patterns if p.get('bullish', False))
        bearish_count = sum(1 for p in patterns if not p.get('bullish', True))
        
        if bullish_count + bearish_count == 0:
            return 0.0
        
        return (bullish_count - bearish_count) / (bullish_count + bearish_count)
    
    def _generate_unified_recommendation(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate unified recommendation from all analysis modalities"""
        
        recommendations = []
        confidence_scores = []
        
        # Technical recommendation
        if 'technical_analysis' in analysis_results:
            tech_bias = self._get_technical_bias(analysis_results['technical_analysis'])
            tech_confidence = analysis_results['technical_analysis'].get('confidence_score', 0)
            
            if tech_bias > 0.3:
                recommendations.append(('technical', 'BUY', tech_confidence))
            elif tech_bias < -0.3:
                recommendations.append(('technical', 'SELL', tech_confidence))
            else:
                recommendations.append(('technical', 'HOLD', tech_confidence))
        
        # Sentiment recommendation
        if 'sentiment_analysis' in analysis_results:
            sentiment = analysis_results['sentiment_analysis']['overall_sentiment']
            sentiment_confidence = min(abs(sentiment) * 2, 1.0)  # Convert to confidence
            
            if sentiment > 0.2:
                recommendations.append(('sentiment', 'BUY', sentiment_confidence))
            elif sentiment < -0.2:
                recommendations.append(('sentiment', 'SELL', sentiment_confidence))
            else:
                recommendations.append(('sentiment', 'HOLD', sentiment_confidence))
        
        # Unified decision
        if recommendations:
            buy_weight = sum(conf for source, action, conf in recommendations if action == 'BUY')
            sell_weight = sum(conf for source, action, conf in recommendations if action == 'SELL')
            hold_weight = sum(conf for source, action, conf in recommendations if action == 'HOLD')
            
            total_weight = buy_weight + sell_weight + hold_weight
            
            if buy_weight > sell_weight and buy_weight > hold_weight:
                final_action = 'BUY'
                final_confidence = buy_weight / total_weight
            elif sell_weight > hold_weight:
                final_action = 'SELL'
                final_confidence = sell_weight / total_weight
            else:
                final_action = 'HOLD'
                final_confidence = hold_weight / total_weight
        else:
            final_action = 'HOLD'
            final_confidence = 0.0
        
        return {
            'action': final_action,
            'confidence': final_confidence,
            'individual_recommendations': recommendations,
            'reasoning': f"Unified analysis suggests {final_action} with {final_confidence:.2f} confidence based on {len(recommendations)} data sources"
        }

# Global instances
chart_pattern_agent = ChartPatternRecognitionAgent()
multimodal_agent = MultimodalAnalysisAgent()