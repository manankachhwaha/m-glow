import { SupabaseDataSource } from './SupabaseDataSource';
import { MockDataSource } from './MockDataSource';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { IDataSource } from './IDataSource';

export const dataSource: IDataSource = isSupabaseConfigured
  ? new SupabaseDataSource()
  : new MockDataSource();
