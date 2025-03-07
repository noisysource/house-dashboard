// src/components/dashboard/AmperageGaugeSection.tsx
import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import AmperageGauge from "./AmperageGauge";
import usePowerData from "../../hooks/usePowerData";

const AmperageGaugeSection = () => {
  const theme = useTheme();
  const currentAmperage = usePowerData().currentAmperage;
  const colors = tokens(theme.palette.mode);
  
  return (
    <Box
      gridColumn="span 4"
      gridRow="span 2"
      sx={{ backgroundColor: colors.primary[400] }}
    >
      <Box p="20px" height="100%">
        <AmperageGauge
          value={currentAmperage}
          min={0}
          max={50}
          title="Current House Load"
          unit="A"
        />
      </Box>
    </Box>
  );
};

export default AmperageGaugeSection;