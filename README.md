# Focus Procurement Sourcer

Government IT & Technology contract aggregator for **Focus Consulting**.

## Focus Consulting NAICS Codes (Primary Filter)
All opportunities are filtered to match Focus Consulting's core competencies:

| Code | Description |
|------|-------------|
| **541511** | Custom Computer Programming Services |
| **541512** | Computer Systems Design Services |
| **518210** | Data Processing, Hosting, and Related Services |
| **511210** | Software Publishers |
| **541519** | Other Computer Related Services |

## Set-Aside Certifications
- 8(a) Business Development Program
- DC Certified Business Enterprise (CBE)
- Massachusetts Minority Small Business Enterprise
- Vermont Minority Small Business Enterprise

## Data Sources (Socrata APIs)

| Source | Type | API |
|--------|------|-----|
| Montgomery County, MD | Contracts | Socrata |
| Richmond, VA | Contracts | Socrata |
| Boston, MA | Contracts | CKAN |
| Delaware (State) | Contract Spend | Socrata |

## Features
- Real-time data from official government APIs
- Filter by source, contract type, keywords
- No scraping - all data via official APIs
- Mobile responsive

## Deployment
Deployed on Netlify. Push to main to auto-deploy.

## Future Enhancements
- Add SAM.gov federal opportunities
- Add more state/local Socrata sources
- Email alerts for new contracts
- NAICS code filtering where available
