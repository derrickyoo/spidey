import pLimit from "p-limit";
import { normalizeURL } from "./crawl";

export class ConcurrentCrawler {
  #baseURL: string;
  #pages: Record<string, number>;
  #limit: <T>(fn: () => Promise<T>) => Promise<T>;

  constructor(baseURL: string) {
    this.#baseURL = baseURL;
    this.#pages = {};
    this.#limit = pLimit(1);
  }

  #addPageVisit(normalizedURL: string): boolean {
    if (this.#pages[normalizedURL] > 0) {
      this.#pages[normalizedURL]++;

      return false;
    }

    this.#pages[normalizedURL] = 1;
    return true;
  }

  async #getHTML(currentURL: string): Promise<string> {
    return await this.#limit(async () => {
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
    });
  }
}
