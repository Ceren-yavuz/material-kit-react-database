// MySQL GraphQL API Service
import { MysqlProvisionStatus } from '../types/mysqltypes';

import type { MysqlDatabase } from '../types/mysqltypes';

const MYSQL_SERVICE_ENDPOINT = 'http://localhost:3001/graphql'; // MySQL Backend GraphQL endpoint'i

interface GraphQLResponse<T> {
  data: T;
  errors?: any[];
}

interface MysqlOperationsResponse {
  getMysqlOperations: MysqlDatabase[];
}

interface MysqlOperationResponse {
  getMysqlOperation: MysqlDatabase | null;
}

class MysqlService {
  // Test backend connectivity
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(MYSQL_SERVICE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '30076493', // Backend için gerekli tenant header'ı
          'user': '{"tenantId":"30076493","email":"eh@e.com"}', // Backend için gerekli user header'ı
          'x-org-id': 'id:30076493:organization/00d31b82-50d4-4622-bbb5-ceb91e96f559', // Backend için gerekli org header'ı
        },
        body: JSON.stringify({
          query: '{ __schema { types { name } } }',
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('MySQL Backend connection test:', result);
        return true;
      }
      return false;
    } catch (error) {
      console.error('MySQL Backend connection failed:', error);
      return false;
    }
  }

  private async executeGraphQL<T>(query: string, variables?: any): Promise<T> {
    try {
      const response = await fetch(MYSQL_SERVICE_ENDPOINT, {
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
      console.error('MySQL Service Error:', error);
      throw error;
    }
  }

  async getAllMysqlOperations(): Promise<MysqlDatabase[]> {
    console.log('MySQL Service: Starting getAllMysqlOperations...');
    const query = `
      query GetMysqlOperations {
        getMysqlOperations {
          uuid
          mysqlEdition
          mysqlVersion
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

    console.log('MySQL Service: Executing GraphQL query:', query);
    const response = await this.executeGraphQL<MysqlOperationsResponse>(query);
    console.log('MySQL Service: GraphQL response:', response);
    return response.getMysqlOperations;
  }

  async getMysqlOperation(uuid: string): Promise<MysqlDatabase | null> {
    const query = `
      query GetMysqlOperation($uuid: String!) {
        getMysqlOperation(uuid: $uuid) {
          uuid
          mysqlEdition
          mysqlVersion
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

    const response = await this.executeGraphQL<MysqlOperationResponse>(query, { uuid });
    return response.getMysqlOperation;
  }

  async createMysqlOperation(input: {
    mysqlEdition: string;
    mysqlVersion: string;
    password: string;
    remoteUser: string;
    remoteIp: string;
  }): Promise<MysqlDatabase> {
    const mutation = `
      mutation TriggerMysqlInstall($input: InstallMysqlInput!) {
        triggerMysqlInstall(input: $input) {
          operation {
            uuid
            mysqlEdition
            mysqlVersion
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

    const response = await this.executeGraphQL<{ triggerMysqlInstall: { operation: MysqlDatabase } }>(
      mutation,
      { input }
    );
    
    return response.triggerMysqlInstall.operation;
  }

  async removeMysqlOperation(input: {
    password: string;
    remoteUser: string;
    remoteIp: string;
  }): Promise<any> {
    const mutation = `
      mutation TriggerMysqlRemove($input: RemoveMysqlInput!) {
        triggerMysqlRemove(input: $input) {
          success
          message
        }
      }
    `;

    return await this.executeGraphQL<any>(mutation, { input });
  }

  // Utility method to get status color for UI
  getStatusColor(status: MysqlProvisionStatus): 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' {
    switch (status) {
      case MysqlProvisionStatus.SUCCEEDED:
      case MysqlProvisionStatus.COMPLETED:
        return 'success';
      case MysqlProvisionStatus.FAILED:
      case MysqlProvisionStatus.TERMINATING_FAILED:
        return 'error';
      case MysqlProvisionStatus.PROVISIONING:
      case MysqlProvisionStatus.IN_PROGRESS:
        return 'warning';
      case MysqlProvisionStatus.DELETING:
      case MysqlProvisionStatus.TERMINATING:
        return 'secondary';
      default:
        return 'default';
    }
  }

  // Utility method to format status text for UI - returns original status
  getStatusText(status: MysqlProvisionStatus): string {
    return status; // Return original status as is
  }
}

export const mysqlService = new MysqlService();
export default mysqlService;