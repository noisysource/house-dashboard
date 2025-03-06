// src/components/dashboard/PowerConsumptionSection.tsx
import { Box, ButtonGroup, Button, Typography, IconButton, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import LineChart from "./LineChart";
import { useState } from "react";

const PowerConsumptionSection = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedPeriod, setSelectedPeriod] = useState("24h");

  return (
    <Box
      gridColumn="span 8"
      gridRow="span 2"
      sx={{ backgroundColor: colors.primary[400] }}
    >
      <Box
        mt="25px"
        p="0 30px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
            Power Consumption ({selectedPeriod === "24h" ? "24h" :
              selectedPeriod === "week" ? "7 Days" : "30 Days"})
          </Typography>
          <Typography variant="h3" fontWeight="bold" color={colors.greenAccent[500]}>
            {selectedPeriod === "24h" ? "12.8 kWh" :
              selectedPeriod === "week" ? "89.4 kWh" : "342.7 kWh"}
          </Typography>
        </Box>
        <Box>
          <ButtonGroup
            variant="outlined"
            size="small"
            sx={{
              mr: 2,
              '& .MuiButton-root': {
                color: colors.grey[100],
                borderColor: colors.grey[700],
                fontSize: "0.75rem",
              },
              '& .MuiButton-root.Mui-selected': {
                backgroundColor: colors.greenAccent[700],
                color: colors.grey[900],
                fontWeight: 'bold',
              }
            }}
          >
            <Button
              onClick={() => setSelectedPeriod("24h")}
              variant={selectedPeriod === "24h" ? "contained" : "outlined"}
              sx={{
                backgroundColor: selectedPeriod === "24h" ? colors.greenAccent[500] : 'transparent',
                '&:hover': { backgroundColor: selectedPeriod === "24h" ? colors.greenAccent[600] : colors.grey[800] }
              }}
            >
              24h
            </Button>
            <Button
              onClick={() => setSelectedPeriod("week")}
              variant={selectedPeriod === "week" ? "contained" : "outlined"}
              sx={{
                backgroundColor: selectedPeriod === "week" ? colors.greenAccent[500] : 'transparent',
                '&:hover': { backgroundColor: selectedPeriod === "week" ? colors.greenAccent[600] : colors.grey[800] }
              }}
            >
              Week
            </Button>
            <Button
              onClick={() => setSelectedPeriod("month")}
              variant={selectedPeriod === "month" ? "contained" : "outlined"}
              sx={{
                backgroundColor: selectedPeriod === "month" ? colors.greenAccent[500] : 'transparent',
                '&:hover': { backgroundColor: selectedPeriod === "month" ? colors.greenAccent[600] : colors.grey[800] }
              }}
            >
              Month
            </Button>
          </ButtonGroup>
          <IconButton>
            <DownloadOutlinedIcon
              sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
            />
          </IconButton>
        </Box>
      </Box>
      <Box height="250px" m="-20px 0 0 0">
        <LineChart isDashboard={true} timePeriod={selectedPeriod} />
      </Box>
    </Box>
  );
};

export default PowerConsumptionSection;