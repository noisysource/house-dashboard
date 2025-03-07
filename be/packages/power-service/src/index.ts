import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import { setupWebSocketServer } from './services/websocket-service';
import { connectMqtt } from './services/mqtt-service';
import powerRoutes from './routes/power-routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/power', powerRoutes);

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
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Power service running on port ${PORT}`);
});