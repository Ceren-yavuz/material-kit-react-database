const POSTGRES_SERVICE_ENDPOINT = 'http://localhost:4000/api/postgresql'; // API Gateway PostgreSQL endpoint

export interface CreatePostgresInput {
  remote_ip: string;
  ssh_user: string;
  ssh_password: string;
  dbVersion: string;
  use_edb: boolean;
  license_code?: string;
  createdBy: string;
}

export interface PostgresDatabase {
  uuid: string;
  remote_ip: string;
  ssh_user: string;
  dbVersion: string;
  use_edb: boolean;
  license_code?: string;
  createdBy: string;
  status: string;
  createdAt: string;
}

interface GraphQLResponse<T> {
  data: T;
  errors?: any[];
}

interface PostgresListResponse {
  getPostgres: PostgresDatabase[];
}

interface PostgresCreateResponse {
  createPostgres: {
    postgres: PostgresDatabase[];
  };
}

class PostgresService {
  // Test backend connectivity through gateway
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${POSTGRES_SERVICE_ENDPOINT}/graphql`, {
        method: 'POST',
        headers: {
         'Content-Type': 'application/json',
          'x-tenant-id': '30076493',
          'user': '{"tenantId":"30076493","email":"eh@e.com"}',
          'x-org-id': 'id:30076493:organization/00d31b82-50d4-4622-bbb5-ceb91e96f559',
        },
        body: JSON.stringify({
          query: '{ healthCheck }',
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('PostgreSQL Backend (via Gateway) connection test:', result);
        return result.data?.healthCheck === 'API is up and running';
      }
      return false;
    } catch (error) {
      console.error('PostgreSQL Backend (via Gateway) connection failed:', error);
      return false;
    }
  }

  private async executeGraphQL<T>(query: string, variables?: any): Promise<T> {
    try {
      console.log('executeGraphQL called with:', { query, variables });
      
      if (!query) {
        throw new Error('Query is required');
      }
      
      const requestBody = {
        query,
        ...(variables && { variables }),
      };
      
      console.log('Request body:', requestBody);
      console.log('About to stringify:', JSON.stringify(requestBody));
      
      const bodyString = JSON.stringify(requestBody);
      console.log('Body string created:', bodyString);
      
      const response = await fetch(`${POSTGRES_SERVICE_ENDPOINT}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '30076495',
          'user': '{"tenantId":"30076495","email":"eh@e.com"}',
          'x-org-id': 'id:30076495:organization/00d31b82-50d4-4622-bbb5-ceb91e96f559',
        },
        body: bodyString,
      });

      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      const result: GraphQLResponse<T> = JSON.parse(responseText);
      
      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message || 'GraphQL query failed');
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL execution failed:', error);
      throw error;
    }
  }

  async getPostgres(): Promise<PostgresDatabase[]> {
    const query = `
      query GetPostgres {
        getPostgres {
          uuid
          remote_ip
          ssh_user
          dbVersion
          use_edb
          license_code
          createdBy
          status
          createdAt
        }
      }
    `;

    try {
      const response = await this.executeGraphQL<PostgresListResponse>(query);
      return response.getPostgres || [];
    } catch (error) {
      console.error('Error fetching PostgreSQL databases:', error);
      return [];
    }
  }

  async createPostgres(input: CreatePostgresInput): Promise<PostgresDatabase> {
    const query = `
      mutation CreatePostgres($input: CreatePgInput!) {
        createPostgres(input: $input) {
          postgres {
            uuid
            remote_ip
            ssh_user
            dbVersion
            use_edb
            license_code
            createdBy
            status
            createdAt
          }
        }
      }
    `;

    try {
      const response = await this.executeGraphQL<PostgresCreateResponse>(query, { input });
      if (response.createPostgres.postgres && response.createPostgres.postgres.length > 0) {
        return response.createPostgres.postgres[0];
      }
      throw new Error('Failed to create PostgreSQL database');
    } catch (error) {
      console.error('Error creating PostgreSQL database:', error);
      throw error;
    }
  }

  async deletePostgres(id: string): Promise<boolean> {
    const query = `
      mutation DeletePostgres($input: DeletePgInput!) {
        deletePostgres(input: $input) {
          uuid
        }
      }
    `;

    try {
      const response = await this.executeGraphQL<any>(query, { 
        input: { uuid: id } 
      });
      return !!response.deletePostgres?.uuid;
    } catch (error) {
      console.error('Error deleting PostgreSQL database:', error);
      throw error;
    }
  }
}

export const postgresService = new PostgresService();