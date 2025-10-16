import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for handling touch gestures including swipe, pinch, and tap
 */
export const useTouchGestures = (options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onDoubleTap,
    swipeThreshold = 50,
    pinchThreshold = 0.1,
    tapTimeout = 300
  } = options;

  const [gestureState, setGestureState] = useState({
    isGesturing: false,
    gestureType: null,
    scale: 1,
    rotation: 0,
    deltaX: 0,
    deltaY: 0
  });

  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const lastTapRef = useRef(0);
  const initialDistanceRef = useRef(0);
  const initialScaleRef = useRef(1);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    if (e.touches.length === 2) {
      // Pinch gesture start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      initialDistanceRef.current = distance;
      
      setGestureState(prev => ({
        ...prev,
        isGesturing: true,
        gestureType: 'pinch'
      }));
    } else {
      setGestureState(prev => ({
        ...prev,
        isGesturing: true,
        gestureType: 'swipe'
      }));
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchStartRef.current) return;

    if (e.touches.length === 2 && gestureState.gestureType === 'pinch') {
      // Handle pinch gesture
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scale = distance / initialDistanceRef.current;
      
      setGestureState(prev => ({
        ...prev,
        scale: initialScaleRef.current * scale
      }));

      if (onPinch) {
        onPinch({
          scale: initialScaleRef.current * scale,
          delta: scale - 1
        });
      }
    } else if (e.touches.length === 1) {
      // Handle swipe gesture
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      
      setGestureState(prev => ({
        ...prev,
        deltaX,
        deltaY
      }));
    }
  }, [gestureState.gestureType, onPinch]);

  const handleTouchEnd = useCallback((e) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const deltaTime = touchEndRef.current.timestamp - touchStartRef.current.timestamp;

    // Handle tap gestures
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < tapTimeout) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;
      
      if (timeSinceLastTap < 300 && onDoubleTap) {
        onDoubleTap({ x: touch.clientX, y: touch.clientY });
      } else if (onTap) {
        onTap({ x: touch.clientX, y: touch.clientY });
      }
      
      lastTapRef.current = now;
    }

    // Handle swipe gestures
    if (gestureState.gestureType === 'swipe') {
      if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight({ deltaX, deltaY, velocity: deltaX / deltaTime });
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft({ deltaX, deltaY, velocity: Math.abs(deltaX) / deltaTime });
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown({ deltaX, deltaY, velocity: deltaY / deltaTime });
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp({ deltaX, deltaY, velocity: Math.abs(deltaY) / deltaTime });
          }
        }
      }
    }

    // Reset gesture state
    setGestureState({
      isGesturing: false,
      gestureType: null,
      scale: 1,
      rotation: 0,
      deltaX: 0,
      deltaY: 0
    });

    touchStartRef.current = null;
    touchEndRef.current = null;
    initialScaleRef.current = gestureState.scale;
  }, [gestureState, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap, swipeThreshold, tapTimeout]);

  return {
    gestureState,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};