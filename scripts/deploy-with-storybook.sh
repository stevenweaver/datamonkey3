#!/bin/bash
set -e

echo "🏗️  Building main application..."
npm run build

echo "📚 Building Storybook..."
npm run build-storybook

echo "📁 Copying Storybook to build output..."
mkdir -p .svelte-kit/cloudflare/storybook
cp -r storybook-static/* .svelte-kit/cloudflare/storybook/

echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy .svelte-kit/cloudflare

echo "✅ Deployed! Storybook available at: https://your-domain.pages.dev/storybook/"