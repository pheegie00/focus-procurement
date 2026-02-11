#!/usr/bin/env node
/**
 * State/Local Procurement Scraper
 * Scrapes open bids from state eProcurement portals
 * States: MD, VA, PA, NJ, MA, DC, MN, WV, DE
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'state-bids.json');

// NAICS codes for IT consulting
const TARGET_KEYWORDS = [
  'software', 'IT ', 'technology', 'computer', 'data', 'systems',
  'programming', 'application', 'web', 'cloud', 'cyber', 'network',
  'consulting', 'digital', 'database', 'infrastructure', 'development'
];

// State portal configurations
const STATE_PORTALS = {
  maryland: {
    name: 'Maryland',
    abbrev: 'MD',
    url: 'https://emma.maryland.gov/page.aspx/en/bpm/process_manage_extranet/',
    searchUrl: 'https://emma.maryland.gov/page.aspx/en/bpm/process_manage_extranet/publicBids',
    scraper: scrapeMarylandEMMA
  },
  virginia: {
    name: 'Virginia',
    abbrev: 'VA', 
    url: 'https://eva.virginia.gov/pages/eva-solicitations.htm',
    scraper: scrapeVirginiaEVA
  },
  pennsylvania: {
    name: 'Pennsylvania',
    abbrev: 'PA',
    url: 'https://www.emarketplace.state.pa.us/BidInquiry.aspx',
    scraper: scrapePennsylvania
  },
  newjersey: {
    name: 'New Jersey',
    abbrev: 'NJ',
    url: 'https://www.njstart.gov/bso/external/publicBids.sdo',
    altUrl: 'https://www.state.nj.us/treasury/purchase/advertised.shtml',
    scraper: scrapeNewJersey
  },
  massachusetts: {
    name: 'Massachusetts',
    abbrev: 'MA',
    url: 'https://www.commbuys.com/bso/external/publicBids.sdo',
    scraper: scrapeMassachusetts
  },
  dc: {
    name: 'Washington DC',
    abbrev: 'DC',
    url: 'https://ocp.dc.gov/page/ocp-solicitations',
    scraper: scrapeDC
  },
  minnesota: {
    name: 'Minnesota',
    abbrev: 'MN',
    url: 'https://mn.gov/admin/government/contracting-purchasing/current-opportunities/',
    scraper: scrapeMinnesota
  },
  westvirginia: {
    name: 'West Virginia',
    abbrev: 'WV',
    url: 'https://www.wvpurchasing.gov/',
    scraper: scrapeWestVirginia
  },
  delaware: {
    name: 'Delaware',
    abbrev: 'DE',
    url: 'https://mygss.bidx.io/public/opportunities',
    scraper: scrapeDelaware
  }
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generic scraper that extracts links and text from a page
async function genericScraper(page, state) {
  const opportunities = [];
  
  try {
    await page.goto(state.url, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(3000);
    
    // Extract all links and surrounding text
    const items = await page.evaluate(() => {
      const results = [];
      const links = document.querySelectorAll('a');
      
      links.forEach(link => {
        const text = link.textContent.trim();
        const href = link.href;
        const parent = link.closest('tr, li, div, article');
        const context = parent ? parent.textContent.trim() : '';
        
        if (text.length > 10 && text.length < 500) {
          results.push({
            title: text,
            url: href,
            context: context.substring(0, 500)
          });
        }
      });
      
      return results;
    });
    
    // Filter for IT-related opportunities
    for (const item of items) {
      const searchText = `${item.title} ${item.context}`.toLowerCase();
      const isRelevant = TARGET_KEYWORDS.some(kw => searchText.includes(kw.toLowerCase()));
      
      if (isRelevant && item.url.startsWith('http')) {
        opportunities.push({
          id: Buffer.from(item.url).toString('base64').substring(0, 20),
          title: item.title,
          state: state.abbrev,
          stateName: state.name,
          url: item.url,
          source: state.url,
          scrapedAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error(`Error scraping ${state.name}: ${error.message}`);
  }
  
  return opportunities;
}

// Maryland eMMA
async function scrapeMarylandEMMA(page, state) {
  return genericScraper(page, state);
}

// Virginia eVA
async function scrapeVirginiaEVA(page, state) {
  const opportunities = [];
  
  try {
    await page.goto(state.url, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(3000);
    
    // Look for solicitation listings
    const items = await page.evaluate(() => {
      const results = [];
      // Try to find table rows or list items with bid info
      const rows = document.querySelectorAll('table tr, .solicitation-item, .bid-item, li');
      
      rows.forEach(row => {
        const link = row.querySelector('a');
        if (link) {
          results.push({
            title: link.textContent.trim() || row.textContent.trim().substring(0, 200),
            url: link.href
          });
        }
      });
      
      return results;
    });
    
    for (const item of items) {
      if (item.title.length > 10 && item.url.startsWith('http')) {
        const searchText = item.title.toLowerCase();
        const isRelevant = TARGET_KEYWORDS.some(kw => searchText.includes(kw.toLowerCase()));
        
        if (isRelevant) {
          opportunities.push({
            id: Buffer.from(item.url).toString('base64').substring(0, 20),
            title: item.title,
            state: state.abbrev,
            stateName: state.name,
            url: item.url,
            source: state.url,
            scrapedAt: new Date().toISOString()
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scraping ${state.name}: ${error.message}`);
  }
  
  return opportunities;
}

// Pennsylvania eMarketplace
async function scrapePennsylvania(page, state) {
  return genericScraper(page, state);
}

// New Jersey - try alternate URL
async function scrapeNewJersey(page, state) {
  const opportunities = [];
  
  try {
    // Try the advertised bids page
    await page.goto(state.altUrl || state.url, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(3000);
    
    const items = await page.evaluate(() => {
      const results = [];
      const links = document.querySelectorAll('a');
      
      links.forEach(link => {
        const text = link.textContent.trim();
        const href = link.href;
        
        if (text.length > 10 && (href.includes('bid') || href.includes('rfp') || href.includes('.pdf'))) {
          results.push({
            title: text,
            url: href
          });
        }
      });
      
      return results;
    });
    
    for (const item of items) {
      const searchText = item.title.toLowerCase();
      const isRelevant = TARGET_KEYWORDS.some(kw => searchText.includes(kw.toLowerCase()));
      
      if (isRelevant) {
        opportunities.push({
          id: Buffer.from(item.url).toString('base64').substring(0, 20),
          title: item.title,
          state: state.abbrev,
          stateName: state.name,
          url: item.url,
          source: state.altUrl || state.url,
          scrapedAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error(`Error scraping ${state.name}: ${error.message}`);
  }
  
  return opportunities;
}

// Massachusetts COMMBUYS
async function scrapeMassachusetts(page, state) {
  return genericScraper(page, state);
}

// Washington DC
async function scrapeDC(page, state) {
  return genericScraper(page, state);
}

// Minnesota
async function scrapeMinnesota(page, state) {
  return genericScraper(page, state);
}

// West Virginia
async function scrapeWestVirginia(page, state) {
  return genericScraper(page, state);
}

// Delaware - uses BidX platform
async function scrapeDelaware(page, state) {
  const opportunities = [];
  
  try {
    await page.goto(state.url, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(5000); // BidX is slow
    
    const items = await page.evaluate(() => {
      const results = [];
      // BidX uses card-based layout
      const cards = document.querySelectorAll('.opportunity-card, .bid-card, [class*="opportunity"], [class*="bid"]');
      
      cards.forEach(card => {
        const title = card.querySelector('h2, h3, h4, .title, [class*="title"]');
        const link = card.querySelector('a');
        
        if (title && link) {
          results.push({
            title: title.textContent.trim(),
            url: link.href
          });
        }
      });
      
      // Fallback to any links
      if (results.length === 0) {
        document.querySelectorAll('a').forEach(link => {
          if (link.textContent.length > 20) {
            results.push({
              title: link.textContent.trim(),
              url: link.href
            });
          }
        });
      }
      
      return results;
    });
    
    for (const item of items) {
      const searchText = item.title.toLowerCase();
      const isRelevant = TARGET_KEYWORDS.some(kw => searchText.includes(kw.toLowerCase()));
      
      if (isRelevant && item.url.startsWith('http')) {
        opportunities.push({
          id: Buffer.from(item.url).toString('base64').substring(0, 20),
          title: item.title,
          state: state.abbrev,
          stateName: state.name,
          url: item.url,
          source: state.url,
          scrapedAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error(`Error scraping ${state.name}: ${error.message}`);
  }
  
  return opportunities;
}

async function main() {
  console.log('='.repeat(60));
  console.log('STATE PROCUREMENT SCRAPER');
  console.log('States: MD, VA, PA, NJ, MA, DC, MN, WV, DE');
  console.log('='.repeat(60));
  
  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  
  let allOpportunities = [];
  
  for (const [key, state] of Object.entries(STATE_PORTALS)) {
    console.log(`\n📍 Scraping ${state.name}...`);
    
    try {
      const opportunities = await state.scraper(page, state);
      console.log(`   Found ${opportunities.length} IT opportunities`);
      allOpportunities.push(...opportunities);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
    
    await sleep(2000); // Be nice to servers
  }
  
  await browser.close();
  
  // Dedupe by URL
  const seen = new Set();
  allOpportunities = allOpportunities.filter(opp => {
    if (seen.has(opp.url)) return false;
    seen.add(opp.url);
    return true;
  });
  
  // Save results
  const output = {
    lastUpdated: new Date().toISOString(),
    totalOpportunities: allOpportunities.length,
    states: [...new Set(allOpportunities.map(o => o.state))],
    opportunities: allOpportunities
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ TOTAL: ${allOpportunities.length} IT opportunities`);
  console.log(`📁 Saved to: ${OUTPUT_FILE}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
