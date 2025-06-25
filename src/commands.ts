import { readConfig, setUser } from "./config";
import { createFeed, printFeed } from "./lib/db/queries/feeds";
import { createUser, deleteAllUsers, getUserByName, getUsers } from "./lib/db/queries/users";
export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
import { fetchFeed } from "./lib/rss";
export type CommandsRegistry = Record<string, CommandHandler>


export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler

}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {

    const handler = registry[cmdName]
    if (!handler) {
        throw new Error(`Unknown command ${cmdName}`)

    }
    await handler(cmdName, ...args)

}

export async function handlerLogin(cmdName: string, ...args: string[]) {

    if (args.length < 1) {
        throw new Error(`Usage ${cmdName} <username>`)
    }

    const name = args[0]
    const user = await getUserByName(name)
    if (!user) {
        throw new Error(`User ${name} does not exits. Please register first`)
    }

    setUser(name)
    console.log(`Logged in as ${name}`)
}


export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length < 1) {
        throw new Error(`Usage: ${cmdName} <username>`);
    }
    const name = args[0]
    const exists = await getUserByName(name)
    if (exists) {
        throw new Error(`User "${name}" already exists.`);

    }
    const created = await createUser(name);
    setUser(name);
    console.log(`✔ Registered and logged in as "${name}"`);
    console.log("→ New user record:", created);
}


export async function handlerReset(cmdName: string) {

    const count = await deleteAllUsers()
    console.log(`✔ Reset complete—deleted ${count} user(s).`);

}

export async function handlerUsers(cmdName: string, ...args: string[]) {

    if (args.length > 0) {
        throw new Error(`Usage: ${cmdName} (no arguments)`);
    }

    const all = await getUsers()
    const { currentUserName } = readConfig()
    if (all.length === 0) {
        console.log("No users found.");
        return;
    }

    for (const u of all) {
        const suffix = u.name === currentUserName ? " (current)" : "";
        console.log(`* ${u.name}${suffix}`);

    }
}


export async function handlerAgg(cmdName: string, ...args: string[]) {
    if (args.length > 0) {
        throw new Error(`Usage: ${cmdName}`);
    }

    const feed = await fetchFeed("https://www.wagslane.dev/index.xml")
    console.log(JSON.stringify(feed, null, 2))
}


export async function handlerAddFeed(cmdName: string, ...args: string[]) {
    if (args.length < 2) {
        throw new Error(`Usage: ${cmdName} <feed-name> <feed-url>`);
    }
    const [name, url] = args;

    // 1. Who’s logged in?
    const { currentUserName } = readConfig();
    if (!currentUserName) {
        throw new Error("No user logged in. Please `gator login <user>` first.");
    }

    const user = await getUserByName(currentUserName)
    if (!user) {
        throw new Error(
            `Current user "${currentUserName}" not found in DB.`)
    }

    const feed = await createFeed(name, url, user.id)
    printFeed(feed, user)

}