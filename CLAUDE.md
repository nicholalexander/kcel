# kcel - Ultra-Secure Passphrase Generator

## Project Overview
A brutalist, ultra-secure passphrase generator deployed at [kcel.io](https://kcel.io) that creates:
- Fixed 20-word passphrases with 258.5 bits of entropy
- Cryptographically secure generation using Web Crypto API
- Unique, non-reproducible passphrases
- Zero tracking, zero analytics, zero third-party resources

## Core Principles
1. **Maximum Security**: 258.5 bits of entropy (uncrackable)
2. **Brutalist Design**: Pure HTML, no CSS frameworks
3. **Privacy First**: No tracking, no cookies, no analytics
4. **Offline-First**: Service Worker caches everything after first visit
5. **API Access**: JSON endpoint for programmatic access

## Technical Implementation

### Cryptographic Approach
- Uses `crypto.getRandomValues()` for true randomness
- EFF's long word list (7,776 words = 12.925 bits per word)
- Fixed 20 words = 258.5 bits total entropy
- Would take ~10⁶¹ years to crack at 1 billion attempts/second
- No Math.random() or weak PRNGs

### Deployment
- **Live Site**: [https://kcel.io](https://kcel.io)
- **Platform**: Cloudflare Workers (edge computing)
- **CDN**: 200+ global locations
- **Compression**: Brotli, ~20KB gzipped total

## File Structure
```
├── src/
│   ├── index.html       # Main generator page
│   ├── about.html       # About/security information
│   ├── passphrase.js    # Core generation logic
│   └── wordlist.js      # EFF word list (7,776 words)
├── dist/                # Production build output
│   ├── worker.js        # Cloudflare Worker with API
│   ├── sw.js           # Service Worker for offline
│   └── ...             # Minified assets
├── worker.js           # API endpoint source
├── build.js            # Build system (Terser + html-minifier)
├── wrangler.json       # Cloudflare Workers config
└── package.json        # Dependencies and scripts
```

## API Endpoint

### GET /api/passphrase
Returns JSON with a cryptographically secure passphrase:
```json
{
  "passphrase": "word1-word2-...-word20",
  "timestamp": "2025-10-06T12:00:00.000Z"
}
```

**Features:**
- Cryptographically secure (uses crypto.getRandomValues)
- Never cached (Cache-Control headers prevent caching)
- CORS enabled
- ISO 8601 timestamp

## Build System

### Commands
```bash
npm run build       # Build production files to dist/
npm run serve       # Serve production build locally
npm run serve-dev   # Serve development files
npm run deploy      # Deploy to Cloudflare Workers
npm run clean       # Remove dist folder
```

### Build Process
1. Compresses wordlist from 114KB to 61KB (47% reduction)
2. Minifies JavaScript with Terser
3. Minifies HTML with html-minifier-terser
4. Creates Service Worker for offline functionality
5. Builds Worker with embedded wordlist for API
6. Total size: ~68KB (~20KB gzipped)

## Security Features

### Implemented
- ✅ 258.5 bits of entropy (20 words × 12.925 bits)
- ✅ Cryptographically secure random generation
- ✅ Service Worker excludes API from cache
- ✅ No tracking, analytics, or third-party resources
- ✅ Offline-capable after first visit
- ✅ API endpoint with proper cache headers

### Protection Against
- **Brute Force**: 7.59 × 10⁷⁷ possible combinations
- **Pattern Analysis**: Each word selection independent
- **Cache Poisoning**: API responses never cached
- **Network Attacks**: HTTPS only via Cloudflare

## Development Notes

### Service Worker
- Caches static assets only (HTML, JS)
- Bypasses cache for `/api/*` routes
- Enables offline functionality

### Worker Script
- Handles routing for API and static files
- Embeds full wordlist for API generation
- Uses same cryptographic functions as frontend

## Performance
- **Total Size**: 146KB uncompressed
- **Gzipped**: ~44KB over the wire
- **Edge Deployment**: <50ms latency globally
- **Offline**: Works without internet after first visit

## Contributing
Pull requests welcome. Maintain brutalist aesthetic and security focus.

## License
MIT License - Copyright (c) 2024 Nichol Alexander