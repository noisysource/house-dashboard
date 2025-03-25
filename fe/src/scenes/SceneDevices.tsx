import React, { useState } from 'react';
import {
  Box, Button,
  Card, CardContent, Typography, Grid, useTheme
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { tokens } from '../theme';
import Header from '../components/common/Header';
import DeviceDialog from '../components/device/CreateEditDeviceDialog';
import { IDevice } from '@house-dashboard/db-service/src/models/';
import { CreateDeviceInput } from '../graphql/inputTypes';
import { useDevices } from '../hooks/useDevice';

const SceneDevices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [currentDevice, setCurrentDevice] = useState<IDevice | null>();
  const [error, setError] = useState<string | null>(null);

  const { devices, loading, error: queryError, createDevice, updateDevice, deleteDevice } = useDevices();


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
      if (!currentDevice.ipAddress) {
        setError('IP address is required');
        return;
      }

      // Format input
      const input: CreateDeviceInput = {
        name: currentDevice.name,
        type: currentDevice.type,
        ipAddress: currentDevice.ipAddress,
      };

      if (dialogMode === 'create') {
        await createDevice({name: currentDevice.name, ipAddress: currentDevice.ipAddress, type: currentDevice.type});
      } else {
        if (currentDevice?.id) {
          await updateDevice(currentDevice.id, input);
        } else {
          throw new Error('Device ID is required for updating a device');
        }
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
        await deleteDevice(id);
      } catch (err) {
        console.error('Error deleting device:', err);
      }
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
        {devices?.map((device: IDevice) => (
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
                </Box>

                <Box mt={2}>
                  <Typography variant="body1">
                    <strong>IP Address:</strong> {device.ipAddress}
                  </Typography>
                  {device.rooms && device.rooms.length > 0 ? (
                    <Typography variant="body1">
                      <strong>Location:</strong> {device.rooms.join(', ')}
                    </Typography>
                  ) : (
                    <Typography variant="body1" color="textSecondary">
                      <strong>Location:</strong> Device is lost in space
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {(!devices || devices.length === 0) && (
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