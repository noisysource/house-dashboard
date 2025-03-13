import { Box, Tab, Tabs, Typography, useTheme, Card, CardContent, ToggleButtonGroup, ToggleButton, Alert, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2"; // Import Grid v2
import { tokens } from "../../theme";
import { useMemo, useState } from "react";
import BoltIcon from '@mui/icons-material/Bolt';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import InsightsIcon from '@mui/icons-material/Insights';
import KitchenIcon from '@mui/icons-material/Kitchen';
import WeekendIcon from '@mui/icons-material/Weekend';
import SingleBedIcon from '@mui/icons-material/SingleBed';
import ShowerIcon from '@mui/icons-material/Shower';
import LaptopIcon from '@mui/icons-material/Laptop';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import usePowerStats from "../../hooks/usePowerStats";
import RoomConsumptionGraph from "../../components/power/RoomConsumptionGraph";
import useRoomPowerData from "../../hooks/useRoomPowerData";


// Function to map room names to appropriate icons
const getRoomIcon = (roomName: string) => {
  const name = roomName.toLowerCase();
  if (name.includes('living')) return <WeekendIcon />;
  if (name.includes('kitchen')) return <KitchenIcon />;
  if (name.includes('bed')) return <SingleBedIcon />;
  if (name.includes('bath')) return <ShowerIcon />;
  if (name.includes('office')) return <LaptopIcon />;
  return <MeetingRoomIcon />; // Default icon
};

// Function to get a color for a room
const getRoomColor = (index: number) => {
  const colors = [
    "#4cceac", "#6870fa", "#ff9f43", "#ee5253", "#2e86de",
    "#8854d0", "#20bf6b", "#eb3b5a", "#f9ca24"
  ];
  return colors[index % colors.length];
};

const ScenePower = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    getTotalForTimeRange
  } = usePowerStats({ timeRange });

  const {
    roomData: apiRoomData,
    isLoading: roomsLoading,
    error: roomsError
  } = useRoomPowerData({ timeRange });

  // Add icons and colors to room data
  const roomData = useMemo(() => {
    return apiRoomData.map((room, index) => ({
      ...room,
      icon: getRoomIcon(room.name),
      color: getRoomColor(index)
    }));
  }, [apiRoomData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTimeRangeChange = (event: React.MouseEvent<HTMLElement>, newTimeRange: string) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange as 'day' | 'week' | 'month');
    }
  };

  // Calculate total power consumption for the selected time range
  const totalPowerConsumption = roomData.reduce(
    (total, room) => total + (room.power?.[timeRange] || 0),
    0
  );

  // Time period display text
  const timeRangeText = timeRange === 'day' ? 'Last 24 Hours' :
    timeRange === 'week' ? 'This Week' :
      'This Month';

  // Handle loading state
  const isLoading = statsLoading || roomsLoading;

  // Handle error state
  const hasError = statsError || roomsError;

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid size={12}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BoltIcon sx={{ fontSize: 40, color: colors.greenAccent[500] }} />
              <Typography
                variant="h2"
                color={colors.grey[100]}
                fontWeight="bold"
              >
                HOME ENERGY
              </Typography>
            </Box>
            <Typography variant="h5" color={colors.greenAccent[400]} sx={{ ml: '45px' }}>
              Monitor and optimize your power consumption
            </Typography>
          </Box>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon color="secondary" />
              <Typography variant="body1" color={colors.grey[300]}>
                Time Period:
              </Typography>
            </Box>

            {/* Global Time Range Selection */}
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              color="primary"
              size="small"
              sx={{
                bgcolor: colors.primary[400],
                '& .MuiToggleButton-root': {
                  color: colors.grey[300],
                  '&.Mui-selected': {
                    bgcolor: colors.greenAccent[500],
                    color: colors.primary[900],
                    '&:hover': {
                      bgcolor: colors.greenAccent[600],
                    }
                  },
                  '&:hover': {
                    bgcolor: colors.primary[300],
                  }
                }
              }}
            >
              <ToggleButton value="day">Last 24h</ToggleButton>
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grid>
      </Grid>

      {/* Error alert */}
      {hasError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading power data. Some information may not be available.
        </Alert>
      )}

      {/* TABS */}
      <Box sx={{ borderBottom: 1, borderColor: colors.grey[700], mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: colors.greenAccent[500],
            },
            '& .MuiTab-root': {
              color: colors.grey[300],
              fontWeight: 'medium',
              fontSize: '1rem',
              textTransform: 'none',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              py: 1.5,
              '&.Mui-selected': {
                color: colors.greenAccent[400],
                fontWeight: 'bold',
              },
            }
          }}
        >
          <Tab icon={<InsightsIcon />} label="Overview" iconPosition="start" />
          <Tab icon={<MeetingRoomIcon />} label="Room Details" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="secondary" />
        </Box>
      )}

      {/* TAB CONTENT */}
      {!isLoading && activeTab === 0 ? (
        // OVERVIEW TAB
        <Grid container rowSpacing={2} columnSpacing={2}>
          {/* Total Consumption Card */}
          <Grid size={12}>
            <Card sx={{ bgcolor: colors.blueAccent[700], boxShadow: 3, borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h5" color={colors.grey[100]}>
                  Total Energy Consumption
                </Typography>
                <Typography variant="body2" color={colors.grey[300]} sx={{ mb: 3 }}>
                  {timeRangeText}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant="h1" color={colors.grey[100]} fontWeight="bold">
                    {totalPowerConsumption.toFixed(1)}
                  </Typography>
                  <Typography variant="h4" color={colors.grey[300]} sx={{ ml: 1 }}>
                    kWh
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Place Graph and Distribution side by side */}

          {/* Detailed Power Consumption Charts - takes 8/12 of the space */}
          <Grid size={9}>
            <Card sx={{ bgcolor: colors.primary[400], boxShadow: 3, borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InsightsIcon color="secondary" />
                  Room Energy Comparison - {timeRangeText}
                </Typography>
                <RoomConsumptionGraph
                  roomData={roomData}
                  timeRange={timeRange as 'day' | 'week' | 'month'}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Distribution Card - takes 4/12 of the space */}
          <Grid size={3}>
            <Card sx={{ bgcolor: colors.primary[400], boxShadow: 3, borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" color={colors.grey[100]}>
                  Distribution by Room
                </Typography>
                <Typography variant="body2" color={colors.grey[300]} sx={{ mb: 2 }}>
                  {timeRangeText}
                </Typography>

                {/* Top 3 Consumers */}
                <Box sx={{ mt: 2 }}>
                  {roomData
                    .sort((a, b) => (b.power?.[timeRange] || 0) - (a.power?.[timeRange] || 0))
                    .slice(0, 3)
                    .map((room, index) => (
                      <Box
                        key={room.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1.5,
                          pb: 1.5,
                          borderBottom: index < 2 ? `1px solid ${colors.grey[700]}` : 'none'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            bgcolor: room.color,
                            color: '#000',
                            borderRadius: '50%',
                            width: 34,
                            height: 34,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            {room.icon}
                          </Box>
                          <Typography variant="body1">{room.name}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                          <Typography variant="h5" color={colors.greenAccent[400]}>
                            {(room.power?.[timeRange] || 0).toFixed(1)}
                          </Typography>
                          <Typography variant="body2" color={colors.grey[300]}>kWh</Typography>
                        </Box>
                      </Box>
                    ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      ) : !isLoading && activeTab === 1 ? (
        // ROOM DETAILS TAB
        <Box>
          {/* Room Cards Grid */}
          <Grid container spacing={3}>
            {/* Room Usage Summary */}
            <Grid size={12}>
              <Card sx={{ bgcolor: colors.primary[400], boxShadow: 3, borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MeetingRoomIcon color="secondary" />
                      Room Energy Usage - {timeRangeText}
                    </Typography>
                    <Typography variant="h5" color={colors.blueAccent[400]}>
                      Total: {totalPowerConsumption.toFixed(1)} kWh
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Individual Room Cards */}
            {roomData
              .sort((a, b) => (b.power?.[timeRange] || 0) - (a.power?.[timeRange] || 0))
              .map((room) => (
                <Grid size={12} key={room.id}>
                  <Card sx={{
                    bgcolor: colors.primary[400],
                    boxShadow: 3,
                    borderRadius: 2,
                    height: '100%',
                    borderLeft: `6px solid ${room.color}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      {/* Room Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box sx={{
                          bgcolor: room.color,
                          color: '#000',
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          {room.icon}
                        </Box>
                        <Typography variant="h4">{room.name}</Typography>
                      </Box>

                      {/* Power Consumption */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color={colors.grey[400]}>
                          Energy Usage
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                          <Typography variant="h3" color={colors.greenAccent[500]}>
                            {(room.power?.[timeRange] || 0).toFixed(1)}
                          </Typography>
                          <Typography variant="body1" color={colors.grey[300]} sx={{ ml: 1 }}>
                            kWh
                          </Typography>
                          <Typography variant="body2" color={colors.grey[400]} sx={{ ml: 'auto' }}>
                            {(((room.power?.[timeRange] || 0) / totalPowerConsumption) * 100).toFixed(0)}% of total
                          </Typography>
                        </Box>
                      </Box>

                      {/* Circuit Load */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color={colors.grey[400]}>
                          Average Circuit Load
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                          <Typography variant="h5" color={colors.blueAccent[400]}>
                            {(room.current?.[timeRange] || 0).toFixed(1)}
                          </Typography>
                          <Typography variant="body1" color={colors.grey[300]} sx={{ ml: 1 }}>
                            A
                          </Typography>
                        </Box>
                      </Box>

                      {/* Devices */}
                      {room.devices && room.devices.length > 0 && (
                        <Box>
                          <Typography variant="body2" color={colors.grey[400]} sx={{ mb: 0.5 }}>
                            Connected Devices
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {room.devices.map((device, index) => (
                              <Box
                                key={index}
                                sx={{
                                  bgcolor: colors.primary[600],
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.75rem'
                                }}
                              >
                                {device}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      ) : null}
    </Box>
  );
};

export default ScenePower;