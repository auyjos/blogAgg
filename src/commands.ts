import { userInfo } from "os";
import { readConfig, setUser } from "./config";
import { createFeedFollow, deleteFeedFollowByUrl, getFeedByUrl, getFeedsFollowsForUser } from "./lib/db/queries/feedFollow";
import { createFeed, getFeeds, printFeed } from "./lib/db/queries/feeds";
import { createUser, deleteAllUsers, getUserByName, getUsers, User } from "./lib/db/queries/users";

import { fetchFeed } from "./lib/rss";
import { parseDuration } from "./lib/parseDuration";
import { scrapeFeeds } from "./lib/aggregator";
import { resolve } from "path";
import { getPostsForUser } from "./lib/db/queries/posts";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>


export type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>

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

export function middleWareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName, ...args) => {
        const { currentUserName } = readConfig()
        if (!currentUserName) {
            throw new Error("No user logged in. Please `gator login <user>` first.");
        }
        const user = await getUserByName(currentUserName)
        if (!user) {
            throw new Error(`User "${currentUserName}" not found in DB.`);
        }
        await handler(cmdName, user, ...args)
    }
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
    if (args.length !== 1) {
        throw new Error(`Usage: ${cmdName} <interval>`);
    }

    const intervalStr = args[0]
    const intervalMs = parseDuration(intervalStr)
    console.log(`🔁 Collecting feeds every ${intervalStr}`);

    //run immediatly then on interval
    scrapeFeeds().catch((e) => console.error(e));
    const id = setInterval(() => scrapeFeeds().catch((e) => console.error(e)), intervalMs)

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("\n🛑 Shutting down feed aggregator...");
            clearInterval(id);
            resolve();
        })
    })

}


export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
    if (args.length < 2) {
        throw new Error(`Usage: ${cmdName} <feed-name> <feed-url>`);
    }
    const [name, url] = args;


    const feed = await createFeed(name, url, user.id)
    printFeed(feed, user)

    const followDetail = await createFeedFollow(user.id, feed.id)
    console.log(`✔ ${user.name} now follows "${feed.name}"`);


}

export async function handlerListFeeds(cmdName: string, ...args: string[]) {
    if (args.length > 0) {
        throw new Error(`Usage: ${cmdName}`);
    }

    const all = await getFeeds()
    if (all.length === 0) {
        console.log('No feeds found')
        return;
    }

    for (const f of all) {
        console.log(`* ${f.name} – ${f.url} (added by ${f.userName})`);
    }

}



// follow handlers
export async function handlerFollow(cmdName: string, user: User, ...args: string[]) {

    if (args.length !== 1) {
        throw new Error(`Usage: ${cmdName} <feed-url>`);
    }
    const url = args[0]


    const feed = await getFeedByUrl(url)
    if (!feed) {
        throw new Error(`Feed not found: ${url}`);
    }



    const ff = await createFeedFollow(user.id, feed.id)
    console.log(`✔ ${user.name} now follows "${feed.name}"`);
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]) {

    if (args.length !== 0) {
        throw new Error(`Usage: ${cmdName}`);
    }
    const follows = await getFeedsFollowsForUser(user.id)
    if (follows.length === 0) {
        console.log("You are not following any feeds.");
        return;
    }
    for (const f of follows) {
        console.log(`* ${f.feedName} – ${f.feedUrl}`);
    }
}


export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]) {

    if (args.length !== 1) {
        throw new Error(`Usage: ${cmdName} <feed-url>`);
    }

    const url = args[0]
    const count = await deleteFeedFollowByUrl(user.id, url)

    if (count === 0) {
        throw new Error(`You are not following: ${url}`);
    }
    console.log(`✔ Unfollowed feed: ${url}`);
}


export async function handlerBrowse(cmdName: string, user: User, ...args: string[]) {

    let limit = 2
    if (args.length > 1) {
        throw new Error(`Usage: ${cmdName} [limit]`);
    }
    if (args.length === 1) {
        limit = parseInt(args[0], 10)
        if (isNaN(limit) || limit < 1) {
            throw new Error(`Invalid limit: ${args[0]}`);
        }
    }

    const posts = await getPostsForUser(user.id, limit)
    if (posts.length === 0) {
        console.log("No posts available.");
        return;
    }
    for (const p of posts) {
        const date = p.publishedAt ? p.publishedAt.toISOString().split("T")[0] : "unknown"
        console.log(`* [${date}] ${p.title} — ${p.url}`);

    }
}