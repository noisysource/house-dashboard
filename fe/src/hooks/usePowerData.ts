import { useState, useEffect, useRef } from 'react';
import { IPowerReading } from '@house-dashboard/db-service/src/models';

interface PowerData {
  channels: Record<string, IPowerReading>;
  totalPower: number;
  totalCurrent: number;
  timestamp?: number;
}

export const usePowerData = () => {
  const [powerData, setPowerData] = useState<PowerData>({
    channels: {},
    totalPower: 0,
    totalCurrent: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    // WebSocket connection URL
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001/ws';
    
    // Create WebSocket connection
    const connectWebSocket = () => {
      console.log('Connecting to WebSocket...');
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'initial_data' || message.type === 'power_update') {
            setPowerData(message.data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Failed to connect to power monitoring service');
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Try to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
    };
    
    connectWebSocket();
    
    // Clean up
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  // For backward compatibility with useAmperageGenerator
  const currentAmperage = powerData.totalCurrent;
  
  return {
    powerData,
    currentAmperage,
    isConnected,
    error
  };
};

export default usePowerData;