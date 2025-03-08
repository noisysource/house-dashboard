import mqtt from 'mqtt';
import { IPowerReading, PowerReading } from '../models/PowerReading';
import { broadcastUpdate } from './websocket-service';

interface PowerReadingData {
  deviceId: string;
  timestamp: number;
  power: number;
  current: number;
  voltage: number;
  relayIndex?: number;
}

// Store the latest power readings in memory for quick access
export const powerReadings: Record<string, PowerReadingData> = {};

// MQTT client
const brokerUrl = process.env.MQTT_HOST || '';
const username = process.env.MQTT_USERNAME;
const password = process.env.MQTT_PASSWORD;
const topic = process.env.POWER_TOPIC || 'house-dashboard/power/shelly2pm';

const mqttClient = mqtt.connect(brokerUrl, {
  username: username,
  password: password
});

// Function to calculate and broadcast totals
export function updateTotalsAndBroadcast(): void {
  const totalPower = Object.values(powerReadings).reduce((sum, device) => sum + device.power, 0);
  const totalCurrent = Object.values(powerReadings).reduce((sum, device) => sum + device.current, 0);
  
  broadcastUpdate({
    devices: powerReadings,
    totalPower,
    totalCurrent,
    timestamp: new Date()
  });
}

// Connect to MQTT broker and subscribe to topics
export function connectMqtt(): void {
  mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    
    // Subscribe to power topics
    mqttClient.subscribe(topic, (err) => {
      if (err) {
        console.error('Error subscribing to power topics:', err);
      } else {
        console.log('Subscribed to power topics');
      }
    });
  });

  // Process incoming messages
  mqttClient.on('message', async (topic, message) => {
    // Log all messages for debugging
    console.log(`MQTT Message: Topic=${topic}`);

    try {
      // Handle custom topic from Shelly script
      if (topic === 'house-dashboard/power/shelly2pm') {
        console.log('Received message on custom topic:', message.toString().substring(0, 100));
        try {
          const data = JSON.parse(message.toString());
          const deviceId = data.deviceId || 'unknown-device';

          // Process each channel (relay)
          if (data.channels && Array.isArray(data.channels)) {
            // Prepare bulk insert for MongoDB
            const readings: IPowerReading[] = [];
            const timestamp = new Date();
            
            data.channels.forEach((channel: any) => {
              const readingId = `${deviceId}-relay${channel.relay}`;

              // Update in-memory readings
              powerReadings[readingId] = {
                deviceId,
                timestamp: Date.now(),
                power: channel.power || 0,
                current: channel.current || 0,
                voltage: channel.voltage || 230,
                relayIndex: channel.relay
              };

              // Add to MongoDB batch
              readings.push(new PowerReading({
                timestamp,
                power: channel.power || 0,
                current: channel.current || 0,
                voltage: channel.voltage || 230,
                deviceId,
                relayIndex: channel.relay
              }));

              console.log(`Updated power reading for ${readingId}: ${channel.power}W`);
            });
            
            // Save to MongoDB (bulk insert)
            try {
              if (readings.length > 0) {
                await PowerReading.insertMany(readings);
                console.log(`Saved ${readings.length} power readings to MongoDB`);
              }
            } catch (dbError) {
              console.error('Failed to save readings to MongoDB:', dbError);
            }

            // Update WebSocket clients
            updateTotalsAndBroadcast();
          }
        } catch (err) {
          console.error('Error processing custom topic message:', err);
        }
        return;
      }
    } catch (error) {
      console.error('Error processing MQTT message:', error);
    }
  });

  // Error handling
  mqttClient.on('error', (err) => {
    console.error('MQTT client error:', err);
  });
}