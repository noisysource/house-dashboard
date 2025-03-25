import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { buildSchema } from './schema/schema';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function startServer() {
  const schema = await buildSchema();
  console.log('🔨 GraphQL schema built');

  const app = express();

  // Add middleware
  app.use(cors());
  app.use(express.json());

  // Apollo Server setup
  const server = new ApolloServer({
    schema,

    formatError: (error) => {
      // Log errors to console in development
      console.error('GraphQL Error:', error);

      // Return cleaner error for production
      return {
        message: error.message,
        path: error.path,
        // Avoid exposing internal details in production
        ...(process.env.NODE_ENV === 'development' && {
          extensions: error.extensions
        })
      };
    },
    plugins: [
      {
        // Log resolver timing in development
        requestDidStart: async () => {
          return {
            didEncounterErrors: async ({ errors }) => {
              if (errors) {
                for (const error of errors) {
                  console.error('GraphQL execution error:', error);
                }
              }
            }
          };
        }
      }
    ]
  });

  // Start Apollo Server
  await server.start();
  console.log('🚀 Apollo Server started');

  // Apply middleware
  // Apply middleware
  app.use('/graphql', expressMiddleware(server));
  // Create HTTP server
  const httpServer = createServer(app);

  // Set port
  const PORT = process.env.PORT || 4000;

  // Start HTTP server
  httpServer.listen(PORT, () => {
    console.log(`
    🏠 House Dashboard GraphQL API
    ================================
    🌐 Server ready at http://localhost:${PORT}/graphql
    📖 Explore the API at http://localhost:${PORT}/graphql
    `);
  });

  // Handle shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await server.stop();
    process.exit(0);
  });
}

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});