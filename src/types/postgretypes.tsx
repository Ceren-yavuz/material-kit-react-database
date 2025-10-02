export enum PostgreProvisionStatus {
  PENDING = 'PENDING',
  INSTALLING = 'INSTALLING',
  TESTING = 'TESTING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  DELETING_PENDING = 'DELETING_PENDING',
  DELETING = 'DELETING',
  DELETED = 'DELETED',
  DELETING_FAILED = 'DELETING_FAILED',
  CANCELLED = 'CANCELLED',
}

export interface PostgreDatabase {
  uuid: string;
  postgreEdition: string;
  postgreVersion: string;
  password: string;
  remoteUser: string;
  remoteIp: string;
  name?: string;
  osVersion?: string;
  status: PostgreProvisionStatus;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
}