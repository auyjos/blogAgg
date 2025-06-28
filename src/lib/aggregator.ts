
import { fetchFeed, RSSFeed } from "./rss";
import { getNextFeedToFetch, markedFeedFetched } from "./db/queries/feeds";

export async function scrapeFeeds(): Promise<void> {

    const feedRow = await getNextFeedToFetch()
    if (!feedRow) {
        console.log("No feeds to scrape. Sleeping until next interval.");
        return;
    }

    console.log(`⏳ Fetching ${feedRow.name} (${feedRow.url})…`);

    try {
        await markedFeedFetched(feedRow.id)
        const parsed: RSSFeed = await fetchFeed(feedRow.url)
        for (const item of parsed.channel.item) {
            console.log(`• [${feedRow.name}] ${item.title}`);
        }
    } catch (error: any) {
        console.error(`❌ Error scraping ${feedRow.url}:`, error.message);
    }

}