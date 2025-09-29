export interface BaseDatabase {
  edition: string;
  version: string;
  remoteUser: string;
  remoteIp: string;
  status: string;
  password: string; 
  createdAt: Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  deletedAt?: Date;
  updatedAt?: Date;
}