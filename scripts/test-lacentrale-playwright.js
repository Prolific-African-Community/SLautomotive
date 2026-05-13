const { chromium } = require("playwright");

async function main() {
  const url =
    "https://www.lacentrale.fr/listing?makesModelsCommercialNames=BMW%3A%3AX3&mileageMax=150000&priceMax=30000&yearMax=2022&yearMin=2016";

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: "fr-FR",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  console.log("Opening:", url);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await page.waitForTimeout(8000);

  const title = await page.title();
  const currentUrl = page.url();
  const bodyText = await page.locator("body").innerText().catch(() => "");
  const links = await page.$$eval("a[href]", (anchors) =>
    anchors
      .map((a) => a.href)
      .filter((href) => href.includes("lacentrale.fr"))
      .slice(0, 50)
  );

  console.log("TITLE:", title);
  console.log("CURRENT URL:", currentUrl);
  console.log("BODY SAMPLE:", bodyText.slice(0, 1000));
  console.log("LINKS:", links);

  await page.screenshot({
    path: "scripts/lacentrale-test.png",
    fullPage: true,
  });

  console.log("Screenshot saved: scripts/lacentrale-test.png");

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});