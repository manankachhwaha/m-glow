// CrowdSphere Data Models

export type UserRole = 'guest' | 'venue_owner' | 'admin';

export interface User {
  id: string;
  email: string;
  display_name: string;
  photo_url?: string;
  role: UserRole;
  created_at: string;
}

export type VenueType = 'club' | 'restaurant' | 'event';
export type PriceLevel = 1 | 2 | 3;
export type CrowdLevel = 'quiet' | 'moderate' | 'busy' | 'none';

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  lat: number;
  lng: number;
  address: string;
  price_level: PriceLevel;
  elegance: number; // 0.0 to 1.0
  phone?: string;
  website?: string;
  tz: string; // IANA timezone
  owner_user_id?: string;
  is_verified: boolean;
  open_hours?: string; // JSON string for MVP
  current_crowd?: CrowdLevel;
  distance?: number; // computed
}

export type MediaType = 'image' | 'video';
export type PostStatus = 'approved' | 'pending' | 'rejected';
export type ModerationFlag = 'none' | 'nsfw' | 'other';

export interface Post {
  id: string;
  venue_id: string;
  media_url: string;
  thumb_url: string;
  media_type: MediaType;
  created_at: string; // UTC ISO
  expires_at: string; // UTC ISO
  status: PostStatus;
  has_faces: boolean;
  faces_blurred: boolean;
  moderation_flag: ModerationFlag;
  venue?: Venue; // populated in feeds
}

export interface Favorite {
  user_id: string;
  venue_id: string;
  created_at: string;
}

export interface Event {
  id: string;
  venue_id: string;
  title: string;
  start_at: string; // UTC ISO
  end_at: string; // UTC ISO
  desc: string;
}

export type ChatStatus = 'open' | 'closed';

export interface Chat {
  id: string;
  venue_id: string;
  guest_user_id: string;
  created_at: string;
  last_msg_at: string;
  status: ChatStatus;
}

export type MessageSender = 'guest' | 'owner' | 'bot';

export interface Message {
  id: string;
  chat_id: string;
  sender: MessageSender;
  text: string;
  created_at: string;
}

export type FaqKey = 'PARKING' | 'COVER_CHARGE' | 'HOURS' | 'DRESS_CODE' | 'FAMILY_FRIENDLY' | 'VEG_OPTIONS' | 'PAYMENT';

export interface FaqItem {
  id: string;
  venue_id: string;
  q_key: FaqKey;
  question: string;
  answer: string;
  updated_at: string;
}

export interface CrowdSnapshot {
  id: string;
  venue_id: string;
  level: CrowdLevel;
  score: number; // 0.0 to 1.0
  at: string; // UTC ISO
}

// API Request/Response types
export interface VenueListParams {
  lat?: number;
  lng?: number;
  radius_km?: number;
  level?: CrowdLevel;
  type?: VenueType;
  price?: PriceLevel;
  elegance_min?: number;
  q?: string;
}

export interface VenueDetail {
  venue: Venue;
  today_posts: Post[];
  events: Event[];
  current_crowd: CrowdLevel;
}

export interface CreatePostRequest {
  venue_id: string;
  file: File | string; // File or URL
}

export interface CreatePostResponse {
  post_id: string;
  status: PostStatus;
}

export interface CrowdLevelResponse {
  level: CrowdLevel;
  score: number;
  last_updated: string;
}