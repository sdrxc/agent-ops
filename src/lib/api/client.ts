import axios from "axios"
import { ApiResponse } from "@/types/api"

const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV
const baseURL = process.env.NEXT_PUBLIC_API_URL || ""
const isLocalEnv = runtimeEnv === "local"

export const apiClient = axios.create({
  baseURL: isLocalEnv ? baseURL : "",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for auth tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = getAuthToken()
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error)
  }
)

export async function apiRequest<T>(
  request: () => Promise<{ data: ApiResponse<T> }>
): Promise<T> {
  try {
    const response = await request()
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.error || "API request failed")
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message)
    }
    throw error
  }
}




