import { setUser } from "./config";

export type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandsRegistry = Record<string, CommandHandler>


export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler

}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): void {

    const handler = registry[cmdName]
    if (!handler) {
        throw new Error(`Unknown command ${cmdName}`)

    }
    handler(cmdName, ...args)

}

export function handlerLogin(cmdName: string, ...args: string[]): void {

    if (args.length < 1) {
        throw new Error(`Usage ${cmdName} <username>`)
    }

    const username = args[0]

    setUser(username)
    console.log(`Logged in as ${username}`)
}