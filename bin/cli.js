#!/usr/bin/env node

const { scan } = require("../lib/scanner");
const { roast } = require("../lib/roaster");
const { listPersonas } = require("../lib/personas");

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
};

function colorize(text, ...codes) {
  return codes.join("") + text + c.reset;
}

const args = process.argv.slice(2);
let domain = null;
let personaId = "random";
let showHelp = false;
let showList = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--help" || arg === "-h") showHelp = true;
  else if (arg === "--list" || arg === "-l") showList = true;
  else if (arg === "--persona" || arg === "-p") personaId = args[++i];
  else if (arg.startsWith("--persona=")) personaId = arg.split("=")[1];
  else if (arg === "list") showList = true;
  else if (!domain) domain = arg;
}

if (showHelp || (!domain && !showList)) {
  console.log(`
${colorize("SPEED ROAST", c.bold, c.cyan)} — Get your website's performance roasted by legendary personas

${colorize("Usage:", c.bold)}
  npx speed-roast <domain> [options]

${colorize("Options:", c.bold)}
  -p, --persona <id>   Choose persona (default: random)
  -l, --list           List all available personas
  -h, --help           Show this help

${colorize("Examples:", c.bold)}
  npx speed-roast example.com
  npx speed-roast example.com --persona trump
  npx speed-roast example.com -p dostoevsky
  npx speed-roast --list

${colorize("What it checks:", c.bold)}
  TTFB, total load time, HTML size, compression, caching,
  scripts (inline/external/third-party), stylesheets,
  redirects, resource hints (preload/preconnect/prefetch)

${colorize("26 personas available", c.dim)} — writers, tech leaders, entertainers, creators
${colorize("Powered by Citedy", c.dim)} — https://www.citedy.com
`);
  process.exit(0);
}

if (showList) {
  const personas = listPersonas();
  console.log(`\n${colorize("Available Personas (26)", c.bold, c.cyan)}\n`);

  const groups = {};
  for (const p of personas) {
    const group = getGroup(p.id);
    if (!groups[group]) groups[group] = [];
    groups[group].push(p);
  }

  for (const [group, items] of Object.entries(groups)) {
    console.log(colorize(`  ${group}`, c.bold, c.yellow));
    for (const p of items) {
      console.log(`    ${p.icon}  ${colorize(p.id, c.cyan).padEnd(30)} ${p.name}`);
    }
    console.log();
  }

  console.log(
    colorize("  Use: ", c.dim) +
      colorize("npx speed-roast example.com --persona trump", c.white) +
      "\n"
  );
  process.exit(0);
}

function getGroup(id) {
  const writers = [
    "hemingway", "proust", "orwell", "tolkien", "nabokov",
    "christie", "bulgakov", "dostoevsky", "strugatsky", "bradbury",
  ];
  const tech = ["sam_altman", "elon_musk", "jobs", "bezos"];
  const public_ = ["donald_trump"];
  const entertainment = ["tarantino", "nolan", "ryanreynolds", "keanureeves"];
  if (writers.includes(id)) return "Writers";
  if (tech.includes(id)) return "Tech Leaders";
  if (public_.includes(id)) return "Public Figures";
  if (entertainment.includes(id)) return "Entertainment";
  return "Creators";
}

async function main() {
  const bar = "\u2501".repeat(52);

  console.log(`\n${colorize(bar, c.dim)}`);
  console.log(
    colorize("  SCANNING ", c.bold, c.cyan) + colorize(domain, c.bold, c.white)
  );
  console.log(colorize(bar, c.dim));

  const scanResults = await scan(domain);

  if (scanResults.error) {
    console.log(
      `\n${colorize("  ERROR: ", c.bold, c.red)}${scanResults.error}\n`
    );
    process.exit(1);
  }

  const result = roast(scanResults, personaId);

  if (!result) {
    console.log(
      `\n${colorize("  Unknown persona: ", c.bold, c.red)}${personaId}`
    );
    console.log(colorize("  Use --list to see available personas\n", c.dim));
    process.exit(1);
  }

  const { persona, lines, score, grade, summary } = result;

  let gradeColor, gradeBg;
  if (grade === "A") {
    gradeColor = c.green;
    gradeBg = c.bgGreen;
  } else if (grade === "C") {
    gradeColor = c.yellow;
    gradeBg = c.bgYellow;
  } else {
    gradeColor = c.red;
    gradeBg = c.bgRed;
  }

  // Stats line
  const stats = [
    `TTFB: ${scanResults.ttfb}ms`,
    `Load: ${(scanResults.totalTime / 1000).toFixed(1)}s`,
    `Size: ${scanResults.htmlSize}KB`,
    `Scripts: ${scanResults.scriptCount}`,
    scanResults.hasCompression ? `Compression: ${scanResults.compressionType}` : "No compression",
  ].join(" | ");

  console.log();
  console.log(
    `  ${persona.icon}  ${colorize(persona.name + "'s Speed Roast", c.bold, c.white)}`
  );
  console.log(colorize(bar, c.dim));
  console.log(colorize(`  ${stats}`, c.dim));
  console.log();

  for (const line of lines) {
    const words = line.split(" ");
    let current = "  ";
    for (const word of words) {
      if (current.length + word.length > 72) {
        console.log(current);
        current = "  " + word;
      } else {
        current += (current.length > 2 ? " " : "") + word;
      }
    }
    if (current.length > 2) console.log(current);
    console.log();
  }

  console.log(colorize(bar, c.dim));
  console.log(
    `  Speed Score: ${colorize(` ${grade} `, c.bold, gradeBg)} ${colorize(score + "/100", c.bold, gradeColor)}`
  );
  console.log();

  const summaryWords = summary.split(" ");
  let sLine = "  ";
  for (const word of summaryWords) {
    if (sLine.length + word.length > 72) {
      console.log(colorize(sLine, c.dim));
      sLine = "  " + word;
    } else {
      sLine += (sLine.length > 2 ? " " : "") + word;
    }
  }
  if (sLine.length > 2) console.log(colorize(sLine, c.dim));

  console.log();
  console.log(colorize(bar, c.dim));
  console.log(
    `  ${colorize("Want the full analysis?", c.bold)} ${colorize("\u2192", c.cyan)} ${colorize("https://www.citedy.com", c.cyan, c.bold)}`
  );
  console.log(colorize(bar, c.dim));
  console.log();
}

main().catch((e) => {
  console.error(colorize(`\n  Error: ${e.message}\n`, c.red));
  process.exit(1);
});
