import { JSDOM } from "jsdom";
import pLimit from "p-limit";

export function normalizeURL(url: string) {
  const urlObj = new URL(url);
  let fullPath = `${urlObj.hostname}${urlObj.pathname}`;

  if (fullPath.slice(-1) === "/") {
    fullPath = fullPath.slice(0, -1);
  }

  return fullPath;
}

export function getHeadingFromHTML(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const heading = document.querySelector("h1") ?? document.querySelector("h2");

  return (heading?.textContent ?? "").trim();
}

export function getFirstParagraphFromHTML(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const main = document.querySelector("main");
  const p = main?.querySelector("p") ?? document.querySelector("p");

  return (p?.textContent ?? "").trim();
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const anchors = document.querySelectorAll("a");

  const urls: string[] = [];
  anchors.forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (!href) return;

    const absoluteURL = new URL(href, baseURL).toString();
    urls.push(absoluteURL);
  });

  return urls;
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
  const imageURLs: string[] = [];

  const dom = new JSDOM(html);
  const document = dom.window.document;
  const images = document.querySelectorAll("img");

  images.forEach((img) => {
    const src = img.getAttribute("src");
    if (!src) return;
    const absoluteURL = new URL(src, baseURL).toString();
    imageURLs.push(absoluteURL);
  });

  return imageURLs;
}

export type ExtractedPageData = {
  url: string;
  heading: string;
  first_paragraph: string;
  outgoing_links: string[];
  image_urls: string[];
};

export function extractPageData(
  html: string,
  pageURL: string,
): ExtractedPageData {
  return {
    url: pageURL,
    heading: getHeadingFromHTML(html),
    first_paragraph: getFirstParagraphFromHTML(html),
    outgoing_links: getURLsFromHTML(html, pageURL),
    image_urls: getImagesFromHTML(html, pageURL),
  };
}

class ConcurrentCrawler {
  private baseURL: string;
  private pages: Record<string, number>;
  private limit: <T>(fn: () => Promise<T>) => Promise<T>;

  constructor(baseURL: string, maxConcurrency: number = 5) {
    this.baseURL = baseURL;
    this.pages = {};
    this.limit = pLimit(maxConcurrency);
  }

  private addPageVisit(normalizedURL: string): boolean {
    if (this.pages[normalizedURL]) {
      this.pages[normalizedURL]++;
      return false;
    } else {
      this.pages[normalizedURL] = 1;
      return true;
    }
  }

  private async getHTML(currentURL: string): Promise<string> {
    return await this.limit(async () => {
      let res: Response;
      try {
        res = await fetch(currentURL, {
          headers: { "User-Agent": "BootCrawler/1.0" },
        });
      } catch (err) {
        throw new Error(`Got Network error: ${(err as Error).message}`);
      }

      if (res.status > 399) {
        throw new Error(`Got HTTP error: ${res.status} ${res.statusText}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("text/html")) {
        throw new Error(`Got non-HTML response: ${contentType}`);
      }

      return res.text();
    });
  }

  private async crawlPage(currentURL: string): Promise<void> {
    const currentURLObj = new URL(currentURL);
    const baseURLObj = new URL(this.baseURL);
    if (currentURLObj.hostname !== baseURLObj.hostname) {
      return;
    }

    const normalizedURL = normalizeURL(currentURL);

    if (!this.addPageVisit(normalizedURL)) {
      return;
    }

    console.log(`crawling ${currentURL}`);
    let html = "";
    try {
      html = await this.getHTML(currentURL);
    } catch (err) {
      console.log(`${(err as Error).message}`);
      return;
    }

    const nextURLs = getURLsFromHTML(html, this.baseURL);

    const crawlPromises = nextURLs.map((nextURL) => this.crawlPage(nextURL));

    await Promise.all(crawlPromises);
  }

  async crawl(): Promise<Record<string, number>> {
    await this.crawlPage(this.baseURL);
    return this.pages;
  }
}

export async function crawlSiteAsync(
  baseURL: string,
  maxConcurrency: number = 5,
): Promise<Record<string, number>> {
  const crawler = new ConcurrentCrawler(baseURL, maxConcurrency);
  return await crawler.crawl();
}
