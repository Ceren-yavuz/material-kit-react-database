// MinIO Storage Types
export interface MinioStorage {
  uuid: string;
  remote_ip: string;
  ssh_user: string;
  ssh_password: string;
  osVersion?: string;
  status: ProvisionStatus;
  license_code?: string;
  use_edb: boolean;
  createdAt: string;
  deletedAt?: string;
  createdBy: string;
}

export enum ProvisionStatus {
  PENDING = 'PENDING',
  INSTALLING = 'INSTALLING',
  TESTING = 'TESTING',
  INSTALLED = 'INSTALLED',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  DELETING_PENDING = 'DELETING_PENDING',
  DELETING = 'DELETING',
  DELETED = 'DELETED',
  DELETING_FAILED = 'DELETING_FAILED',
  CANCELLED = 'CANCELLED',
}

export interface CreateMinioInput {
  ssh_user: string;
  ssh_password: string;
  remote_ip: string;
  createdBy: string;
  license_code?: string;
  use_edb: boolean;
}

export interface DeleteMinioInput {
  uuid: string;
  deletedBy: string;
}

export interface InstallPayload {
  minio?: MinioStorage;
}

export interface DeletePayload {
  ids: string[];
}

// GraphQL Queries and Mutations
export const GET_MINIO_STORAGES = `
  query GetMinio {
    getMinio {
      uuid
      remote_ip
      ssh_user
      ssh_password
      osVersion
      status
      license_code
      use_edb
      createdAt
      updatedAt
      tenantId
      createdBy
    }
  }
`;

export const CREATE_MINIO_STORAGE = `
  mutation CreateMinio($input: CreateMinioInput!) {
    createMinio(input: $input) {
      success
      message
      uuid
    }
  }
`;

export const DELETE_MINIO_STORAGE = `
  mutation DeleteMinio($input: DeleteMinioInput!) {
    DeleteMinio(input: $input) {
      ids
    }
  }
`;