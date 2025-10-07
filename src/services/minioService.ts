import { API_ENDPOINTS } from '../config/backend-config';

import type { 
  MinioStorage, 
  CreateMinioInput, 
  DeleteMinioInput, 
  InstallPayload, 
  DeletePayload
} from '../types/minioTypes';

class MinioService {
  private endpoint = API_ENDPOINTS.MINIO_GRAPHQL;

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '30076495', 
          'user': '{"tenantId":"30076495","email":"eh@e.com"}',
          'x-org-id': 'id:30076495:organization/00d31b82-50d4-4622-bbb5-ceb91e96f559',
        },
        body: JSON.stringify({
          query: '{ healthCheck }',
        }),
      });
      
      if (!response.ok) {
        console.warn(`MinIO service health check failed with status: ${response.status}`);
        return false;
      }
      
      const result = await response.json();
      
      if (result.errors) {
        console.warn('MinIO service health check returned errors:', result.errors);
        return false;
      }
      
      return !result.errors && result.data;
    } catch (error) {
      console.error('MinIO service connection test failed:', error);
      return false;
    }
  }

  async getAllMinioStorages(): Promise<MinioStorage[]> {
    try {
      // First check if service is available
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('MinIO service is not available. Please check if the backend is running on port 3002.');
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '30076495', 
          'user': '{"tenantId":"30076495","email":"eh@e.com"}',
          'x-org-id': 'id:30076495:organization/00d31b82-50d4-4622-bbb5-ceb91e96f559',
        },
        body: JSON.stringify({
          query: `
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
                deletedAt
                createdBy
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(`MinIO service returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        const errorMessage = result.errors.map((err: any) => err.message).join(', ');
        
        // Handle specific errors
        if (errorMessage.includes('No metadata')) {
          console.warn('MinIO database schema not initialized. Returning empty list.');
          return [];
        }
        
        throw new Error(`GraphQL errors: ${errorMessage}`);
      }

      return result.data?.getMinio || [];
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching MinIO storages:', error.message);
        throw error;
      }
      
      console.error('Unknown error fetching MinIO storages:', error);
      throw new Error('An unknown error occurred while fetching storage data.');
    }
  }

  async createMinioStorage(input: CreateMinioInput): Promise<InstallPayload> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '30076495', 
          'user': '{"tenantId":"30076495","email":"eh@e.com"}',
          'x-org-id': 'id:30076495:organization/00d31b82-50d4-4622-bbb5-ceb91e96f559',
        },
        body: JSON.stringify({
          query: `
            mutation CreateMinio($input: CreateMinioInput!) {
              createMinio(input: $input) {
                minio {
                  uuid
                  remote_ip
                  ssh_user
                  status
                  createdAt
                  createdBy
                }
              }
            }
          `,
          variables: { input },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        const errorMessage = result.errors.map((err: any) => err.message).join(', ');
        
        // Handle specific errors
        if (errorMessage.includes('No metadata')) {
          throw new Error('MinIO database schema is not initialized. Please contact the administrator to set up the MinIO backend database.');
        }
        
        throw new Error(`GraphQL errors: ${errorMessage}`);
      }

      return result.data?.createMinio || {};
    } catch (error) {
      console.error('Error creating MinIO storage:', error);
      throw error;
    }
  }

  async deleteMinioStorage(input: DeleteMinioInput): Promise<DeletePayload> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '30076495', 
          'user': '{"tenantId":"30076495","email":"eh@e.com"}',
          'x-org-id': 'id:30076495:organization/00d31b82-50d4-4622-bbb5-ceb91e96f559',
        },
        body: JSON.stringify({
          query: `
            mutation DeleteMinio($input: DeleteMinioInput!) {
              DeleteMinio(input: $input) {
                success
                message
              }
            }
          `,
          variables: { input },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return result.data?.DeleteMinio || { success: false, message: 'Unknown error' };
    } catch (error) {
      console.error('Error deleting MinIO storage:', error);
      throw error;
    }
  }
}

export const minioService = new MinioService();
export default minioService;