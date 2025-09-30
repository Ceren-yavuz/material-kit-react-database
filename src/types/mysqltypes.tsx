export enum MysqlProvisionStatus {
  PROVISIONING = 'PROVISIONING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DELETING = 'DELETING',
  TERMINATING = 'TERMINATING',
  TERMINATING_FAILED = 'TERMINATING_FAILED',
  CLONNED = 'CLONNED',
  SUCCEEDED = 'SUCCEEDED',
}

export interface MysqlDatabase {
  uuid: string;
  mysqlEdition: string;
  mysqlVersion: string;
  password: string;
  remoteUser: string;
  remoteIp: string;
  name?: string;
  osVersion?: string;
  status: MysqlProvisionStatus;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
}