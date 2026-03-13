import { getHTML } from "./crawl";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("❌ usage: <base_url>");
    process.exit(1);
  }

  if (args.length > 1) {
    console.error("❌ usage: <base_url>");
    process.exit(1);
  }

  const baseURL = args[0];
  console.log(`✅ crawler is starting at ${baseURL}`);

  const html = await getHTML(baseURL);
  console.log(html);

  process.exit(0);
}

main();
