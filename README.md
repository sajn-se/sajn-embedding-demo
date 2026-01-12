# @sajn/embed-react Demo

A demo page for the [@sajn/embed-react](https://www.npmjs.com/package/@sajn/embed-react) package, showcasing how to embed sajn document signing and viewing components in your React application.

## About sajn

[sajn](https://sajn.se) is a document signing platform. This demo showcases the React embedding components that allow you to integrate sajn's signing and viewing experience directly into your application.

## Documentation

For full documentation on the embedding components, visit: [docs.sajn.se/guides/embedding-react](https://docs.sajn.se/guides/embedding-react)

## Features

- Toggle between `EmbedSignDocument` and `EmbedViewDocument` components
- Configure all available props (language, host, scroll indicator, document rejection)
- Theme customization via CSS variables
- Preview in inline panel or dialog modal
- Event log showing callback events
- All settings persisted in URL for easy sharing

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

## URL Parameters

All configuration is stored in the URL, making it easy to share specific configurations:

| Parameter | Description |
|-----------|-------------|
| `documentId` | Document identifier |
| `token` | Signer authentication token |
| `mode` | `sign` or `view` |
| `language` | `sv`, `en`, `no`, `da`, `fi`, `de`, `is`, `es`, `fr`, `it` |
| `host` | Custom API host (optional) |
| `scrollIndicator` | Show scroll hint (`true`/`false`) |
| `allowRejection` | Enable document rejection (`true`/`false`) |
| `bg` | Background color |
| `primary` | Primary color |
| `fg` | Foreground color |
| `muted` | Muted foreground color |

## License

MIT
