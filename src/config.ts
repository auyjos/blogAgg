import fs from 'fs';
import os from 'os';
import path from 'path';

export type Config = {
    dbUrl: string;
    currentUserName?: string;
}


function getConfigFilePath(): string {
    const home = os.homedir()
    return path.join(home, ".gatorconfig.json");
}

function writeConfig(config: Config): void {
    const raw = {
        db_url: config.dbUrl,
        ...(config.currentUserName !== undefined && { current_user_name: config.currentUserName })
    };
    const json = JSON.stringify(raw, null, 2)
    fs.writeFileSync(getConfigFilePath(), json, { encoding: 'utf-8' })
}


// 4. Helper: validate the parsed JSON has the right shape
function validateConfig(raw: any): Config {
    if (typeof raw !== "object" || raw === null) {
        throw new Error("Config file does not contain an object");
    }
    if (typeof raw.db_url !== "string") {
        throw new Error("Config missing required 'db_url' string");
    }
    const cfg: Config = { dbUrl: raw.db_url };
    if (raw.current_user_name !== undefined) {
        if (typeof raw.current_user_name !== "string") {
            throw new Error("Config field 'current_user_name' must be a string");
        }
        cfg.currentUserName = raw.current_user_name;
    }
    return cfg;
}

// 5. Exported: readConfig()
export function readConfig(): Config {
    const file = getConfigFilePath();
    if (!fs.existsSync(file)) {
        throw new Error(`Config file not found at ${file}`);
    }
    const text = fs.readFileSync(file, { encoding: "utf-8" });
    const raw = JSON.parse(text);
    return validateConfig(raw);
}

// 6. Exported: setUser()
//    – reads, updates, then writes back
export function setUser(userName: string): void {
    const cfg = readConfig();
    cfg.currentUserName = userName;
    writeConfig(cfg);
}