import type { MongoDatabase } from '../types/mongotypes';
import { UnifiedDatabase, mapMongoToUnified, mapPostgresToUnified } from '../types/databaseTypes';

import mongoService from './mongoService';
import { postgresService, type PostgreDatabase } from './postgresService';

export enum DatabaseType {
  MONGODB = 'mongodb',
  POSTGRESQL = 'postgresql'
}

export interface MongoCreateOptions {
  type: DatabaseType.MONGODB;
  mongoEdition: string;
  mongoVersion: string;
  password: string;
  remoteUser: string;
  remoteIp: string;
  name?: string;
  osVersion?: string;
}

export interface PostgresCreateOptions {
  type: DatabaseType.POSTGRESQL;
  remote_ip: string;
  ssh_user: string;
  ssh_password: string;
  dbVersion: string;
  use_edb: boolean;
  license_code?: string;
  createdBy: string;
}

export type DatabaseServiceOptions = MongoCreateOptions | PostgresCreateOptions;

class UnifiedDatabaseService {
  // Test all backend connections
  async testAllConnections(): Promise<{
    mongo: boolean;
    postgres: boolean;
  }> {
    const [mongoConnection, postgresConnection] = await Promise.allSettled([
      mongoService.testConnection(),
      postgresService.testConnection()
    ]);

    return {
      mongo: mongoConnection.status === 'fulfilled' ? mongoConnection.value : false,
      postgres: postgresConnection.status === 'fulfilled' ? postgresConnection.value : false
    };
  }



  // Get all databases from both services
  async getAllDatabases(): Promise<{
    mongo: MongoDatabase[];
    postgres: PostgreDatabase[];
    combined: UnifiedDatabase[];
  }> {
    const [mongoDatabases, postgresDatabases] = await Promise.allSettled([
      mongoService.getAllMongoOperations(),
      postgresService.getPostgres()
    ]);

    const mongoResults = mongoDatabases.status === 'fulfilled' ? mongoDatabases.value : [];
    const postgresResults = postgresDatabases.status === 'fulfilled' ? postgresDatabases.value : [];

    const combined = [
      ...mongoResults.map(mapMongoToUnified),
      ...postgresResults.map(mapPostgresToUnified)
    ];

    return {
      mongo: mongoResults,
      postgres: postgresResults,
      combined
    };
  }

  // Get specific database
  async getDatabase(id: string, type: DatabaseType): Promise<MongoDatabase | PostgreDatabase | null> {
    switch (type) {
      case DatabaseType.MONGODB:
        return mongoService.getMongoOperation(id);
      case DatabaseType.POSTGRESQL:
        // PostgreSQL service doesn't have getById method, would need to implement
        const allPostgres = await postgresService.getPostgres();
        return allPostgres.find(db => db.uuid === id) || null;
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  // Create database on specified service
  async createDatabase(options: DatabaseServiceOptions): Promise<MongoDatabase | PostgreDatabase | null> {
    switch (options.type) {
      case DatabaseType.MONGODB:
        const { type: _, ...mongoInput } = options;
        return mongoService.createMongoOperation(mongoInput);
      case DatabaseType.POSTGRESQL:
        const { type: __, ...postgresInput } = options;
        return postgresService.createPostgres(postgresInput);
      default:
        throw new Error(`Unsupported database type: ${(options as any).type}`);
    }
  }

  // Get service availability status
  getServiceStatus(): {
    mongo: { url: string; port: number };
    postgres: { url: string; port: number };
    gateway: { url: string; port: number };
  } {
    return {
      mongo: { url: 'http://localhost:3000/graphql', port: 3000 },
      postgres: { url: 'http://localhost:3001/graphql', port: 3001 },
      gateway: { url: 'http://localhost:4000', port: 4000 }
    };
  }
}

// Singleton instance
const unifiedDatabaseService = new UnifiedDatabaseService();
export default unifiedDatabaseService;