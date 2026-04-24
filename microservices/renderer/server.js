import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
app.use(express.json({ limit: '50mb' }));

let browser;

async function init() {
    browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--use-gl=angle',
            '--disable-dev-shm-usage',
            '--window-size=1024,1024'
        ]
    });
    console.log("Renderer ready.");
}

app.post('/render', async (req, res) => {
    const { config } = req.body;

    const configBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(config))));

    const url = `http://frontend:80/?render_mode=true&config=${configBase64}`;

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 2 });

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        await page.waitForFunction('window.__3D_READY__ === true', { timeout: 15000 });

        const imageBuffer = await page.screenshot({ type: 'png', omitBackground: false });
        await page.close();

        res.setHeader('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: str(e) });
    }
});

init().then(() => app.listen(3000));