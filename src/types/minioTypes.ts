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
  PROVISIONING = 'PROVISIONING',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED',
  DELETING = 'DELETING',
  DELETED = 'DELETED'
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
  remote_ip: string;
  ssh_user: string;
  ssh_password: string;
}

export interface InstallPayload {
  minio?: MinioStorage;
}

export interface DeletePayload {
  success: boolean;
  message: string;
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
      success
      message
    }
  }
`;