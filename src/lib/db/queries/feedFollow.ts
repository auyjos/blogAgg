import { url } from "inspector";
import { db } from "../index";
import { feedFollows, feeds, users } from "../schema";
import { eq, and } from "drizzle-orm";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";


export type FeedFollow = InferSelectModel<typeof feedFollows>;
export type NewFeedFollow = InferInsertModel<typeof feedFollows>;
export type FeedFollowDetail = FeedFollow & {
    feedName: string;
    feedUrl: string;
    userName: string;
};

/**
 * Create a new follow link between user + feed.
 * Returns full detail joined to feed.name + user.name.
 */
export async function createFeedFollow(userId: string, feedId: string): Promise<FeedFollowDetail> {
    //Insert new record
    const [ff] = await db
        .insert(feedFollows)
        .values({ userId, feedId })
        .returning()
    // pull back joined detail
    const [detail] = await db
        .select({
            id: feedFollows.id,
            userId: feedFollows.userId,
            feedId: feedFollows.feedId,
            createdAt: feedFollows.createdAt,
            updatedAt: feedFollows.updatedAt,
            feedName: feeds.name,
            feedUrl: feeds.url,
            userName: users.name,

        }).from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .where(eq(feedFollows.id, ff.id))
    return detail;
}

//List follows for a given user, with feed names
export async function getFeedsFollowsForUser(userId: string): Promise<FeedFollowDetail[]> {

    return await db
        .select({
            id: feedFollows.id,
            userId: feedFollows.userId,
            feedId: feedFollows.feedId,
            createdAt: feedFollows.createdAt,
            updatedAt: feedFollows.updatedAt,
            feedName: feeds.name,
            feedUrl: feeds.url,
            userName: users.name,
        })
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .where(eq(feedFollows.userId, userId))

}

//find feeds by url
export async function getFeedByUrl(feedUrl: string): Promise<InferSelectModel<typeof feeds> | undefined> {
    const [f] = await db.select().from(feeds).where(eq(feeds.url, feedUrl))
    return f
}

export async function deleteFeedFollowByUrl(userId: string, url: string): Promise<number> {
    const [feed] = await db.select({ id: feeds.id }).from(feeds).where(eq(feeds.url, url))

    if (!feed) {
        throw new Error(`Feed not found: ${url}`);
    }

    const deleted = await db.delete(feedFollows).where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feed.id)))
        .returning()

    return deleted.length
}