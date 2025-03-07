"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mqtt_service_1 = require("../services/mqtt-service");
const router = express_1.default.Router();
// Get all power readings
router.get('/readings', (req, res) => {
    const totalPower = Object.values(mqtt_service_1.powerReadings).reduce((sum, device) => sum + device.power, 0);
    const totalCurrent = Object.values(mqtt_service_1.powerReadings).reduce((sum, device) => sum + device.current, 0);
    res.json({
        devices: mqtt_service_1.powerReadings,
        totalPower,
        totalCurrent,
        timestamp: Date.now()
    });
});
// Get specific device reading
router.get('/readings/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const reading = mqtt_service_1.powerReadings[deviceId];
    if (!reading) {
        return res.status(404).json({ error: 'Device not found' });
    }
    res.json(reading);
});
exports.default = router;
