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
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:5175/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));
  console.log('--- logs after load ---');
  console.log(logs.filter(l => l.includes('[debug]')).join('\n'));

  logs.length = 0;
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await page.evaluate(() => window.scrollTo(0, 1500));
  await new Promise(r => setTimeout(r, 500));
  console.log('--- logs after scroll ---');
  console.log(logs.filter(l => l.includes('[debug]')).join('\n'));
  await browser.close();
})();
