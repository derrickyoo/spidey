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
