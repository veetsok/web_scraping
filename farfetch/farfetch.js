const puppeteer = require("puppeteer");
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
  await page.goto(
    "https://www.farfetch.com/kz/shopping/men/clothing-2/items.aspx?page=1&view=96&sort=3&category=136394&designer=106911|214504|82306358|1664",
    {
      waitUntil: "domcontentloaded",
    }
  );

  await randomDelay();

  const products = await page.evaluate(() => {
    const productList = [];
    document
      .querySelectorAll('li[data-testid="productCard"]')
      .forEach((productElement) => {
        const productName = productElement
          .querySelector('p[data-component="ProductCardDescription"]')
          ?.textContent.trim(); // Added optional chaining
        const productBrand = productElement
          .querySelector('p[data-component="ProductCardBrandName"]')
          ?.textContent.trim(); // Added optional chaining
        const productPrice = productElement
          .querySelector('p[data-component="Price"]')
          ?.textContent.trim(); // Added optional chaining
        const productImage = productElement
          .querySelector('img[data-component="ProductCardImagePrimary"]')
          ?.getAttribute("src"); // Added optional chaining
        const productURL = productElement
          .querySelector('a[data-component="ProductCardLink"]')
          ?.getAttribute("href"); // Added optional chaining
        productList.push({
          name: productName,
          brand: productBrand,
          price: productPrice,
          image: productImage,
          url: productURL,
        });
      });
    return productList;
  });

  await browser.close();

  const csvContent = products
    .map(
      (product) =>
        `${product.name},${product.brand},${product.price},${product.image},${product.url}`
    )
    .join("\n");
  fs.writeFileSync(
    "farfetch_products.csv",
    "Name,Brand,Price,Image,URL\n" + csvContent,
    "utf-8"
  );

  console.log("farfetch_products.csv");
})();
