const puppeteer = require('puppeteer-core');
const axios = require('axios');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\samee\\.gemini\\antigravity-ide\\brain\\2b6fb4ac-ea0c-4cac-9c0d-e6ab83322597';
const BASE_URL = 'http://localhost:5000/api';

async function captureAllScreenshots() {
  console.log('🚀 Launching Chrome for visual verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
    defaultViewport: { width: 1280, height: 900 }
  });

  try {
    const page = await browser.newPage();

    // ─────────────────────────────────────────────────────────────
    // 1. Authenticate Trader via API for direct session injection
    // ─────────────────────────────────────────────────────────────
    console.log('🔑 Authenticating trader1@krishisetu.com via API...');
    const traderLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'trader1@krishisetu.com',
      password: 'password123'
    });
    const traderToken = traderLoginRes.data.accessToken || traderLoginRes.data.token;
    const traderUser = traderLoginRes.data.user;

    // Open app and inject session
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok, usr) => {
      localStorage.setItem('krishisetu_token', tok);
      localStorage.setItem('token', tok);
      localStorage.setItem('krishisetu_user', JSON.stringify(usr));
      localStorage.setItem('user', JSON.stringify(usr));
    }, traderToken, traderUser);

    // ─────────────────────────────────────────────────────────────
    // 2. Trader Dashboard Screenshot
    // ─────────────────────────────────────────────────────────────
    console.log('📸 Capturing Trader Dashboard (/trader/dashboard)...');
    await page.goto('http://localhost:5173/trader/dashboard', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const traderDashPath = path.join(ARTIFACTS_DIR, 'trader_dashboard_verified.png');
    await page.screenshot({ path: traderDashPath, fullPage: false });
    console.log(`  ✓ Saved: ${traderDashPath}`);

    // ─────────────────────────────────────────────────────────────
    // 3. Trader Bids Screenshot
    // ─────────────────────────────────────────────────────────────
    console.log('📸 Capturing Trader Bids (/trader/bids)...');
    await page.goto('http://localhost:5173/trader/bids', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const traderBidsPath = path.join(ARTIFACTS_DIR, 'trader_bids_verified.png');
    await page.screenshot({ path: traderBidsPath, fullPage: false });
    console.log(`  ✓ Saved: ${traderBidsPath}`);

    // ─────────────────────────────────────────────────────────────
    // 4. Trader Orders & Vehicle Modal Screenshot
    // ─────────────────────────────────────────────────────────────
    console.log('📸 Capturing Trader Orders (/trader/orders)...');
    await page.goto('http://localhost:5173/trader/orders', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const traderOrdersPath = path.join(ARTIFACTS_DIR, 'trader_orders_verified.png');
    await page.screenshot({ path: traderOrdersPath, fullPage: false });
    console.log(`  ✓ Saved: ${traderOrdersPath}`);

    // Click to open vehicle assignment modal
    console.log('📸 Opening Vehicle Assignment Modal...');
    const modalOpened = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Assign') || b.textContent.includes('Update') || b.textContent.includes('Vehicle') || b.textContent.includes('Transport'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (modalOpened) {
      await new Promise(r => setTimeout(r, 1200));
      const modalPath = path.join(ARTIFACTS_DIR, 'trader_vehicle_modal_verified.png');
      await page.screenshot({ path: modalPath, fullPage: false });
      console.log(`  ✓ Saved Vehicle Modal: ${modalPath}`);
    } else {
      console.log('  ⚠️ No vehicle button found on current orders list');
    }

    // ─────────────────────────────────────────────────────────────
    // 5. Trader Invoices Screenshot
    // ─────────────────────────────────────────────────────────────
    console.log('📸 Capturing Trader Invoices (/trader/invoices)...');
    await page.goto('http://localhost:5173/trader/invoices', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const traderInvoicesPath = path.join(ARTIFACTS_DIR, 'trader_invoices_verified.png');
    await page.screenshot({ path: traderInvoicesPath, fullPage: false });
    console.log(`  ✓ Saved: ${traderInvoicesPath}`);

    console.log('\n🎉 Trader visual screenshots captured successfully!');
  } catch (err) {
    console.error('❌ Screenshot capture error:', err.message);
  } finally {
    await browser.close();
  }
}

captureAllScreenshots()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
