const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900 });
  await page.goto('http://127.0.0.1:5177/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000)); // wait for preload
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });

  // Hero: scroll to frame ~90 (progress = 89/260)
  await page.evaluate(() => {
    const total = document.getElementById('home').offsetHeight - window.innerHeight;
    window.scrollTo(0, total * (89/260));
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: '/home/claude/shot_hero.png' });

  // About: scroll to frame ~245
  await page.evaluate(() => {
    const total = document.getElementById('home').offsetHeight - window.innerHeight;
    window.scrollTo(0, total * (245/260));
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: '/home/claude/shot_about.png' });

  await browser.close();
})();
