/**
 * Centralized site configuration for external URLs.
 * Change SITE_DOMAIN here to update all email addresses site-wide.
 */

export const SITE_DOMAIN = 'dayfornight.dev';

/**
 * Base URL for shared assets (images, fonts, videos, CSS).
 * Currently serves from the same origin (SWA).
 * To cut over to Azure Blob Storage, change to:
 *   'https://dfnassets.z19.web.core.windows.net'
 * Or with CDN:
 *   'https://assets.dayfornight.dev'
 */
export const ASSETS_BASE_URL = '';

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/dayfornightfest',
  instagram: 'https://instagram.com/dayfornightfest/',
  twitter: 'https://twitter.com/dayfornightfest',
  spotify: 'https://open.spotify.com/playlist/5yQVK7rXvuwcna4Gx9PYVn',
};

export const CONTACT_EMAILS = {
  sponsors: `sponsors@${SITE_DOMAIN}`,
  media: `media@${SITE_DOMAIN}`,
  info: `info@${SITE_DOMAIN}`,
  vendors: `vendors@${SITE_DOMAIN}`,
};
