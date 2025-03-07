import { Box, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState } from "react";
import MeteoCard from "../../components/power/MeteoCard";
import PowerConsumptionSection from "../../components/power/PowerConsumptionSection";
import RoomDetailsList from "../../components/power/RoomDetailsList";
import { mockRoomData } from "../../data/mockData"; // Move your mock data to a separate file
import AmperageGaugeSection from "../../components/power/AmperageGaugeSection";

const Power = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [activeTab, setActiveTab] = useState(0);

  // Use our custom hooks

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography
            variant="h2"
            color={colors.grey[100]}
            fontWeight="bold"
            sx={{ mb: "5px" }}
          >
            HOME ENERGY DASHBOARD
          </Typography>
          <Typography variant="h5" color={colors.greenAccent[400]}>
            Monitor your home power consumption
          </Typography>
        </Box>
      </Box>

      {/* TABS */}
      <Box sx={{ borderBottom: 1, borderColor: colors.grey[700], mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: colors.greenAccent[500],
            },
            '& .MuiTab-root': {
              color: colors.grey[300],
              fontWeight: 'medium',
              fontSize: '1rem',
              textTransform: 'none',
              '&.Mui-selected': {
                color: colors.greenAccent[400],
                fontWeight: 'bold',
              },
            }
          }}
        >
          <Tab label="Overview" />
          <Tab label="Room Details" />
        </Tabs>
      </Box>

      {/* TAB CONTENT */}
      {activeTab === 0 ? (
        // OVERVIEW TAB
        <Box
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gridAutoRows="140px"
          gap="20px"
        >
          {/* ROW 1 - Stats */}
          <MeteoCard />
          {/* ROW 2 - Gauge & Chart */}
          <AmperageGaugeSection />
          <PowerConsumptionSection />
        </Box>
      ) : (
        // ROOM DETAILS TAB
        <RoomDetailsList roomData={mockRoomData} />
      )}
    </Box>
  );
};

export default Power;