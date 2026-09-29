export interface SiteInfo {
  suburb: string;
  slug: string;
}

export interface HeroContent {
  heading: string;
  description: string;
}

export interface SeoContent {
  title: string;
  description: string;
}

export interface SiteContent {
  site: SiteInfo;
  hero: HeroContent;
  seo: SeoContent;
}

export interface ContentApiResponse {
  status: string;
  slug: string;
  content: SiteContent;
}

export const FALLBACK_CONTENT: SiteContent = {
  site: {
    suburb: 'Gold Coast',
    slug: 'gold-coast',
  },
  hero: {
    heading: 'CCTV & Security Camera Installation in Gold Coast',
    description:
      'Professionally installed hard-wired camera systems for local Gold Coast homes and businesses, with tidy cabling, clear night footage, mobile viewing and reliable ongoing support.',
  },
  seo: {
    title: 'CCTV & Security Camera Installation Gold Coast | Computers Gold Coast',
    description:
      'Professionally installed CCTV & security camera systems for local homes and businesses in Surfers Paradise, Southport, Broadbeach, Robina, Burleigh Heads, and wider Gold Coast. Licensed QLD installers, tidy cabling, clear night vision, mobile viewing.',
  },
};

const CONTENT_API_BASE =
  import.meta.env.CONTENT_API_URL || 'http://127.0.0.1:8787';

/**
 * Fetches CCTV content for a given slug from the Content API at build time.
 * Falls back safely to verified static Gold Coast copy if the API is unreachable or returns invalid data.
 */
export async function getCctvContent(slug: string = 'gold-coast'): Promise<SiteContent> {
  const url = `${CONTENT_API_BASE}/api/content/${slug}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[content-client] Received HTTP ${res.status} for "${slug}". Using static fallback.`);
      return FALLBACK_CONTENT;
    }

    const data = (await res.json()) as ContentApiResponse;

    if (
      data &&
      data.status === 'success' &&
      data.content &&
      data.content.site &&
      data.content.hero &&
      data.content.seo &&
      typeof data.content.site.suburb === 'string' &&
      typeof data.content.site.slug === 'string' &&
      typeof data.content.hero.heading === 'string' &&
      typeof data.content.hero.description === 'string' &&
      typeof data.content.seo.title === 'string' &&
      typeof data.content.seo.description === 'string'
    ) {
      return data.content;
    }

    console.warn(`[content-client] Incomplete schema for "${slug}". Using static fallback.`);
    return FALLBACK_CONTENT;
  } catch (error) {
    console.warn(`[content-client] Network/timeout error for "${slug}":`, error);
    return FALLBACK_CONTENT;
  }
}
