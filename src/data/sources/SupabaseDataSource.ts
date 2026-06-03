import { supabase, getAnonUserId, dataUrlToBlob } from '@/lib/supabase';
import { calculateDistance } from '@/utils/time';
import { computeCrowdLevel } from '@/utils/crowd';
import type { IDataSource } from './IDataSource';
import type {
  Venue, VenueListParams, VenueDetail, Post, Message, FaqItem,
  CrowdLevelResponse, User, CreatePostRequest, CreatePostResponse, Chat,
} from '../models';

function rowToVenue(row: Record<string, unknown>, userLat = 19.076, userLng = 72.8777): Venue {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as Venue['type'],
    lat: row.lat as number,
    lng: row.lng as number,
    address: row.address as string,
    price_level: row.price_level as Venue['price_level'],
    elegance: (row.elegance as number) ?? 0.7,
    phone: row.phone as string | undefined,
    website: row.website as string | undefined,
    tz: (row.tz as string) ?? 'Asia/Kolkata',
    owner_user_id: row.owner_user_id as string | undefined,
    is_verified: (row.is_verified as boolean) ?? false,
    open_hours: row.open_hours as string | undefined,
    hero_image: (row.hero_image_url as string) ?? (row.hero_image as string) ?? undefined,
    distance: calculateDistance(userLat, userLng, row.lat as number, row.lng as number),
  };
}

function rowToPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    venue_id: row.venue_id as string,
    media_url: row.media_url as string,
    thumb_url: (row.thumb_url as string) ?? (row.media_url as string),
    media_type: (row.media_type as Post['media_type']) ?? 'image',
    created_at: row.created_at as string,
    expires_at: row.expires_at as string,
    status: (row.status as Post['status']) ?? 'approved',
    has_faces: (row.has_faces as boolean) ?? false,
    faces_blurred: (row.faces_blurred as boolean) ?? true,
    moderation_flag: (row.moderation_flag as Post['moderation_flag']) ?? 'none',
    venue: row.venue ? rowToVenue(row.venue as Record<string, unknown>) : undefined,
  };
}

export class SupabaseDataSource implements IDataSource {
  async listVenues(params: VenueListParams): Promise<Venue[]> {
    const { data, error } = await supabase.from('venues').select('*');
    if (error) throw error;

    const uLat = params.lat ?? 19.076;
    const uLng = params.lng ?? 72.8777;

    let venues = (data as Record<string, unknown>[]).map(r => rowToVenue(r, uLat, uLng));

    if (params.type) venues = venues.filter(v => v.type === params.type);
    if (params.price) venues = venues.filter(v => v.price_level === params.price);
    if (params.q) {
      const q = params.q.toLowerCase();
      venues = venues.filter(v => v.name.toLowerCase().includes(q));
    }

    // Compute crowd levels from recent posts
    const since = new Date(Date.now() - 90 * 60 * 1000).toISOString();
    const { data: recentPosts } = await supabase
      .from('posts').select('id,venue_id,created_at,status')
      .gte('created_at', since).eq('status', 'approved');

    venues = venues.map(v => {
      const vp = (recentPosts ?? []).filter((p: Record<string, unknown>) => p.venue_id === v.id);
      const { level } = computeCrowdLevel(vp.map((p: Record<string, unknown>) => ({
        id: p.id as string, venue_id: p.venue_id as string,
        media_url: '', thumb_url: '', media_type: 'image' as const,
        created_at: p.created_at as string,
        expires_at: p.created_at as string,
        status: 'approved' as const,
        has_faces: false, faces_blurred: true, moderation_flag: 'none' as const,
      })));
      return { ...v, current_crowd: level };
    });

    if (params.level) venues = venues.filter(v => v.current_crowd === params.level);
    venues.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    return venues;
  }

  async getVenue(id: string): Promise<VenueDetail> {
    const [venueRes, postsRes] = await Promise.all([
      supabase.from('venues').select('*').eq('id', id).single(),
      supabase.from('posts').select('*').eq('venue_id', id).eq('status', 'approved')
        .gte('expires_at', new Date().toISOString()).order('created_at', { ascending: false }),
    ]);
    if (venueRes.error) throw venueRes.error;

    const venue = rowToVenue(venueRes.data as Record<string, unknown>);
    const todayPosts = (postsRes.data ?? []).map(r => rowToPost(r as Record<string, unknown>));
    const { level } = computeCrowdLevel(todayPosts);

    return { venue, today_posts: todayPosts, events: [], current_crowd: level };
  }

