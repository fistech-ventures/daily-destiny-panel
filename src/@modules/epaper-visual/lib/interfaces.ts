
export interface HotspotCoordinates {
  x: number; // 0-1 percentage
  y: number; // 0-1 percentage
  width: number; // 0-1 percentage
  height: number; // 0-1 percentage
}

export interface Hotspot {
  id: string;
  pageId: string;
  title: string | null;
  coordinates: HotspotCoordinates;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IEpaperVisualPage {
  id: string;
  editionId: string;
  pageNumber: number;
  imageUrl: string;
  hotspots: Hotspot[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Edition {
  id: string;
  isActive: boolean;
  publishDate: string; // ISO date
  status: 'draft' | 'published';
  pages: IEpaperVisualPage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEditionPayload {
  publishDate: string;
  status?: 'draft' | 'published';
}

export interface CreatePagePayload {
  pageNumber: number;
  imageUrl: string;
}

export interface SaveHotspotsPayload {
  pageId: string;
  hotspots: {
    title?: string;
    coordinates: HotspotCoordinates;
  }[];
}

export interface IEditionsFilter {
  status?: string;
  publishDate?: string;
  page?: number;
  limit?: number;
}
