/**
 * Phase 1: Content Extraction Script
 *
 * Parses the 20151205012054 snapshot HTML files and produces:
 * - Markdown files for each artist (with frontmatter)
 * - Page content files (home, info, schedule)
 * - Snapshot metadata JSON
 * - Homepage grid order JSON (preserves original artist display order)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const SNAPSHOT_DIR = resolve(import.meta.dirname, '..', '20151205012054');
const OUTPUT_DIR = resolve(import.meta.dirname, '..', 'src', 'content', '2015');
const META_OUTPUT_DIR = resolve(import.meta.dirname, '..', 'src', 'data');

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
});

// Don't convert links that are just URLs displayed as text (e.g., <a href="http://x">http://x</a>)
turndown.addRule('simplifyBareLinks', {
  filter: (node) => {
    return (
      node.nodeName === 'A' &&
      node.getAttribute('href') &&
      node.textContent.trim() === node.getAttribute('href')
    );
  },
  replacement: (_content, node) => node.getAttribute('href'),
});

/**
 * Extract artist data from an individual artist page HTML
 */
function extractArtist(slug, html) {
  const $ = cheerio.load(html);

  // Artist name from post title
  const name = $('h2.post-title').first().text().trim();

  // Featured image
  const featuredImg = $('.post-media img').first().attr('src') || '';
  // Normalize image path to just filename
  const image = featuredImg.replace(/^.*\/images\//, '');

  // Bio content from .w-text-block
  const bioHtml = $('.post-content .w-text-block').first().html() || '';
  const bioMarkdown = turndown.turndown(bioHtml).trim();

  // Extract external URL (first link in bio that's not internal)
  let externalUrl = '';
  $('.post-content .w-text-block a').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.startsWith('http') && !href.includes('dayfornight')) {
      if (!externalUrl) externalUrl = href;
    }
  });

  // Category from portfolio-category-widget
  const categories = [];
  $('.portfolio-category-widget ul li a').each((_, el) => {
    categories.push($(el).text().trim());
  });

  // Published date
  const publishedRaw = $('.portfolio-meta-widget p').text().replace('Published:', '').trim();

  // Prev/Next navigation
  const prevLink = $('.prev-post a[rel="prev"]').last().attr('href') || '';
  const prevName = $('.prev-post h4 a').text().trim();
  const nextLink = $('.next-post a[rel="next"]').last().attr('href') || '';
  const nextName = $('.next-post h4 a').text().trim();

  // Extract prev/next slugs from relative links
  const prevSlug = prevLink.match(/artists\/([^/]+)\/?/)?.[1] || prevLink.replace(/^\.\.\//, '').replace(/\/$/, '') || '';
  const nextSlug = nextLink.match(/artists\/([^/]+)\/?/)?.[1] || nextLink.replace(/^\.\.\//, '').replace(/\/$/, '') || '';

  // OG image for social sharing
  const ogImage = $('meta[property="og:image"]').first().attr('content') || '';

  return {
    slug,
    name,
    image,
    externalUrl,
    categories,
    publishedDate: publishedRaw,
    prevArtist: { slug: prevSlug, name: prevName },
    nextArtist: { slug: nextSlug, name: nextName },
    bioMarkdown,
    ogImage,
  };
}

/**
 * Extract homepage grid order (preserves the original artist display order)
 */
function extractHomepageGrid(html) {
  const $ = cheerio.load(html);
  const gridItems = [];

  $('.w-portfolio-grid .w-item').each((_, el) => {
    const $el = $(el);
    const name = $el.find('figcaption h3').text().trim();
    const category = $el.find('figcaption p').text().trim();
    const image = ($el.find('img.cover-image').attr('src') || '').replace(/^.*\/images\//, '');
    const link = $el.find('figcaption > a').attr('href') || '';
    const slug = link.match(/artists\/([^/]+)\/?/)?.[1] || '';
    const cssClass = ($el.attr('class') || '').match(/c-(\w+)/)?.[1] || '';

    gridItems.push({ name, slug, category, image, cssClass });
  });

  return gridItems;
}

/**
 * Extract homepage metadata (hero, quicklinks, social text, etc.)
 */
function extractHomepageMeta(html) {
  const $ = cheerio.load(html);

  // Social links from side nav
  const socialLinks = [];
  $('#side-nav .social-icons a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const title = $(el).attr('title') || '';
    socialLinks.push({ url: href, title });
  });

  // Footer contact emails
  const footerEmails = [];
  $('#footer-widget .footer-nav a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const label = $(el).text().trim();
    footerEmails.push({ label, href });
  });

  // Navigation menu items
  const navItems = [];
  $('#vertical-nav .vertical-menu .menu-item a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const label = $(el).text().trim();
    const isExternal = $(el).attr('target') === '_blank';
    navItems.push({ label, href, isExternal });
  });

  return {
    title: 'Day For Night - light & sound collide',
    subtitle: 'DAY FOR NIGHT FESTIVAL: JOIN THE EVOLUTION OF LIGHT + SOUND',
    socialLinks,
    footerEmails,
    navItems,
    footerCopyright: 'Site contents copyright © 2015 Day For Night 2015 . All rights reserved.',
    footerSponsorImage: 'silver-eagle-distributors.png',
    heroImage: 'banner-photo-120415.jpg',
    logos: {
      main: 'DAY_FOR_NIGHT.png',
      sticky: 'DAY_FOR_NIGHT_LOGO.png',
      sideNav: 'logo.png',
      footer: 'logo-white.png',
      favicon: 'favicon-dfn.png',
    },
  };
}

