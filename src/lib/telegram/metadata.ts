import ogs from "open-graph-scraper";

export interface OgMetadata {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
}

const TWITTER_HOSTS = ["twitter.com", "x.com"];

/**
 * Fetch Open Graph metadata for a URL.
 * Returns null fields on failure (never throws).
 */
export async function fetchMetadata(url: string): Promise<OgMetadata> {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");

    // Twitter/X blocks scrapers aggressively — use fxtwitter API
    if (TWITTER_HOSTS.some((h) => hostname.includes(h))) {
      return fetchTwitterMetadata(url);
    }

    const { result } = await ogs({
      url,
      timeout: 10000,
      fetchOptions: {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; NeverEndingReads/1.0; +https://reads.example.com)",
        },
      },
    });

    return {
      title: result.ogTitle ?? result.dcTitle ?? null,
      description: result.ogDescription ?? result.dcDescription ?? null,
      imageUrl: result.ogImage?.[0]?.url ?? null,
      siteName: result.ogSiteName ?? hostname,
    };
  } catch {
    return { title: null, description: null, imageUrl: null, siteName: null };
  }
}

/**
 * Extract tweet ID from various twitter/x.com URL formats.
 */
function extractTweetId(url: string): string | null {
  const match = url.match(/\/status\/(\d+)/);
  return match?.[1] ?? null;
}

async function fetchTwitterMetadata(url: string): Promise<OgMetadata> {
  const tweetId = extractTweetId(url);
  if (!tweetId) {
    return { title: null, description: null, imageUrl: null, siteName: "Twitter" };
  }

  try {
    // Use fxtwitter JSON API for structured data
    const apiUrl = `https://api.fxtwitter.com/status/${tweetId}`;
    const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });

    if (!resp.ok) throw new Error(`fxtwitter API ${resp.status}`);

    const data = await resp.json();
    const tweet = data.tweet;

    if (!tweet) throw new Error("No tweet in response");

    const author = tweet.author;
    const authorLabel = author
      ? `${author.name} (@${author.screen_name})`
      : null;

    // Prefer linked article title, fall back to tweet text
    const title = tweet.article?.title ?? tweet.text ?? null;

    // For description: if we used tweet text as title, use author as description
    // If we used article title, use tweet text as description
    let description: string | null = null;
    if (tweet.article?.title) {
      description = tweet.text || authorLabel;
    } else {
      description = authorLabel;
    }

    // Get image: article cover, or first media entity, or author avatar
    let imageUrl: string | null = null;
    if (tweet.article?.cover_media?.media_info?.original_img_url) {
      imageUrl = tweet.article.cover_media.media_info.original_img_url;
    } else if (tweet.media?.photos?.[0]?.url) {
      imageUrl = tweet.media.photos[0].url;
    } else if (tweet.media_entities?.[0]?.media_info?.original_img_url) {
      imageUrl = tweet.media_entities[0].media_info.original_img_url;
    } else if (author?.avatar_url) {
      imageUrl = author.avatar_url;
    }

    return {
      title,
      description,
      imageUrl,
      siteName: "Twitter",
    };
  } catch {
    // Fallback: try fxtwitter OG scrape
    try {
      const fxUrl = url
        .replace("twitter.com", "fxtwitter.com")
        .replace("x.com", "fxtwitter.com");
      const { result } = await ogs({ url: fxUrl, timeout: 10000 });
      return {
        title: result.ogDescription ?? result.ogTitle ?? null,
        description: result.ogTitle ?? null,
        imageUrl: result.ogImage?.[0]?.url ?? null,
        siteName: "Twitter",
      };
    } catch {
      return { title: null, description: null, imageUrl: null, siteName: "Twitter" };
    }
  }
}

/**
 * Rate-limited bulk metadata fetch.
 * Waits `delayMs` between each request.
 */
export async function fetchMetadataBulk(
  urls: string[],
  delayMs = 500
): Promise<Map<string, OgMetadata>> {
  const results = new Map<string, OgMetadata>();

  for (const url of urls) {
    const meta = await fetchMetadata(url);
    results.set(url, meta);
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return results;
}
