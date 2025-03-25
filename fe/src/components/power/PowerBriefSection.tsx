import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2"; // Import Grid v2
import usePowerReadings from "../../hooks/usePowerReadings";
import { formatWatts, formatAmps, formatKilowattHours } from "../../utils/formatters";
import PowerMeter from "./PowerMeter";
import AmpMeter from "./AmpMeter";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ElectricMeterIcon from '@mui/icons-material/ElectricMeter';

// Contract maximum current in amperes
const CONTRACT_MAX_AMPS = 30;
// Electricity cost per kWh 
const ELECTRICITY_COST_PER_KWH = 0.15;

const PowerBriefSection: React.FC = () => {
  const { stats, selectedPeriod } = usePowerReadings();
  const theme = useTheme();

  // Calculate percentage of capacity
  const capacityPercentage = Math.round((stats.current.current / CONTRACT_MAX_AMPS) * 100);

  // Calculate estimated cost
  const estimatedCost = selectedPeriod === 'month'
    ? stats.current.week * ELECTRICITY_COST_PER_KWH
    : stats.current.month * ELECTRICITY_COST_PER_KWH;

  return (
    <Box sx={{ width: '150%' }}>
      <Grid container rowSpacing={2} columnSpacing={2}>
        {/* Current Power Card */}
        <Grid size={6}>
          <Card sx={{
            height: '100%',
            boxShadow: theme.shadows[3],
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              boxShadow: theme.shadows[6],
              transform: 'translateY(-4px)'
            }
          }}>
            <CardContent sx={{
              textAlign: 'center',
              py: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" color="textSecondary">Current Power</Typography>
              </Box>

              <PowerMeter value={stats.current.power} />

              <Box sx={{ mt: 2 }}>
                <Typography variant="h4" color="textSecondary">{formatWatts(stats.current.power)}</Typography>
                <Typography variant="body2" color="textSecondary">Power Consumption</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Estimated Cost Card */}
        <Grid size={6}>
          <Card sx={{
            height: '100%',
            boxShadow: theme.shadows[3],
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              boxShadow: theme.shadows[6],
              transform: 'translateY(-4px)'
            }
          }}>
            <CardContent sx={{
              textAlign: 'center',
              py: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Typography variant="h6" color="textSecondary">
                  Current Cost this month
                </Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px'
              }}>
                <Typography variant="h3" color="success.main">
                  {estimatedCost.toFixed(2)} €
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                    {formatKilowattHours(selectedPeriod === 'week' ? stats.current.week : stats.current.month)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    at {ELECTRICITY_COST_PER_KWH}/kWh €
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="success.dark" sx={{ fontWeight: 'bold' }}>
                  Today: {(stats.current.today * ELECTRICITY_COST_PER_KWH).toFixed(2)} €
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Circuit Load Card */}
        <Grid size={12}>
          <Card sx={{
            height: '100%',
            width: '100%',
            boxShadow: theme.shadows[3],
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              boxShadow: theme.shadows[6],
              transform: 'translateY(-4px)'
            }
          }}>
            <CardContent sx={{
              textAlign: 'center',
              py: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <ElectricMeterIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                <Typography variant="h6" color="textSecondary">Circuit Load</Typography>
              </Box>

              <AmpMeter
                value={stats.current.current}
                contractMax={CONTRACT_MAX_AMPS}
                warningThreshold={60}
                dangerThreshold={80}
              />

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h4" color="secondary">{formatAmps(stats.current.current)}</Typography>
                <Typography variant="body1" color="textSecondary">
                  ({capacityPercentage}% of max)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
};

export default PowerBriefSection;