// Mock Data Source with Realistic Nightlife Data

import type { IDataSource } from './IDataSource';
import type {
  Venue,
  VenueListParams,
  VenueDetail,
  Post,
  Chat,
  Message,
  FaqItem,
  CreatePostRequest,
  CreatePostResponse,
  CrowdLevelResponse,
  User,
  CrowdLevel
} from '../models';
import { computeCrowdLevel } from '../../utils/crowd';
import { isToday, calculateDistance } from '../../utils/time';

// Seed data with Mumbai coordinates
const SEED_VENUES: Venue[] = [
  {
    id: 'v1',
    name: 'Skybar Lounge',
    type: 'club',
    lat: 19.0760,
    lng: 72.8777,
    address: 'BKC, Mumbai',
    price_level: 3,
    elegance: 0.9,
    phone: '+91 98765 43210',
    website: 'https://skybar.com',
    tz: 'Asia/Kolkata',
    is_verified: true,
    open_hours: 'Today 7 PM - 2 AM',
    hero_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center'
  },
  {
    id: 'v2',
    name: 'The Underground',
    type: 'club',
    lat: 19.0728,
    lng: 72.8826,
    address: 'Lower Parel, Mumbai',
    price_level: 2,
    elegance: 0.7,
    phone: '+91 98765 43211',
    tz: 'Asia/Kolkata',
    is_verified: true,
    open_hours: 'Today 8 PM - 3 AM',
    hero_image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop&crop=center'
  },
  {
    id: 'v3',
    name: 'Rooftop Republic',
    type: 'restaurant',
    lat: 19.0896,
    lng: 72.8656,
    address: 'Andheri West, Mumbai',
    price_level: 2,
    elegance: 0.8,
    phone: '+91 98765 43212',
    tz: 'Asia/Kolkata',
    is_verified: true,
    open_hours: 'Today 6 PM - 1 AM',
    hero_image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop&crop=center'
  },
  {
    id: 'v4',
    name: 'Neon Nights',
    type: 'club',
    lat: 19.0544,
    lng: 72.8320,
    address: 'Colaba, Mumbai',
    price_level: 3,
    elegance: 0.95,
    phone: '+91 98765 43213',
    tz: 'Asia/Kolkata',
    is_verified: true,
    open_hours: 'Today 9 PM - 4 AM',
    hero_image: 'https://images.unsplash.com/photo-1571266028243-d220c8b0b7b8?w=800&h=600&fit=crop&crop=center'
  },
  {
    id: 'v5',
    name: 'Social House',
    type: 'restaurant',
    lat: 19.0330,
    lng: 72.8570,
    address: 'Worli, Mumbai',
    price_level: 2,
    elegance: 0.6,
    phone: '+91 98765 43214',
    tz: 'Asia/Kolkata',
    is_verified: true,
    open_hours: 'Today 5 PM - 12 AM',
    hero_image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop&crop=center'
  },
  {
    id: 'v6',
    name: 'Electric Dreams',
    type: 'club',
    lat: 19.1197,
    lng: 72.9081,
    address: 'Powai, Mumbai',
    price_level: 2,
    elegance: 0.75,
    phone: '+91 98765 43215',
    tz: 'Asia/Kolkata',
    is_verified: true,
    open_hours: 'Today 8 PM - 2 AM',
    hero_image: 'https://images.unsplash.com/photo-1574391884720-bbc8673de6fa?w=800&h=600&fit=crop&crop=center'
  }
];

