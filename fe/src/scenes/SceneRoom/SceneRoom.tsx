import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Card, CardContent, Typography, IconButton, Grid, List, ListItem, ListItemText,
  ListItemSecondaryAction, useTheme, Checkbox, FormControl, FormGroup, FormControlLabel
} from '@mui/material';
import { tokens } from '../../theme';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { ASSIGN_DEVICE, CREATE_ROOM, DELETE_ROOM, GET_DEVICES, GET_ROOMS, UPDATE_ROOM } from '../../graphql/queries/queries';
import Header from '../../components/common/Header';

const SceneRoom = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [currentRoom, setCurrentRoom] = useState({ id: '', name: '' });
  const [roomName, setRoomName] = useState('');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // GraphQL queries and mutations
  const { data: roomsData, loading: roomsLoading } = useQuery(GET_ROOMS);
  const { data: devicesData, loading: devicesLoading } = useQuery(GET_DEVICES);

  const [createRoom] = useMutation(CREATE_ROOM, {
    refetchQueries: [{ query: GET_ROOMS }]
  });

  const [updateRoom] = useMutation(UPDATE_ROOM, {
    refetchQueries: [{ query: GET_ROOMS }]
  });

  const [deleteRoom] = useMutation(DELETE_ROOM, {
    refetchQueries: [{ query: GET_ROOMS }]
  });

  const [assignDevice] = useMutation(ASSIGN_DEVICE, {
    refetchQueries: [{ query: GET_DEVICES }, { query: GET_ROOMS }]
  });

  // Handle dialog open for create/edit
  const handleOpenDialog = (mode: string, room = { id: '', name: '', devices: [] as string[] }) => {
    setDialogMode(mode);
    setCurrentRoom(room);
    setRoomName(room.name);
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
      console.log('Saving room with name:', roomName);
      console.log('Selected devices:', selectedDevices);
      
      if (dialogMode === 'create') {
        const result = await createRoom({ 
          variables: { 
            input: { 
              name: roomName,
              devices: selectedDevices
            } 
          } 
        });
        console.log('Room created:', result);
        
        // Assign devices to the new room
        if (result.data?.createRoom?.id && selectedDevices.length > 0) {
          const roomId = result.data.createRoom.id;
          for (const deviceId of selectedDevices) {
            await assignDevice({
              variables: { deviceId, roomId }
            });
          }
        }
      } else {
        const result = await updateRoom({ 
          variables: { 
            id: currentRoom.id, 
            input: { 
              name: roomName,
              devices: selectedDevices
            } 
          } 
        });
        console.log('Room updated:', result);
        
        // Update device assignments
        if (currentRoom.id) {
          // Get current devices in this room
          const currentDevices = devicesData?.devices?.filter((d: any) => d.roomId === currentRoom.id) || [];
          const currentDeviceIds = currentDevices.map((d: any) => d.id);
          
          // Devices to add to this room
          const devicesToAdd = selectedDevices.filter(id => !currentDeviceIds.includes(id));
          
          // Devices to remove from this room
          const devicesToRemove = currentDeviceIds.filter((id: string) => !selectedDevices.includes(id));
          
          // Assign new devices to this room
          for (const deviceId of devicesToAdd) {
            await assignDevice({
              variables: { deviceId, roomId: currentRoom.id }
            });
          }
          
          // Unassign devices from this room (set roomId to null)
          for (const deviceId of devicesToRemove) {
            await assignDevice({
              variables: { deviceId, roomId: null }
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
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  // Assign device to room
  const handleAssignDevice = async (deviceId: string, roomId: string) => {
    try {
      await assignDevice({
        variables: { deviceId, roomId }
      });
    } catch (error) {
      console.error('Error assigning device:', error);
    }
  };

  // Get devices for a specific room
  const getRoomDevices = (roomId: string) => {
    if (!devicesData || !devicesData.devices) return [];
    return devicesData.devices.filter((device: { roomId: string }) => device.roomId === roomId);
  };

  // Get unassigned devices
  const getUnassignedDevices = () => {
    if (!devicesData || !devicesData.devices) return [];
    return devicesData.devices.filter((device: { roomId: any }) => !device.roomId);
  };

  // Get all devices (for the dialog)
  const getAllDevices = () => {
    if (!devicesData || !devicesData.devices) return [];
    return devicesData.devices;
  };

  const isLoading = roomsLoading || devicesLoading;

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="ROOMS" subtitle="Manage rooms and device assignments" />
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('create')}
        >
          Add New Room
        </Button>
      </Box>
      
      {isLoading ? (
        <Typography variant="h6" sx={{ mt: 3 }}>Loading...</Typography>
      ) : (
        <Grid container spacing={3} mt={2}>
          {/* Room Cards */}
          {roomsData && roomsData.rooms && roomsData.rooms.map((room: any) => (
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
                        onClick={() => handleOpenDialog('edit', room)}
                        size="small"
                        sx={{ color: colors.greenAccent[500] }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteRoom(room.id)}
                        size="small"
                        sx={{ color: colors.redAccent[500] }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="h6" mb={1}>Devices in this room:</Typography>
                  <List dense>
                    {getRoomDevices(room.id).map((device: any) => (
                      <ListItem key={device.id} sx={{ bgcolor: colors.primary[500], mb: 1, borderRadius: 1 }}>
                        <ListItemText 
                          primary={device.name} 
                          secondary={`${device.type} - ${device.ip}`} 
                        />
                      </ListItem>
                    ))}
                    
                    {getRoomDevices(room.id).length === 0 && (
                      <ListItem>
                        <ListItemText primary="No devices assigned" />
                      </ListItem>
                    )}
                  </List>
                  
                  <Box mt={2}>
                    <Typography variant="h6" mb={1}>Add device to this room:</Typography>
                    <List dense sx={{ maxHeight: '150px', overflow: 'auto' }}>
                      {getUnassignedDevices().map((device: any) => (
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
          {(!roomsData?.rooms || roomsData.rooms.length === 0) && (
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
                  {getAllDevices().map((device: any) => (
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
                              {device.type} - {device.ip}
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
            <Box sx={{ color: colors.redAccent[500], mt: 2 }}>
              <Typography variant="body2">{error}</Typography>
            </Box>
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
            disabled={!roomName.trim()}
          >
            {dialogMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SceneRoom;