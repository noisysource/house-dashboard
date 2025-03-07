"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const websocket_service_1 = require("./services/websocket-service");
const mqtt_service_1 = require("./services/mqtt-service");
const power_routes_1 = __importDefault(require("./routes/power-routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API routes
app.use('/api/power', power_routes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'power-service' });
});
// Create HTTP server
const server = http_1.default.createServer(app);
// Setup WebSocket server for real-time updates
(0, websocket_service_1.setupWebSocketServer)(server);
// Connect to MQTT broker
(0, mqtt_service_1.connectMqtt)();
// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Power service running on port ${PORT}`);
});
