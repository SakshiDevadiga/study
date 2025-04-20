import { useState, useEffect, useRef } from 'react';

interface WebSocketHook {
  socket: WebSocket | null;
  isConnected: boolean;
  error: string | null;
}

export function useWebSocket(): WebSocketHook {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const connect = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
          console.log('WebSocket connected');
        };
        
        ws.onclose = (e) => {
          setIsConnected(false);
          console.log('WebSocket closed', e.code, e.reason);
          
          // Try to reconnect after 2 seconds
          if (reconnectTimeoutRef.current !== null) {
            window.clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = window.setTimeout(connect, 2000);
        };
        
        ws.onerror = (e) => {
          setError('Connection failed. Will try to reconnect...');
          console.error('WebSocket error:', e);
        };
        
        setSocket(ws);
        
        return () => {
          ws.close();
          if (reconnectTimeoutRef.current !== null) {
            window.clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };
      } catch (err) {
        setError(`WebSocket initialization failed: ${err}`);
        console.error('Failed to create WebSocket:', err);
        return () => {};
      }
    };
    
    const cleanup = connect();
    
    return () => {
      cleanup();
    };
  }, []);
  
  return { socket, isConnected, error };
}
