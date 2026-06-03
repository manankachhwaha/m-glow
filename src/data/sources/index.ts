import { SupabaseDataSource } from './SupabaseDataSource';
import { MockDataSource } from './MockDataSource';
import type { IDataSource } from './IDataSource';

// Use Supabase if env vars are present, otherwise fall back to mock
const hasSupabase =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY;

export const dataSource: IDataSource = hasSupabase
  ? new SupabaseDataSource()
  : new MockDataSource();
