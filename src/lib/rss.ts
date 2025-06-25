// src/lib/rss.ts
import { XMLParser } from "fast-xml-parser";

export type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};


export async function fetchFeed(feedUrl: string): Promise<RSSFeed> {

    const res = await fetch(feedUrl, {
        headers: { "User-Agent": "gator" },
    })
    if (!res.ok) {
        throw new Error(`Failed to fetch feed: ${res.status} ${res.statusText}`);
    }
    const xml = await res.text();
    const parser = new XMLParser();
    const parsed = parser.parse(xml)

    if (!parsed.rss || !parsed.rss.channel) {
        throw new Error("Invalid RSS: missing <channel>");
    }

    const ch = parsed.rss.channel;
    const { title, link, description } = ch

    if (typeof title !== "string" || typeof link !== "string" || typeof description !== "string") {
        throw new Error("Invalid RSS: channel metadata malformed");
    }

    let itemsRaw = ch.item
    if (!Array.isArray(itemsRaw)) {
        itemsRaw = []
    }

    const itemList: RSSItem[] = itemsRaw
        .map((it: any) => {
            const { title, link, description, pubDate } = it;
            if (
                typeof title === "string" &&
                typeof link === "string" &&
                typeof description === "string" &&
                typeof pubDate === "string"
            ) {
                return { title, link, description, pubDate };
            }
            return null;
        })
        .filter((i): i is RSSItem => i !== null);

    return {
        channel: {
            title, link, description, item: itemList
        }
    }

}