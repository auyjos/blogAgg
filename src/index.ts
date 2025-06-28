
import { setUser, readConfig } from "./config";
import {
    CommandsRegistry, registerCommand, runCommand,
    handlerLogin, handlerRegister,
    handlerReset, handlerUsers, handlerAgg, handlerAddFeed, handlerListFeeds, handlerFollow, handlerFollowing, middleWareLoggedIn,
    handlerUnfollow, handlerBrowse
} from "./commands";
async function main() {
    const registry: CommandsRegistry = {
    };
    registerCommand(registry, "login", handlerLogin)
    registerCommand(registry, "register", handlerRegister)
    registerCommand(registry, "reset", handlerReset)
    registerCommand(registry, "users", handlerUsers)
    registerCommand(registry, "agg", handlerAgg)
    registerCommand(registry, "addfeed", middleWareLoggedIn(handlerAddFeed));
    registerCommand(registry, "feeds", handlerListFeeds)
    registerCommand(registry, "agg", handlerAgg)
    registerCommand(registry, "follow", middleWareLoggedIn(handlerFollow))
    registerCommand(registry, "following", middleWareLoggedIn(handlerFollowing));
    registerCommand(registry, "unfollow", middleWareLoggedIn(handlerUnfollow));
    registerCommand(registry, "browse", middleWareLoggedIn(handlerBrowse));
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


    process.exit(0)
}

main();