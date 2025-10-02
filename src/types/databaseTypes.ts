import type { MongoDatabase } from './mongotypes';
import type { PostgresDatabase } from '../services/postgresService';
import { DatabaseType } from '../services/unifiedDatabaseService';

export interface UnifiedDatabase {
  id: string;
  uuid?: string; // MongoDB için
  name?: string;
  status: string;
  createdAt: string;
  type: DatabaseType;
  // Common fields
  description?: string;
  username?: string;
  host?: string;
  port?: number;
  // MongoDB specific fields
  mongoEdition?: string;
  mongoVersion?: string;
  password?: string;
  remoteUser?: string;
  remoteIp?: string;
  // PostgreSQL specific fields
  remote_ip?: string;
  ssh_user?: string;
  dbVersion?: string;
  use_edb?: boolean;
  license_code?: string;
  createdBy?: string;
}

export function mapMongoToUnified(mongo: MongoDatabase): UnifiedDatabase {
  // Safe date conversion
  const createdAtString = typeof mongo.createdAt === 'string' 
    ? mongo.createdAt 
    : mongo.createdAt instanceof Date 
    ? mongo.createdAt.toISOString() 
    : String(mongo.createdAt);

  return {
    id: mongo.uuid,
    uuid: mongo.uuid,
    name: mongo.name || `MongoDB ${mongo.mongoVersion}`,
    status: mongo.status.toString(),
    createdAt: createdAtString,
    type: DatabaseType.MONGODB,
    description: `MongoDB ${mongo.mongoEdition} ${mongo.mongoVersion}`,
    username: mongo.remoteUser,
    host: mongo.remoteIp,
    mongoEdition: mongo.mongoEdition,
    mongoVersion: mongo.mongoVersion,
    password: mongo.password,
    remoteUser: mongo.remoteUser,
    remoteIp: mongo.remoteIp,
  };
}

export function mapPostgresToUnified(postgres: PostgresDatabase): UnifiedDatabase {
  return {
    id: postgres.uuid,
    name: `PostgreSQL ${postgres.dbVersion}`,
    status: postgres.status,
    createdAt: postgres.createdAt,
    type: DatabaseType.POSTGRESQL,
    description: `PostgreSQL ${postgres.dbVersion} ${postgres.use_edb ? '(EDB)' : '(Community)'}`,
    username: postgres.ssh_user,
    host: postgres.remote_ip,
    remote_ip: postgres.remote_ip,
    ssh_user: postgres.ssh_user,
    dbVersion: postgres.dbVersion,
    use_edb: postgres.use_edb,
    license_code: postgres.license_code,
    createdBy: postgres.createdBy,
  };
}