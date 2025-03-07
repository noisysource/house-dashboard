import { Box, ButtonGroup, Button, Typography, IconButton, useTheme, Skeleton } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import LineChart from "./LineChart";
import usePowerStats from "../../hooks/usePowerStats";

interface PowerConsumptionSectionProps {
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}

const PowerConsumptionSection: React.FC<PowerConsumptionSectionProps> = ({ 
  className, 
  style,
  compact = false 
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { stats, selectedPeriod, setSelectedPeriod } = usePowerStats();

  const formatPeriodText = () => {
    switch (selectedPeriod) {
      case '24h':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      default:
        return 'Today';
    }
  };

  const getConsumptionValue = () => {
    switch (selectedPeriod) {
      case '24h':
        return stats.current.today;
      case 'week':
        return stats.current.week;
      case 'month':
        return stats.current.month;
      default:
        return stats.current.today;
    }
  };

  return (
    <Box 
      className={className}
      style={style}
      sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          mb: 1,
          gap: 1
        }}
      >
        <Box flexGrow={1} minWidth="120px">
          <Typography 
            variant={compact ? "body1" : "h5"} 
            fontWeight="600" 
            color={colors.grey[100]}
            noWrap
          >
            {`Power Consumption (${formatPeriodText()})`}
          </Typography>
          
          {stats.loading ? (
            <Skeleton variant="text" width={120} height={compact ? 40 : 60} />
          ) : (
            <Typography 
              variant={compact ? "h5" : "h3"} 
              fontWeight="bold" 
              color={colors.greenAccent[500]}
            >
              {`${getConsumptionValue()} kWh`}
            </Typography>
          )}
          
          <Typography variant="body2" color={colors.grey[300]}>
            Current: {stats.current.power.toFixed(1)} W
          </Typography>
        </Box>
        
        <Box 
          display="flex" 
          alignItems="center"
          sx={{ 
            flexShrink: 0 
          }}
        >
          <ButtonGroup
            variant="outlined"
            size="small"
            sx={{
              '& .MuiButton-root': {
                color: colors.grey[100],
                borderColor: colors.grey[700],
                fontSize: compact ? "0.6rem" : "0.75rem",
                padding: compact ? '2px 8px' : '4px 10px',
              }
            }}
          >
            <Button
              onClick={() => setSelectedPeriod('24h')}
              variant={selectedPeriod === "24h" ? "contained" : "outlined"}
              sx={{
                backgroundColor: selectedPeriod === "24h" ? colors.greenAccent[500] : 'transparent',
                '&:hover': { backgroundColor: selectedPeriod === "24h" ? colors.greenAccent[600] : colors.grey[800] }
              }}
            >
              24h
            </Button>
            <Button
              onClick={() => setSelectedPeriod('week')}
              variant={selectedPeriod === "week" ? "contained" : "outlined"}
              sx={{
                backgroundColor: selectedPeriod === "week" ? colors.greenAccent[500] : 'transparent',
                '&:hover': { backgroundColor: selectedPeriod === "week" ? colors.greenAccent[600] : colors.grey[800] }
              }}
            >
              Week
            </Button>
            <Button
              onClick={() => setSelectedPeriod('month')}
              variant={selectedPeriod === "month" ? "contained" : "outlined"}
              sx={{
                backgroundColor: selectedPeriod === "month" ? colors.greenAccent[500] : 'transparent',
                '&:hover': { backgroundColor: selectedPeriod === "month" ? colors.greenAccent[600] : colors.grey[800] }
              }}
            >
              Month
            </Button>
          </ButtonGroup>
          {!compact && (
            <IconButton size="small" sx={{ ml: 1 }}>
              <DownloadOutlinedIcon
                sx={{ fontSize: compact ? "18px" : "24px", color: colors.greenAccent[500] }}
              />
            </IconButton>
          )}
        </Box>
      </Box>
      
      <Box 
        sx={{ 
          flexGrow: 1, 
          width: '100%', 
          minHeight: compact ? '100px' : '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {stats.loading ? (
          <Skeleton variant="rectangular" width="100%" height="100%" />
        ) : (
          <LineChart 
            isDashboard={true} 
            timePeriod={selectedPeriod} 
            data={selectedPeriod === '24h' ? stats.history.hourly :
                 selectedPeriod === 'week' ? stats.history.daily :
                 stats.history.monthly}
          />
        )}
      </Box>
    </Box>
  );
};

export default PowerConsumptionSection;