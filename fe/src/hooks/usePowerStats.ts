import { useState, useEffect } from 'react';
import usePowerData from './usePowerData';

export interface PowerStats {
  current: {
    power: number; // Current power consumption in watts
    today: number; // kWh used today
    week: number;  // kWh used this week
    month: number; // kWh used this month
  };
  history: {
    hourly: [string, number][]; // [timestamp, power] for last 24 hours
    daily: [string, number][];  // [timestamp, power] for last 7 days
    monthly: [string, number][]; // [timestamp, power] for last 30 days
  };
  loading: boolean;
}

// Sample data generator for development
const generateSampleData = (period: string) => {
  const now = new Date();
  const data: [string, number][] = [];
  
  if (period === '24h') {
    // Generate hourly data for last 24 hours
    for (let i = 0; i < 24; i++) {
      const time = new Date(now);
      time.setHours(now.getHours() - (23 - i));
      // More usage during day, less at night
      const baseValue = (i >= 8 && i <= 20) ? 500 + Math.random() * 300 : 100 + Math.random() * 100;
      data.push([time.toISOString(), baseValue]);
    }
  } else if (period === 'week') {
    // Generate daily data for last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - i));
      // Weekend vs weekday variation
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseValue = isWeekend ? 12 + Math.random() * 5 : 9 + Math.random() * 4;
      data.push([date.toISOString().split('T')[0], baseValue]);
    }
  } else if (period === 'month') {
    // Generate data for last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - (29 - i));
      const baseValue = 8 + Math.random() * 6; // kWh per day
      data.push([date.toISOString().split('T')[0], baseValue]);
    }
  }
  
  return data;
};

const usePowerStats = () => {
  const { powerData, isConnected } = usePowerData();
  const [stats, setStats] = useState<PowerStats>({
    current: {
      power: 0,
      today: 0,
      week: 0,
      month: 0,
    },
    history: {
      hourly: [],
      daily: [],
      monthly: [],
    },
    loading: true
  });
  
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | 'week' | 'month'>('24h');
  
  // Effect to update current power from websocket data
  useEffect(() => {
    if (powerData && powerData.totalPower !== undefined) {
      setStats(prev => ({
        ...prev,
        current: {
          ...prev.current,
          power: powerData.totalPower || 0
        },
        loading: false
      }));
    }
  }, [powerData]);
  
  // Effect to fetch historical data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setStats(prev => ({ ...prev, loading: true }));
      
      try {
        // In a real app, you'd fetch from your API here:
        // const response = await fetch(`/api/power/history?period=${selectedPeriod}`);
        // const data = await response.json();
        
        // For now, use sample data
        const sampleData = generateSampleData(selectedPeriod);
        
        // Calculate kWh totals
        let todayKwh = 0;
        let weekKwh = 0;
        let monthKwh = 0;
        
        if (selectedPeriod === '24h') {
          // Sum up power readings and convert to kWh
          todayKwh = sampleData.reduce((sum, [_, value]) => sum + value, 0) / 1000;
          weekKwh = todayKwh * 7;
          monthKwh = todayKwh * 30;
        } else if (selectedPeriod === 'week') {
          weekKwh = sampleData.reduce((sum, [_, value]) => sum + value, 0);
          todayKwh = weekKwh / 7;
          monthKwh = weekKwh * (30/7);
        } else if (selectedPeriod === 'month') {
          monthKwh = sampleData.reduce((sum, [_, value]) => sum + value, 0);
          todayKwh = monthKwh / 30;
          weekKwh = monthKwh * (7/30);
        }
        
        setStats(prev => ({
          ...prev,
          current: {
            ...prev.current,
            today: parseFloat(todayKwh.toFixed(1)),
            week: parseFloat(weekKwh.toFixed(1)),
            month: parseFloat(monthKwh.toFixed(1))
          },
          history: {
            ...prev.history,
            [selectedPeriod === '24h' ? 'hourly' : 
              selectedPeriod === 'week' ? 'daily' : 'monthly']: sampleData
          },
          loading: false
        }));
        
      } catch (error) {
        console.error('Error fetching power history:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    
    fetchHistoricalData();
    
    // Set up interval to refresh data (every 5 minutes)
    const intervalId = setInterval(fetchHistoricalData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [selectedPeriod]);
  
  return { stats, selectedPeriod, setSelectedPeriod };
};

export default usePowerStats;