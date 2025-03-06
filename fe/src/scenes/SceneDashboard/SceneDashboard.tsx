import { Box, Grid, Typography, useTheme, Paper, Button, IconButton, Card, CardContent } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
// import FullCalendarComponent from "../../components/calendar/FullCalendar";
import AmperageGauge from "../../components/power/AmperageGauge";
import LineChart from "../../components/power/LineChart";

// Smart home control icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import GarageIcon from '@mui/icons-material/Garage';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import SecurityIcon from '@mui/icons-material/Security';
import TvIcon from '@mui/icons-material/Tv';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import PowerIcon from '@mui/icons-material/Power';
import MeteoCard from "../../components/power/MeteoCard";
import FullCalendarComponent from "../../components/calendar/FullCalendarComponent";

const SceneDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentAmperage, setCurrentAmperage] = useState(24.6);
  const [totalKw, setTotalKw] = useState(5.4);

  // Smart home device states
  const [deviceStates, setDeviceStates] = useState({
    livingRoomLights: false,
    bedroomLights: false,
    garageDoor: false,
    acSystem: false,
    securitySystem: true,
    tvSystem: false,
  });

  // Simulate changing power consumption
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newAmperage = Math.max(10, Math.min(40, currentAmperage + (Math.random() - 0.5) * 5));
      setCurrentAmperage(parseFloat(newAmperage.toFixed(1)));
      setTotalKw(parseFloat((newAmperage * 220 / 1000).toFixed(1)));
    }, 5000);

    return () => clearInterval(intervalId);
  }, [currentAmperage]);

  // Toggle device state
  // const toggleDevice = (device: string) => {
  //   setDeviceStates(prev => ({
  //     ...prev,
  //     [device]: !prev[device]
  //   }));
  // };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography
            variant="h2"
            color={colors.grey[100]}
            fontWeight="bold"
            sx={{ mb: "5px" }}
          >
            HOUSE DASHBOARD
          </Typography>
          <Typography variant="h5" color={colors.greenAccent[400]}>
            Home System Overview
          </Typography>
        </Box>
      </Box>

      {/* DASHBOARD GRID */}
      <Grid container spacing={3}>
        {/* Weather Widget */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              backgroundColor: colors.primary[400],
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h5" mb={2}>Current Weather</Typography>
            <MeteoCard/>
          </Paper>
        </Grid>

        {/* Power Consumption Overview */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              backgroundColor: colors.primary[400],
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h5" mb={2}>Power Consumption</Typography>
            <Box display="flex" justifyContent="space-between" height="200px">
              <Box width="30%" display="flex" flexDirection="column" justifyContent="center">
                <AmperageGauge
                  value={currentAmperage}
                  min={0}
                  max={50}
                  title="Current Load"
                  unit="A"
                />
              </Box>
              <Box width="65%" height="100%">
                <Typography variant="h6" mb={1}>Daily Usage: {totalKw} kW</Typography>
                <Box height="160px">
                  <LineChart timePeriod={''} isDashboard={true} />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Calendar */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              backgroundColor: colors.primary[400],
              height: '350px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h5" mb={2}>Upcoming Events</Typography>
            <Box flexGrow={1}>
              <FullCalendarComponent daysToShow={3} />
            </Box>
          </Paper>
        </Grid>

        {/* Smart Home Controls */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              backgroundColor: colors.primary[400],
              height: '350px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h5" mb={2}>Smart Home Controls</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<LightbulbIcon />}
                  // onClick={() => toggleDevice('livingRoomLights')}
                  sx={{
                    p: 2,
                    backgroundColor: deviceStates.livingRoomLights ? colors.greenAccent[500] : colors.grey[700],
                    '&:hover': {
                      backgroundColor: deviceStates.livingRoomLights ? colors.greenAccent[600] : colors.grey[800]
                    }
                  }}
                >
                  Living Room
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<NightsStayIcon />}
                  // onClick={() => toggleDevice('bedroomLights')}
                  sx={{
                    p: 2,
                    backgroundColor: deviceStates.bedroomLights ? colors.greenAccent[500] : colors.grey[700],
                    '&:hover': {
                      backgroundColor: deviceStates.bedroomLights ? colors.greenAccent[600] : colors.grey[800]
                    }
                  }}
                >
                  Bedroom
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<GarageIcon />}
                  // onClick={() => toggleDevice('garageDoor')}
                  sx={{
                    p: 2,
                    backgroundColor: deviceStates.garageDoor ? colors.greenAccent[500] : colors.grey[700],
                    '&:hover': {
                      backgroundColor: deviceStates.garageDoor ? colors.greenAccent[600] : colors.grey[800]
                    }
                  }}
                >
                  Garage
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AcUnitIcon />}
                  // onClick={() => toggleDevice('acSystem')}
                  sx={{
                    p: 2,
                    backgroundColor: deviceStates.acSystem ? colors.greenAccent[500] : colors.grey[700],
                    '&:hover': {
                      backgroundColor: deviceStates.acSystem ? colors.greenAccent[600] : colors.grey[800]
                    }
                  }}
                >
                  A/C System
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<SecurityIcon />}
                  // onClick={() => toggleDevice('securitySystem')}
                  sx={{
                    p: 2,
                    backgroundColor: deviceStates.securitySystem ? colors.greenAccent[500] : colors.grey[700],
                    '&:hover': {
                      backgroundColor: deviceStates.securitySystem ? colors.greenAccent[600] : colors.grey[800]
                    }
                  }}
                >
                  Security
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<TvIcon />}
                  // onClick={() => toggleDevice('tvSystem')}
                  sx={{
                    p: 2,
                    backgroundColor: deviceStates.tvSystem ? colors.greenAccent[500] : colors.grey[700],
                    '&:hover': {
                      backgroundColor: deviceStates.tvSystem ? colors.greenAccent[600] : colors.grey[800]
                    }
                  }}
                >
                  TV & Media
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SceneDashboard;