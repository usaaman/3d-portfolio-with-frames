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

  const info = await page.evaluate(() => {
    const wrapper = document.getElementById('home');
    const rect = wrapper.getBoundingClientRect();
    return {
      wrapperOffsetHeight: wrapper.offsetHeight,
      innerHeight: window.innerHeight,
      rectTop: rect.top,
      canvasWidth: document.querySelector('.scene-canvas').width,
      canvasHeight: document.querySelector('.scene-canvas').height,
    };
  });
  console.log('INFO', JSON.stringify(info));

  // manually add a scroll listener to verify events fire
  await page.evaluate(() => {
    window.__scrollEvents = 0;
    window.addEventListener('scroll', () => { window.__scrollEvents++; });
  });
  await page.evaluate(() => window.scrollTo(0, 1200));
  await new Promise(r => setTimeout(r, 300));
  const evCount = await page.evaluate(() => window.__scrollEvents);
  console.log('scroll events fired:', evCount, 'scrollY:', await page.evaluate(()=>window.scrollY));

  console.log('LOGS', logs);
  await browser.close();
})();
