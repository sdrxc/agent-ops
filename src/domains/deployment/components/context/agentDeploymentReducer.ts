import { AgentDeploymentState, AgentDeploymentAction } from '../../types';

export const initialAgentDeploymentState: AgentDeploymentState = {
  currentStep: 1,
  totalSteps: 6,
  loading: false,
  errors: [],
  projectInfo: {
    projectName: '',
    description: '',
    tags: [],
    memoryManagement: '',
  },
  agentRegistry: {
    name: '',
    description: '',
    version: '',
    protocol_version: '',
    url: '',
    preferred_transport: '',
    input_modes: [],
    output_modes: [],
    default_input_modes: [],
    default_output_modes: [],

    // ✅ Default capability
    capabilities: { default_capability: true },

    // ✅ One empty skill (key-value format for SDK compatibility)
    skills: [
      {
        key: '',
        description: '',
      },
    ],

    // ✅ One empty security policy
    security: [
      {
        policy_name: '',
        details: '',
        enforced: true,
      },
    ],

    supports_authenticated_extended_card: true,
    feedback_enabled: true,
  },
  toolsRegistry: [],
  selectedServerID: '',
  configureServer: null,
  codeUpload: {
    repoUrl: '',
    branch: '',
    connected: false
  },
  serverConfig: {},
  secretsManager: []
};


export function agentDeploymentReducer(
  state: AgentDeploymentState,
  action: AgentDeploymentAction
): AgentDeploymentState {
  switch (action.type) {
    case 'SET_PROJECT_INFO':
      return { ...state, projectInfo: { ...state.projectInfo, ...action.payload } };
    case 'SET_AGENT_REGISTRY':
      return { ...state, agentRegistry: { ...state.agentRegistry, ...action.payload } };
    case "SET_TOOLS_REGISTRY":
      return { ...state, toolsRegistry: action.payload };
    case "SET_SERVER_SELECTION":
      return {
        ...state,
        selectedServerID: action.payload.serverID,
        configureServer: action.payload.configureServer,
      };
    case "SET_CODE_UPLOAD":
      return { ...state, codeUpload: { ...state.codeUpload, ...action.payload } };
    case "SET_SECRETS_MANAGER":
      return { ...state, secretsManager: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'NEXT_STEP':
      console.log("Reducer: Moving to next step");
      return { ...state, currentStep: Math.min(state.currentStep + 1, state.totalSteps), errors: [] };
    case 'PREVIOUS_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1), errors: [] };
    case 'RESET_ERRORS':
      return { ...state, errors: [] };
    default:
      return state;
  }
}
