
import { fetchFeed, RSSFeed } from "./rss";
import { getNextFeedToFetch, markedFeedFetched } from "./db/queries/feeds";
import { createPost } from "./db/queries/posts";

export async function scrapeFeeds(): Promise<void> {

    const feedRow = await getNextFeedToFetch()
    if (!feedRow) {
        console.log("No feeds to scrape. Sleeping until next interval.");
        return;
    }

    console.log(`⏳ Fetching ${feedRow.name} (${feedRow.url})…`);

    await markedFeedFetched(feedRow.id)

    const parsed: RSSFeed = await fetchFeed(feedRow.url)
    for (const item of parsed.channel.item) {

        let pubDate: Date | undefined;
        // parse publication date if present (no variable assignment since it's unused)
        try {
            if (item.pubDate) {
                pubDate = new Date(item.pubDate);
            }
        } catch (error: any) {
            console.log(error.message);
        }
        const post = await createPost({
            title: item.title,
            url: item.link,
            description: item.description,
            publishedAt: pubDate ?? null,
            feedId: feedRow.id,
        })
        if (post) {
            console.log(`+ Saved post: ${post.title}`);
        }

    }
}