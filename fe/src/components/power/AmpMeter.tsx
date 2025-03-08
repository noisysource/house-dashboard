import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface AmpMeterProps {
  value: number;
  contractMax: number;
  warningThreshold?: number; // Percentage at which to show warning
  dangerThreshold?: number;  // Percentage at which to show danger
}

const AmpMeter: React.FC<AmpMeterProps> = ({ 
  value, 
  contractMax = 30,
  warningThreshold = 60,
  dangerThreshold = 80 
}) => {
  const theme = useTheme();
  
  // Calculate percentage of contract maximum (0-100)
  const percentage = Math.min(100, (value / contractMax) * 100);
  
  // Determine color based on percentage of maximum
  let color = theme.palette.success.main; // green for low usage
  
  if (percentage > dangerThreshold) {
    color = theme.palette.error.main; // red for near limit
  } else if (percentage > warningThreshold) {
    color = theme.palette.warning.main; // orange for medium usage
  }
  
  // Create tick marks for the meter
  const tickMarks = Array(5).fill(0).map((_, index) => {
    const tickPercentage = (index + 1) * 20;
    const isCritical = tickPercentage >= 80;
    
    return (
      <Box 
        key={index}
        sx={{ 
          position: 'absolute',
          top: '-8px',
          left: `${tickPercentage}%`,
          height: '8px',
          width: '2px',
          backgroundColor: isCritical ? theme.palette.error.main : theme.palette.grey[600],
          transform: 'translateX(-1px)'
        }} 
      />
    );
  });
  
  return (
    <Box sx={{ 
      width: '100%', 
      height: '100px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Meter reading labels */}
      <Box sx={{ 
        width: '90%',
        display: 'flex',
        justifyContent: 'space-between',
        mb: 0.5
      }}>
        <Box sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>0A</Box>
        <Box sx={{ fontSize: '0.75rem', color: theme.palette.error.main, fontWeight: 'bold' }}>{contractMax}A</Box>
      </Box>

      {/* The meter bar with tick marks */}
      <Box sx={{ 
        position: 'relative',
        width: '90%',
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
          transition: 'width 0.5s ease-in-out',
          borderRadius: '10px'
        }} />
        
        {/* Tick marks */}
        {tickMarks}
        
        {/* Current indicator line */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: `${percentage}%`,
          height: '100%',
          width: '2px',
          backgroundColor: theme.palette.common.black,
          transform: 'translateX(-1px)',
          zIndex: 2
        }} />
      </Box>

      {/* Safety zones indicator */}
      <Box sx={{ 
        width: '90%',
        display: 'flex',
        mt: 0.5,
        height: '6px'
      }}>
        <Box sx={{
          flex: `${warningThreshold}`,
          height: '100%',
          backgroundColor: theme.palette.success.light,
          borderTopLeftRadius: '3px',
          borderBottomLeftRadius: '3px'
        }} />
        <Box sx={{
          flex: `${dangerThreshold - warningThreshold}`,
          height: '100%',
          backgroundColor: theme.palette.warning.light
        }} />
        <Box sx={{
          flex: `${100 - dangerThreshold}`,
          height: '100%',
          backgroundColor: theme.palette.error.light,
          borderTopRightRadius: '3px',
          borderBottomRightRadius: '3px'
        }} />
      </Box>
      
      {/* Safety zone labels */}
      <Box sx={{ 
        width: '90%',
        display: 'flex',
        justifyContent: 'space-between',
        mt: 0.5
      }}>
        <Box sx={{ fontSize: '0.7rem', color: theme.palette.success.main }}>Safe</Box>
        <Box sx={{ fontSize: '0.7rem', color: theme.palette.warning.main }}>Caution</Box>
        <Box sx={{ fontSize: '0.7rem', color: theme.palette.error.main }}>Critical</Box>
      </Box>
    </Box>
  );
};

export default AmpMeter;