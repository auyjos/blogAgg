
import { setUser, readConfig } from "./config";
import { CommandsRegistry, registerCommand, runCommand, handlerLogin, handlerRegister, handlerReset, handlerUsers, handlerAgg } from "./commands";
async function main() {
    const registry: CommandsRegistry = {
    };
    registerCommand(registry, "login", handlerLogin)
    registerCommand(registry, "register", handlerRegister)
    registerCommand(registry, "reset", handlerReset)
    registerCommand(registry, "users", handlerUsers)
    registerCommand(registry, "agg", handlerAgg)
    const rawArgs = process.argv.slice(2)

    if (rawArgs.length === 0) {
        console.log(' Error, no command provided')
        process.exit(1)
    }

    const [cmdName, ...cmdArgs] = rawArgs;

    try {
        await runCommand(registry, cmdName, ...cmdArgs)
    } catch (error: any) {
        console.log('Error: ', error.message)
        process.exit(1)
    }

    const cfg = readConfig()
    console.log("Current config: ", cfg)
    process.exit(0)
}

main();