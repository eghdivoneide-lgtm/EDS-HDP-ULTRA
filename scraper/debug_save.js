const fs = require('fs');

async function testPayload() {
    const { chromium } = require('playwright');
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    page.on('response', async r => {
      if(r.url().includes('feed/df_st_1_')) {
        try {
            const txt = await r.text();
            fs.writeFileSync('payload_test.txt', txt, 'utf-8');
            console.log('Payload saved. Quitting...');
            process.exit(0);
        } catch(e) {}
      }
    });
    await page.goto('https://www.flashscore.com/match/r1DNXnig/#/match-summary/match-statistics/0', { waitUntil: 'load' });
}
testPayload();

