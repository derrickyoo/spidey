import { JSDOM } from "jsdom";

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

export async function getHTML(currentURL: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(currentURL, {
      headers: { "User-Agent": "BootCrawler/1.0" },
    });
  } catch (err) {
    throw new Error(`Network error: ${(err as Error).message}`);
  }

  if (res.status > 399) {
    throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("text/html")) {
    throw new Error(`non-HTML response: ${contentType}`);
  }

  return res.text();
}

export async function crawlPage(
  baseURL: string,
  currentURL: string = baseURL,
  pages: Record<string, number> = {},
) {
  const currentURLObj = new URL(currentURL);
  const baseURLObj = new URL(baseURL);
  if (currentURLObj.hostname !== baseURLObj.hostname) {
    return pages;
  }

  const normalizedURL = normalizeURL(currentURL);

  if (pages[normalizedURL] > 0) {
    pages[normalizedURL]++;
    return pages;
  }

  pages[normalizedURL] = 1;

  console.log(`crawling ${currentURL}`);
  let html = "";
  try {
    html = await getHTML(currentURL);
  } catch (err) {
    console.log(`${(err as Error).message}`);
    return pages;
  }

  const nextURLs = getURLsFromHTML(html, baseURL);
  for (const nextURL of nextURLs) {
    pages = await crawlPage(baseURL, nextURL, pages);
  }

  return pages;
}
