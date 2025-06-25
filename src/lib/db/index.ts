import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { readConfig } from "src/config"

const { dbUrl } = readConfig()

const conn = postgres(dbUrl)

export const db = drizzle(conn, { schema })