const fs = require('fs').promises;
const path = require('path');

async function clean() {
    console.log('Cleaning dist folder...');
    try {
        await fs.rm('dist', { recursive: true, force: true });
    } catch (err) {
        // Folder might not exist
    }
    await fs.mkdir('dist', { recursive: true });
}

async function compressWordlist() {
    console.log('Compressing wordlist...');
    const content = await fs.readFile('src/wordlist.js', 'utf8');

    // Extract words between the array brackets
    const match = content.match(/const EFF_WORDLIST = \[([\s\S]*?)\]/);
    if (!match) throw new Error('Could not find wordlist array');

    // Extract all words
    const wordsSection = match[1];
    const words = wordsSection.match(/"([^"]+)"/g).map(w => w.replace(/"/g, ''));

    // Join words with pipe delimiter for compression
    const compressed = words.join('|');

    // Create compressed version
    const compressedJs = `// Compressed EFF wordlist - ${words.length} words
const EFF_WORDLIST_COMPRESSED = "${compressed}";
const EFF_WORDLIST = EFF_WORDLIST_COMPRESSED.split('|');
if (EFF_WORDLIST.length !== 7776) {
    console.error('ERROR: Wordlist corrupted. Expected 7776 words, got', EFF_WORDLIST.length);
}
if (typeof window !== 'undefined') {
    window.EFF_WORDLIST = EFF_WORDLIST;
}`;

    await fs.writeFile('dist/wordlist.js', compressedJs);
    console.log(`  Wordlist compressed from ${content.length} to ${compressedJs.length} bytes`);
}

async function minifyPassphrase() {
    console.log('Minifying passphrase.js...');
    let content = await fs.readFile('src/passphrase.js', 'utf8');

    // Simple minification: remove comments, extra whitespace, console.logs
    content = content
        // Remove single-line comments
        .replace(/\/\/.*$/gm, '')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove console.log statements
        .replace(/console\.log\([^)]*\);?/g, '')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Remove whitespace around operators
        .replace(/\s*([=+\-*/<>!&|,;:{}()\[\]])\s*/g, '$1')
        // Restore space after keywords
        .replace(/\b(const|let|var|if|else|for|while|function|return|new|typeof|throw|try|catch|async|await)\b/g, '$1 ')
        .trim();

    await fs.writeFile('dist/app.js', content);
    console.log('  Passphrase.js minified');
}

async function createServiceWorker() {
    console.log('Creating service worker...');
    const sw = `// Service Worker for offline-first functionality
const CACHE_NAME = 'passphrase-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/wordlist.js',
  '/app.js',
  '/about.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
  );
});`;

    await fs.writeFile('dist/sw.js', sw);
    console.log('  Service worker created');
}

async function processHTML() {
    console.log('Processing HTML files...');

    // Process index.html
    let indexContent = await fs.readFile('src/index.html', 'utf8');

    // Update script paths
    indexContent = indexContent
        .replace('wordlist.js', 'wordlist.js')
        .replace('passphrase.js', 'app.js');

    // Add resource hints and service worker registration
    const swScript = `
    <!-- Service Worker registration -->
    <script>
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered'))
                .catch(err => console.log('SW registration failed'));
        });
    }
    </script>`;

    // Add before closing body tag
    indexContent = indexContent.replace('</body>', swScript + '\n</body>');

    // Add resource hints after title
    const resourceHints = `
    <!-- Resource hints for optimal loading -->
    <link rel="preload" href="/wordlist.js" as="script">
    <link rel="preload" href="/app.js" as="script">`;

    indexContent = indexContent.replace('</title>', '</title>' + resourceHints);

    await fs.writeFile('dist/index.html', indexContent);

    // Copy about.html
    const aboutContent = await fs.readFile('src/about.html', 'utf8');
    await fs.writeFile('dist/about.html', aboutContent);

    console.log('  HTML files processed');
}

async function createManifest() {
    console.log('Creating manifest.json...');
    const manifest = {
        "name": "Secure Passphrase Generator",
        "short_name": "Passphrase",
        "description": "Generate ultra-secure 20-word passphrases",
        "start_url": "/",
        "display": "standalone",
        "theme_color": "#ffffff",
        "background_color": "#ffffff",
        "icons": [
            {
                "src": "/icon-192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/icon-512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ]
    };

    await fs.writeFile('dist/manifest.json', JSON.stringify(manifest, null, 2));
    console.log('  manifest.json created');
}

async function createHeaders() {
    console.log('Creating _headers file for CDN...');
    const headers = `# Cache headers for optimal CDN performance

/wordlist.js
  Cache-Control: public, max-age=31536000, immutable

/app.js
  Cache-Control: public, max-age=86400, stale-while-revalidate

/*.html
  Cache-Control: public, max-age=3600, must-revalidate

/sw.js
  Cache-Control: public, max-age=3600, must-revalidate

/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin`;

    await fs.writeFile('dist/_headers', headers);
    console.log('  _headers file created');
}

async function build() {
    console.log('Starting build process...\n');

    try {
        await clean();
        await compressWordlist();
        await minifyPassphrase();
        await createServiceWorker();
        await processHTML();
        await createManifest();
        await createHeaders();

        console.log('\n✅ Build completed successfully!');
        console.log('📁 Production files in dist/ folder');

        // Show file sizes
        const files = await fs.readdir('dist');
        console.log('\nFile sizes:');
        for (const file of files) {
            const stats = await fs.stat(path.join('dist', file));
            console.log(`  ${file}: ${(stats.size / 1024).toFixed(1)}KB`);
        }
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Run build
build();