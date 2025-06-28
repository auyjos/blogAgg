import { db } from "../index";
import { feeds, users } from "../schema";
import { eq, sql } from "drizzle-orm";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { User } from "./users";

export type Feed = InferSelectModel<typeof feeds>
export type NewFeed = InferInsertModel<typeof feeds>
export type FeedWithCreator = Feed & { userName: string | null };
export async function createFeed(name: string, url: string, userId: string): Promise<Feed> {

    const [result] = await db.insert(feeds).values({ name, url, userId }).returning()
    return result

}


export async function getFeeds(): Promise<FeedWithCreator[]> {

    return await db
        .select({
            id: feeds.id,
            name: feeds.name,
            url: feeds.url,
            createdAt: feeds.createdAt,
            updatedAt: feeds.updatedAt,
            lastFetchedAt: feeds.lastFetchedAt,
            userId: feeds.userId,
            userName: users.name,
        })
        .from(feeds)
        .leftJoin(users, eq(feeds.userId, users.id));

}

//Marks a fetched feed and sets lastfetched at updatedat
export async function markedFeedFetched(id: string): Promise<void> {

    await db.update(feeds).set({
        lastFetchedAt: sql`now()`,
        updatedAt: sql`now()`
    }).where(eq(feeds.id, id))


}
//picks  the next feed:

export async function getNextFeedToFetch(): Promise<Feed | undefined> {

    const [next] = await db.select().from(feeds).orderBy(sql`${feeds.lastFetchedAt} NULLS FIRST`,
        sql`${feeds.lastFetchedAt} ASC`)
        .limit(1)
    return next
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