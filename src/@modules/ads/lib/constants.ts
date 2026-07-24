export const PAGE_TYPES = [
  { value: 'homePage', label: 'Home Page' },
  { value: 'recentPage', label: 'Recent Page' },
  { value: 'videoPage', label: 'Video Page' },
  { value: 'epaperPage', label: 'E-Paper Page' },
  { value: 'galleryDetailsPage', label: 'Gallery Details Page' },
  { value: 'categoryPage', label: 'Category Page' },
] as const;

export const POSITIONS_BY_PAGE = {
  homePage: [
    'Home-TopBanner',
    'Lead-Right',
    'Area-Under',
    'Mid-Banner',
    'Footer-Up-Banner',
  ],
  recentPage: [
    'Right-Sidebar',
    'Footer-Up-Banner',
  ],
  videoPage: [
    'Footer-Up-Banner',
  ],
  epaperPage: [
    'Right-sidebar-bottom',
    'Footer-Up-Banner',
  ],
  galleryDetailsPage: [
    'Footer-Up-Banner',
  ],
  categoryPage: [
    'Right-Sidebar-top',
    'Footer-Up-Banner',
  ],
} as const;

export type PageType = typeof PAGE_TYPES[number]['value'];
export type Position = typeof POSITIONS_BY_PAGE[PageType][number];
