"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.powerReadings = void 0;
exports.connectMqtt = connectMqtt;
exports.getMqttClient = getMqttClient;
const mqtt_1 = __importDefault(require("mqtt"));
const websocket_service_1 = require("./websocket-service");
exports.powerReadings = {};
let mqttClient;
function connectMqtt() {
    const brokerUrl = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
    const username = process.env.MQTT_USERNAME || 'house_dashboard';
    const password = process.env.MQTT_PASSWORD;
    const topic = process.env.MQTT_TOPIC || 'shellies/#';
    console.log(`Connecting to MQTT broker at ${brokerUrl}`);
    // Connect to MQTT broker
    mqttClient = mqtt_1.default.connect(brokerUrl, {
        username,
        password,
        clientId: `power-service-${Math.random().toString(16).substring(2, 8)}`
    });
    // Handle connection
    mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
        mqttClient.subscribe(topic, (err) => {
            if (err) {
                console.error(`Failed to subscribe to ${topic}:`, err);
            }
            else {
                console.log(`Subscribed to ${topic}`);
            }
        });
    });
    // Process incoming messages
    mqttClient.on('message', (topic, message) => {
        try {
            // Parse message
            const data = JSON.parse(message.toString());
            const topicParts = topic.split('/');
            const deviceId = topicParts[1];
            // Check if this is a power-related message
            if (topic.includes('/power') || topic.includes('/relay/0') || topic.includes('/emeter')) {
                // Extract power values based on device type
                const reading = {
                    deviceId,
                    timestamp: Date.now(),
                    power: data.power || data.apower || 0,
                    current: data.current || data.current_a || 0,
                    voltage: data.voltage || 230, // Default to 230V if not provided
                };
                // Store reading
                exports.powerReadings[deviceId] = reading;
                // Calculate totals
                const totalPower = Object.values(exports.powerReadings).reduce((sum, device) => sum + device.power, 0);
                const totalCurrent = Object.values(exports.powerReadings).reduce((sum, device) => sum + device.current, 0);
                // Broadcast update to WebSocket clients
                (0, websocket_service_1.broadcastUpdate)({
                    devices: exports.powerReadings,
                    totalPower,
                    totalCurrent
                });
            }
        }
        catch (error) {
            console.error('Error processing MQTT message:', error);
        }
    });
    // Error handling
    mqttClient.on('error', (err) => {
        console.error('MQTT connection error:', err);
    });
    // Reconnection
    mqttClient.on('reconnect', () => {
        console.log('Attempting to reconnect to MQTT broker');
    });
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('Shutting down MQTT connection');
        mqttClient.end();
        process.exit();
    });
}
function getMqttClient() {
    return mqttClient;
}
