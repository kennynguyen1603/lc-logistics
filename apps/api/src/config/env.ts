function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback
}

export const env = {
  PORT: parseInt(optional("PORT", "8080"), 10),
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: optional("JWT_EXPIRES_IN", "24h"),
  AFTERSHIP_API_KEY: optional("AFTERSHIP_API_KEY", ""),
  CORS_ORIGIN: optional("CORS_ORIGIN", "http://localhost:3000"),
  NODE_ENV: optional("NODE_ENV", "development"),
} as const
