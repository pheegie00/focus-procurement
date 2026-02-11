# Focus Consulting Procurement Sourcer - Research

## Target NAICS Codes
- **541511** - Custom Computer Programming Services
- **541512** - Computer Systems Design Services
- **518210** - Data Processing, Hosting, and Related Services
- **511210** - Software Publishers
- **541519** - Other Computer Related Services

## Target States
NJ, MA, MN, MD, DC, VA, WV, DE, PA

---

# PART 1: Socrata API Dataset IDs

## ✅ Confirmed Working APIs

### Montgomery County, MD
**Portal:** https://data.montgomerycountymd.gov

| Dataset ID | Name | Type | API Endpoint |
|------------|------|------|--------------|
| `vmu2-pnrc` | Contracts | Active contracts | `https://data.montgomerycountymd.gov/resource/vmu2-pnrc.json` |
| `wv2m-su7v` | Contract Spending | Spending data | `https://data.montgomerycountymd.gov/resource/wv2m-su7v.json` |
| `mh7n-3kmr` | Procurement | General procurement | `https://data.montgomerycountymd.gov/resource/mh7n-3kmr.json` |
| `mytb-swri` | Contracts-API | API optimized | `https://data.montgomerycountymd.gov/resource/mytb-swri.json` |

**Sample Query (filter by description containing IT terms):**
```
https://data.montgomerycountymd.gov/resource/vmu2-pnrc.json?$where=contractdesc like '%software%' OR contractdesc like '%computer%' OR contractdesc like '%IT %'&$limit=100
```

### Delaware
**Portal:** https://data.delaware.gov

| Dataset ID | Name | Notes |
|------------|------|-------|
| `sifm-293u` | Statewide Central Contract Spend | State contracts |

### New York State (Reference)
**Portal:** https://data.ny.gov

| Dataset ID | Name | Notes |
|------------|------|-------|
| `ehig-g5x3` | Procurement Report for State Authorities | State-level |
| `8w5p-k45m` | Procurement Report for Local Authorities | Local entities |
| `87uq-bpim` | Agency Contracts | Historical |
| `twsw-2mqa` | MTA Procurements | Transit |

### Boston, MA
**Portal:** https://data.boston.gov (CKAN-based)

| Dataset | Name | Notes |
|---------|------|-------|
| `city-of-boston-contract-award` | Contract Awards | CKAN API |

**CKAN API Example:**
```
https://data.boston.gov/api/3/action/datastore_search?resource_id=<id>&q=software
```

### Richmond, VA
**Portal:** https://data.richmondgov.com

| Dataset ID | Name |
|------------|------|
| `xqn7-jvv2` | City Contracts |

---

# PART 2: State eProcurement Portals (Scrape or Feed)

## State-Level Systems

| State | Portal | URL | API? | Notes |
|-------|--------|-----|------|-------|
| **MD** | eMaryland Marketplace (eMMA) | emma.maryland.gov | ❌ | Must scrape, has RSS? |
| **VA** | eVA | eva.virginia.gov | ❌ | Largest state system |
| **PA** | PA eMarketplace | emarketplace.state.pa.us | ❌ | Jaggaer-based |
| **NJ** | NJSTART | njstart.gov | ❌ | Periscope-based |
| **MA** | COMMBUYS | commbuys.com | ⚠️ | Has public search, possible RSS |
| **DC** | OCP | ocp.dc.gov | ❌ | Smaller portal |
| **MN** | MMD | mmb.state.mn.us | ❌ | Must scrape |
| **WV** | wvOASIS | wvpurchasing.gov | ❌ | Must scrape |
| **DE** | MyMarketplace | mymarketplace.delaware.gov | ❌ | Must scrape |

---

# PART 3: Major City/County Portals

## Maryland
| Entity | Portal | Has API? |
|--------|--------|----------|
| **Montgomery County** | data.montgomerycountymd.gov | ✅ Socrata |
| **Baltimore City** | data.baltimorecity.gov | ✅ Socrata |
| **Prince George's County** | princegeorgescountymd.gov | ❌ |
| **Anne Arundel County** | aacounty.org | ❌ |
| **Howard County** | howardcountymd.gov | ❌ |
| **Baltimore County** | baltimorecountymd.gov | ❌ |