  async listTodayPosts(venueId?: string): Promise<Post[]> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let q = supabase.from('posts').select('*, venue:venues(*)').eq('status', 'approved')
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false });
    if (venueId) q = q.eq('venue_id', venueId);

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(r => rowToPost(r as Record<string, unknown>));
  }

  async listTodayFeed(): Promise<Post[]> {
    return this.listTodayPosts();
  }

  async createOwnerPost(request: CreatePostRequest): Promise<CreatePostResponse> {
    let mediaUrl: string;

    if (typeof request.file === 'string' && request.file.startsWith('data:')) {
      const blob = await dataUrlToBlob(request.file);
      const ext = blob.type === 'image/png' ? 'png' : 'jpg';
      const path = `${request.venue_id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('post-media').upload(path, blob, { contentType: blob.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(path);
      mediaUrl = publicUrl;
    } else {
      mediaUrl = typeof request.file === 'string' ? request.file : URL.createObjectURL(request.file);
    }

    const now = new Date();
    const expires = new Date(now);
    expires.setHours(23, 59, 59, 999);

    const { data, error } = await supabase.from('posts').insert({
      venue_id: request.venue_id,
      uploader_id: getAnonUserId(),
      media_url: mediaUrl,
      thumb_url: mediaUrl,
      media_type: 'image',
      has_faces: true,
      faces_blurred: true,
      status: 'approved',
      moderation_flag: 'none',
      expires_at: expires.toISOString(),
    }).select().single();
    if (error) throw error;

    return { post_id: (data as Record<string, unknown>).id as string, status: 'approved' };
  }

  async toggleFavorite(venueId: string): Promise<boolean> {
    const userId = getAnonUserId();
    const { data: existing } = await supabase.from('favorites')
      .select('id').eq('user_id', userId).eq('venue_id', venueId).maybeSingle();

    if (existing) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('venue_id', venueId);
      return false;
    } else {
      await supabase.from('favorites').insert({ user_id: userId, venue_id: venueId });
      return true;
    }
  }

  async getFavorites(): Promise<string[]> {
    const { data } = await supabase.from('favorites')
      .select('venue_id').eq('user_id', getAnonUserId());
    return (data ?? []).map((r: Record<string, unknown>) => r.venue_id as string);
  }

  async getCrowdLevel(venueId: string): Promise<CrowdLevelResponse> {
    const posts = await this.listTodayPosts(venueId);
    const { level, score } = computeCrowdLevel(posts);
    return { level, score, last_updated: new Date().toISOString() };
  }

  async listFaq(venueId: string): Promise<FaqItem[]> {
    const { data, error } = await supabase.from('faqs').select('*').eq('venue_id', venueId);
    if (error) return [];
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      venue_id: r.venue_id as string,
      q_key: r.q_key as FaqItem['q_key'],
      question: r.question as string,
      answer: r.answer as string,
      updated_at: r.updated_at as string,
    }));
  }

  async createChat(venueId: string): Promise<string> {
    const { data, error } = await supabase.from('chats').insert({
      venue_id: venueId,
      guest_user_id: getAnonUserId(),
      status: 'open',
    }).select().single();
    if (error) throw error;
    return (data as Record<string, unknown>).id as string;
  }

  async createMessage(chatId: string, text: string): Promise<Message> {
    const { data, error } = await supabase.from('messages').insert({
      chat_id: chatId,
      sender: 'guest',
      text,
    }).select().single();
    if (error) throw error;
    const row = data as Record<string, unknown>;
    return {
      id: row.id as string,
      chat_id: row.chat_id as string,
      sender: row.sender as Message['sender'],
      text: row.text as string,
      created_at: row.created_at as string,
    };
  }

  async getMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase.from('messages')
      .select('*').eq('chat_id', chatId).order('created_at', { ascending: true });
    if (error) return [];
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      chat_id: r.chat_id as string,
      sender: r.sender as Message['sender'],
      text: r.text as string,
      created_at: r.created_at as string,
    }));
  }

  async getCurrentUser(): Promise<User | null> { return null; }
  async setCurrentUser(_user: User | null): Promise<void> {}
}
