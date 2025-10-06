# kcel - Secure Passphrase Generator

A brutalist, ultra-secure passphrase generator that creates 20-word passphrases with 258.5 bits of entropy using the EFF diceware method.

**Live Site**: [https://kcel.io](https://kcel.io)

## Features

- **Maximum Security**: 20-word passphrases with 258.5 bits of entropy
- **Cryptographically Secure**: Uses Web Crypto API (`crypto.getRandomValues()`)
- **No Tracking**: Zero analytics, no cookies, no third-party resources
- **Offline-First**: Service Worker caches everything after first visit
- **Brutalist Design**: Pure HTML, no CSS framework, minimal styling
- **Fast**: ~68KB total, ~20KB gzipped, served from Cloudflare edge

## Security

Each passphrase:
- Contains 20 words from EFF's long wordlist (7,776 words)
- Provides 258.5 bits of entropy
- Would take ~10⁶¹ years to crack at 1 billion attempts/second
- Is generated entirely in your browser
- Cannot be reproduced or recovered

## Development

### Prerequisites
- Node.js 16+
- npm

### Setup
```bash
git clone https://github.com/nicholalexander/kcel.git
cd kcel
npm install
```

### Commands
```bash
npm run build       # Build production files to dist/
npm run serve       # Serve production build on localhost:8080
npm run serve-dev   # Serve development files on localhost:8080
npm run deploy      # Deploy to Cloudflare Workers
npm run clean       # Remove dist folder
```

### Project Structure
```
├── src/              # Source files
│   ├── index.html    # Main page
│   ├── about.html    # About page
│   ├── passphrase.js # Core generation logic
│   └── wordlist.js   # EFF wordlist (7,776 words)
├── dist/             # Production build (gitignored)
├── build.js          # Build script (terser + html-minifier)
├── package.json      # Dependencies and scripts
└── wrangler.json     # Cloudflare Workers config
```

### Build System
The build process:
1. Compresses wordlist from 114KB to 61KB (47% reduction)
2. Minifies JavaScript with Terser
3. Minifies HTML with html-minifier-terser
4. Creates Service Worker for offline functionality
5. Generates PWA manifest
6. Sets up CDN cache headers

### Deployment
Deployed to Cloudflare Workers for edge performance:
- Automatic HTTPS
- Global CDN (200+ locations)
- HTTP/3 with QUIC
- Brotli compression
- DDoS protection

## Technical Details

### Entropy Calculation
- Each word from 7,776 possibilities = log₂(7776) = 12.925 bits
- 20 words × 12.925 bits = 258.5 bits total entropy

### Browser Compatibility
Requires modern browser with:
- Web Crypto API
- Service Worker support
- JavaScript enabled

## Contributing

Pull requests welcome! Please keep the brutalist aesthetic and focus on security.

## License

MIT License

Copyright (c) 2024 Nichol Alexander

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.