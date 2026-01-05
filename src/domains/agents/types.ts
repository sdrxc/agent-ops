import { Agent } from "@/types/api"

export interface AgentsState {
  agents: Agent[]
  loading: boolean
  error: string | null
  selectedAgent: Agent | null
}

export type AgentsAction =
  | { type: 'SET_AGENTS'; payload: Agent[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SELECT_AGENT'; payload: Agent | null }
  | { type: 'ADD_AGENT'; payload: Agent }
  | { type: 'UPDATE_AGENT'; payload: Agent }
  | { type: 'DELETE_AGENT'; payload: string }




