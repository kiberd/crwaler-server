const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 4000;

app.get('/price', async (req, res) => {

    const models = ["BQ4422-161", "CZ0790-003"];

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

    const priceArry = [];

    for (const model of models) {

        const price = {
            model: "",
            name: "",
            kream: 0,
            nike: 0
        };

        const kreamUrl = "https://kream.co.kr/search?keyword=" + model;
        await page.goto(kreamUrl);
        console.log(await page.evaluate('navigator.userAgent'));

        const kreamPriceSelector = "#__layout > div > div.layout__main.search-container > div.content-container > div.content > div > div.shop-content > div > div.search_result.md > div.search_result_list > div > div > a > div.price.price_area > p.amount";
        
        try {

            await page.waitForSelector(kreamPriceSelector, { timeout: 3000 });
            const kreamPriceData = await page.$eval(
                kreamPriceSelector, element => {
                    return element.textContent;
                });
            price.kream = commaString2Int(kreamPriceData?.split(' ').join('').slice(0, -1));

        } catch (error) {
            console.log('Failed');
        }

        try {

            const kreamNameSelector = "#__layout > div > div.layout__main.search-container > div.content-container > div.content > div > div.shop-content > div > div.search_result.md > div.search_result_list > div > div > a > div.product_info_area > div.title > div > p.translated_name";
            await page.waitForSelector(kreamNameSelector, { timeout: 3000 });
            
            const kreamNameData = await page.$eval(
                kreamNameSelector, element => {
                    return element.textContent;
            });

            price.name = kreamNameData;


        } catch (error) {
            console.log('Failed');
        }

        price.model = model;

        // https://www.nike.com/kr/w?q=BQ4422-161

        const nikeUrl = "https://www.nike.com/kr/w?q=" + model;
        await page.goto(nikeUrl);

        try {
            const nikeSelector = "#skip-to-products > div > div > figure > div > div.product-card__animation_wrapper > div > div > div > div";
            await page.waitForSelector(nikeSelector, { timeout: 3000 });
            const nikeData = await page.$eval(
                nikeSelector, element => {

                    return element.textContent;
                });
            price.nike = commaString2Int(nikeData?.split(' ').join('').slice(0, -1));

        } catch (error) {
            console.log('Failed');
        }

        console.log(price)
        priceArry.push(price);

    }

    await browser.close();
    res.send(JSON.stringify(priceArry));

});


app.listen(port, () => {
    console.log(`Crawler app listening on port ${port}`)
});

function commaString2Int(stringNumber) {
    return parseInt(stringNumber.replace(/,/g, ''));
}

