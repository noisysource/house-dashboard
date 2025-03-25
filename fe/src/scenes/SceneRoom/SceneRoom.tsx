import { useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Card, CardContent, Typography, IconButton, Grid, List, ListItem, ListItemText,
  ListItemSecondaryAction, useTheme, Checkbox, FormControl, FormGroup, FormControlLabel,
  Alert
} from '@mui/material';
import { tokens } from '../../theme';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_DEVICES } from '../../graphql/queries/deviceQueries';
import { 
  GET_ROOMS, 
  CREATE_ROOM, 
  UPDATE_ROOM, 
  DELETE_ROOM, 
  UPDATE_DEVICE_ROOM 
} from '../../graphql/queries/roomQueries';
import Header from '../../components/common/Header';

// Define types for Room and Device
interface IRoom {
  id: string;
  name: string;
  floor?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface IDevice {
  id: string;
  name: string;
  type: string;
  ipAddress: string; // Updated from ip
  macAddress?: string;
  rooms: string[]; // List of room IDs the device belongs to
}

interface RoomFormData {
  id: string;
  name: string;
  devices: string[];
}

const SceneRoom = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [currentRoom, setCurrentRoom] = useState<RoomFormData>({ id: '', name: '', devices: [] });
  const [roomName, setRoomName] = useState('');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // GraphQL queries and mutations
  const { data: roomsData, loading: roomsLoading, error: roomsError, refetch: refetchRooms } = 
    useQuery(GET_ROOMS);
  
  const { data: devicesData, loading: devicesLoading, error: devicesError, refetch: refetchDevices } = 
    useQuery(GET_DEVICES);

  const [createRoom, { loading: createLoading }] = useMutation(CREATE_ROOM, {
    onCompleted: () => {
      refetchRooms();
      refetchDevices();
    },
    onError: (error) => {
      console.error('Create room error:', error);
      setError(`Failed to create room: ${error.message}`);
    }
  });

  const [updateRoom, { loading: updateLoading }] = useMutation(UPDATE_ROOM, {
    onCompleted: () => {
      refetchRooms();
      refetchDevices();
    },
    onError: (error) => {
      console.error('Update room error:', error);
      setError(`Failed to update room: ${error.message}`);
    }
  });

  const [deleteRoom, { loading: deleteLoading }] = useMutation(DELETE_ROOM, {
    onCompleted: () => {
      refetchRooms();
      refetchDevices();
    },
    onError: (error) => {
      console.error('Delete room error:', error);
      setError(`Failed to delete room: ${error.message}`);
    }
  });

  const [updateDeviceRoom, { loading: assignLoading }] = useMutation(UPDATE_DEVICE_ROOM, {
    onCompleted: () => {
      refetchRooms();
      refetchDevices();
    },
    onError: (error) => {
      console.error('Assign device error:', error);
      setError(`Failed to assign device: ${error.message}`);
    }
  });

  // Handle dialog open for create/edit
  const handleOpenDialog = (mode: string, room: Partial<IRoom & {devices: string[]}> = { id: '', name: '', devices: [] }) => {
    setDialogMode(mode);
    setCurrentRoom({
      id: room.id || '',
      name: room.name || '',
      devices: room.devices || []
    });
    setRoomName(room.name || '');
    setSelectedDevices(room.devices || []);
    setError(null);
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRoomName('');
    setSelectedDevices([]);
    setError(null);
  };

  // Toggle device selection
  const handleDeviceToggle = (deviceId: string) => {
    setSelectedDevices(prev => {
      if (prev.includes(deviceId)) {
        return prev.filter(id => id !== deviceId);
      } else {
        return [...prev, deviceId];
      }
    });
  };

  // Save room (create or update)
  const handleSaveRoom = async () => {
    try {
      setError(null);
      
      if (dialogMode === 'create') {
        await createRoom({
          variables: {
            record: {
              name: roomName
            }
          }
        });
        
        // After room creation, update devices with the newly created room ID
        // This would happen in a separate step in the backend
      } else {
        await updateRoom({
          variables: {
            id: currentRoom.id,
            record: {
              name: roomName
            }
          }
        });

        // Update device assignments separately
        const devices = getAllDevices();
        
        // First pass: update all devices with their room assignments
        for (const device of devices) {
          const isSelected = selectedDevices.includes(device.id);
          const hasRoom = device.rooms?.includes(currentRoom.id);
          
          // If selection state changed
          if (isSelected !== hasRoom) {
            const updatedRooms = isSelected 
              ? [...(device.rooms || []), currentRoom.id]
              : (device.rooms || []).filter(id => id !== currentRoom.id);
            
            await updateDeviceRoom({
              variables: {
                id: device.id,
                record: {
                  rooms: updatedRooms
                }
              }
            });
          }
        }
      }

      handleCloseDialog();
    } catch (err) {
      console.error('Detailed error saving room:', err);
      setError(err instanceof Error ? err.message : 'Failed to save room');
    }
  };

  // Delete room
  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoom({ variables: { id: roomId } });
        
        // Update all devices that were in this room
        const devicesInRoom = getDevicesInRoom(roomId);
        for (const device of devicesInRoom) {
          const updatedRooms = (device.rooms || []).filter(id => id !== roomId);
          await updateDeviceRoom({
            variables: {
              id: device.id,
              record: {
                rooms: updatedRooms
              }
            }
          });
        }
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  // Assign device to room
  const handleAssignDevice = async (deviceId: string, roomId: string) => {
    try {
      const device = getAllDevices().find(d => d.id === deviceId);
      if (!device) return;
      
      const updatedRooms = [...(device.rooms || []), roomId];
      
      await updateDeviceRoom({
        variables: {
          id: deviceId,
          record: {
            rooms: updatedRooms
          }
        }
      });
    } catch (error) {
      console.error('Error assigning device:', error);
    }
  };

