import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { setupWebSocketServer } from './services/websocket-service';
import { connectMqtt } from './services/mqtt-service';
import powerRoutes from './routes/power-routes';
import roomsRoutes from './routes/room-routes';
import deviceRoutes from './routes/device-routes';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const app = express();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/house_dashboard';

// Connect to MongoDB
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/power', powerRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/devices', deviceRoutes);

// Health check endpoint
app.get('/health', (req: any, res: any) => {
    res.json({ status: 'ok', service: 'power-service' });
});

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server for real-time updates
setupWebSocketServer(server);

// Connect to MQTT broker
connectMqtt();

// Start server
const PORT = process.env.POWER_SERVICE_PORT || 3001;
server.listen(PORT, () => {
    console.log(`Power service running on port ${PORT}`);
});