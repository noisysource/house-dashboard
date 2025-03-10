import { Box, Typography, useTheme, Paper, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { tokens } from "../../theme";
import { useState } from "react";
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import GarageIcon from '@mui/icons-material/Garage';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import SecurityIcon from '@mui/icons-material/Security';
import TvIcon from '@mui/icons-material/Tv';
import MeteoCard from "../../components/power/MeteoCard";
import FullCalendarComponent from "../../components/calendar/FullCalendarComponent";
import PowerBriefSection from "../../components/power/PowerBriefSection";

const SceneDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Smart home device states
  const [deviceStates, setDeviceStates] = useState({
    livingRoomLights: false,
    bedroomLights: false,
    garageDoor: false,
    acSystem: false,
    securitySystem: true,
    tvSystem: false,
  });

  // Toggle device state
  // const toggleDevice = (device: string) => {
  //   setDeviceStates(prev => ({
  //     ...prev,
  //     [device]: !prev[device]
  //   }));
  // };

  return (
    <Box sx={{ flexGrow: 1, m: 4 }}>

      {/* HEADER */}
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
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
      </Grid>

      {/* DASHBOARD GRID */}
      <Box sx={{ flexGrow: 1 }}>
       
       
        <Grid container spacing={4}>

           {/* METEO */}
          <Grid size={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                backgroundColor: colors.primary[400],
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h5" mb={2}>
                Current Weather
              </Typography>
              <MeteoCard />
            </Paper>
          </Grid>

          {/* Power */}
          <Grid size={8}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                backgroundColor: colors.primary[400],
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Typography variant="h5" mb={2}>
                Power Consumption
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <Grid size={8}>
                    <PowerBriefSection />
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Calendar */}
          <Grid size={8}>
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

          {/* Controls */}
          <Grid size={4}>
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
                <Grid size={6}>
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
                <Grid size={6}>
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
                <Grid size={6}>
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
                <Grid size={6}>
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
                <Grid size={6}>
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
                <Grid size={6}>
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
    </Box>
  );
};

export default SceneDashboard;