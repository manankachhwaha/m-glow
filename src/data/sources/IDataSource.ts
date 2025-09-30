// Data Source Interface for CrowdSphere

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
  User
} from '../models';

export interface IDataSource {
  // Venues
  listVenues(params: VenueListParams): Promise<Venue[]>;
  getVenue(id: string): Promise<VenueDetail>;
  
  // Posts
  listTodayPosts(venueId?: string): Promise<Post[]>;
  listTodayFeed(): Promise<Post[]>;
  createOwnerPost(request: CreatePostRequest): Promise<CreatePostResponse>;
  
  // Favorites
  toggleFavorite(venueId: string): Promise<boolean>; // returns new state
  getFavorites(): Promise<string[]>; // venue IDs
  
  // Crowd
  getCrowdLevel(venueId: string): Promise<CrowdLevelResponse>;
  
  // Chat & FAQ
  listFaq(venueId: string): Promise<FaqItem[]>;
  createChat(venueId: string): Promise<string>; // returns chat ID
  createMessage(chatId: string, text: string): Promise<Message>;
  getMessages(chatId: string): Promise<Message[]>;
  
  // Auth & Users
  getCurrentUser(): Promise<User | null>;
  setCurrentUser(user: User | null): Promise<void>;
}