import { useState, useEffect } from 'react';
import usePowerData from './usePowerData';

export interface PowerStats {
  current: {
    power: number; // Current power consumption in watts
    current: number; // Current load in amps
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

// GraphQL endpoint
const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

// GraphQL queries
const POWER_STATS_QUERY = `
  query GetPowerStats($period: String!) {
    powerStats(period: $period) {
      current {
        power
        today
        week
        month
      }
      history {
        hourly {
          timestamp
          value
        }
        daily {
          timestamp
          value
        }
        monthly {
          timestamp
          value
        }
      }
    }
  }
`;

// Keep your existing sample data generation for fallback
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
      current: 0, // Add current property
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
  const [error, setError] = useState<string | null>(null);
  
  // Update current power from WebSocket when available
  useEffect(() => {
    if (powerData) {
      setStats(prev => ({
        ...prev,
        current: {
          ...prev.current,
          power: powerData.totalPower || 0,
          current: powerData.totalCurrent || 0 // Add current from websocket data
        },
        loading: false
      }));
    }
  }, [powerData]);
  
  // Fetch historical data from GraphQL API
  useEffect(() => {
    const fetchPowerStats = async () => {
      setStats(prev => ({ ...prev, loading: true }));
      
      try {
        // GraphQL request
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: POWER_STATS_QUERY,
            variables: { period: selectedPeriod },
          }),
        });
        
        const result = await response.json();
        
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        
        // Format the time series data from GraphQL
        const formatTimeSeriesData = (timeSeries: { timestamp: string, value: number }[]): [string, number][] => {
          return timeSeries.map(point => [point.timestamp, point.value]);
        };
        
        setStats({
          current: {
            // Use real-time power from WebSocket if available, otherwise from GraphQL
            power: powerData?.totalPower ?? result.data.powerStats.current.power,
            current: powerData?.totalCurrent ?? 0, // Add current property
            today: result.data.powerStats.current.today,
            week: result.data.powerStats.current.week,
            month: result.data.powerStats.current.month,
          },
          history: {
            hourly: formatTimeSeriesData(result.data.powerStats.history.hourly || []),
            daily: formatTimeSeriesData(result.data.powerStats.history.daily || []),
            monthly: formatTimeSeriesData(result.data.powerStats.history.monthly || []),
          },
          loading: false
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching power stats:', err);
        setError('Failed to fetch power data from GraphQL API');
        
        // Fallback to sample data generation
        const sampleData = generateSampleData(selectedPeriod);
        
        // Calculate kWh totals from sample data
        let todayKwh = 0;
        let weekKwh = 0;
        let monthKwh = 0;
        
        if (selectedPeriod === '24h') {
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
      }
    };
    
    fetchPowerStats();
    
    // Refresh data periodically (every 5 minutes)
    const intervalId = setInterval(fetchPowerStats, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [selectedPeriod, powerData?.totalPower, powerData?.totalCurrent]);
  
  return { stats, selectedPeriod, setSelectedPeriod, error };
};

export default usePowerStats;