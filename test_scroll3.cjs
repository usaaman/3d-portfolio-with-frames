const puppeteer = require('puppeteer-core');
const crypto = require('crypto');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:5175/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });

  async function canvasHash() {
    const data = await page.evaluate(() => {
      const c = document.querySelector('.scene-canvas');
      return c.toDataURL('image/png').slice(0, 5000); // partial sample is enough to detect change
    });
    return crypto.createHash('md5').update(data).digest('hex');
  }

  console.log('hash @0:', await canvasHash());
  await page.evaluate(() => window.scrollTo(0, 1000));
  await new Promise(r => setTimeout(r, 300));
  console.log('scrollY:', await page.evaluate(() => window.scrollY));
  console.log('hash @1000:', await canvasHash());

  await page.evaluate(() => window.scrollTo(0, 2500));
  await new Promise(r => setTimeout(r, 300));
  console.log('scrollY:', await page.evaluate(() => window.scrollY));
  console.log('hash @2500:', await canvasHash());

  await browser.close();
})();
