import { ResponsiveLine } from '@nivo/line';
import { useTheme, Box } from '@mui/material';
import { tokens } from '../../theme';

interface LineChartProps {
  isDashboard?: boolean;
  timePeriod?: string;
  data?: [string, number][]; // [timestamp, value] pairs
  height?: number | string;
}

const LineChart: React.FC<LineChartProps> = ({ 
  isDashboard = false, 
  timePeriod = '24h', 
  data = [],
  height = 200
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Define unit based on time period
  const yUnit = timePeriod === '24h' ? 'W' : 'kWh';

  // Format and reduce data points
  const chartData = [{
    id: 'power',
    data: (data || [])
      // Filter out every nth data point based on time period to reduce points
      .filter((_, index) => {
        if (timePeriod === '24h') {
          // Keep only every 4 hours (roughly 6 points for 24h)
          return index % 4 === 0;
        } else if (timePeriod === 'week') {
          // Keep only every second day (3-4 points for a week)
          return index % 2 === 0;
        } else if (timePeriod === 'month') {
          // Keep only every 6 days (~5 points for a month)
          return index % 6 === 0;
        }
        return true;
      })
      .map(([timestamp, value]) => {
        let label = '';
        
        try {
          const date = new Date(timestamp);
          
          // Format based on time period
          if (timePeriod === '24h') {
            // Show only hour
            label = date.getHours() + 'h';
          } else if (timePeriod === 'week') {
            // Show day name
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            label = days[date.getDay()];
          } else {
            // For month, show day/month
            label = date.getDate() + '/' + (date.getMonth() + 1);
          }
        } catch (e) {
          label = String(timestamp);
        }
        
        // Round power values for cleaner display
        let roundedValue = value;
        if (timePeriod === '24h') {
          // Round to nearest 50 watts for power
          roundedValue = Math.round(value / 50) * 50;
        } else {
          // Round to one decimal for kWh
          roundedValue = Math.round(value * 10) / 10;
        }
        
        return { x: label, y: roundedValue };
      })
  }];
  
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          height: typeof height === 'number' ? height : 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.grey[100],
          border: `1px dashed ${colors.grey[800]}`,
          borderRadius: 1
        }}
      >
        No data available
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: typeof height === 'number' ? height : 200,
        width: '100%',
        position: 'relative'
      }}
    >
      <ResponsiveLine
        data={chartData}
        margin={{ top: 10, right: 30, bottom: 40, left: 50 }}
        xScale={{ type: 'point' }}
        yScale={{ 
          type: 'linear', 
          min: 0,
          max: 'auto'
        }}
        // Use a smoother curve for fewer points
        curve="monotoneX"
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: isDashboard ? -45 : 0,
          // Reduce number of ticks
          tickValues: 5,
          legendOffset: 36,
          legendPosition: 'middle'
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          // Use fewer ticks with custom formatting
          tickValues: 5,
          format: v => {
            // For power, display in a more readable format
            if (timePeriod === '24h') {
              if (v >= 1000) {
                return `${(v/1000).toFixed(1)}k`;
              }
              return `${v}`;
            }
            return `${v}`;
          },
          legendOffset: -40,
          legendPosition: 'middle'
        }}
        enableGridX={false}
        colors={colors.greenAccent[500]}
        lineWidth={3}
        pointSize={8}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        enableArea={true}
        areaOpacity={0.15}
        useMesh={true}
        animate={false}
        theme={{
          axis: {
            domain: {
              line: { stroke: colors.grey[100] }
            },
            legend: {
              text: { fill: colors.grey[100] }
            },
            ticks: {
              line: { stroke: colors.grey[100], strokeWidth: 1 },
              text: { fill: colors.grey[100] }
            }
          },
          grid: {
            line: { stroke: colors.grey[800], strokeWidth: 1 }
          },
          tooltip: {
            container: {
              background: colors.primary[400],
              color: colors.grey[100]
            }
          }
        }}
        tooltip={({ point }) => (
          <Box sx={{ 
            p: 1, 
            bgcolor: colors.primary[400], 
            color: colors.grey[100],
            border: `1px solid ${colors.grey[800]}`,
            borderRadius: 1
          }}>
            <strong>{String(point.data.x)}</strong>
            <div>
              {timePeriod === '24h' 
                ? `${point.data.y} ${yUnit}` 
                : `${point.data.y} ${yUnit}`
              }
            </div>
          </Box>
        )}
        // Legends at the bottom to save space
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 40,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: 'rgba(0, 0, 0, .03)',
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
      />
    </Box>
  );
};

export default LineChart;