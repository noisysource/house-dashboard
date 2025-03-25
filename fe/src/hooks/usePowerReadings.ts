import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import usePowerData from './usePowerData';
import {
  GET_TOTAL_CONSUMPTION,
  GET_POWER_STATS_BY_CHANNEL
} from '../graphql/queries/powerStatQueries';

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

interface UsePowerStatsProps {
  timeRange?: 'day' | 'week' | 'month';
  channelId?: string; // Add channelId as an optional parameter
}

const usePowerReadings = ({ timeRange, channelId }: UsePowerStatsProps = {}) => {
  const { powerData, isConnected } = usePowerData();
  const initialPeriod = timeRange ? timeRangeToApiPeriod[timeRange] : '24h';
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | 'week' | 'month'>(initialPeriod);
  const [error, setError] = useState<string | null>(null);

  // Default stats state
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

  // Update selectedPeriod when timeRange prop changes
  useEffect(() => {
    if (timeRange) {
      setSelectedPeriod(timeRangeToApiPeriod[timeRange]);
    }
  }, [timeRange]);

  // Query for total consumption data (household level)
  const { data: totalConsumptionData, loading: totalConsumptionLoading } = useQuery(GET_TOTAL_CONSUMPTION, {
    variables: { period: selectedPeriod },
    skip: !!channelId, // Skip if we're looking at a specific channel
    pollInterval: 5 * 60 * 1000, // Poll every 5 minutes
    onError: (error) => {
      console.error('Error fetching total consumption:', error);
      setError(`Failed to fetch total consumption: ${error.message}`);
    }
  });

  // Query for channel-specific power data
  const { data: channelData, loading: channelLoading } = useQuery(GET_POWER_STATS_BY_CHANNEL, {
    variables: {
      channelId,
      period: selectedPeriod
    },
    skip: !channelId, // Skip if no channelId is provided
    pollInterval: 5 * 60 * 1000, // Poll every 5 minutes
    onError: (error) => {
      console.error('Error fetching channel power stats:', error);
      setError(`Failed to fetch channel data: ${error.message}`);
    }
  });

  // Process real-time power data from WebSocket
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

  // Process GraphQL data
  useEffect(() => {
    const loading = totalConsumptionLoading || channelLoading;

    // If still loading, update only the loading status
    if (loading) {
      setStats(prev => ({ ...prev, loading }));
      return;
    }

    try {
      // Process data based on which query was successful
      if (channelId && channelData?.powerStatsByChannel) {
        // Handle channel-specific data
        const channelStats = channelData.powerStatsByChannel;

        // Format the time series data
        const formatTimeSeriesData = (readings: any[]): [string, number][] => {
          if (!Array.isArray(readings)) return [];
          return readings.map(point => [
            point?.timestamp || new Date().toISOString(),
            typeof point?.power === 'number' ? point.power : 0
          ]);
        };

        // Determine which time period to show
        let timeSeriesData: [string, number][] = [];
        if (selectedPeriod === '24h') {
          timeSeriesData = formatTimeSeriesData(channelStats.readings || []);
        }

        setStats({
          current: {
            power: powerData?.totalPower ?? 0,
            current: powerData?.totalCurrent ?? 0,
            today: selectedPeriod === '24h' ? channelStats.totalEnergy : 0,
            week: selectedPeriod === 'week' ? channelStats.totalEnergy : 0,
            month: selectedPeriod === 'month' ? channelStats.totalEnergy : 0,
          },
          history: {
            hourly: selectedPeriod === '24h' ? timeSeriesData : stats.history.hourly,
            daily: selectedPeriod === 'week' ? timeSeriesData : stats.history.daily,
            monthly: selectedPeriod === 'month' ? timeSeriesData : stats.history.monthly,
          },
          loading: false
        });

      } else if (totalConsumptionData?.totalConsumption) {
        // Handle household-level data
        const consumptionData = totalConsumptionData.totalConsumption;

        // Create historical time series from breakdown data
        const timeSeriesFromBreakdown = (breakdown: any[]): [string, number][] => {
          if (!Array.isArray(breakdown)) return [];
          return breakdown.map((item, index) => {
            // Create a timestamp based on the period
            const now = new Date();
            let timestamp;

            if (selectedPeriod === '24h') {
              timestamp = new Date(now.setHours(now.getHours() - (23 - index))).toISOString();
            } else if (selectedPeriod === 'week') {
              timestamp = new Date(now.setDate(now.getDate() - (6 - index))).toISOString();
            } else {
              timestamp = new Date(now.setDate(now.getDate() - (29 - index))).toISOString();
            }

            return [timestamp, item.energy || 0];
          });
        };

        setStats({
          current: {
            power: powerData?.totalPower ?? 0,
            current: powerData?.totalCurrent ?? 0,
            today: selectedPeriod === '24h' ? consumptionData.totalEnergy : stats.current.today,
            week: selectedPeriod === 'week' ? consumptionData.totalEnergy : stats.current.week,
            month: selectedPeriod === 'month' ? consumptionData.totalEnergy : stats.current.month,
          },
          history: {
            hourly: selectedPeriod === '24h' ? timeSeriesFromBreakdown(consumptionData.breakdown || []) : stats.history.hourly,
            daily: selectedPeriod === 'week' ? timeSeriesFromBreakdown(consumptionData.breakdown || []) : stats.history.daily,
            monthly: selectedPeriod === 'month' ? timeSeriesFromBreakdown(consumptionData.breakdown || []) : stats.history.monthly,
          },
          loading: false
        });


        setError(null);
      }
    } catch (err) {
      console.error('Error processing power stats:', err);
      setError(`Failed to process power data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [totalConsumptionData, channelData, totalConsumptionLoading, channelLoading, selectedPeriod, channelId, powerData?.totalPower, powerData?.totalCurrent, stats]);

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
    isLoading: stats.loading || totalConsumptionLoading || channelLoading,
    error,
    selectedPeriod,
    setSelectedPeriod,
    getTotalForTimeRange,
    getHistoryForTimeRange
  };
};

export default usePowerReadings;