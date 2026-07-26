const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));

  // inject drawImage counter BEFORE page scripts run
  await page.evaluateOnNewDocument(() => {
    window.__drawCount = 0;
    const orig = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function(...args) {
      window.__drawCount++;
      return orig.apply(this, args);
    };
  });

  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:5175/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));
  console.log('drawCount after load:', await page.evaluate(() => window.__drawCount));

  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await page.evaluate(() => window.scrollTo(0, 1500));
  await new Promise(r => setTimeout(r, 300));
  console.log('scrollY:', await page.evaluate(() => window.scrollY));
  console.log('drawCount after scroll:', await page.evaluate(() => window.__drawCount));

  await browser.close();
})();
