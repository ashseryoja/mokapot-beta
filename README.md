# Terra Misu Tiramisu

An Armenian-language website concept for Terra Misu, a tiramisu café in Yerevan. Built as a small static site with responsive typography, an animated parallax hero, a filterable flavour catalogue, and accessible product details.

## Run locally

Serve the `dist` directory with any static file server. For example:

```sh
python3 -m http.server 4186 --directory dist
```

## Deploy with Vercel

Import this repository in Vercel. The project uses the `dist` directory as its static output; no build command or environment variables are required.

## Assets and content

The interface is in Armenian. Self-hosted fonts are included with their licenses: Noto Sans Armenian and Mardoto. The nine tiramisu menu photos are AI-generated illustrative assets on white backgrounds; the flavour examples are illustrative as well. Check the café's current menu and product photography before using them as factual listings.

The hero uses four transparent image layers for its scroll animation. It does not yet use 3D models. Replace those assets with a GLB/glTF renderer after configuring the model-generation API securely on a server.
