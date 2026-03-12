import { normalizeURL } from "./crawl.js";

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
