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