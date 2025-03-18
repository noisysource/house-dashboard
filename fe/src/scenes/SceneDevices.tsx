import React, { useState } from 'react';
import {
  Box, Button,
  Card, CardContent, Typography, IconButton, Grid, Switch, useTheme
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { tokens } from '../theme';
import Header from '../components/common/Header';
import { useQuery, useMutation } from '@apollo/client';
import { CREATE_DEVICE, UPDATE_DEVICE, DELETE_DEVICE, GET_DEVICES } from '../graphql/queries/queries';
import DeviceDialog from '../components/device/CreateEditDeviceDialog';
import { IDevice } from '../models/Device';
import { channel } from 'diagnostics_channel';

const SceneDevices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [currentDevice, setCurrentDevice] = useState<IDevice | null>();
  const [error, setError] = useState<string | null>(null);

  // GraphQL queries and mutations
  const { data, loading, error: queryError } = useQuery(GET_DEVICES);

  const [createDevice] = useMutation(CREATE_DEVICE, {
    refetchQueries: [{ query: GET_DEVICES }],
    onError: (error) => {
      setError(error.message);
    }
  });

  const [updateDevice] = useMutation(UPDATE_DEVICE, {
    refetchQueries: [{ query: GET_DEVICES }],
    onError: (error) => {
      setError(error.message);
    }
  });

  const [deleteDevice] = useMutation(DELETE_DEVICE, {
    refetchQueries: [{ query: GET_DEVICES }],
    onError: (error) => {
      setError(error.message);
    }
  });

  // Handle dialog open for create/edit
  const handleOpenDialog = (mode: React.SetStateAction<string>, device: IDevice) => {
    setDialogMode(mode);
    setCurrentDevice(device);
    setError(null);
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle form field changes
  const handleChange = (e: any) => {
    const { name, value, checked } = e.target;
    setCurrentDevice(prev => ({
      ...prev,
      [name]: name === 'active' ? checked : value
    } as IDevice));
  };

  // Save device (create or update)
  const handleSaveDevice = async () => {
    try {
      // Validate form
      if (!currentDevice || !currentDevice.name) {
        setError('Device name is required');
        return;
      }
      if (!currentDevice.ip) {
        setError('IP address is required');
        return;
      }

      // Format input
      const input = {
        name: currentDevice.name,
        ip: currentDevice.ip,
        type: currentDevice.type,
        location: currentDevice.location,
        active: currentDevice.active,
        channel: currentDevice.channel,
        topic: currentDevice.topic
      };

      if (dialogMode === 'create') {
        await createDevice({
          variables: { input }
        });
      } else {
        await updateDevice({
          variables: {
            id: currentDevice.id,
            input
          }
        });
      }

      handleCloseDialog();
    } catch (err) {
      console.error('Error saving device:', err);
      setError((err as any).message || 'Failed to save device');
    }
  };

  // Delete a device
  const handleDeleteDevice = async (id: any) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await deleteDevice({ variables: { id } });
      } catch (err) {
        console.error('Error deleting device:', err);
      }
    }
  };

  // Toggle device active status
  const handleToggleActive = async (device: { id: any; active: any; }) => {
    try {
      await updateDevice({
        variables: {
          id: device.id,
          input: { ...device, active: !device.active }
        }
      });
    } catch (err) {
      console.error('Error toggling device status:', err);
    }
  };

  if (loading) return <Typography variant="h6">Loading devices...</Typography>;
  if (queryError) return <Typography variant="h6" color="error">Error loading devices: {queryError.message}</Typography>;

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DEVICES" subtitle="Manage your connected devices" />
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('create', currentDevice || {} as IDevice)}
        >
          Add New Device
        </Button>
      </Box>

      <Grid container spacing={3} mt={2}>
        {data?.devices?.map((device: any) => (
          device && <Grid item xs={12} sm={6} md={4} key={device.id}>
            <Card
              sx={{
                backgroundColor: colors.primary[400],
                boxShadow: 3,
                height: '100%',
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h5" fontWeight="bold">{device.name}</Typography>
                    <Typography variant="subtitle1" color={colors.greenAccent[400]}>{device.type}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Switch
                      checked={device.active}
                      onChange={() => handleToggleActive(device)}
                      color="secondary"
                      size="small"
                    />
                    <IconButton
                      onClick={() => handleOpenDialog('edit', device)}
                      sx={{ color: colors.greenAccent[500] }}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteDevice(device.id)}
                      sx={{ color: colors.redAccent[500] }}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box mt={2}>
                  <Typography variant="body1">
                    <strong>IP Address:</strong> {device.ip}
                  </Typography>
                  {device.location && (
                    <Typography variant="body1">
                      <strong>Location:</strong> {device.location}
                    </Typography>
                  )}
                  <Typography variant="body1">
                    <strong>Status:</strong>{' '}
                    <Box component="span" sx={{
                      color: device.active ? colors.greenAccent[400] : colors.redAccent[400],
                      fontWeight: 'bold'
                    }}>
                      {device.active ? 'Active' : 'Inactive'}
                    </Box>
                  </Typography>
                  {device.roomId && (
                    <Typography variant="body1">
                      <strong>Room:</strong> {device.roomName || device.roomId}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {(!data?.devices || data.devices.length === 0) && (
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: colors.primary[400], p: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" mb={2}>
                  No devices available
                </Typography>
                <Typography variant="body1" mb={3}>
                  Add your first device to start monitoring power consumption
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('create', currentDevice || {} as IDevice)}
                >
                  Add New Device
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialog for creating/editing devices */}
      <DeviceDialog
        open={openDialog}
        mode={dialogMode}
        device={currentDevice || undefined}
        onClose={handleCloseDialog}
        onSave={handleSaveDevice}
        onChange={handleChange}
        error={error}
      />
    </Box>
  );
};

export default SceneDevices;