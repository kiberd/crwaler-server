const express = require('express');
const puppeteer = require('puppeteer-core');
const app = express();
const port = 4000;

app.get('/price', async (req, res) => {

    const models = ["BQ4422-161", "CZ0790-003"];

    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: false
    });

    const page = await browser.newPage();

    const priceArry = [];

    for (const model of models) {

        const price = {
            model: "",
            name: "",
            kream: 1,
            nike: 1
        };

        const kreamUrl = "https://kream.co.kr/search?keyword=" + model + "&tab=products";
        await page.goto(kreamUrl);

        const kreamPriceSelector = "#__layout > div > div.layout__main.search-container > div.content-container > div.content > div > div.shop-content > div > div.search_result.md > div.search_result_list > div > div > a > div.price.price_area > p.amount";
        await page.waitForSelector(kreamPriceSelector);
        const kreamPriceData = await page.$eval(
            kreamPriceSelector, element => {
                return element.textContent;
            });

        const kreamNameSelector = "#__layout > div > div.layout__main.search-container > div.content-container > div.content > div > div.shop-content > div > div.search_result.md > div.search_result_list > div > div > a > div.product_info_area > div.title > div > p.translated_name";
        await page.waitForSelector(kreamNameSelector);
        const kreamNameData = await page.$eval(
            kreamNameSelector, element => {
                return element.textContent;
            });

        price.model = model;
        price.kream = commaString2Int(kreamPriceData?.split(' ').join('').slice(0, -1));
        price.name = kreamNameData;



        // https://www.nike.com/kr/w?q=BQ4422-161

        const nikeUrl = "https://www.nike.com/kr/w?q=" + model;
        await page.goto(nikeUrl);
        const nikeSelector = "#skip-to-products > div > div > figure > div > div.product-card__animation_wrapper > div > div > div > div";
        await page.waitForSelector(nikeSelector);
        const nikeData = await page.$eval(
            nikeSelector, element => {

                return element.textContent;
            });

        price.nike = commaString2Int(nikeData?.split(' ').join('').slice(0, -1));

        priceArry.push(price);


    }


    await browser.close();

    res.send(JSON.stringify(priceArry))
});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

function commaString2Int(stringNumber) {
    return parseInt(stringNumber.replace(/,/g, ''));
}

