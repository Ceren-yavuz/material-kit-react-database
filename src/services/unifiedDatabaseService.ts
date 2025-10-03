import mongoService from './mongoService';
import mysqlService from './mysqlService';
import { postgresService } from './postgresService';
import { UnifiedDatabase, mapMongoToUnified, mapPostgresToUnified, mapMysqlToUnified } from '../types/databaseTypes';

import type { MongoDatabase } from '../types/mongotypes';
import type { PostgreDatabase } from './postgresService';
import type { MysqlDatabase } from '../types/mysqltypes.tsx';

export enum DatabaseType {
  MONGODB = 'mongodb',
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql'
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

export interface MysqlCreateOptions {
  type: DatabaseType.MYSQL;
  mysqlEdition: string;
  mysqlVersion: string;
  password: string;
  remoteUser: string;
  remoteIp: string;
  name?: string;
  osVersion?: string;
}

export type DatabaseServiceOptions = MongoCreateOptions | PostgresCreateOptions | MysqlCreateOptions;

class UnifiedDatabaseService {
  // Test all backend connections
  async testAllConnections(): Promise<{
    mongo: boolean;
    postgres: boolean;
    mysql: boolean;
  }> {
    const [mongoConnection, postgresConnection, mysqlConnection] = await Promise.allSettled([
      mongoService.testConnection(),
      postgresService.testConnection(),
      mysqlService.testConnection()
    ]);

    return {
      mongo: mongoConnection.status === 'fulfilled' ? mongoConnection.value : false,
      postgres: postgresConnection.status === 'fulfilled' ? postgresConnection.value : false,
      mysql: mysqlConnection.status === 'fulfilled' ? mysqlConnection.value : false
    };
  }



  // Get all databases from all services
  async getAllDatabases(): Promise<{
    mongo: MongoDatabase[];
    postgres: PostgreDatabase[];
    mysql: MysqlDatabase[];
    combined: UnifiedDatabase[];
  }> {
    const [mongoDatabases, postgresDatabases, mysqlDatabases] = await Promise.allSettled([
      mongoService.getAllMongoOperations(),
      postgresService.getPostgres(),
      mysqlService.getAllMysqlOperations()
    ]);

    const mongoResults = mongoDatabases.status === 'fulfilled' ? mongoDatabases.value : [];
    const postgresResults = postgresDatabases.status === 'fulfilled' ? postgresDatabases.value : [];
    const mysqlResults = mysqlDatabases.status === 'fulfilled' ? mysqlDatabases.value : [];

    const combined = [
      ...mongoResults.map(mapMongoToUnified),
      ...postgresResults.map(mapPostgresToUnified),
      ...mysqlResults.map(mapMysqlToUnified)
    ];

    return {
      mongo: mongoResults,
      postgres: postgresResults,
      mysql: mysqlResults,
      combined
    };
  }

  // Get specific database
  async getDatabase(id: string, type: DatabaseType): Promise<MongoDatabase | PostgreDatabase | MysqlDatabase | null> {
    switch (type) {
      case DatabaseType.MONGODB:
        return mongoService.getMongoOperation(id);
      case DatabaseType.POSTGRESQL: {
        // PostgreSQL service doesn't have getById method, would need to implement
        const allPostgres = await postgresService.getPostgres();
        return allPostgres.find(db => db.uuid === id) || null;
      }
      case DatabaseType.MYSQL:
        return mysqlService.getMysqlOperation(id);
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  // Create database on specified service
  async createDatabase(options: DatabaseServiceOptions): Promise<MongoDatabase | PostgreDatabase | MysqlDatabase | null> {
    switch (options.type) {
      case DatabaseType.MONGODB: {
        const { type: _, ...mongoInput } = options;
        return mongoService.createMongoOperation(mongoInput);
      }
      case DatabaseType.POSTGRESQL: {
        const { type: __, ...postgresInput } = options;
        return postgresService.createPostgres(postgresInput);
      }
      case DatabaseType.MYSQL: {
        const { type: ___, ...mysqlInput } = options;
        return mysqlService.createMysqlOperation(mysqlInput);
      }
      default:
        throw new Error(`Unsupported database type: ${(options as any).type}`);
    }
  }

  // Get service availability status
  getServiceStatus(): {
    mongo: { url: string; port: number };
    postgres: { url: string; port: number };
    mysql: { url: string; port: number };
  } {
    return {
      mongo: { url: 'http://localhost:3000/graphql', port: 3000 },
      postgres: { url: 'http://localhost:3001/graphql', port: 3001 },
      mysql: { url: 'http://localhost:3000/graphql', port: 3000 }
    };
  }
}

// Singleton instance
const unifiedDatabaseService = new UnifiedDatabaseService();
export default unifiedDatabaseService;