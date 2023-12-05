const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");

const randomDelay = () => {
  const delay = Math.floor(Math.random() * 3000) + 1000; // От 1 до 4 секунд
  return new Promise((resolve) => setTimeout(resolve, delay));
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto("https://moscow.shop.megafon.ru/mobile", {
    waitUntil: "domcontentloaded",
  });

  await randomDelay();

  const content = await page.content();
  const $ = cheerio.load(content);

  const products = [];
  $(".b-good__title-link").each(async (index, element) => {
    const productName = $(element).text().trim();
    const productPrice = $(element)
      .closest(".b-good")
      .find(".b-price__value")
      .text()
      .trim();
    products.push({ name: productName, price: productPrice });

    await randomDelay();
  });

  await browser.close();

  const csvContent = products
    .map((product) => `${product.name},${product.price}`)
    .join("\n");
  fs.writeFileSync("megafon_products.csv", "Name,Price\n" + csvContent, "utf-8");

  console.log("megafon_products.csv");
})();
