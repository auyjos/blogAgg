import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config"

//readConfig() returns {dbUrl, currentUsername}

const { dbUrl } = readConfig()

export default defineConfig({
    dialect: "postgresql",
    schema: "src/lib/db/schema.ts",
    out: "src/lib/db/migration",
    dbCredentials: {
        url: dbUrl
    }
})