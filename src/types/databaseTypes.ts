import type { MongoDatabase } from './mongotypes';
import type { MysqlDatabase } from './mysqltypes.tsx';
import type { PostgreDatabase } from '../services/postgresService';
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

export function mapPostgresToUnified(postgres: PostgreDatabase): UnifiedDatabase {
  return {
    id: postgres.uuid,
    name: `PostgreSQL ${postgres.postgreVersion}`,
    status: postgres.status,
    createdAt: postgres.createdAt.toString(),
    type: DatabaseType.POSTGRESQL,
    description: `PostgreSQL ${postgres.postgreVersion} (${postgres.postgreEdition})`,
    username: postgres.remoteUser,
    host: postgres.remoteIp,
    remote_ip: postgres.remoteIp,
    ssh_user: postgres.remoteUser,
    dbVersion: postgres.postgreVersion,
    use_edb: postgres.postgreEdition === 'Enterprise',
    license_code: postgres.name,
    createdBy: postgres.createdBy,
  };
}

export function mapMysqlToUnified(mysql: MysqlDatabase): UnifiedDatabase {
  const createdAtString = typeof mysql.createdAt === 'string' 
    ? mysql.createdAt 
    : mysql.createdAt instanceof Date 
    ? mysql.createdAt.toISOString() 
    : String(mysql.createdAt);

  return {
    id: mysql.uuid,
    name: `MySQL ${mysql.mysqlVersion}`,
    status: mysql.status.toString(),
    createdAt: createdAtString,
    type: DatabaseType.MYSQL,
    description: `MySQL ${mysql.mysqlVersion} (${mysql.mysqlEdition})`,
    username: mysql.remoteUser,
    host: mysql.remoteIp,
  };
}