// Cloudflare Worker to handle API and static files

function getSecureRandomNumber(max) {
  const randomBuffer = new Uint32Array(1);
  const maxValid = Math.floor(4294967296 / max) * max;
  let value;

  do {
    crypto.getRandomValues(randomBuffer);
    value = randomBuffer[0];
  } while (value >= maxValid);

  return value % max;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API endpoint
    if (url.pathname === '/api/passphrase' && request.method === 'GET') {
      const words = [];
      for (let i = 0; i < 20; i++) {
        const index = getSecureRandomNumber(7776);
        words.push(EFF_WORDLIST[index]);
      }

      return new Response(JSON.stringify({
        passphrase: words.join('-'),
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate, private',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    // Serve static files for everything else
    return env.ASSETS.fetch(request);
  }
};

// This will be populated by build process
const EFF_WORDLIST = [];