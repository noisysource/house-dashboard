import { Box, Card, CardContent, FormControl, Grid, MenuItem, Select, SelectChangeEvent, Typography, Divider } from "@mui/material";
import LineChart from "./LineChart";
import usePowerReadings from "../../hooks/usePowerReadings";
import { formatWatts, formatKilowattHours, formatAmps } from "../../utils/formatters";
import PowerMeter from "./PowerMeter";
import AmpMeter from "./AmpMeter";

// Contract maximum current in amperes - adjust this based on your specific contract
const CONTRACT_MAX_AMPS = 30;

const PowerConsumptionSection: React.FC = () => {
  const { stats, selectedPeriod, setSelectedPeriod, error } = usePowerReadings();

  // Handle period change
  const handlePeriodChange = (event: SelectChangeEvent<string>) => {
    setSelectedPeriod(event.target.value as '24h' | 'week' | 'month');
  };

  // Get the appropriate dataset based on selected period
  const getChartData = () => {
    if (selectedPeriod === '24h') {
      return stats.history.hourly;
    } else if (selectedPeriod === 'week') {
      return stats.history.daily;
    } else {
      return stats.history.monthly;
    }
  };

  const getChartTitle = () => {
    switch (selectedPeriod) {
      case '24h':
        return 'Power Consumption (24 Hours)';
      case 'week':
        return 'Daily Power Consumption (Week)';
      case 'month':
        return 'Daily Power Consumption (Month)';
      default:
        return 'Power Consumption';
    }
  };

  const getChartUnit = () => {
    return selectedPeriod === '24h' ? 'W' : 'kWh';
  };

  return (
    <Grid container spacing={3}>
      {/* Current Power Card */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" color="textSecondary">Current Power</Typography>
            <PowerMeter value={stats.current.power} />
            <Box sx={{ mt: 1 }}>
              <Typography variant="h5">{formatWatts(stats.current.power)}</Typography>
              <Typography variant="body2" color="textSecondary">Power Consumption</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Current Load Card */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" color="textSecondary">Circuit Load</Typography>
            <AmpMeter
              value={stats.current.current}
              contractMax={CONTRACT_MAX_AMPS}
              warningThreshold={60}
              dangerThreshold={80}
            />
            <Box sx={{ mt: 1 }}>
              <Typography variant="h5">{formatAmps(stats.current.current)}</Typography>
              <Typography variant="body2" color="textSecondary">
                of {CONTRACT_MAX_AMPS}A Maximum
              </Typography>
            </Box>

            {/* Add percentage of max */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" color="text.secondary">
                {Math.round((stats.current.current / CONTRACT_MAX_AMPS) * 100)}% of capacity
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Daily Usage Card */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" color="textSecondary">Today's Usage</Typography>
            <Box sx={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h3">{formatKilowattHours(stats.current.today)}</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">kilowatt hours</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Weekly/Monthly Card */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" color="textSecondary">
              {selectedPeriod === 'week' ? "This Week" : "This Month"}
            </Typography>
            <Box sx={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h3">
                {formatKilowattHours(selectedPeriod === 'week' ? stats.current.week : stats.current.month)}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">kilowatt hours</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Estimated Cost Card - Optional */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" color="textSecondary">
              Estimated {selectedPeriod === 'week' ? "Weekly" : "Monthly"} Cost
            </Typography>
            <Box sx={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h3">
                {selectedPeriod === 'week'
                  ? `$${(stats.current.week * 0.15).toFixed(2)}`
                  : `$${(stats.current.month * 0.15).toFixed(2)}`
                }
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">at $0.15/kWh</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Chart */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{getChartTitle()}</Typography>
              <FormControl variant="outlined" size="small">
                <Select
                  value={selectedPeriod}
                  onChange={handlePeriodChange}
                >
                  <MenuItem value="24h">24 Hours</MenuItem>
                  <MenuItem value="week">Week</MenuItem>
                  <MenuItem value="month">Month</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error} (showing sample data)
              </Typography>
            )}

            <Box sx={{ height: 300 }}>
              {stats.loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography>Loading data...</Typography>
                </Box>
              ) : (
                <LineChart
                  data={getChartData()}
                  yAxisLabel={getChartUnit()}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PowerConsumptionSection;