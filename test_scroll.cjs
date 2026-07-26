const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  page.on('pageerror', err => logs.push('PAGEERROR: ' + err.message));
  await page.goto('http://127.0.0.1:5175/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000)); // wait for frames preload
  const before = await page.evaluate(() => ({
    scrollY: window.scrollY,
    bodyOverflowY: getComputedStyle(document.body).overflowY,
    htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
    docScrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
  }));
  console.log('BEFORE', JSON.stringify(before));
  await page.evaluate(() => window.scrollTo(0, 1500));
  await new Promise(r => setTimeout(r, 500));
  const after = await page.evaluate(() => ({ scrollY: window.scrollY }));
  console.log('AFTER', JSON.stringify(after));
  console.log('LOGS', logs.slice(0,20));
  await browser.close();
})();
