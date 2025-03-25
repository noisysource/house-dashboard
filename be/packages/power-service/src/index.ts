import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { setupWebSocketServer } from './services/websocket-service';
import { connectMqtt } from './services/mqtt-service';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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