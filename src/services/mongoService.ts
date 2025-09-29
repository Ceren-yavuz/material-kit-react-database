import { ProvisionStatus } from '../types/mongotypes';

// MongoDB GraphQL API Service
import type { MongoDatabase} from '../types/mongotypes';

const MONGO_SERVICE_ENDPOINT = 'http://localhost:3000/graphql'; // Backend GraphQL endpoint'i

interface GraphQLResponse<T> {
  data: T;
  errors?: any[];
}

interface MongoOperationsResponse {
  getMongoOperations: MongoDatabase[];
}

interface MongoOperationResponse {
  getMongoOperation: MongoDatabase | null;
}

class MongoService {
  // Test backend connectivity
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(MONGO_SERVICE_ENDPOINT, {
        method: 'POST',
        headers: {
         'Content-Type': 'application/json',
          'x-tenant-id': '30076493', // Backend için gerekli tenant header'ı
          'user': '{"tenantId":"30076493","email":"eh@e.com"}', // Backend için gerekli user header'ı
          'x-org-id': 'id:30076493:organization/00d31b82-50d4-4622-bbb5-ceb91e96f559', // Backend için gerekli org header'ı
        },
        body: JSON.stringify({
          query: '{ hello }',
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Backend connection test:', result);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  }

  private async executeGraphQL<T>(query: string, variables?: any): Promise<T> {
    try {
      const response = await fetch(MONGO_SERVICE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '30076493', // Backend için gerekli tenant header'ı
          'user': '{"tenantId":"30076493","email":"eh@e.com"}', // Backend için gerekli user header'ı
          'x-org-id': 'id:30076493:organization/00d31b82-50d4-4622-bbb5-ceb91e96f559', // Backend için gerekli org header'ı
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
        throw new Error(`GraphQL error: ${result.errors.map(e => e.message).join(', ')}`);
      }

      return result.data;
    } catch (error) {
      console.error('MongoDB Service Error:', error);
      throw error;
    }
  }

  async getAllMongoOperations(): Promise<MongoDatabase[]> {
    const query = `
      query GetMongoOperations {
        getMongoOperations {
          uuid
          mongoEdition
          mongoVersion
          password
          remoteUser
          remoteIp
          name
          osVersion
          status
          createdAt
          createdBy
          updatedAt
          updatedBy
          isDeleted
          deletedAt
        }
      }
    `;

    const response = await this.executeGraphQL<MongoOperationsResponse>(query);
    return response.getMongoOperations;
  }

  async getMongoOperation(uuid: string): Promise<MongoDatabase | null> {
    const query = `
      query GetMongoOperation($uuid: String!) {
        getMongoOperation(uuid: $uuid) {
          uuid
          mongoEdition
          mongoVersion
          password
          remoteUser
          remoteIp
          name
          osVersion
          status
          createdAt
          createdBy
          updatedAt
          updatedBy
          isDeleted
          deletedAt
        }
      }
    `;

    const response = await this.executeGraphQL<MongoOperationResponse>(query, { uuid });
    return response.getMongoOperation;
  }

  async createMongoOperation(input: {
    mongoEdition: string;
    mongoVersion: string;
    password: string;
    remoteUser: string;
    remoteIp: string;
    name?: string;
    osVersion?: string;
  }): Promise<MongoDatabase> {
    const mutation = `
      mutation TriggerMongoInstall($input: InstallInput!) {
        triggerMongoInstall(input: $input) {
          operation {
            uuid
            mongoEdition
            mongoVersion
            password
            remoteUser
            remoteIp
            name
            osVersion
            status
            createdAt
            createdBy
            updatedAt
            updatedBy
            isDeleted
            deletedAt
          }
        }
      }
    `;

    const response = await this.executeGraphQL<{ triggerMongoInstall: { operation: MongoDatabase } }>(
      mutation,
      { input }
    );
    
    return response.triggerMongoInstall.operation;
  }

  async removeMongoOperation(input: {
    password: string;
    remoteUser: string;
    remoteIp: string;
  }): Promise<any> {
    const mutation = `
      mutation TriggerMongoRemove($input: RemoveInput!) {
        triggerMongoRemove(input: $input) {
          success
          message
        }
      }
    `;

    return await this.executeGraphQL<any>(mutation, { input });
  }

  // Utility method to get status color for UI
  getStatusColor(status: ProvisionStatus): 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' {
    switch (status) {
      case ProvisionStatus.SUCCEEDED:
      case ProvisionStatus.COMPLETED:
        return 'success';
      case ProvisionStatus.FAILED:
      case ProvisionStatus.TERMINATING_FAILED:
        return 'error';
      case ProvisionStatus.PROVISIONING:
      case ProvisionStatus.IN_PROGRESS:
        return 'warning';
      case ProvisionStatus.DELETING:
      case ProvisionStatus.TERMINATING:
        return 'secondary';
      default:
        return 'default';
    }
  }

  // Utility method to format status text for UI - returns original status
  getStatusText(status: ProvisionStatus): string {
    return status; // Return original status as is
  }
}

export const mongoService = new MongoService();
export default mongoService;