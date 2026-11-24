import mongoose from 'mongoose';

export type DatabaseMode = 'mongodb' | 'local-store';

let activeDatabaseMode: DatabaseMode = 'local-store';

export async function connectDatabase(): Promise<DatabaseMode> {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    activeDatabaseMode = 'local-store';
    console.log('[db] MONGODB_URI not set; using persistent local store (.data/tasks.json).');
    return activeDatabaseMode;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    activeDatabaseMode = 'mongodb';
    console.log('[db] Connected to MongoDB.');
    return activeDatabaseMode;
  } catch (error) {
    console.error(
      '[db] MongoDB connection failed, falling back to persistent local store:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    activeDatabaseMode = 'local-store';
    return activeDatabaseMode;
  }
}

export function getDatabaseMode(): DatabaseMode {
  if (mongoose.connection.readyState === 1) {
    return 'mongodb';
  }
  return activeDatabaseMode;
}
