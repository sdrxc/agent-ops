import { IncidentsState, IncidentsAction } from "../types"

export const initialIncidentsState: IncidentsState = {
  incidents: [],
  loading: false,
  error: null,
  selectedIncident: null,
}

export function incidentsReducer(
  state: IncidentsState,
  action: IncidentsAction
): IncidentsState {
  switch (action.type) {
    case 'SET_INCIDENTS':
      return { ...state, incidents: action.payload, loading: false, error: null }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SELECT_INCIDENT':
      return { ...state, selectedIncident: action.payload }
    case 'ADD_INCIDENT':
      return { ...state, incidents: [...state.incidents, action.payload] }
    case 'UPDATE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map((incident) =>
          incident.id === action.payload.id ? action.payload : incident
        ),
      }
    case 'DELETE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.filter((incident) => incident.id !== action.payload),
        selectedIncident:
          state.selectedIncident?.id === action.payload ? null : state.selectedIncident,
      }
    default:
      return state
  }
}




