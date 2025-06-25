import { db } from "../index";
import { feeds } from "../schema";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { User } from "./users";

export type Feed = InferSelectModel<typeof feeds>
export type NewFeed = InferInsertModel<typeof feeds>

export async function createFeed(name: string, url: string, userId: string): Promise<Feed> {

    const [result] = await db.insert(feeds).values({ name, url, userId }).returning()
    return result

}

/** Nicely log a feed record and its owning user */
export function printFeed(feed: Feed, user: User) {
    console.log("New feed created:");
    console.log(`  id:        ${feed.id}`);
    console.log(`  name:      ${feed.name}`);
    console.log(`  url:       ${feed.url}`);
    console.log(`  owner:     ${user.name} (${user.id})`);
    console.log(`  createdAt: ${feed.createdAt.toISOString()}`);
    console.log(`  updatedAt: ${feed.updatedAt.toISOString()}`);
}