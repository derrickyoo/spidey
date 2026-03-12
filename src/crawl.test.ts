import { getHeadingFromHTML, normalizeURL } from "./crawl";

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
