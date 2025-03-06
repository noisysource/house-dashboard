// src/components/dashboard/AmperageGaugeSection.tsx
import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import AmperageGauge from "./AmperageGauge";
import { useAmperageGenerator } from "../../hooks/useAmperageGenerator";

const AmperageGaugeSection = () => {
  const theme = useTheme();
  const currentAmperage = useAmperageGenerator(24.6);
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