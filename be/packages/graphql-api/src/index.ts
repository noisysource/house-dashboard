import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { typeDefs } from './schema/typeDefs';
import path from 'path';
import { resolvers } from './resolvers/powerResolvers';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || '';

async function startServer() {
  // Connect to MongoDB
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }

  // Express app setup
  const app = express();
  const httpServer = http.createServer(app);

  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers: resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true,
  });

  // Start Apollo Server
  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server),
  );
  // Start server
  const PORT = process.env.GRAPHQL_PORT || 4000;
  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

startServer().catch((err) => console.error('Server start error:', err));