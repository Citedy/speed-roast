const { getPersona } = require("./personas");

function fillTemplate(template, vars) {
  if (!template) return null;
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? key);
}

function roast(scanResults, personaId) {
  const persona = getPersona(personaId);
  if (!persona) return null;

  const r = scanResults;
  const vars = {
    ttfb: r.ttfb,
    totalTime: (r.totalTime / 1000).toFixed(1),
    totalTimeMs: r.totalTime,
    size: r.htmlSize,
    scripts: r.scriptCount,
    thirdParty: r.thirdPartyScripts,
    inline: r.inlineScriptCount,
    external: r.externalScriptCount,
    stylesheets: r.stylesheetCount,
    images: r.imageCount,
    redirects: r.redirectCount,
    compression: r.compressionType || "none",
    preloads: r.preloadCount,
    preconnects: r.preconnectCount,
  };

  const lines = [];
  let score = 100;
  let issues = 0;

  function add(key, deduction, extraVars = {}) {
    const text = fillTemplate(persona.roasts[key], { ...vars, ...extraVars });
    if (text) {
      lines.push(text);
      score -= deduction;
      issues++;
    }
  }

  function good(key) {
    const text = fillTemplate(persona.roasts[key], vars);
    if (text) lines.push(text);
  }

  // TTFB
  if (r.ttfb > 800) {
    add("slow_ttfb", 15, { ttfb: r.ttfb });
  } else if (r.ttfb > 400) {
    add("medium_ttfb", 8, { ttfb: r.ttfb });
  } else {
    good("fast_ttfb");
  }

  // Total load time
  const totalSec = r.totalTime / 1000;
  if (totalSec > 3) {
    add("slow_total", 12, { totalTime: totalSec.toFixed(1) });
  } else if (totalSec > 1.5) {
    add("medium_total", 5, { totalTime: totalSec.toFixed(1) });
  } else {
    good("fast_total");
  }

  // HTML size
  if (r.htmlSize > 500) {
    add("huge_html", 10, { size: r.htmlSize });
  } else if (r.htmlSize > 200) {
    add("large_html", 5, { size: r.htmlSize });
  }

  // Compression
  if (!r.hasCompression) {
    add("no_compression", 12);
  } else {
    good("has_compression");
  }

  // Cache headers
  if (!r.hasCacheControl) {
    add("no_cache", 8);
  }

  // Scripts
  if (r.scriptCount > 30) {
    add("extreme_scripts", 10, { scripts: r.scriptCount });
  } else if (r.scriptCount > 15) {
    add("many_scripts", 5, { scripts: r.scriptCount });
  }

  // Third-party scripts
  if (r.thirdPartyScripts > 10) {
    add("many_third_party", 10, { thirdParty: r.thirdPartyScripts });
  } else if (r.thirdPartyScripts > 5) {
    add("some_third_party", 5, { thirdParty: r.thirdPartyScripts });
  }

  // Stylesheets
  if (r.stylesheetCount > 8) {
    add("many_stylesheets", 8, { stylesheets: r.stylesheetCount });
  } else if (r.stylesheetCount > 4) {
    add("some_stylesheets", 3, { stylesheets: r.stylesheetCount });
  }

  // Redirects
  if (r.redirectCount > 2) {
    add("many_redirects", 8, { redirects: r.redirectCount });
  } else if (r.redirectCount > 0) {
    add("has_redirect", 3, { redirects: r.redirectCount });
  }

  // Resource hints
  if (!r.hasPreload && !r.hasPreconnect && !r.hasPrefetch) {
    add("no_hints", 5);
  } else if (r.hasPreload) {
    good("has_preload");
  }

  // Inline vs external ratio
  if (r.inlineScriptCount > 10) {
    add("many_inline", 5, { inline: r.inlineScriptCount });
  }

  score = Math.max(0, Math.min(100, score));

  let grade, summary;
  if (score >= 80) {
    grade = "A";
    summary = persona.summary_good;
  } else if (score >= 50) {
    grade = "C";
    summary = persona.summary_ok;
  } else {
    grade = "F";
    summary = persona.summary_bad;
  }

  return { persona, lines, score, grade, summary, issues };
}

module.exports = { roast };
