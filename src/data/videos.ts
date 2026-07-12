// Local-video drop-in support for archived Vimeo embeds.
//
// Several archived pages embed festival videos from player.vimeo.com. Those
// source videos are now private/removed, so the embeds no longer play. To
// restore one, download the source video and drop it in as:
//
//     public/shared-assets/<year>/videos/vimeo-<vimeoId>.mp4
//
// On the next build, the helper below detects the file and swaps the dead
// iframe for a native <video> pointing at the local copy. Until then, the
// original iframe is left untouched (no visual change), so this is a safe,
// zero-regression drop-in mechanism.

import fs from 'node:fs';
import path from 'node:path';

/** Absolute-from-root URL to a local video file, or null if it isn't present. */
export function localVideo(year: string | number, vimeoId: string): string | null {
  const rel = `shared-assets/${year}/videos/vimeo-${vimeoId}.mp4`;
  const abs = path.join(process.cwd(), 'public', rel);
  return fs.existsSync(abs) ? `/${rel}` : null;
}

interface VideoTagOpts {
  local: string;
  poster?: string;
  background?: boolean;
}

/** <video> markup for a recovered local file. */
export function localVideoTag({ local, poster, background = false }: VideoTagOpts): string {
  const behavior = background
    ? 'autoplay loop muted playsinline preload="metadata"'
    : 'controls playsinline preload="none"';
  const posterAttr = poster ? ` poster="${poster}"` : '';
  const fill = 'style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border:0;"';
  return `<video class="dfn-local-video"${posterAttr} ${fill} ${behavior}><source src="${local}" type="video/mp4"></video>`;
}

/**
 * Rewrite an injected HTML string: any <iframe> pointing at
 * player.vimeo.com/video/<id> is replaced with a local <video> when the file
 * exists. Iframes without a local file are returned unchanged.
 */
export function swapVimeoIframes(html: string, year: string | number, background = true): string {
  return html.replace(
    /<iframe\b[^>]*player\.vimeo\.com\/video\/(\d+)[^>]*><\/iframe>/gi,
    (match, id: string) => {
      const local = localVideo(year, id);
      return local ? localVideoTag({ local, background }) : match;
    },
  );
}
