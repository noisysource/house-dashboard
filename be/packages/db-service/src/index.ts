import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { configureMongoose, connectToDatabase, disconnectFromDatabase } from './connection';
import deviceRoutes from './routes/device-routes';
import roomRoutes from './routes/room-routes';
import powerRoutes from './routes/power-routes';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.DB_SERVICE_PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/power', powerRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'db-service' });
});

// Connect to database and start server
async function startServer() {
  try {
    await connectToDatabase();
    
    app.listen(PORT, () => {
      console.log(`DB Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle shutdown
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

// Start the server
startServer();