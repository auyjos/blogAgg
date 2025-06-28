import { db } from "..";
import { posts, feeds, feedFollows, users } from "../schema";
import { eq, desc } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type Post = InferSelectModel<typeof posts>
export type NewPost = InferInsertModel<typeof posts>

//Insert post

export async function createPost(data: NewPost): Promise<Post> {

    const [p] = await db.insert(posts).values(data).onConflictDoNothing()// skips duplicates
        .returning()
    return p
}

//fetch latest posts for user via their follows

export async function getPostsForUser(
    userId: string,
    limit: number
): Promise<Post[]> {
    // 1️⃣ Explicitly select only the `posts` columns, aliasing them to `post`
    const rows = await db
        .select({ post: posts })
        .from(posts)
        .innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
        .where(eq(feedFollows.userId, userId))
        // 2️⃣ Order by the column directly, with a literal direction
        .orderBy(desc(posts.publishedAt))
        .limit(limit);

    // 3️⃣ Now each `row` has exactly one key: `post`
    return rows.map((r) => r.post);
}