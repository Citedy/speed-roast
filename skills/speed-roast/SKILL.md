# speed-roast

Website speed audit CLI that checks 15 real performance signals and delivers results as a roast from one of 26 celebrity personas.

## Usage

```bash
# Roast any website's speed with a random persona
npx speed-roast example.com

# Pick a specific persona
npx speed-roast example.com --persona musk

# List all 26 personas
npx speed-roast --list
```

## What It Checks

15 real speed signals: TTFB, total load time, HTML size, compression, cache headers, script count, inline scripts, external scripts, third-party scripts, stylesheets, images, redirects, preload hints, preconnect hints, prefetch hints.

## 26 Personas

**Writers:** Hemingway, Dostoevsky, Tolkien, Orwell, Nabokov, Bulgakov, Christie, Proust, Bradbury, Strugatsky
**Tech Leaders:** Musk, Jobs, Bezos, Altman
**Entertainment:** Tarantino, Nolan, Reynolds, Keanu
**Creators:** MrBeast, Taylor Swift, Kanye, Billie Eilish, Zendaya, Chalamet
**Public Figures:** Trump

## When to Use

- Quick speed audit of any website
- Compare competitor performance scores
- Fun way to present speed findings to clients
- Content creation — roast outputs make great social media posts

## Requirements

- Node.js 18+
- No API keys needed
- No dependencies
- Runs entirely locally
