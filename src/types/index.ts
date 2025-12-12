// Shared type definitions for MeetMe

// Template format dimensions
export const FORMAT_DIMENSIONS = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1200, height: 630 },
  portrait: { width: 1080, height: 1350 },
} as const;

export const FORMAT_DIMENSIONS_WITH_LABELS = {
  square: { width: 1080, height: 1080, label: "Square (1080x1080)" },
  story: { width: 1080, height: 1920, label: "Story (1080x1920)" },
  landscape: { width: 1200, height: 630, label: "Landscape (1200x630)" },
  portrait: { width: 1080, height: 1350, label: "Portrait (1080x1350)" },
} as const;

export const FORMAT_ASPECT_RATIOS = {
  square: "aspect-square",
  story: "aspect-[9/16]",
  landscape: "aspect-[1200/630]",
  portrait: "aspect-[4/5]",
} as const;

export type TemplateFormat = keyof typeof FORMAT_DIMENSIONS;

// Base template interface (minimum required fields for rendering)
export interface TemplateBase {
  format: string;
  image_url: string;
  photo_frame_x: number;
  photo_frame_y: number;
  photo_frame_width: number;
  photo_frame_height: number;
  placeholder_image_url?: string;
  placeholder_scale?: number;
  placeholder_x?: number;
  placeholder_y?: number;
}

// Full template interface (includes id, name, type for database records)
export interface Template extends TemplateBase {
  id: string;
  name: string;
  type: string;
}

// Event interface matching database schema
export interface EventBase {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  owner_user_id: string;
  hero_title: string;
  hero_subtitle?: string | null;
  logo_url?: string | null;
  secondary_logo_url?: string | null;
  favicon_url?: string | null;
  brand_primary_color?: string | null;
  brand_secondary_color?: string | null;
  brand_text_color?: string | null;
  homepage_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  helper_text?: string | null;
  layout_preset?: string | null;
  photo_folder_button_text?: string | null;
  photo_folder_button_url?: string | null;
  photo_folder_button_color?: string | null;
  photo_folder_button_opacity?: number | null;
}

// Caption interface
export interface Caption {
  id: string;
  caption_text: string;
}


// Analytics data interfaces
export interface DailyData {
  date: string;
  views: number;
  uploads: number;
  downloads: number;
}

export interface HourlyData {
  hour: number;
  views: number;
  uploads: number;
  downloads: number;
}

export interface WeekdayData {
  day: string;
  views: number;
  uploads: number;
  downloads: number;
}

export interface TemplateStats {
  id: string;
  name: string;
  type: string;
  views: number;
  uploads: number;
  downloads: number;
  conversion: number;
}

export interface AnalyticsStats {
  totalViews: number;
  totalUploads: number;
  totalDownloads: number;
  conversionRate: number;
}
