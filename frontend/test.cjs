const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('LOG:', msg.text()));
    page.on('pageerror', err => console.log('ERR:', err.toString()));

    await page.goto('http://localhost:5174');
    await new Promise(r => setTimeout(r, 2000));

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign In'));
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 3000));
    await browser.close();
  } catch (e) {
    console.error(e);
  }
})();

await page.goto('http://localhost:5173');
await new Promise(r => setTimeout(r, 3000));

await page.screenshot({ path: 'C:/Users/njcha/.gemini/antigravity-ide/brain/c9ac7325-cb7c-401c-9665-45c4d78d75ac/dashboard_puppeteer_test4.png' });
await browser.close();
  } catch (e) {
  console.error(e);
}
}) ();
