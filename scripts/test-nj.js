#!/usr/bin/env node
/**
 * Test NJ Scraper Only
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const TARGET_KEYWORDS = [
  'software', 'IT ', 'technology', 'computer', 'data', 'systems',
  'programming', 'application', 'web', 'cloud', 'cyber', 'network',
  'consulting', 'digital', 'database', 'infrastructure', 'development'
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testNJContracts() {
  console.log('🔍 Testing NJ Contracts Scraper...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  
  const contractsUrl = 'https://www.njstart.gov/bso/view/search/external/advancedSearchContractBlanket.xhtml?view=activeContracts';
  
  try {
    console.log('📍 Navigating to NJ Active Contracts page...');
    await page.goto(contractsUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(3000);
    
    // Take screenshot for debugging
    await page.screenshot({ path: '/tmp/nj-contracts-page.png', fullPage: true });
    console.log('📸 Screenshot saved to /tmp/nj-contracts-page.png');
    
    // Get page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Try to find and click search button
    console.log('🔎 Looking for search button...');
    const searchBtn = await page.$('input[type="submit"], button[type="submit"], .btn-search, [value*="Search"]');
    
    if (searchBtn) {
      console.log('✅ Found search button, clicking...');
      await searchBtn.click();
      await sleep(5000);
      await page.screenshot({ path: '/tmp/nj-contracts-results.png', fullPage: true });
      console.log('📸 Results screenshot saved to /tmp/nj-contracts-results.png');
    } else {
      console.log('⚠️ No search button found, checking for existing results...');
    }
    
    // Extract all visible text and links
    const pageData = await page.evaluate(() => {
      const data = {
        tables: [],
        links: [],
        forms: []
      };
      
      // Get all tables
      document.querySelectorAll('table').forEach((table, idx) => {
        const rows = [];
        table.querySelectorAll('tr').forEach(row => {
          const cells = Array.from(row.querySelectorAll('td, th')).map(c => c.textContent.trim());
          if (cells.length > 0 && cells.some(c => c.length > 0)) {
            rows.push(cells);
          }
        });
        if (rows.length > 0) {
          data.tables.push({ index: idx, rowCount: rows.length, sample: rows.slice(0, 5) });
        }
      });
      
      // Get all links
      document.querySelectorAll('a').forEach(link => {
        const text = link.textContent.trim();
        if (text.length > 3 && text.length < 200) {
          data.links.push({ text: text.substring(0, 100), href: link.href });
        }
      });
      
      // Get form inputs
      document.querySelectorAll('input, select').forEach(input => {
        data.forms.push({
          type: input.type || input.tagName,
          name: input.name || input.id,
          value: input.value?.substring(0, 50)
        });
      });
      
      return data;
    });
    
    console.log('\n📊 Page Analysis:');
    console.log(`   Tables found: ${pageData.tables.length}`);
    console.log(`   Links found: ${pageData.links.length}`);
    console.log(`   Form inputs: ${pageData.forms.length}`);
    
    if (pageData.tables.length > 0) {
      console.log('\n📋 Tables:');
      pageData.tables.forEach(t => {
        console.log(`   Table ${t.index}: ${t.rowCount} rows`);
        if (t.sample.length > 0) {
          console.log(`   Sample headers: ${t.sample[0].slice(0, 5).join(' | ')}`);
        }
      });
    }
    
    if (pageData.forms.length > 0) {
      console.log('\n📝 Form fields:');
      pageData.forms.slice(0, 15).forEach(f => {
        console.log(`   ${f.type}: ${f.name} = "${f.value || ''}"`);
      });
    }
    
    // Filter IT-related links
    const itLinks = pageData.links.filter(l => {
      const text = l.text.toLowerCase();
      return TARGET_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
    });
    
    console.log(`\n🎯 IT-related links: ${itLinks.length}`);
    itLinks.slice(0, 10).forEach(l => {
      console.log(`   - ${l.text}`);
    });
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
  
  await browser.close();
  console.log('\n✅ Test complete!');
}

testNJContracts().catch(console.error);
