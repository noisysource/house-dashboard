import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Button,
    Typography} from '@mui/material';
import { IDevice } from '@house-dashboard/db-service/src/models/';

// Device types
const deviceTypes = [
    'Other'
];

interface DeviceDialogProps {
    open: boolean;
    mode: string;
    device?: IDevice;
    onClose: () => void;
    onSave: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error: string | null;
}

const DeviceDialog: React.FC<DeviceDialogProps> = ({
    open,
    mode,
    device,
    onClose,
    onSave,
    onChange,
    error
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                {mode === 'create' ? 'Add New Device' : 'Edit Device'}
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    name="name"
                    label="Device Name"
                    type="text"
                    fullWidth
                    value={device?.name || ''}
                    onChange={onChange}
                    sx={{ mb: 2 }}
                />
                <TextField
                    margin="dense"
                    name="ipAddress"
                    label="IP Address"
                    type="text"
                    fullWidth
                    value={device?.ipAddress || ''}
                    onChange={onChange}
                    sx={{ mb: 2 }}
                />
                <TextField
                    margin="dense"
                    name="type"
                    label="Device Type"
                    select
                    fullWidth
                    value={device?.type || ''}
                    onChange={onChange}
                    sx={{ mb: 2 }}
                >
                    {deviceTypes.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>
                {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={onSave} 
                    variant="contained" 
                    color="secondary"
                    disabled={!device?.name || !device?.ipAddress}
                >
                    {mode === 'create' ? 'Create' : 'Update'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeviceDialog;