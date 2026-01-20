// Environment configuration
export const Environment = {
  serverURL: import.meta.env.VITE_API_BASE_URL  || "http://127.0.0.1:8000",
 
} as const;

export type EnvironmentType = typeof Environment;

//  "http://3.7.228.189:8000"
// "http://localhost:8000"
// "http://localhost:3000"