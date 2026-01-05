import { AgentsState, AgentsAction } from "../types"

export const initialAgentsState: AgentsState = {
  agents: [],
  loading: false,
  error: null,
  selectedAgent: null,
}

export function agentsReducer(
  state: AgentsState,
  action: AgentsAction
): AgentsState {
  switch (action.type) {
    case 'SET_AGENTS':
      return { ...state, agents: action.payload, loading: false, error: null }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SELECT_AGENT':
      return { ...state, selectedAgent: action.payload }
    case 'ADD_AGENT':
      return { ...state, agents: [...state.agents, action.payload] }
    case 'UPDATE_AGENT':
      return {
        ...state,
        agents: state.agents.map((agent) =>
          agent.id === action.payload.id ? action.payload : agent
        ),
      }
    case 'DELETE_AGENT':
      return {
        ...state,
        agents: state.agents.filter((agent) => agent.id !== action.payload),
        selectedAgent:
          state.selectedAgent?.id === action.payload ? null : state.selectedAgent,
      }
    default:
      return state
  }
}