/**
 * Extract info page content
 */
function extractPageContent(html, pageName) {
  const $ = cheerio.load(html);

  // The main content area
  const contentHtml = $('#content .main-content').html() || '';
  const contentMarkdown = turndown.turndown(contentHtml).trim();
  const title = $('title').text().replace(' | Day For Night', '').replace(' – | Day For Night', '').trim();

  return { title, content: contentMarkdown };
}

/**
 * Generate frontmatter YAML from object
 */
function toFrontmatter(data) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - "${item}"`);
      }
    } else if (typeof value === 'object') {
      lines.push(`${key}:`);
      for (const [k, v] of Object.entries(value)) {
        lines.push(`  ${k}: "${v}"`);
      }
    } else {
      // Escape quotes in string values
      const escaped = String(value).replace(/"/g, '\\"');
      lines.push(`${key}: "${escaped}"`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

// ─── Main Execution ──────────────────────────────────────────────────────────

console.log('Phase 1: Content Extraction for 20151205012054');
console.log('='.repeat(50));

// Create output directories
mkdirSync(join(OUTPUT_DIR, 'artists'), { recursive: true });
mkdirSync(META_OUTPUT_DIR, { recursive: true });

// ─── 1. Extract all artist pages ─────────────────────────────────────────────

const artistsDir = join(SNAPSHOT_DIR, 'index.php', 'artists');
const artistSlugs = readdirSync(artistsDir).filter((name) => {
  return existsSync(join(artistsDir, name, 'index.html'));
});

console.log(`\nFound ${artistSlugs.length} artist pages to extract`);

const artists = [];
let errors = [];

for (const slug of artistSlugs) {
  try {
    const html = readFileSync(join(artistsDir, slug, 'index.html'), 'utf-8');
    const artist = extractArtist(slug, html);
    artists.push(artist);

    // Write markdown file
    const frontmatter = toFrontmatter({
      name: artist.name,
      slug: artist.slug,
      image: artist.image,
      externalUrl: artist.externalUrl || undefined,
      categories: artist.categories,
      publishedDate: artist.publishedDate,
      prevArtist: artist.prevArtist.slug ? artist.prevArtist : undefined,
      nextArtist: artist.nextArtist.slug ? artist.nextArtist : undefined,
    });

    const mdContent = `${frontmatter}\n\n${artist.bioMarkdown}\n`;
    writeFileSync(join(OUTPUT_DIR, 'artists', `${slug}.md`), mdContent);

    console.log(`  ✓ ${artist.name} (${slug})`);
  } catch (err) {
    errors.push({ slug, error: err.message });
    console.error(`  ✗ ERROR: ${slug} — ${err.message}`);
  }
}

// ─── 2. Extract homepage grid order ──────────────────────────────────────────

console.log('\nExtracting homepage grid order...');
const homepageHtml = readFileSync(join(SNAPSHOT_DIR, 'index.html'), 'utf-8');
const gridOrder = extractHomepageGrid(homepageHtml);
console.log(`  ✓ ${gridOrder.length} artists in grid`);

// ─── 3. Extract homepage metadata ────────────────────────────────────────────

console.log('\nExtracting homepage metadata...');
const homepageMeta = extractHomepageMeta(homepageHtml);
console.log(`  ✓ Social links: ${homepageMeta.socialLinks.length}`);
console.log(`  ✓ Nav items: ${homepageMeta.navItems.length}`);
console.log(`  ✓ Footer emails: ${homepageMeta.footerEmails.length}`);

// ─── 4. Extract info & schedule pages ────────────────────────────────────────

console.log('\nExtracting auxiliary pages...');
const auxPages = {};

const infoPath = join(SNAPSHOT_DIR, 'index.php', 'info', 'index.html');
if (existsSync(infoPath)) {
  const infoHtml = readFileSync(infoPath, 'utf-8');
  auxPages.info = extractPageContent(infoHtml, 'info');
  console.log(`  ✓ Info page: "${auxPages.info.title}"`);
}

const schedulePath = join(SNAPSHOT_DIR, 'index.php', 'schedule', 'index.html');
if (existsSync(schedulePath)) {
  const scheduleHtml = readFileSync(schedulePath, 'utf-8');
  auxPages.schedule = extractPageContent(scheduleHtml, 'schedule');
  console.log(`  ✓ Schedule page: "${auxPages.schedule.title}"`);
}

// ─── 5. Write metadata files ─────────────────────────────────────────────────

console.log('\nWriting metadata files...');

const snapshotMeta = {
  snapshot: '20151205012054',
  year: 2015,
  festivalDates: 'December 19-20, 2015',
  theme: 'Flora',
  siteTitle: homepageMeta.title,
  subtitle: homepageMeta.subtitle,
  logos: homepageMeta.logos,
  socialLinks: homepageMeta.socialLinks,
  footerEmails: homepageMeta.footerEmails,
  footerCopyright: homepageMeta.footerCopyright,
  footerSponsorImage: homepageMeta.footerSponsorImage,
  heroImage: homepageMeta.heroImage,
  navItems: homepageMeta.navItems,
  gridOrder: gridOrder,
  artistCount: artists.length,
};

writeFileSync(
  join(META_OUTPUT_DIR, 'snapshot-2015.json'),
  JSON.stringify(snapshotMeta, null, 2)
);
console.log('  ✓ snapshot-2015.json');

// Write auxiliary pages as markdown
for (const [pageName, pageData] of Object.entries(auxPages)) {
  const pageMd = `---\ntitle: "${pageData.title}"\n---\n\n${pageData.content}\n`;
  writeFileSync(join(OUTPUT_DIR, `${pageName}.md`), pageMd);
  console.log(`  ✓ ${pageName}.md`);
}

// ─── 6. Summary ──────────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(50));
console.log('EXTRACTION COMPLETE');
console.log(`  Artists extracted: ${artists.length}`);
console.log(`  Grid items: ${gridOrder.length}`);
console.log(`  Aux pages: ${Object.keys(auxPages).length}`);
if (errors.length > 0) {
  console.log(`  Errors: ${errors.length}`);
  for (const { slug, error } of errors) {
    console.log(`    - ${slug}: ${error}`);
  }
}
console.log(`\nOutput: ${OUTPUT_DIR}`);
console.log(`Metadata: ${META_OUTPUT_DIR}`);
