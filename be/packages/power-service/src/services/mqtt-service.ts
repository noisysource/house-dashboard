import mqtt from 'mqtt';
import { broadcastUpdate } from './websocket-service';

// Store for power readings
export interface PowerReading {
  deviceId: string;
  timestamp: number;
  power: number; // watts
  current: number; // amperes
  voltage: number; // volts
  relayIndex?: number; // For multi-relay devices like Shelly 2PM
}

export const powerReadings: Record<string, PowerReading> = {};

let mqttClient: mqtt.MqttClient;

export function connectMqtt(): void {
  const brokerUrl = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
  const username = process.env.MQTT_USERNAME || 'house_dashboard';
  const password = process.env.MQTT_PASSWORD;
  // const topic = process.env.MQTT_TOPIC || 'house-dashboard/power/#';
  const topic = 'house-dashboard/power/shelly2pm';

  console.log(`Connecting to MQTT broker at ${brokerUrl}`);

  // Connect to MQTT broker
  mqttClient = mqtt.connect(brokerUrl, {
    username,
    password,
    clientId: `power-service-${Math.random().toString(16).substring(2, 8)}`
  });

  // Handle connection
  mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');

    // Subscribe to all Shelly topics
    mqttClient.subscribe('house-dashboard/power/shelly2pm', (err) => {
      if (err) {
        console.error(`Failed to subscribe to ${topic}:`, err);
      } else {
        console.log(`Subscribed to ${topic}`);
      }
    });

    // Also subscribe to all topics temporarily for debugging
    // mqttClient.subscribe('#', (err) => {
    //   if (err) {
    //     console.error('Failed to subscribe to all topics:', err);
    //   } else {
    //     console.log('Subscribed to all topics for debugging');

    //     // Publish a test message to see if MQTT is working
    //     mqttClient.publish('house-dashboard/test', 'Power service connected');
    //   }
    // });
  });

  // Process incoming messages
  mqttClient.on('message', (topic, message) => {
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
            data.channels.forEach((channel: any) => {
              const readingId = `${deviceId}-relay${channel.relay}`;

              powerReadings[readingId] = {
                deviceId,
                timestamp: Date.now(),
                power: channel.power || 0,
                current: channel.current || 0,
                voltage: channel.voltage || 230,
                relayIndex: channel.relay
              };

              console.log(`Updated power reading for ${readingId}: ${channel.power}W`);
            });

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

  // Helper function to update totals and broadcast
  function updateTotalsAndBroadcast() {
    const totalPower = Object.values(powerReadings).reduce((sum, device) => sum + device.power, 0);
    const totalCurrent = Object.values(powerReadings).reduce((sum, device) => sum + device.current, 0);

    console.log(`Total power: ${totalPower}W, Total current: ${totalCurrent}A`);
    console.log(`Connected devices: ${Object.keys(powerReadings).length}`);

    broadcastUpdate({
      devices: powerReadings,
      totalPower,
      totalCurrent
    });
  }
}

export function getMqttClient(): mqtt.MqttClient {
  return mqttClient;
}