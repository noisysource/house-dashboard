import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useEffect, useState } from "react";

interface AmperageGaugeProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  unit?: string;
}

const AmperageGauge = ({
  value,
  min = 0,
  max = 50,
  title = "Current Load",
  unit = "A"
}: AmperageGaugeProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [progress, setProgress] = useState(0);
  
  // Calculate percentage for positioning
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  
  // Animate the gauge when value changes
  useEffect(() => {
    setProgress(percentage);
  }, [percentage]);

  // Determine color based on percentage value
  const getColor = () => {
    if (percentage < 0.4) return colors.greenAccent[500];
    if (percentage < 0.7) return colors.blueAccent[500];
    if (percentage < 0.9) return colors.redAccent[300];
    return colors.redAccent[500];
  };

  // Circumference of the circle
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="100%"
    >
      <Typography variant="h5" mb={1} fontWeight="bold">{title}</Typography>
      
      {/* Circular Gauge */}
      <Box position="relative" display="flex" justifyContent="center" alignItems="center" height="80%">
        <svg width="220" height="220" viewBox="0 0 220 220">
          {/* Background circle */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={colors.grey[800]}
            strokeWidth="12"
            transform="rotate(-90 110 110)"
          />
          
          {/* Progress circle */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
            style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />
          
          {/* Indicator points - key values */}
          {[0, 0.25, 0.5, 0.75, 1].map((point) => (
            <circle
              key={point}
              cx={110 + Math.cos(2 * Math.PI * point - Math.PI / 2) * radius}
              cy={110 + Math.sin(2 * Math.PI * point - Math.PI / 2) * radius}
              r="3"
              fill={colors.grey[100]}
            />
          ))}
        </svg>
        
        {/* Center value display */}
        <Box
          position="absolute"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Typography 
            variant="h1" 
            fontWeight="bold" 
            color={getColor()}
            sx={{ lineHeight: 1 }}
          >
            {value}
          </Typography>
          <Typography 
            variant="h5"
            color={colors.grey[100]}
          >
            {unit}
          </Typography>
          
          {/* Status indicators */}
          <Box 
            mt={2} 
            px={2} 
            py={0.5} 
            borderRadius="16px"
            bgcolor={getColor()}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography 
              variant="body2"
              fontWeight="bold"
              color="#000"
            >
              {percentage < 0.4 ? "LOW" : 
               percentage < 0.7 ? "NORMAL" : 
               percentage < 0.9 ? "HIGH" : "CRITICAL"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AmperageGauge;