# speed-roast

Get your website's performance roasted by 26 legendary personas — Elon Musk, Trump, Hemingway, Dostoevsky, MrBeast, Taylor Swift, and more.

```bash
npx speed-roast example.com
npx speed-roast example.com --persona trump
npx speed-roast example.com --persona dostoevsky
```

Zero dependencies. Zero config. Zero cost.

## What it checks

| # | Metric | What it measures |
|---|--------|-----------------|
| 1 | TTFB | Time to First Byte |
| 2 | Total Load Time | Full page download |
| 3 | HTML Size | Page weight in KB |
| 4 | Compression | gzip/brotli enabled? |
| 5 | Cache Headers | Cache-Control present? |
| 6 | Total Scripts | `<script>` tag count |
| 7 | Inline Scripts | Non-cacheable inline JS |
| 8 | Third-party Scripts | External domain scripts |
| 9 | Stylesheets | Render-blocking CSS files |
| 10 | Redirects | Redirect chain length |
| 11 | Resource Hints | preload/preconnect/prefetch |
| 12 | Images | Image count |

## Personas (26)

### Writers
| Persona | Flag |
|---|---|
| Ernest Hemingway | `--persona hemingway` |
| Marcel Proust | `--persona proust` |
| George Orwell | `--persona orwell` |
| J.R.R. Tolkien | `--persona tolkien` |
| Vladimir Nabokov | `--persona nabokov` |
| Agatha Christie | `--persona christie` |
| Mikhail Bulgakov | `--persona bulgakov` |
| Fyodor Dostoevsky | `--persona dostoevsky` |
| Strugatsky Brothers | `--persona strugatsky` |
| Ray Bradbury | `--persona bradbury` |

### Tech Leaders
| Persona | Flag |
|---|---|
| Elon Musk | `--persona musk` |
| Sam Altman | `--persona altman` |
| Steve Jobs | `--persona jobs` |
| Jeff Bezos | `--persona bezos` |

### Public Figures
| Persona | Flag |
|---|---|
| Donald Trump | `--persona trump` |

### Entertainment
| Persona | Flag |
|---|---|
| Quentin Tarantino | `--persona tarantino` |
| Christopher Nolan | `--persona nolan` |
| Ryan Reynolds | `--persona reynolds` |
| Keanu Reeves | `--persona keanu` |

### Creators
| Persona | Flag |
|---|---|
| MrBeast | `--persona mrbeast` |
| Taylor Swift | `--persona swift` |
| Kanye West | `--persona kanye` |
| Zendaya | `--persona zendaya` |
| Timothee Chalamet | `--persona chalamet` |
| Billie Eilish | `--persona billie` |

## Options

```
-p, --persona <id>   Choose persona (default: random)
-l, --list           List all available personas
-h, --help           Show help
```

## Examples

```bash
# Random persona
npx speed-roast competitor.com

# Specific persona
npx speed-roast mysite.com --persona tolkien

# List all personas
npx speed-roast --list
```

## How it works

1. Fetches your page with timing measurements
2. Analyzes 12 performance signals (TTFB, compression, caching, scripts, etc.)
3. Generates a roast in the selected persona's voice
4. Gives you a score from F to A

No API keys. No LLM calls. Everything runs locally with zero dependencies.

## See also

- [seo-roast](https://github.com/Citedy/seo-roast) — SEO audit with the same 26 personas

## License

MIT - [Citedy](https://www.citedy.com)
