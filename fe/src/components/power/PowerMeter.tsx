import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface PowerMeterProps {
  value: number;
  maxValue?: number;
}

const PowerMeter: React.FC<PowerMeterProps> = ({ value, maxValue = 3000 }) => {
  const theme = useTheme();
  
  // Calculate percentage (0-100)
  const percentage = Math.min(100, (value / maxValue) * 100);
  
  // Determine color based on power usage
  let color = theme.palette.success.main; // green for low usage
  
  if (percentage > 70) {
    color = theme.palette.error.main; // red for high usage
  } else if (percentage > 40) {
    color = theme.palette.warning.main; // orange for medium usage
  }
  
  return (
    <Box sx={{ 
      width: '100%', 
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Box sx={{ 
        position: 'relative',
        width: '80%',
        height: '20px',
        backgroundColor: theme.palette.grey[300],
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: color,
          transition: 'width 0.5s ease-in-out'
        }} />
      </Box>
    </Box>
  );
};

export default PowerMeter;