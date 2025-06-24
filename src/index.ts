
import { setUser, readConfig } from "./config";
import { CommandsRegistry, registerCommand, runCommand, handlerLogin } from "./commands";
function main() {
    const registry: CommandsRegistry = {
    };
    registerCommand(registry, "login", handlerLogin)
    const rawArgs = process.argv.slice(2)

    if (rawArgs.length < 1) {
        console.log(' Error, no command provided')
        process.exit(1)
    }

    const [cmdName, ...cmdArgs] = rawArgs;

    try {
        runCommand(registry, cmdName, ...cmdArgs)
    } catch (error: any) {
        console.log('Error: ', error.message)
        process.exit(1)
    }

    const cfg = readConfig()
    console.log("Current config: ", cfg)
}

main();