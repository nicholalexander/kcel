const fs = require('fs').promises;
const path = require('path');
const { minify: minifyJS } = require('terser');
const { minify: minifyHTML } = require('html-minifier-terser');

async function clean() {
    console.log('🧹 Cleaning dist folder...');
    try {
        await fs.rm('dist', { recursive: true, force: true });
    } catch (err) {
        // Folder might not exist
    }
    await fs.mkdir('dist', { recursive: true });
}

async function compressWordlist() {
    console.log('📦 Compressing wordlist...');
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
    const compressedJs = `// EFF wordlist - ${words.length} words
const EFF_WORDLIST_COMPRESSED="${compressed}";
const EFF_WORDLIST=EFF_WORDLIST_COMPRESSED.split('|');
if(EFF_WORDLIST.length!==7776){console.error('ERROR: Wordlist corrupted. Expected 7776 words, got',EFF_WORDLIST.length);}
if(typeof window!=='undefined'){window.EFF_WORDLIST=EFF_WORDLIST;}`;

    // Minify the compressed wordlist
    const minified = await minifyJS(compressedJs, {
        compress: {
            dead_code: true,
            drop_console: false, // Keep the error console
            drop_debugger: true,
            passes: 2
        },
        mangle: false, // Don't mangle EFF_WORDLIST name
        format: {
            comments: false
        }
    });

    await fs.writeFile('dist/wordlist.js', minified.code);

    const originalSize = content.length;
    const compressedSize = minified.code.length;
    console.log(`  ✓ Reduced from ${(originalSize/1024).toFixed(1)}KB to ${(compressedSize/1024).toFixed(1)}KB (${Math.round((1 - compressedSize/originalSize) * 100)}% smaller)`);
}

async function minifyPassphrase() {
    console.log('🚀 Minifying passphrase.js...');
    const content = await fs.readFile('src/passphrase.js', 'utf8');

    const minified = await minifyJS(content, {
        compress: {
            dead_code: true,
            drop_console: true, // Remove ALL console.log statements
            drop_debugger: true,
            passes: 2,
            pure_funcs: ['console.log', 'console.error', 'console.warn']
        },
        mangle: {
            toplevel: false, // Don't mangle top-level names
            reserved: ['EFF_WORDLIST'] // Preserve this global
        },
        format: {
            comments: false
        }
    });

    await fs.writeFile('dist/app.js', minified.code);

    const originalSize = content.length;
    const minifiedSize = minified.code.length;
    console.log(`  ✓ Reduced from ${(originalSize/1024).toFixed(1)}KB to ${(minifiedSize/1024).toFixed(1)}KB (${Math.round((1 - minifiedSize/originalSize) * 100)}% smaller)`);
}

async function createServiceWorker() {
    console.log('⚙️  Creating service worker...');
    const sw = `const CACHE_NAME='passphrase-v1';
const urlsToCache=['/','/wordlist.js','/app.js','/about'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(urlsToCache)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(n=>Promise.all(n.map(n=>n!==CACHE_NAME?caches.delete(n):null))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>{if(r)return r;const f=e.request.clone();return fetch(f).then(r=>{if(!r||r.status!==200||r.type!=='basic')return r;const c=r.clone();caches.open(CACHE_NAME).then(a=>a.put(e.request,c));return r})}))});`;

    await fs.writeFile('dist/sw.js', sw);
    console.log('  ✓ Service worker created');
}

async function processHTML() {
    console.log('📄 Processing HTML files...');

    // Process index.html
    let indexContent = await fs.readFile('src/index.html', 'utf8');

    // Update script paths
    indexContent = indexContent.replace('passphrase.js', 'app.js');

    // Add service worker registration
    const swScript = `<script>if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').then(r=>console.log('SW registered')).catch(e=>console.log('SW failed',e));});}</script>`;

    // Add before closing body tag
    indexContent = indexContent.replace('</body>', swScript + '</body>');

    // Add resource hints after title
    const resourceHints = `<link rel="preload" href="/wordlist.js" as="script">
<link rel="preload" href="/app.js" as="script">`;

    indexContent = indexContent.replace('</title>', '</title>\n' + resourceHints);

    // Minify HTML
    const minifiedIndex = await minifyHTML(indexContent, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyJS: true,
        minifyCSS: true
    });

    await fs.writeFile('dist/index.html', minifiedIndex);

    // Process about.html
    const aboutContent = await fs.readFile('src/about.html', 'utf8');
    const minifiedAbout = await minifyHTML(aboutContent, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
    });

    await fs.writeFile('dist/about.html', minifiedAbout);
    console.log('  ✓ HTML files minified');
}

async function createManifest() {
    console.log('📱 Creating manifest.json...');
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

    // Minify JSON
    await fs.writeFile('dist/manifest.json', JSON.stringify(manifest));
    console.log('  ✓ manifest.json created');
}

async function createHeaders() {
    console.log('☁️  Creating CDN headers...');
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
    console.log('  ✓ _headers file created');
}

async function copyAssets() {
    console.log('📋 Copying assets...');

    // Copy favicon if it exists
    try {
        await fs.copyFile('src/favicon.ico', 'dist/favicon.ico');
        console.log('  ✓ favicon.ico copied');
    } catch (err) {
        // Favicon might not exist
    }
}

async function showResults() {
    const files = await fs.readdir('dist');
    let totalSize = 0;

    console.log('\n📊 Build Results:');
    console.log('─────────────────');

    for (const file of files) {
        const stats = await fs.stat(path.join('dist', file));
        const size = stats.size / 1024;
        totalSize += size;
        console.log(`  ${file.padEnd(20)} ${size.toFixed(1)}KB`);
    }

    console.log('─────────────────');
    console.log(`  ${'Total'.padEnd(20)} ${totalSize.toFixed(1)}KB`);
    console.log(`  ${'Gzipped (est.)'.padEnd(20)} ~${(totalSize * 0.3).toFixed(1)}KB`);
}

async function build() {
    console.log('🔨 Starting production build...\n');

    try {
        await clean();
        await compressWordlist();
        await minifyPassphrase();
        await createServiceWorker();
        await processHTML();
        await createManifest();
        await createHeaders();
        await copyAssets();
        await showResults();

        console.log('\n✅ Build completed successfully!');
        console.log('📁 Production files in dist/ folder');
        console.log('🚀 Ready for deployment to Cloudflare\n');
    } catch (error) {
        console.error('\n❌ Build failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Install dependencies if needed
async function checkDependencies() {
    try {
        require('terser');
        require('html-minifier-terser');
    } catch (err) {
        console.log('📦 Installing build dependencies...');
        const { execSync } = require('child_process');
        execSync('npm install', { stdio: 'inherit' });
        console.log('');
    }
}

// Run build
checkDependencies().then(() => build());