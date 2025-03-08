import { useTheme } from "@mui/material";
import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatChartDate } from "../../utils/formatters";

interface LineChartProps {
  data: [string, number][]; // [timestamp, value]
  yAxisLabel?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, yAxisLabel = '' }) => {
  const theme = useTheme();
  
  // Transform data for Recharts
  const chartData = data.map(([timestamp, value]) => ({
    timestamp,
    value
  }));
  
  // Determine period based on data
  let period: '24h' | 'week' | 'month' = '24h';
  if (data.length > 0) {
    const firstTimestamp = data[0][0];
    if (firstTimestamp.includes('T')) {
      // If timestamp includes time (ISO format), it's hourly data
      period = '24h';
    } else {
      // Otherwise it's daily data - determine if week or month
      period = data.length <= 7 ? 'week' : 'month';
    }
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
      >
        <XAxis 
          dataKey="timestamp" 
          stroke={theme.palette.text.secondary}
          tickFormatter={(timestamp) => formatChartDate(timestamp, period)}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke={theme.palette.text.secondary} 
          tickFormatter={(value) => `${value}${yAxisLabel}`}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => [`${value} ${yAxisLabel}`, 'Value']}
          labelFormatter={(timestamp) => formatChartDate(timestamp, period)}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={theme.palette.primary.main} 
          dot={false}
          activeDot={{ r: 6 }}
          strokeWidth={2}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;