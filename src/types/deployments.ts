export interface DeploymentEnvironment {
  name: string;
  version: string;
  commit: string;
  status: 'Healthy' | 'Deploying' | 'Warning';
  lastUpdated: string;
  author: string;
  warning?: string;
}

export interface Deployment {
  id: string;
  name: string;
  repo: string;
  type: 'Single' | 'Swarm';
  environments: DeploymentEnvironment[];
}

