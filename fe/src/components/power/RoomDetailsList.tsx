// src/components/dashboard/RoomDetailsList.tsx
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";

// Import the mock data type or define it here
interface Device {
  deviceId: string;
  name: string;
  status: string;
  amperage: number;
  kilowatts: number;
  time: string;
}

interface Room {
  roomId: string;
  roomName: string;
  totalAmperage: number;
  totalKw: number;
  devices: Device[];
}

interface RoomDetailsListProps {
  roomData: Room[];
}

const RoomDetailsList = ({ roomData }: RoomDetailsListProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      sx={{
        backgroundColor: colors.primary[400],
        borderRadius: '4px',
        overflow: 'auto',
        height: 'calc(100vh - 240px)' // Adjust height to fit screen
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        borderBottom={`4px solid ${colors.primary[500]}`}
        color={colors.grey[100]}
        p="15px"
      >
        <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
          Current Consumption by Room
        </Typography>
      </Box>

      {/* Room Grid */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        gap="20px"
        p="20px"
      >
        {roomData.map((room) => (
          <Box
            key={room.roomId}
            sx={{
              backgroundColor: colors.primary[500],
              borderRadius: "5px",
              boxShadow: `0px 2px 10px ${colors.primary[600]}`
            }}
          >
            {/* Room Header */}
            <Box
              p="15px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`2px solid ${colors.primary[600]}`}
              bgcolor={colors.primary[600]}
              sx={{
                borderTopLeftRadius: "5px",
                borderTopRightRadius: "5px"
              }}
            >
              <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
                {room.roomName}
              </Typography>
              <Box textAlign="right">
                <Typography variant="body1" fontWeight="600" color={colors.greenAccent[400]}>
                  {room.totalAmperage} A
                </Typography>
                <Typography variant="body2" color={colors.grey[300]}>
                  {room.totalKw} kW
                </Typography>
              </Box>
            </Box>

            {/* Device List */}
            <Box>
              {room.devices.map((device) => (
                <Box
                  key={device.deviceId}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  borderBottom={`1px solid ${colors.primary[600]}`}
                  p="10px 15px"
                >
                  <Box>
                    <Typography color={colors.greenAccent[400]} fontWeight="500">
                      {device.name}
                    </Typography>
                    <Typography variant="body2" color={colors.grey[300]}>
                      {device.status} • {device.time}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body1" fontWeight="600" color={colors.grey[100]}>
                      {device.amperage} A
                    </Typography>
                    <Typography variant="body2" color={colors.grey[400]}>
                      {device.kilowatts} kW
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default RoomDetailsList;