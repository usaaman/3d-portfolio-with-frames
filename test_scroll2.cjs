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
  page.on('response', res => { if (res.status() >= 400) logs.push(res.status()+' '+res.url()); });
  await page.goto('http://127.0.0.1:5175/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));

  // disable smooth scroll to test instantly
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });

  const heroOpacityBefore = await page.evaluate(() => document.querySelector('.hero-content').style.opacity);
  console.log('hero opacity @0:', heroOpacityBefore);

  await page.evaluate(() => window.scrollTo(0, 800));
  await new Promise(r => setTimeout(r, 300));
  console.log('scrollY after 800 jump:', await page.evaluate(() => window.scrollY));
  console.log('hero opacity @800:', await page.evaluate(() => document.querySelector('.hero-content').style.opacity));

  await page.evaluate(() => window.scrollTo(0, 3000));
  await new Promise(r => setTimeout(r, 300));
  console.log('scrollY after 3000 jump:', await page.evaluate(() => window.scrollY));
  console.log('about opacity @3000:', await page.evaluate(() => document.querySelector('.about-content').style.opacity));

  // now simulate real wheel scroll events (like a user scrolling) instead of scrollTo
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 300));
  for (let i = 0; i < 20; i++) {
    await page.mouse.wheel({ deltaY: 200 });
    await new Promise(r => setTimeout(r, 50));
  }
  console.log('scrollY after wheel events:', await page.evaluate(() => window.scrollY));
  console.log('hero opacity after wheel:', await page.evaluate(() => document.querySelector('.hero-content').style.opacity));

  console.log('ERR LOGS', logs.filter(l => typeof l === 'string' && (l.includes('4') || l.includes('error') || l.includes('Error'))).slice(0,10));
  await browser.close();
})();
