const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(
    "https://www.dns-shop.ru/catalog/17a8d26216404e77/vstraivaemye-xolodilniki/",
    { waitUntil: "domcontentloaded" }
  );

  await page.waitForTimeout(5000);

  const content = await page.content();
  const $ = cheerio.load(content);

  const products = [];
  $("[data-id='product']").each((index, element) => {
    const productName = $(element).find(".catalog-product__name span").text().trim();
    const productPrice = $(element).find(".product-buy__price").text().trim();
    products.push({ name: productName, price: productPrice });
  });
  await browser.close();
  const csvContent = products
    .map((product) => `${product.name},${product.price}`)
    .join("\n");
  fs.writeFileSync("products.csv", "Name,Price\n" + csvContent, "utf-8");

  console.log("products.csv");
})();
