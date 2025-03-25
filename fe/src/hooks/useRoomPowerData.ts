import { useState, useEffect } from 'react';
import { timeRangeToApiPeriod } from './usePowerReadings';

import { GET_ROOM_POWER_STATS } from '../graphql/queries/powerStatQueries';

// GraphQL endpoint
const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

export interface RoomPowerData {
  id: string;
  name: string;
  power: {
    day: number;
    week: number;
    month: number;
  };
  current: {
    day: number;
    week: number;
    month: number;
  };
  devices?: string[];
}

interface UseRoomPowerDataProps {
  timeRange?: 'day' | 'week' | 'month';
}

const useRoomPowerData = ({ timeRange = 'day' }: UseRoomPowerDataProps = {}) => {
  const [roomData, setRoomData] = useState<RoomPowerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Convert UI timeRange to API period
  const period = timeRangeToApiPeriod[timeRange];

  useEffect(() => {
    const fetchRoomPowerData = async () => {
      setIsLoading(true);

      try {
        // GraphQL request for room power data
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: GET_ROOM_POWER_STATS,
            variables: { period },
          }),
        });

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        setRoomData(result.data.roomPowerData);
        setError(null);
      } catch (err) {
        console.error('Error fetching room power data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch room power data'));
        // Don't set sample data - let the component handle empty state
        setRoomData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomPowerData();

    // Refresh data periodically (every 5 minutes)
    const intervalId = setInterval(fetchRoomPowerData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [period]);

  return { roomData, isLoading, error };
};

export default useRoomPowerData;