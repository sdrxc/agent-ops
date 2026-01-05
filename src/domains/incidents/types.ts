export interface Incident {
  id: string
  title: string
  description: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Open' | 'Investigating' | 'Resolved'
  affectedService: string
  createdAt: string
  updatedAt: string
  reporter: string
}

export interface IncidentsState {
  incidents: Incident[]
  loading: boolean
  error: string | null
  selectedIncident: Incident | null
}

export type IncidentsAction =
  | { type: 'SET_INCIDENTS'; payload: Incident[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SELECT_INCIDENT'; payload: Incident | null }
  | { type: 'ADD_INCIDENT'; payload: Incident }
  | { type: 'UPDATE_INCIDENT'; payload: Incident }
  | { type: 'DELETE_INCIDENT'; payload: string }




