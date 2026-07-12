// Source of truth for the year-navigation pill in dayfornight-reborn.
//
// A flat, chronological list of the hosted show-year snapshots. The pill uses
// this to render the current snapshot's label plus prev/next neighbors, so the
// order here is the order visitors step through with the pill arrows.
//
// Keep this in sync with the rotation pool in `src/pages/index.astro`.

export interface SnapshotLink {
  year: number;
  edition: string;
  // Short state label: 'Splash' | 'Main' | 'Lineup' | 'Presale' | 'Recap' | …
  label: string;
  // Canonical path, always with a trailing slash (e.g. "/2016/lineup/").
  href: string;
  description: string;
}

// Ordered by the festival timeline: within a year, presale/splash precede the
// main event, which precedes the recap.
export const liveSnapshots: SnapshotLink[] = [
  {
    year: 2015,
    edition: 'Day For Night 2015',
    label: 'Splash',
    href: '/2015/splash/',
    description: 'Early 2015 splash / teaser page',
  },
  {
    year: 2015,
    edition: 'Day For Night 2015',
    label: 'Main',
    href: '/2015/',
    description: 'The inaugural 2015 edition (Flora-themed full lineup site)',
  },
  {
    year: 2015,
    edition: 'Day For Night 2015',
    label: 'Recap',
    href: '/2015/recap/',
    description: 'Post-festival 2015 recap',
  },
  {
    year: 2016,
    edition: 'Day For Night 2016',
    label: 'Presale',
    href: '/2016/',
    description: 'Spring 2016 blind-presale home page (video hero)',
  },
  {
    year: 2016,
    edition: 'Day For Night 2016',
    label: 'Lineup',
    href: '/2016/lineup/',
    description: 'Full 2016 lineup / main show site',
  },
  {
    year: 2016,
    edition: 'Day For Night 2016',
    label: 'Recap',
    href: '/2016/recap/',
    description: 'Post-festival 2016 recap',
  },
  {
    year: 2017,
    edition: 'Day For Night 2017',
    label: 'Presale',
    href: '/2017/presale/',
    description: '2017 presale state',
  },
  {
    year: 2017,
    edition: 'Day For Night 2017',
    label: 'Main',
    href: '/2017/',
    description: 'The full 2017 edition site',
  },
  {
    year: 2018,
    edition: 'Day For Night 2018',
    label: 'Main',
    href: '/2018/',
    description: 'The 2018 edition (2017 festival captured October 2018)',
  },
];

// Locate the snapshot whose href matches the current page (trailing slash
// normalized by the caller).
export function findSnapshot(currentHref: string): SnapshotLink | undefined {
  return liveSnapshots.find((entry) => entry.href === currentHref);
}

// Snapshot list neighbors for the year-pill. `currentHref` should exactly
// match an entry in liveSnapshots; otherwise the helper returns nothing.
export function adjacentSnapshots(currentHref: string): {
  prev?: SnapshotLink;
  next?: SnapshotLink;
} {
  const index = liveSnapshots.findIndex((entry) => entry.href === currentHref);
  if (index === -1) return {};
  return {
    prev: index > 0 ? liveSnapshots[index - 1] : undefined,
    next: index < liveSnapshots.length - 1 ? liveSnapshots[index + 1] : undefined,
  };
}
