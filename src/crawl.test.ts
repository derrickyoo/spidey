import {
  getFirstParagraphFromHTML,
  getHeadingFromHTML,
  getImagesFromHTML,
  getURLsFromHTML,
  normalizeURL,
} from "./crawl";

test("normalizeURL http protocol", () => {
  const input = "http://www.boot.dev/blog/path/";
  const actual = normalizeURL(input);
  const expected = "www.boot.dev/blog/path";
  expect(actual).toEqual(expected);
});

test("normalizeURL https protocol", () => {
  const input = "https://www.boot.dev/blog/path/";
  const actual = normalizeURL(input);
  const expected = "www.boot.dev/blog/path";
  expect(actual).toEqual(expected);
});

test("normalizeURL remove ending slash", () => {
  const input = "https://www.boot.dev/blog/path/";
  const actual = normalizeURL(input);
  const expected = "www.boot.dev/blog/path";
  expect(actual).toEqual(expected);
});

test("normalizeURL domain name", () => {
  const input = "http://CRAWLER-TEST.com/path";
  const actual = normalizeURL(input);
  const expected = "crawler-test.com/path";
  expect(actual).toEqual(expected);
});

test("getHeadingFromHTML basic", () => {
  const inputBody = `<html><body><h1>Test Title</h1></body></html>`;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "Test Title";
  expect(actual).toEqual(expected);
});

test("getHeadingFromHTML basic", () => {
  const inputBody = `<html><body><h1>Test Title</h1></body></html>`;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "Test Title";
  expect(actual).toEqual(expected);
});

test("getHeadingFromHTML missing h1", () => {
  const inputBody = `<html><body></body></html>`;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "";
  expect(actual).toEqual(expected);
});

test("getHeadingFromHTML fallback h2", () => {
  const inputBody = `<html><body><h2>Fallback</h2></body></html>`;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "Fallback";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML main priority", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
        <p>Main paragraph.</p>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Main paragraph.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML fallback first paragraph", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Outside paragraph.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML no paragraphs", () => {
  const inputBody = `
    <html><body>
      <main>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "";
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML from absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a href="https://crawler-test.com"><span>Boot.dev</span></a></body></html>`;
  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/"];
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML from relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one"];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML from both absolute and relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody =
    `<html><body>` +
    `<a href="/path/one"><span>Boot.dev</span></a>` +
    `<a href="https://other.com/path/one"><span>Boot.dev</span></a>` +
    `</body></html>`;
  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = [
    "https://crawler-test.com/path/one",
    "https://other.com/path/one",
  ];
  expect(actual).toEqual(expected);
});

test("getImagesFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><img src="https://crawler-test.com/logo.png" alt="Logo"></body></html>`;
  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png"];
  expect(actual).toEqual(expected);
});

test("getImagesFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;
  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png"];
  expect(actual).toEqual(expected);
});

test("getImagesFromHTML multiple", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody =
    `<html><body>` +
    `<img src="/logo.png" alt="Logo">` +
    `<img src="https://cdn.boot.dev/banner.jpg">` +
    `</body></html>`;
  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = [
    "https://crawler-test.com/logo.png",
    "https://cdn.boot.dev/banner.jpg",
  ];
  expect(actual).toEqual(expected);
});
