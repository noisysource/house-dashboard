import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Button,
    Box,
    Typography,
    Switch,
    IconButton,
    InputAdornment,
    Tooltip
} from '@mui/material';
import { IDevice } from '../../models/Device';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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
    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    // Calculate the topic based on location and name
    const generateTopic = (): string => {
        if (!device) return '';
        
        const location = device.location?.trim().toLowerCase().replace(/\s+/g, '-') || 'home';
        const name = device.name?.trim().toLowerCase().replace(/\s+/g, '-') || '';
        
        if (name) {
            return `house-dashboard/${location}/${name}`;
        }
        return '';
    };

    // Handle field changes with auto-topic generation
    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Call the original onChange handler
        onChange(e);
        
        // If the name or location changes, update the topic field
        if (e.target.name === 'name' || e.target.name === 'location') {
            // We need to wait for the state update to complete
            setTimeout(() => {
                // Create a new synthetic event for topic update
                const newTopic = e.target.name === 'name' 
                    ? `house-dashboard/${device?.location?.trim().toLowerCase().replace(/\s+/g, '-') || 'home'}/${e.target.value.trim().toLowerCase().replace(/\s+/g, '-')}` 
                    : `house-dashboard/${e.target.value.trim().toLowerCase().replace(/\s+/g, '-') || 'home'}/${device?.name?.trim().toLowerCase().replace(/\s+/g, '-')}`;
                
                const topicEvent = {
                    target: {
                        name: 'topic',
                        value: newTopic
                    }
                } as React.ChangeEvent<HTMLInputElement>;
                
                onChange(topicEvent);
            }, 0);
        }
    };

    // Auto-generated topic display
    const autoTopic = generateTopic();

    // Copy to clipboard function
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(autoTopic);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                {mode === 'create' ? 'Add New Device' : 'Edit Device'}
            </DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    name="location"
                    label="Location (optional)"
                    type="text"
                    fullWidth
                    value={device?.location || ''}
                    onChange={handleFieldChange} 
                    sx={{ mb: 2 }}
                />
                <TextField
                    autoFocus
                    margin="dense"
                    name="name"
                    label="Device Name"
                    type="text"
                    fullWidth
                    value={device?.name || ''}
                    onChange={handleFieldChange}
                    sx={{ mb: 2 }}
                />
                <TextField
                    margin="dense"
                    name="ip"
                    label="IP Address"
                    type="text"
                    fullWidth
                    value={device?.ip || ''}
                    onChange={onChange}
                    sx={{ mb: 2 }}
                />
                <TextField
                    margin="dense"
                    name="channel"
                    label="Device Channel"
                    type="text"
                    fullWidth
                    value={device?.channel || ''}
                    onChange={onChange}
                    sx={{ mb: 2 }}
                />
                <TextField
                    margin="dense"
                    name="topic"
                    label="MQTT Topic"
                    type="text"
                    fullWidth
                    value={device?.topic || autoTopic}
                    InputProps={{
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position="end">
                                <Tooltip title={copySuccess ? "Copied!" : "Copy to clipboard"}>
                                    <IconButton
                                        onClick={handleCopyToClipboard}
                                        edge="end"
                                    >
                                        <ContentCopyIcon />
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        ),
                    }}
                    helperText="Auto-generated from location and name"
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

                <Box display="flex" alignItems="center">
                    <Typography>Active: </Typography>
                    <Switch
                        name="active"
                        checked={device?.active || false}
                        onChange={onChange}
                        color="secondary"
                    />
                </Box>

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
                    disabled={!device?.name || !device?.ip}
                >
                    {mode === 'create' ? 'Create' : 'Update'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeviceDialog;