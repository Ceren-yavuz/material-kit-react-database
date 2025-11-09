// Multi-backend service configuration
export const BACKEND_CONFIG = {
  mongodb: {
    endpoint: 'http://localhost:3000/graphql', 
    name: 'MongoDB Service',
    port: 3000,
    enabled: true
  },
  postgresql: {
    endpoint: 'http://localhost:3001/graphql', 
    name: 'PostgreSQL Service',
    port: 3001,
    enabled: true
  },
  minio: {
    endpoint: 'http://localhost:3002/graphql', 
    name: 'MinIO Storage Service',
    port: 3002,
    enabled: true
  }
};

export const API_ENDPOINTS = {
  MONGO_GRAPHQL: BACKEND_CONFIG.mongodb.endpoint,
  POSTGRES_GRAPHQL: BACKEND_CONFIG.postgresql.endpoint,
  MINIO_GRAPHQL: BACKEND_CONFIG.minio.endpoint
};

// Service health check utility
export class ServiceHealthChecker {
  static async checkService(serviceKey: keyof typeof BACKEND_CONFIG): Promise<boolean> {
    const config = BACKEND_CONFIG[serviceKey];
    if (!config.enabled) return false;
    
    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ __typename }' })
      });
      return response.ok;
    } catch (error) {
      console.warn(`${config.name} health check failed:`, error);
      return false;
    }
  }
  
  static async checkAllServices(): Promise<Record<string, boolean>> {
    const results = await Promise.allSettled([
      this.checkService('mongodb'),
      this.checkService('postgresql'),
      this.checkService('minio')
    ]);
    
    return {
      mongodb: results[0].status === 'fulfilled' ? results[0].value : false,
      postgresql: results[1].status === 'fulfilled' ? results[1].value : false,
      minio: results[2].status === 'fulfilled' ? results[2].value : false
    };
  }
}