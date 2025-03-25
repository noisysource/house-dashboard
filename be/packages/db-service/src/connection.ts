import mongoose from 'mongoose';

let isConnected = false;
const DB_NAME = 'house-dashboard'; // Standardize the name with hyphens

/**
 * Connect to MongoDB database
 */
export const connectToDatabase = async (): Promise<void> => {
  if (isConnected) {
    console.log('=> Using existing database connection');
    return;
  }

  try {
    // Ensure consistent database name
    const connectionString = process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`;
    console.log(`=> Connecting to MongoDB: ${connectionString}`);
    
    const db = await mongoose.connect(connectionString);
    isConnected = !!db.connections[0].readyState;
    
    // Configure mongoose settings
    configureMongoose();
    
    console.log(`=> Connected to MongoDB database: ${db.connection.db?.databaseName || 'unknown'}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectFromDatabase = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }
  
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('=> Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
    throw error;
  }
};

/**
 * Get database connection status
 */
export const getDatabaseStatus = (): boolean => {
  return isConnected;
};

/**
 * Configure global Mongoose schema options
 */
export function configureMongoose() {
  // Set default schema options for all models
  mongoose.Schema.Types.String.cast(false);
  mongoose.Schema.Types.Number.cast(false);
  mongoose.Schema.Types.Boolean.cast(false);

  // Set default toJSON transform for all schemas
  const defaultSchemaOptions = {
    timestamps: true,
    versionKey: false,
    id: true,
    toJSON: {
      virtuals: true,
      transform: (_: any, ret: any) => {
        // Convert _id to id
        ret.id = ret._id.toString();
        delete ret._id;
        
        // Convert any remaining ObjectIds to strings
        Object.keys(ret).forEach(key => {
          if (mongoose.isValidObjectId(ret[key])) {
            ret[key] = ret[key].toString();
          }
        });
        
        // Remove __v if it exists
        if (ret.__v !== undefined) {
          delete ret.__v;
        }
        
        return ret;
      }
    }
  };

  // Apply these defaults to all new schemas
  mongoose.set('toJSON', defaultSchemaOptions.toJSON);
  
  // Set as mongoose schema default options
  (mongoose.Schema as any).defaultOptions = defaultSchemaOptions;
}