import mqtt from 'mqtt';
import { broadcastUpdate } from './websocket-service';
import { saveProcessedPowerReadings } from '@house-dashboard/db-service/src/operations/powerOperations';
import { IPowerReading } from '@house-dashboard/db-service/src/models';


// Store the latest power readings in memory for quick access
export const powerReadings: Record<string, IPowerReading> = {};

// MQTT client setup (unchanged)
const brokerUrl = process.env.MQTT_HOST || '';
const username = process.env.MQTT_USERNAME;
const password = process.env.MQTT_PASSWORD;
const topic = process.env.POWER_TOPIC || 'house-dashboard/power/shelly2pm';
const alltopic = '#';

// Connection options (unchanged)
const mqttOptions: mqtt.IClientOptions = {
  clientId: `power-service-${Math.random().toString(16).substring(2, 8)}`,
  clean: true
};

// Only add credentials if provided (unchanged)
if (username && password) {
  mqttOptions.username = username;
  mqttOptions.password = password;
}

const mqttClient = mqtt.connect(brokerUrl, mqttOptions);

// Function to calculate and broadcast totals (unchanged)
export function updateTotalsAndBroadcast(): void {
  const totalPower = Object.values(powerReadings).reduce((sum, reading) => sum + reading.power, 0);
  const totalCurrent = Object.values(powerReadings).reduce((sum, reading) => sum + reading.current, 0);

  broadcastUpdate({
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
    mqttClient.subscribe(alltopic, (err) => {
      if (err) {
        console.error('Error subscribing to power topics:', err);
      } else {
        console.log(`Subscribed to ${topic}`);
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
          const timestamp = new Date();

          try {
            // Use the db-service function to handle all database operations
            const reading = await saveProcessedPowerReadings(data, timestamp);

            // Update in-memory readings based on the returned data
            if (reading && reading.id) {
              powerReadings[reading.id] = reading;
            }
          
            // Update WebSocket clients
            updateTotalsAndBroadcast();

          } catch (dbError) {
            console.error('Failed to save readings to MongoDB:', dbError);
          }

        } catch (err) {
          console.error('Error processing custom topic message:', err);
        }
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