## Virginia
| Entity | Portal | Has API? |
|--------|--------|----------|
| **Richmond** | data.richmondgov.com | ✅ Socrata |
| **Fairfax County** | fairfaxcounty.gov | ❌ (uses eVA) |
| **Virginia Beach** | vbgov.com | ❌ |
| **Norfolk** | norfolk.gov | ❌ |
| **Arlington County** | arlingtonva.us | ❌ |
| **Loudoun County** | loudoun.gov | ❌ |

## Pennsylvania
| Entity | Portal | Has API? |
|--------|--------|----------|
| **Philadelphia** | opendataphilly.org | ⚠️ CKAN |
| **Pittsburgh** | data.wprdc.org | ✅ CKAN |
| **Allegheny County** | data.wprdc.org | ✅ CKAN |

## New Jersey
| Entity | Portal | Has API? |
|--------|--------|----------|
| **Newark** | newarknj.gov | ❌ |
| **Jersey City** | jerseycitynj.gov | ❌ |
| **Most NJ cities** | Use NJSTART | ❌ |

## Massachusetts
| Entity | Portal | Has API? |
|--------|--------|----------|
| **Boston** | data.boston.gov | ✅ CKAN |
| **Cambridge** | cambridgema.gov | ❌ |
| **Most MA cities** | Use COMMBUYS | ⚠️ |

## DC
| Entity | Portal | Has API? |
|--------|--------|----------|
| **Washington DC** | opendata.dc.gov | ⚠️ ArcGIS |
| | ocp.dc.gov | ❌ |

## Minnesota
| Entity | Portal | Has API? |
|--------|--------|----------|
| **Minneapolis** | opendata.minneapolismn.gov | ✅ Socrata? |
| **St. Paul** | stpaul.gov | ❌ |
| **Hennepin County** | hennepin.us | ❌ |

## West Virginia
| Entity | Portal | Has API? |
|--------|--------|----------|
| **Charleston** | cityofcharleston.org | ❌ |
| **Most WV** | Use wvOASIS | ❌ |

## Delaware
| Entity | Portal | Has API? |
|--------|--------|----------|
| **Wilmington** | wilmingtonde.gov | ❌ |
| **New Castle County** | newcastlede.gov | ❌ |

---

# PART 4: Recommended Data Strategy

## Tier 1 - Real APIs (No scraping)
1. SAM.gov Opportunities API (federal)
2. Montgomery County MD Socrata
3. Boston CKAN
4. Pittsburgh/Allegheny CKAN
5. Richmond VA Socrata
6. Delaware state Socrata

## Tier 2 - RSS/Feeds (Light integration)
1. COMMBUYS (MA) - possible RSS
2. Some Jaggaer portals have email alerts → parse

## Tier 3 - Scraping Required
1. VA eVA
2. PA eMarketplace
3. NJ NJSTART
4. MD eMMA (state level)
5. DC OCP
6. MN MMD
7. WV wvOASIS
8. DE MyMarketplace

## Coverage Estimate
- **With Tier 1 only:** ~20% of opportunities
- **With Tier 1 + 2:** ~35% of opportunities
- **With all tiers:** ~70-80% of opportunities

---

# PART 5: Socrata API Query Examples

## Basic Query
```bash
curl "https://data.montgomerycountymd.gov/resource/vmu2-pnrc.json?$limit=10"
```

## Filter by keyword in description
```bash
curl "https://data.montgomerycountymd.gov/resource/vmu2-pnrc.json?\$where=contractdesc%20like%20'%25software%25'&\$limit=50"
```

## Filter by date range
```bash
curl "https://data.montgomerycountymd.gov/resource/vmu2-pnrc.json?\$where=execution%20>%20'2025-01-01'&\$limit=100"
```

## Full text search
```bash
curl "https://data.montgomerycountymd.gov/resource/vmu2-pnrc.json?\$q=technology&\$limit=50"
```

---

# Next Steps

1. **Test each Socrata endpoint** with IT-related keywords
2. **Map NAICS to keywords** for text-based filtering (many datasets don't have NAICS)
3. **Build prototype** with Tier 1 sources first
4. **Evaluate scraping needs** for Tier 3 after seeing Tier 1 coverage
