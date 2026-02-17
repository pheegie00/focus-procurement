#!/usr/bin/env node
/**
 * Quick Scraper - Only fast/working states
 * VA, DC, MN (skip slow ones: NJ, MA, MD, PA, WV, DE)
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'state-bids.json');

// Focus Consulting NAICS Codes
const FOCUS_NAICS_CODES = ['541511', '541512', '518210', '511210', '541519'];

const TARGET_KEYWORDS = [
  'software', 'IT ', 'technology', 'computer', 'data', 'systems',
  'programming', 'application', 'web', 'cloud', 'cyber', 'network',
  'consulting', 'digital', 'database', 'infrastructure', 'development'
];

function matchesFocusNAICS(text) {
  const textLower = text.toLowerCase();
  for (const code of FOCUS_NAICS_CODES) {
    if (text.includes(code)) return true;
  }
  return TARGET_KEYWORDS.some(kw => textLower.includes(kw.toLowerCase()));
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeState(page, name, abbrev, url) {
  const opportunities = [];
  console.log(`\n📍 Scraping ${name}...`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    
    const items = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('a').forEach(link => {
        const text = link.textContent.trim();
        const parent = link.closest('tr, li, div, article');
        const context = parent ? parent.textContent.trim() : '';
        if (text.length > 10 && text.length < 500) {
          results.push({ title: text, url: link.href, context: context.substring(0, 500) });
        }
      });
      return results;
    });
    
    for (const item of items) {
      if (matchesFocusNAICS(`${item.title} ${item.context}`) && item.url.startsWith('http')) {
        opportunities.push({
          id: Buffer.from(item.url).toString('base64').substring(0, 20),
          title: item.title,
          state: abbrev,
          stateName: name,
          url: item.url,
          source: url,
          scrapedAt: new Date().toISOString()
        });
      }
    }
    console.log(`   Found ${opportunities.length} Focus NAICS opportunities`);
  } catch (error) {
    console.error(`   Error: ${error.message}`);
  }
  
  return opportunities;
}

async function main() {
  console.log('='.repeat(50));
  console.log('QUICK SCRAPE - Focus Consulting NAICS Filter');
  console.log('States: VA, DC, MN');
  console.log('='.repeat(50));
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  
  let allOpportunities = [];
  
  // Only scrape fast/working states
  const states = [
    { name: 'Virginia', abbrev: 'VA', url: 'https://eva.virginia.gov/pages/eva-solicitations.htm' },
    { name: 'Washington DC', abbrev: 'DC', url: 'https://ocp.dc.gov/page/ocp-solicitations' },
    { name: 'Minnesota', abbrev: 'MN', url: 'https://mn.gov/admin/government/contracting-purchasing/current-opportunities/' }
  ];
  
  for (const state of states) {
    const opps = await scrapeState(page, state.name, state.abbrev, state.url);
    allOpportunities.push(...opps);
    await sleep(1000);
  }
  
  await browser.close();
  
  // Dedupe
  const seen = new Set();
  allOpportunities = allOpportunities.filter(opp => {
    if (seen.has(opp.url)) return false;
    seen.add(opp.url);
    return true;
  });
  
  // Save
  const output = {
    lastUpdated: new Date().toISOString(),
    totalOpportunities: allOpportunities.length,
    states: [...new Set(allOpportunities.map(o => o.state))],
    naicsCodes: FOCUS_NAICS_CODES,
    opportunities: allOpportunities
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ TOTAL: ${allOpportunities.length} Focus NAICS opportunities`);
  console.log(`📁 Saved to: ${OUTPUT_FILE}`);
  console.log('='.repeat(50));
}

main().catch(console.error);
