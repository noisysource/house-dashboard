// src/components/dashboard/StatsRow.tsx
import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import StatBox from "../common/StatBox";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import BoltIcon from "@mui/icons-material/Bolt";
import HomeIcon from "@mui/icons-material/Home";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import UmbrellaIcon from "@mui/icons-material/Umbrella";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import CircularProgress from "@mui/material/CircularProgress";
import { useWeatherData } from "../../hooks/useWeatherData";
import { useAmperageGenerator } from "../../hooks/useAmperageGenerator";

const MeteoCard = () => {
  const theme = useTheme();
  const { weatherData, getWeatherDescription } = useWeatherData();
  const currentAmperage = useAmperageGenerator(24.6);
  const colors = tokens(theme.palette.mode);

  // Weather icon helper function
  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) {
      return <WbSunnyIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />;
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return <UmbrellaIcon sx={{ color: colors.blueAccent[300], fontSize: "26px" }} />;
    } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      return <AcUnitIcon sx={{ color: colors.grey[300], fontSize: "26px" }} />;
    } else if (code >= 95) {
      return <FlashOnIcon sx={{ color: colors.redAccent[400], fontSize: "26px" }} />;
    } else {
      return <CloudIcon sx={{ color: colors.grey[400], fontSize: "26px" }} />;
    }
  };

  return (
    <>
      <Box
        gridColumn="span 3"
        sx={{ backgroundColor: colors.primary[400] }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
      </Box>
      {/* Indoor Temperature Card */}
      <Box
        gridColumn="span 3"
        sx={{ backgroundColor: colors.primary[400] }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <StatBox
          title="22°C"
          subtitle="Indoor Temperature"
          progress={0.60}
          increase="+1°C from yesterday"
          icon={
            <HomeIcon
              sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
            />
          }
        />
      </Box>

      {/* Outdoor Temperature Card */}
      <Box
        gridColumn="span 3"
        sx={{ backgroundColor: colors.primary[400] }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {weatherData.loading ? (
          <CircularProgress color="secondary" size={30} />
        ) : weatherData.error ? (
          <StatBox
            title="18°C"
            subtitle="Outdoor Temperature"
            progress={0.45}
            increase="Weather data unavailable"
            icon={<WbSunnyIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
          />
        ) : (
          <StatBox
            title={`${weatherData.temperature}°C`}
            subtitle={getWeatherDescription(weatherData.weatherCode)}
            progress={Math.min((weatherData.temperature + 10) / 40, 1)}
            increase={`Feels like ${weatherData.apparentTemperature}°C`}
            icon={getWeatherIcon(weatherData.weatherCode)}
          />
        )}
      </Box>
    </>
  );
};

export default MeteoCard;