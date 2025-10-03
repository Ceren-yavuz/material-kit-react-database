// PostgreSQL GraphQL API Service
import { PostgreProvisionStatus } from '../types/postgretypes';

import type { PostgreDatabase } from '../types/postgretypes';

const POSTGRES_SERVICE_ENDPOINT = 'http://localhost:3001/graphql'; 

interface GraphQLResponse<T> {
  data: T;
  errors?: any[];
}

export interface CreatePostgresInput {
  remote_ip: string;
  ssh_user: string;
  ssh_password: string;
  dbVersion: string;
  use_edb: boolean;
  license_code?: string;
  createdBy: string;
}


interface BackendPostgresItem {
  uuid: string;
  remote_ip: string;
  ssh_user: string;
  ssh_password: string;
  dbVersion?: string;
  use_edb: boolean;
  license_code?: string;
  osVersion?: string;
  status: PostgreProvisionStatus;
  createdAt: Date;
  createdBy: string;
  deletedAt?: Date | null;
  deletedBy?: string;
}

interface PostgreOperationsResponse {
  getPostgres: BackendPostgresItem[];
}

interface PostgreOperationResponse {
  getPostgres: BackendPostgresItem | null;
}

class PostgreService {
  // Test backend connectivity
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(POSTGRES_SERVICE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '30076495', 
          'user': '{"tenantId":"30076495","email":"eh@e.com"}',
          'x-org-id': 'id:30076495:organization/00d31b82-50d4-4622-bbb5-ceb91e96f559',
        },
        body: JSON.stringify({
          query: '{ __schema { types { name } } }',
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('PostgreSQL Backend connection test:', result);
        return true;
      }
      return false;
    } catch (error) {
      console.error('PostgreSQL Backend connection failed:', error);
      return false;
    }
  }

  private async executeGraphQL<T>(query: string, variables?: any): Promise<T> {
    const response = await fetch(POSTGRES_SERVICE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': '30076495',
        'user': '{"tenantId":"30076495","email":"eh@e.com"}',
        'x-org-id': 'id:30076495:organization/00d31b82-50d4-4622-bbb5-ceb91e96f559',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred');
    }

    return result.data;
  }

  // Get all PostgreSQL operations
  async getAllPostgreOperations(): Promise<PostgreDatabase[]> {
    const query = `
      query GetPostgres {
        getPostgres {
          uuid
          remote_ip
          ssh_user
          ssh_password
          dbVersion
          use_edb
          license_code
          osVersion
          status
          createdAt
          createdBy
          deletedAt
          deletedBy
        }
      }
    `;

    try {
      const result = await this.executeGraphQL<PostgreOperationsResponse>(query);
      // Backend'den gelen veriyi frontend tipine dönüştür
      return result.getPostgres.map(item => ({
        uuid: item.uuid,
        postgreEdition: item.use_edb ? 'Enterprise' : 'Community',
        postgreVersion: item.dbVersion || 'Unknown',
        password: item.ssh_password,
        remoteUser: item.ssh_user,
        remoteIp: item.remote_ip,
        name: item.license_code,
        osVersion: item.osVersion,
        status: item.status,
        createdAt: item.createdAt,
        createdBy: item.createdBy,
        updatedAt: item.createdAt, 
        updatedBy: item.createdBy, 
        isDeleted: !!item.deletedAt, 
        deletedAt: item.deletedAt,
      }));
    } catch (error) {
      console.error('Failed to fetch PostgreSQL operations:', error);
      
      
      if (error instanceof Error && error.message.includes('relation "postgres" does not exist')) {
        console.log('PostgreSQL table does not exist, returning empty array');
        return [];
      }
      
      throw error;
    }
  }

  // Get single PostgreSQL operation by UUID  
  async getPostgreOperation(uuid: string): Promise<PostgreDatabase | null> {
    
    try {
      const allOperations = await this.getAllPostgreOperations();
      return allOperations.find(op => op.uuid === uuid) || null;
    } catch (error) {
      console.error('Failed to fetch PostgreSQL operation:', error);
      throw error;
    }
  }

  // Create new PostgreSQL instance
  async createPostgreOperation(data: {
    postgreEdition: string;
    postgreVersion: string;
    password: string;
    remoteUser: string;
    remoteIp: string;
    name?: string;
    osVersion?: string;
  }): Promise<PostgreDatabase> {
    const mutation = `
      mutation CreatePostgres($input: CreatePgInput!) {
        createPostgres(input: $input) {
          postgres {
            uuid
            remote_ip
            ssh_user
            ssh_password
            dbVersion
            use_edb
            license_code
            osVersion
            status
            createdAt
            createdBy
          }
        }
      }
    `;

    try {
      const input = {
        remote_ip: data.remoteIp,
        ssh_user: data.remoteUser,
        ssh_password: data.password,
        dbVersion: data.postgreVersion,
        use_edb: data.postgreEdition === 'Enterprise',
        license_code: data.name || '123',
        createdBy: 'user', 
      };

      const result = await this.executeGraphQL<{ createPostgres: any }>(mutation, { input });
      
      // Response'u frontend tipine dönüştür
      const backendItem = result.createPostgres.postgres;
      return {
        uuid: backendItem.uuid,
        postgreEdition: backendItem.use_edb ? 'Enterprise' : 'Community',
        postgreVersion: backendItem.dbVersion || 'Unknown',
        password: backendItem.ssh_password,
        remoteUser: backendItem.ssh_user,
        remoteIp: backendItem.remote_ip,
        name: backendItem.license_code,
        osVersion: backendItem.osVersion,
        status: backendItem.status,
        createdAt: backendItem.createdAt,
        createdBy: backendItem.createdBy,
        updatedAt: backendItem.createdAt,
        updatedBy: backendItem.createdBy,
        isDeleted: false,
        deletedAt: null,
      };
    } catch (error) {
      console.error('Failed to create PostgreSQL operation:', error);
      
      // Handle specific database errors more gracefully
      if (error instanceof Error) {
        if (error.message.includes('relation "postgres" does not exist')) {
          throw new Error('PostgreSQL backend veritabanı henüz kurulmamış. Lütfen sistem yöneticisiyle iletişime geçin.');
        }
        if (error.message.includes('400')) {
          throw new Error('Geçersiz parametreler. Lütfen tüm alanları doğru şekilde doldurun.');
        }
      }
      
      throw error;
    }
  }

  // Update PostgreSQL operation 
  async updatePostgreOperation(
    uuid: string,
    data: Partial<{
      postgreEdition: string;
      postgreVersion: string;
      password: string;
      remoteUser: string;
      remoteIp: string;
      name: string;
      osVersion: string;
      status: PostgreProvisionStatus;
    }>
  ): Promise<PostgreDatabase> {
    throw new Error('Update operation not implemented in backend');
  }

  // Delete PostgreSQL operation
  async deletePostgreOperation(uuid: string): Promise<boolean> {
    const mutation = `
      mutation DeletePostgres($input: DeletePgInput!) {
        DeletePostgres(input: $input) {
          success
          message
        }
      }
    `;

    try {
      const input = { uuid };
      const result = await this.executeGraphQL<{ DeletePostgres: { success: boolean } }>(mutation, {
        input,
      });
      return result.DeletePostgres.success;
    } catch (error) {
      console.error('Failed to delete PostgreSQL operation:', error);
      throw error;
    }
  }

  // Helper method to get status label
  getStatusLabel(status: PostgreProvisionStatus): string {
    switch (status) {
      case PostgreProvisionStatus.PENDING:
        return 'Beklemede';
      case PostgreProvisionStatus.INSTALLING:
        return 'Kurulum';
      case PostgreProvisionStatus.TESTING:
        return 'Test Ediliyor';
      case PostgreProvisionStatus.SUCCEEDED:
        return 'Başarılı';
      case PostgreProvisionStatus.FAILED:
        return 'Başarısız';
      case PostgreProvisionStatus.DELETING_PENDING:
        return 'Silme Beklemede';
      case PostgreProvisionStatus.DELETING:
        return 'Siliniyor';
      case PostgreProvisionStatus.DELETED:
        return 'Silindi';
      case PostgreProvisionStatus.DELETING_FAILED:
        return 'Silme Başarısız';
      case PostgreProvisionStatus.CANCELLED:
        return 'İptal Edildi';
      default:
        return status;
    }
  }

  // Helper method to get status color
  getStatusColor(status: PostgreProvisionStatus): 'success' | 'error' | 'warning' | 'info' | 'default' {
    switch (status) {
      case PostgreProvisionStatus.SUCCEEDED:
        return 'success';
      case PostgreProvisionStatus.FAILED:
      case PostgreProvisionStatus.DELETING_FAILED:
        return 'error';
      case PostgreProvisionStatus.PENDING:
      case PostgreProvisionStatus.INSTALLING:
      case PostgreProvisionStatus.TESTING:
      case PostgreProvisionStatus.DELETING_PENDING:
      case PostgreProvisionStatus.DELETING:
        return 'warning';
      case PostgreProvisionStatus.DELETED:
      case PostgreProvisionStatus.CANCELLED:
        return 'info';
      default:
        return 'default';
    }
  }

  // Alias methods for unified service compatibility
  getPostgres = this.getAllPostgreOperations;
  
  async createPostgres(input: CreatePostgresInput): Promise<PostgreDatabase> {
    return this.createPostgreOperation({
      postgreEdition: 'Standard',
      postgreVersion: input.dbVersion,
      password: input.ssh_password,
      remoteUser: input.ssh_user,
      remoteIp: input.remote_ip,
      name: `postgres-${input.remote_ip}`,
    });
  }
}

const postgreService = new PostgreService();

export { postgreService as postgresService };
export type { PostgreDatabase } from '../types/postgretypes';
export default postgreService;