// Generate realistic recent posts
const generateRecentPosts = (): Post[] => {
  const now = new Date();
  const posts: Post[] = [];
  
  // Faces-blurred nightlife images
  const imageUrls = [
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=400&q=80', // Club with blurred faces
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80', // Concert
    'https://images.unsplash.com/photo-1571266028243-8c6f4b528d3b?w=400&q=80', // Bar scene
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&q=80', // Restaurant
    'https://images.unsplash.com/photo-1574391884720-bbc8673de6fa?w=400&q=80', // Nightlife
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80'  // Club atmosphere
  ];

  SEED_VENUES.forEach((venue, venueIndex) => {
    // Generate 2-6 posts per venue with staggered times
    const postCount = Math.floor(Math.random() * 5) + 2;
    
    for (let i = 0; i < postCount; i++) {
      const minutesAgo = Math.floor(Math.random() * 120) + 5; // 5-125 minutes ago
      const createdAt = new Date(now.getTime() - minutesAgo * 60 * 1000);
      const expiresAt = new Date(createdAt);
      expiresAt.setHours(23, 59, 59, 999); // Expires at midnight venue time
      
      const imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
      
      posts.push({
        id: `p${venueIndex + 1}_${i + 1}`,
        venue_id: venue.id,
        media_url: imageUrl,
        thumb_url: imageUrl,
        media_type: 'image',
        created_at: createdAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: 'approved',
        has_faces: true,
        faces_blurred: true,
        moderation_flag: 'none',
        venue
      });
    }
  });

  return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const SEED_POSTS = generateRecentPosts();

const SEED_FAQ: FaqItem[] = SEED_VENUES.flatMap(venue => [
  {
    id: `faq_${venue.id}_1`,
    venue_id: venue.id,
    q_key: 'PARKING',
    question: 'Is parking available?',
    answer: 'Yes, valet parking available after 7 PM. ₹200 for cars.',
    updated_at: new Date().toISOString()
  },
  {
    id: `faq_${venue.id}_2`,
    venue_id: venue.id,
    q_key: 'COVER_CHARGE',
    question: 'What are the entry charges?',
    answer: venue.price_level === 3 ? '₹1500 weekdays, ₹2500 weekends' : venue.price_level === 2 ? '₹800 weekdays, ₹1200 weekends' : 'No cover charge',
    updated_at: new Date().toISOString()
  },
  {
    id: `faq_${venue.id}_3`,
    venue_id: venue.id,
    q_key: 'HOURS',
    question: 'What are your hours?',
    answer: venue.open_hours || 'Today 6 PM - 1 AM',
    updated_at: new Date().toISOString()
  },
  {
    id: `faq_${venue.id}_4`,
    venue_id: venue.id,
    q_key: 'DRESS_CODE',
    question: 'What is the dress code?',
    answer: venue.elegance > 0.8 ? 'Smart formal - no shorts, flip-flops or sportswear' : 'Smart casual',
    updated_at: new Date().toISOString()
  },
  {
    id: `faq_${venue.id}_5`,
    venue_id: venue.id,
    q_key: 'PAYMENT',
    question: 'What payment methods do you accept?',
    answer: 'UPI, Cards, and Cash accepted',
    updated_at: new Date().toISOString()
  }
]);

export class MockDataSource implements IDataSource {
  private currentUser: User | null = null;
  private favorites: Set<string> = new Set();
  private chats: Map<string, Chat> = new Map();
  private messages: Map<string, Message[]> = new Map();

  async listVenues(params: VenueListParams): Promise<Venue[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    let venues = [...SEED_VENUES];
    
    // Apply filters
    if (params.type) {
      venues = venues.filter(v => v.type === params.type);
    }
    
    if (params.price) {
      venues = venues.filter(v => v.price_level === params.price);
    }
    
    if (params.elegance_min) {
      venues = venues.filter(v => v.elegance >= params.elegance_min);
    }
    
    if (params.q) {
      const query = params.q.toLowerCase();
      venues = venues.filter(v => v.name.toLowerCase().includes(query));
    }
    
    // Calculate distance and crowd level
    const userLat = params.lat || 19.0760;
    const userLng = params.lng || 72.8777;
    
    venues = venues.map(venue => {
      const distance = calculateDistance(userLat, userLng, venue.lat, venue.lng);
      const venuePosts = SEED_POSTS.filter(p => p.venue_id === venue.id);
      const { level } = computeCrowdLevel(venuePosts);
      
      return {
        ...venue,
        distance,
        current_crowd: level
      };
    });
    
    // Filter by crowd level
    if (params.level) {
      venues = venues.filter(v => v.current_crowd === params.level);
    }
    
    // Sort by distance
    venues.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    return venues;
  }

  async getVenue(id: string): Promise<VenueDetail> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const venue = SEED_VENUES.find(v => v.id === id);
    if (!venue) throw new Error('Venue not found');
    
    const todayPosts = SEED_POSTS.filter(p => 
      p.venue_id === id && isToday(p.created_at, venue.tz)
    );
    
    const { level } = computeCrowdLevel(todayPosts);
    
    return {
      venue,
      today_posts: todayPosts,
      events: [], // TODO: Add events
      current_crowd: level
    };
  }

  async listTodayPosts(venueId?: string): Promise<Post[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    let posts = SEED_POSTS.filter(p => 
      p.status === 'approved' && 
      new Date(p.expires_at) > new Date()
    );
    
    if (venueId) {
      posts = posts.filter(p => p.venue_id === venueId);
    }
    
    return posts;
  }

  async listTodayFeed(): Promise<Post[]> {
    return this.listTodayPosts();
  }

  async createOwnerPost(request: CreatePostRequest): Promise<CreatePostResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
    
    const postId = `new_${Date.now()}`;
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(23, 59, 59, 999);
    
    const newPost: Post = {
      id: postId,
      venue_id: request.venue_id,
      media_url: typeof request.file === 'string' ? request.file : URL.createObjectURL(request.file),
      thumb_url: typeof request.file === 'string' ? request.file : URL.createObjectURL(request.file),
      media_type: 'image',
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'approved',
      has_faces: true,
      faces_blurred: true,
      moderation_flag: 'none'
    };
    
    SEED_POSTS.unshift(newPost);
    
    return { post_id: postId, status: 'approved' };
  }

  async toggleFavorite(venueId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (this.favorites.has(venueId)) {
      this.favorites.delete(venueId);
      return false;
    } else {
      this.favorites.add(venueId);
      return true;
    }
  }

  async getFavorites(): Promise<string[]> {
    return Array.from(this.favorites);
  }

  async getCrowdLevel(venueId: string): Promise<CrowdLevelResponse> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const venuePosts = SEED_POSTS.filter(p => p.venue_id === venueId);
    const { level, score } = computeCrowdLevel(venuePosts);
    
    return {
      level,
      score,
      last_updated: new Date().toISOString()
    };
  }

  async listFaq(venueId: string): Promise<FaqItem[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return SEED_FAQ.filter(faq => faq.venue_id === venueId);
  }

  async createChat(venueId: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const chatId = `chat_${Date.now()}`;
    const chat: Chat = {
      id: chatId,
      venue_id: venueId,
      guest_user_id: this.currentUser?.id || 'guest',
      created_at: new Date().toISOString(),
      last_msg_at: new Date().toISOString(),
      status: 'open'
    };
    
    this.chats.set(chatId, chat);
    
    // Add welcome message with FAQ suggestions
    const welcomeMsg: Message = {
      id: `msg_${Date.now()}`,
      chat_id: chatId,
      sender: 'bot',
      text: 'Hi! I can help answer common questions. Try asking about parking, cover charges, hours, or dress code. For anything else, I\'ll connect you with our manager.',
      created_at: new Date().toISOString()
    };
    
    this.messages.set(chatId, [welcomeMsg]);
    
    return chatId;
  }

  async createMessage(chatId: string, text: string): Promise<Message> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userMsg: Message = {
      id: `msg_${Date.now()}_user`,
      chat_id: chatId,
      sender: 'guest',
      text,
      created_at: new Date().toISOString()
    };
    
    const messages = this.messages.get(chatId) || [];
    messages.push(userMsg);
    
    // Simple FAQ matching
    const lowerText = text.toLowerCase();
    let botResponse = '';
    
    if (lowerText.includes('parking')) {
      botResponse = 'Yes, valet parking is available after 7 PM for ₹200.';
    } else if (lowerText.includes('cover') || lowerText.includes('entry') || lowerText.includes('charge')) {
      botResponse = 'Entry charges vary by day. Weekdays are usually ₹800-1500, weekends ₹1200-2500.';
    } else if (lowerText.includes('hours') || lowerText.includes('time') || lowerText.includes('open')) {
      botResponse = 'We\'re open today from 6 PM to 1 AM. Hours may vary on weekends.';
    } else if (lowerText.includes('dress')) {
      botResponse = 'Smart casual dress code. No shorts, flip-flops, or sportswear please.';
    } else if (lowerText.includes('payment') || lowerText.includes('card') || lowerText.includes('upi')) {
      botResponse = 'We accept UPI, credit/debit cards, and cash.';
    } else {
      botResponse = 'Let me check with our manager about that. They\'ll respond shortly!';
    }
    
    const botMsg: Message = {
      id: `msg_${Date.now()}_bot`,
      chat_id: chatId,
      sender: 'bot',
      text: botResponse,
      created_at: new Date().toISOString()
    };
    
    messages.push(botMsg);
    this.messages.set(chatId, messages);
    
    return userMsg;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.messages.get(chatId) || [];
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async setCurrentUser(user: User | null): Promise<void> {
    this.currentUser = user;
  }
}