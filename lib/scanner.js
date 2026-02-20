const https = require("https");
const http = require("http");
const { URL } = require("url");

function fetch(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === "https:" ? https : http;
    const startTime = Date.now();
    let ttfb = 0;

    const req = mod.get(
      url,
      {
        timeout: opts.timeout || 15000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; speed-roast/1.0; +https://github.com/Citedy/speed-roast)",
          "Accept-Encoding": "gzip, deflate, br",
        },
      },
      (res) => {
        ttfb = Date.now() - startTime;

        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const count = (opts._redirectCount || 0) + 1;
          if (count > 5) return reject(new Error("Too many redirects"));
          return fetch(res.headers.location, { ...opts, _redirectCount: count })
            .then((r) => {
              r.redirectCount = count;
              resolve(r);
            })
            .catch(reject);
        }

        const chunks = [];
        let totalBytes = 0;
        res.on("data", (c) => {
          chunks.push(c);
          totalBytes += c.length;
        });
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString();
          resolve({
            status: res.statusCode,
            body,
            headers: res.headers,
            ttfb,
            totalTime: Date.now() - startTime,
            totalBytes,
            redirectCount: opts._redirectCount || 0,
          });
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

async function scan(domain) {
  let url = domain;
  if (!url.startsWith("http")) url = "https://" + url;

  const results = {
    url,
    ttfb: 0,
    totalTime: 0,
    htmlSize: 0,
    scriptCount: 0,
    inlineScriptCount: 0,
    externalScriptCount: 0,
    thirdPartyScripts: 0,
    stylesheetCount: 0,
    imageCount: 0,
    hasCompression: false,
    compressionType: null,
    hasCacheControl: false,
    cachePolicy: null,
    redirectCount: 0,
    server: null,
    hasPreload: false,
    hasPreconnect: false,
    hasPrefetch: false,
    preloadCount: 0,
    preconnectCount: 0,
    statusCode: 0,
    error: null,
  };

  try {
    const res = await fetch(url, { timeout: 15000 });
    results.ttfb = res.ttfb;
    results.totalTime = res.totalTime;
    results.statusCode = res.status;
    results.htmlSize = Math.round(res.totalBytes / 1024);
    results.redirectCount = res.redirectCount;

    const h = res.headers;
    results.hasCompression = !!h["content-encoding"];
    results.compressionType = h["content-encoding"] || null;
    results.hasCacheControl = !!h["cache-control"];
    results.cachePolicy = h["cache-control"] || null;
    results.server = h["server"] || null;

    const html = res.body;
    const parsedUrl = new URL(url);
    const mainDomain = parsedUrl.hostname.replace(/^www\./, "");

    // Scripts
    const scriptRegex = /<script[^>]*(?:>[\s\S]*?<\/script>|\/?>)/gi;
    let m;
    while ((m = scriptRegex.exec(html)) !== null) {
      results.scriptCount++;
      const srcMatch = m[0].match(/src=["']([^"']+)["']/i);
      if (srcMatch) {
        results.externalScriptCount++;
        try {
          const sd = new URL(srcMatch[1], url).hostname.replace(/^www\./, "");
          if (!sd.endsWith(mainDomain) && !mainDomain.endsWith(sd)) {
            results.thirdPartyScripts++;
          }
        } catch { /* relative */ }
      } else {
        results.inlineScriptCount++;
      }
    }

    // Stylesheets & resource hints
    const linkRegex = /<link[^>]*>/gi;
    while ((m = linkRegex.exec(html)) !== null) {
      const tag = m[0];
      if (/rel=["']stylesheet["']/i.test(tag)) results.stylesheetCount++;
      if (/rel=["']preload["']/i.test(tag)) { results.hasPreload = true; results.preloadCount++; }
      if (/rel=["']preconnect["']/i.test(tag)) { results.hasPreconnect = true; results.preconnectCount++; }
      if (/rel=["'](?:dns-)?prefetch["']/i.test(tag)) results.hasPrefetch = true;
    }

    // Images
    results.imageCount = (html.match(/<img[\s>]/gi) || []).length;

  } catch (e) {
    results.error = e.message;
  }

  return results;
}

module.exports = { scan };