  // Get all devices from GraphQL response
  const getAllDevices = (): IDevice[] => {
    if (!devicesData?.deviceMany) return [];
    return devicesData.deviceMany;
  };

  // Get devices for a specific room
  const getDevicesInRoom = (roomId: string): IDevice[] => {
    return getAllDevices().filter(device => 
      device.rooms && device.rooms.includes(roomId)
    );
  };

  // Get unassigned devices (not in any room)
  const getUnassignedDevices = (): IDevice[] => {
    return getAllDevices().filter(device => 
      !device.rooms || device.rooms.length === 0
    );
  };

  // Get all rooms
  const getAllRooms = (): IRoom[] => {
    if (!roomsData?.roomMany) return [];
    return roomsData.roomMany;
  };

  const isLoading = roomsLoading || devicesLoading;
  const isMutating = createLoading || updateLoading || deleteLoading || assignLoading;
  const apiError = roomsError || devicesError;

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="ROOMS" subtitle="Manage rooms and device assignments" />
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('create')}
          disabled={isMutating}
        >
          Add New Room
        </Button>
      </Box>

      {apiError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading data: {apiError.message}
        </Alert>
      )}

      {isLoading ? (
        <Typography variant="h6" sx={{ mt: 3 }}>Loading...</Typography>
      ) : (
        <Grid container spacing={3} mt={2}>
          {/* Room Cards */}
          {getAllRooms().map((room) => (
            <Grid item xs={12} md={6} lg={4} key={room.id}>
              <Card
                sx={{
                  backgroundColor: colors.primary[400],
                  boxShadow: 3,
                  transition: '0.3s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5">{room.name}</Typography>
                    <Box>
                      <IconButton
                        onClick={() => handleOpenDialog('edit', { 
                          ...room, 
                          devices: getDevicesInRoom(room.id).map(d => d.id) 
                        })}
                        size="small"
                        sx={{ color: colors.greenAccent[500] }}
                        disabled={isMutating}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteRoom(room.id)}
                        size="small"
                        sx={{ color: colors.redAccent[500] }}
                        disabled={isMutating}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="h6" mb={1}>Devices in this room:</Typography>
                  <List dense>
                    {getDevicesInRoom(room.id).map((device) => (
                      <ListItem key={device.id} sx={{ bgcolor: colors.primary[500], mb: 1, borderRadius: 1 }}>
                        <ListItemText
                          primary={device.name}
                          secondary={`${device.type} - ${device.ipAddress}`} // Updated from ip
                        />
                      </ListItem>
                    ))}

                    {getDevicesInRoom(room.id).length === 0 && (
                      <ListItem>
                        <ListItemText primary="No devices assigned" />
                      </ListItem>
                    )}
                  </List>

                  <Box mt={2}>
                    <Typography variant="h6" mb={1}>Add device to this room:</Typography>
                    <List dense sx={{ maxHeight: '150px', overflow: 'auto' }}>
                      {getUnassignedDevices().map((device) => (
                        <ListItem key={device.id} sx={{ bgcolor: colors.primary[500], mb: 1, borderRadius: 1 }}>
                          <ListItemText
                            primary={device.name}
                            secondary={`${device.type}`}
                          />
                          <ListItemSecondaryAction>
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              onClick={() => handleAssignDevice(device.id, room.id)}
                              disabled={isMutating}
                            >
                              Assign
                            </Button>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}

                      {getUnassignedDevices().length === 0 && (
                        <ListItem>
                          <ListItemText primary="No unassigned devices available" />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Empty state */}
          {getAllRooms().length === 0 && (
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: colors.primary[400], p: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" mb={2}>
                    No rooms available
                  </Typography>
                  <Typography variant="body1" mb={3}>
                    Create your first room to start organizing your devices
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('create')}
                    disabled={isMutating}
                  >
                    Add New Room
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Dialog for creating/editing rooms */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Add New Room' : 'Edit Room'}
        </DialogTitle>
        <DialogContent>
          {/* Room name field */}
          <TextField
            autoFocus
            margin="dense"
            label="Room Name"
            type="text"
            fullWidth
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Device selection */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Select devices for this room
          </Typography>

          {devicesLoading ? (
            <Typography>Loading devices...</Typography>
          ) : (
            <FormControl component="fieldset" fullWidth>
              <FormGroup>
                <Grid container spacing={2}>
                  {getAllDevices().map((device) => (
                    <Grid item xs={12} sm={6} md={4} key={device.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedDevices.includes(device.id)}
                            onChange={() => handleDeviceToggle(device.id)}
                            name={device.id}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1">{device.name}</Typography>
                            <Typography variant="body2" color={colors.grey[300]}>
                              {device.type} - {device.ipAddress}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          border: `1px solid ${colors.primary[500]}`,
                          borderRadius: 1,
                          p: 1,
                          width: '100%'
                        }}
                      />
                    </Grid>
                  ))}

                  {getAllDevices().length === 0 && (
                    <Grid item xs={12}>
                      <Typography color={colors.grey[300]}>
                        No devices available
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </FormGroup>
            </FormControl>
          )}

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSaveRoom}
            color="secondary"
            variant="contained"
            disabled={!roomName.trim() || isMutating}
          >
            {dialogMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SceneRoom;