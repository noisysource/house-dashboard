import { useState, useEffect } from 'react';
import usePowerData from './usePowerData';
import { POWER_STATS_QUERY } from '../graphql/queries/queries';

// Define a mapping from UI timeRange to API period
export const timeRangeToApiPeriod = {
  'day': '24h',
  'week': 'week',
  'month': 'month'
} as const;

// Define a mapping from API period to display text
export const periodToDisplayText = {
  '24h': 'Last 24 Hours',
  'week': 'This Week',
  'month': 'This Month'
} as const;

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

interface UsePowerStatsProps {
  timeRange?: 'day' | 'week' | 'month'; // Optional prop to control period externally
}

const usePowerStats = ({ timeRange }: UsePowerStatsProps = {}) => {
  const { powerData, isConnected } = usePowerData();
  const [stats, setStats] = useState<PowerStats>({
    current: {
      power: 0,
      current: 0,
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

  // If timeRange is provided, use it to determine selectedPeriod
  const initialPeriod = timeRange ? timeRangeToApiPeriod[timeRange] : '24h';
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | 'week' | 'month'>(initialPeriod);
  const [error, setError] = useState<string | null>(null);

  // Update selectedPeriod when timeRange prop changes
  useEffect(() => {
    if (timeRange) {
      setSelectedPeriod(timeRangeToApiPeriod[timeRange]);
    }
  }, [timeRange]);

  // Update current power from WebSocket when available
  useEffect(() => {
    if (powerData) {
      setStats(prev => ({
        ...prev,
        current: {
          ...prev.current,
          power: powerData.totalPower || 0,
          current: powerData.totalCurrent || 0
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

        // Debug the raw response
        console.log('GraphQL response:', JSON.stringify(result));

        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          throw new Error(result.errors[0].message);
        }

        // Create default values for missing data
        const defaultData = {
          current: {
            power: 0,
            current: 0,
            today: 0,
            week: 0,
            month: 0,
          },
          history: {
            hourly: [],
            daily: [],
            monthly: []
          }
        };

        // Safely extract data with fallbacks
        const powerStats = result.data?.powerStats || defaultData;

        // Format the time series data safely
        const formatTimeSeriesData = (timeSeries: any[]): [string, number][] => {
          if (!Array.isArray(timeSeries)) return [];
          return timeSeries.map(point => [
            point?.timestamp || new Date().toISOString(),
            typeof point?.value === 'number' ? point.value : 0
          ]);
        };

        // Set state with complete data structure and fallbacks at every level
        setStats({
          current: {
            power: powerData?.totalPower ?? powerStats.current?.power ?? 0,
            current: powerData?.totalCurrent ?? powerStats.current?.current ?? 0,
            today: powerStats.current?.today ?? 0,
            week: powerStats.current?.week ?? 0,
            month: powerStats.current?.month ?? 0,
          },
          history: {
            hourly: formatTimeSeriesData(powerStats.history?.hourly || []),
            daily: formatTimeSeriesData(powerStats.history?.daily || []),
            monthly: formatTimeSeriesData(powerStats.history?.monthly || []),
          },
          loading: false
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching power stats:', err);
        setError(`Failed to fetch power data: ${err instanceof Error ? err.message : 'Unknown error'}`);

        // Use placeholder data on error
        setStats(prev => ({
          ...prev,
          current: {
            power: powerData?.totalPower ?? 0,
            current: powerData?.totalCurrent ?? 0,
            today: 0,
            week: 0,
            month: 0,
          },
          history: {
            hourly: generateSampleData('24h'),
            daily: generateSampleData('week'),
            monthly: generateSampleData('month'),
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

  // Helper to get current total based on selected timeRange
  const getTotalForTimeRange = (range: 'day' | 'week' | 'month') => {
    if (range === 'day') return stats.current.today;
    if (range === 'week') return stats.current.week;
    return stats.current.month;
  };

  // Helper to get appropriate time series data for the selected period
  const getHistoryForTimeRange = (range: 'day' | 'week' | 'month') => {
    if (range === 'day') return stats.history.hourly;
    if (range === 'week') return stats.history.daily;
    return stats.history.monthly;
  };

  // Helper to handle period changes from UI timeRange values
  const handleTimeRangeChange = (newTimeRange: 'day' | 'week' | 'month') => {
    setSelectedPeriod(timeRangeToApiPeriod[newTimeRange]);
  };

  return {
    stats,
    timeRange: selectedPeriod === '24h' ? 'day' : selectedPeriod as 'week' | 'month',
    setTimeRange: handleTimeRangeChange,
    isLoading: stats.loading,
    error,
    selectedPeriod,
    setSelectedPeriod,
    getTotalForTimeRange,
    getHistoryForTimeRange
  };
};

export default usePowerStats;