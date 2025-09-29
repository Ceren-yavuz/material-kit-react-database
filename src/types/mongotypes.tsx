export enum ProvisionStatus {
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

export interface MongoDatabase {
  uuid: string;
  mongoEdition: string;
  mongoVersion: string;
  password: string;
  remoteUser: string;
  remoteIp: string;
  name?: string;
  osVersion?: string;
  status: ProvisionStatus;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
}
    