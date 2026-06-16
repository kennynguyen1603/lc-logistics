import { env } from "../config/env"

const isDev = env.NODE_ENV === "development"

function formatMsg(level: string, msg: string): string {
  return `[${new Date().toISOString()}] [${level}] ${msg}`
}

export const logger = {
  info: (msg: string) => console.log(formatMsg("INFO", msg)),
  warn: (msg: string) => console.warn(formatMsg("WARN", msg)),
  error: (msg: string, err?: unknown) => {
    console.error(formatMsg("ERROR", msg))
    if (isDev && err) console.error(err)
  },
  debug: (msg: string) => {
    if (isDev) console.debug(formatMsg("DEBUG", msg))
  },
}
