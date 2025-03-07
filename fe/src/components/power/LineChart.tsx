import { ResponsiveLine } from "@nivo/line";
import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { alpha } from "@mui/material/styles";

// Mock data for different time periods
const mockData24h = [
  {
    id: "consumption",
    data: [
      { x: "00:00", y: 14 },
      { x: "03:00", y: 10 },
      { x: "06:00", y: 12 },
      { x: "09:00", y: 18 },
      { x: "12:00", y: 24 },
      { x: "15:00", y: 28 },
      { x: "18:00", y: 32 },
      { x: "21:00", y: 26 }
    ],
  }
];

const mockDataWeek = [
  {
    id: "consumption",
    data: [
      { x: "Mon", y: 124 },
      { x: "Tue", y: 115 },
      { x: "Wed", y: 127 },
      { x: "Thu", y: 132 },
      { x: "Fri", y: 142 },
      { x: "Sat", y: 158 },
      { x: "Sun", y: 96 }
    ],
  }
];

const mockDataMonth = [
  {
    id: "consumption",
    data: [
      { x: "Week 1", y: 825 },
      { x: "Week 2", y: 912 },
      { x: "Week 3", y: 876 },
      { x: "Week 4", y: 789 }
    ],
  }
];

interface LineChartProps {
  isDashboard?: boolean;
  timePeriod?: string;
}

const LineChart = ({ isDashboard = false, timePeriod = "24h" }: LineChartProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Select data based on time period
  const getChartData = () => {
    switch(timePeriod) {
      case "week":
        return mockDataWeek;
      case "month":
        return mockDataMonth;
      default:
        return mockData24h;
    }
  };

  return (
    <Box height="100%" position="relative">
      <ResponsiveLine
        data={getChartData()}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: "transparent",
              },
            },
            legend: {
              text: {
                fill: colors.grey[100],
                fontSize: 12,
              },
            },
            ticks: {
              line: {
                stroke: colors.grey[700],
                strokeWidth: 1,
              },
              text: {
                fill: colors.grey[400],
                fontSize: 10,
              },
            },
          },
          tooltip: {
            container: {
              background: colors.primary[400],
              color: colors.grey[100],
              fontSize: 12,
              borderRadius: 4,
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
              border: `1px solid ${colors.grey[700]}`,
            },
          },
          crosshair: {
            line: {
              stroke: colors.greenAccent[500],
              strokeWidth: 1,
              strokeOpacity: 0.5,
              strokeDasharray: '6 6',
            },
          },
          grid: {
            line: {
              stroke: colors.grey[800],
              strokeWidth: 1,
            },
          },
        }}
        colors={isDashboard ? [colors.greenAccent[500]] : { scheme: "nivo" }}
        margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 12,
          tickRotation: 0,
          legend: undefined,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 12,
          tickRotation: 0,
          legend: undefined, 
          tickValues: 5,
        }}
        enableGridX={false}
        enableGridY={true}
        pointSize={6}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        enableArea={true}
        areaOpacity={0.15}
        enableSlices="x"
        defs={[
          {
            id: "gradientA",
            type: "linearGradient",
            colors: [
              { offset: 0, color: alpha(colors.greenAccent[500], 0.6) },
              { offset: 100, color: alpha(colors.greenAccent[500], 0) },
            ],
          },
        ]}
        fill={[{ match: "*", id: "gradientA" }]}
        animate={true}
        motionConfig="gentle"
        layers={["grid", "axes", "areas", "lines", "points", "slices", "mesh", "legends"]}
        lineWidth={3}
      />
    </Box>
  );
};

export default LineChart;