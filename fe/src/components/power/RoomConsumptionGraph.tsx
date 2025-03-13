import { Box, useTheme } from "@mui/material";
import { ResponsiveLine } from "@nivo/line";
import { tokens } from "../../theme";

interface RoomConsumptionGraphProps {
  roomData: Array<{
    id: string;
    name: string;
    power: { day: number; week: number; month: number };
    color: string;
  }>;
  timeRange: 'day' | 'week' | 'month';
}

const RoomConsumptionGraph: React.FC<RoomConsumptionGraphProps> = ({ roomData, timeRange }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Transform room data into Nivo line chart format
  const chartData = roomData.map(room => {
    // Generate data points for the selected time range
    let dataPoints = [];
    const today = new Date();

    if (timeRange === 'day') {
      // Create 24 hourly data points with slight variations around room.power.day/24
      const hourlyAvg = room.power.day / 24;
      for (let i = 23; i >= 0; i--) {
        const date = new Date(today);
        date.setHours(today.getHours() - i);
        const variation = Math.random() * 0.4 + 0.8; // Random between 0.8 and 1.2
        dataPoints.push({
          x: date.toISOString(),
          y: +(hourlyAvg * variation).toFixed(2)
        });
      }
    } else if (timeRange === 'week') {
      // Create 7 daily data points with slight variations
      const dailyAvg = room.power.week / 7;
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const variation = Math.random() * 0.4 + 0.8; // Random between 0.8 and 1.2
        dataPoints.push({
          x: date.toISOString().split('T')[0],
          y: +(dailyAvg * variation).toFixed(2)
        });
      }
    } else {
      // Create 30 daily data points with slight variations
      const dailyAvg = room.power.month / 30;
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const variation = Math.random() * 0.4 + 0.8; // Random between 0.8 and 1.2
        dataPoints.push({
          x: date.toISOString().split('T')[0],
          y: +(dailyAvg * variation).toFixed(2)
        });
      }
    }
    
    return {
      id: room.name,
      color: room.color,
      data: dataPoints
    };
  });

  return (
    <Box sx={{ height: 400 }}>
      <ResponsiveLine
        data={chartData}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ 
          type: 'point' as const
        }}
        yScale={{ 
          type: 'linear' as const, 
          min: 'auto', 
          max: 'auto', 
          stacked: false, 
          reverse: false 
        }}
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: timeRange === 'day' ? -45 : 0,
          format: timeRange === 'day' 
            ? (value) => {
                const date = new Date(value);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
            : undefined,
          legend: timeRange === 'day' ? 'Time' : 'Date',
          legendOffset: 36,
          legendPosition: 'middle' as const
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: timeRange === 'day' ? 'Power (W)' : 'Energy (kWh)',
          legendOffset: -40,
          legendPosition: 'middle' as const,
          format: value => `${value} ${timeRange === 'day' ? 'W' : 'kWh'}`
        }}
        colors={{ datum: 'color' }}
        lineWidth={3}
        enableArea={true}
        areaBaselineValue={0}
        areaOpacity={0.15}
        enableGridX={false}
        enableSlices="x"
        legends={[
          {
            anchor: 'bottom-right' as const,
            direction: 'column' as const,
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right' as const,
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: 'circle' as const,
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover' as const,
                style: {
                  itemBackground: 'rgba(0, 0, 0, .03)',
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: colors.grey[100]
              }
            },
            legend: {
              text: {
                fill: colors.grey[100]
              }
            },
            ticks: {
              line: {
                stroke: colors.grey[100],
                strokeWidth: 1
              },
              text: {
                fill: colors.grey[100]
              }
            }
          },
          legends: {
            text: {
              fill: colors.grey[100]
            }
          },
          tooltip: {
            container: {
              color: colors.primary[500]
            }
          }
        }}
      />
    </Box>
  );
};

export default RoomConsumptionGraph;