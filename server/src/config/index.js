import dotenv from 'dotenv';

dotenv.config();

// Server Configuration
const defaultMongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sunland-ordering';

const getDefaultDbName = (uri) => {
  try {
    const parsedUrl = new URL(uri);
    const dbName = parsedUrl.pathname.replace(/^\/+/, '');
    return dbName || 'sunland-ordering';
  } catch {
    return 'sunland-ordering';
  }
};

export const config = {
  mongodb: {
    uri: defaultMongoUri,
    dbName: process.env.MONGODB_DB || getDefaultDbName(defaultMongoUri),
    options: {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
      socketTimeoutMS: 45000
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h'
  },
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || 'https://sunland-ordering-system.onrender.com'
};

export const mongoUri = config.mongodb.uri;
export const mongoOptions = {
  ...config.mongodb.options,
  dbName: config.mongodb.dbName
};