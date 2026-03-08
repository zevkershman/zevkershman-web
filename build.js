#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// Inject build date into sitemap
const sitemapPath = path.resolve(__dirname, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  sitemap = sitemap.replace('__BUILD_DATE__', today);
  fs.writeFileSync(sitemapPath, sitemap);
  console.log('✓ sitemap.xml updated with date:', today);
}

// Inject Web3Forms key if env var exists
const indexPath = path.resolve(__dirname, 'index.html');
if (fs.existsSync(indexPath) && process.env.WEB3FORMS_KEY) {
  let html = fs.readFileSync(indexPath, 'utf8');
  html = html.replace('YOUR_WEB3FORMS_KEY', process.env.WEB3FORMS_KEY);
  fs.writeFileSync(indexPath, html);
  console.log('✓ Web3Forms key injected');
}

console.log('✓ Build complete');
