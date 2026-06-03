// IndexedDB persistence for owner-uploaded posts

const DB_NAME = 'crowdsphere_db';
const POSTS_STORE = 'posts';
const DB_VERSION = 1;

let _db: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (_db) return _db;
  _db = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(POSTS_STORE)) {
        const store = db.createObjectStore(POSTS_STORE, { keyPath: 'id' });
        store.createIndex('venue_id', 'venue_id', { unique: false });
        store.createIndex('created_at', 'created_at', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _db;
}

export interface PersistedPost {
  id: string;
  venue_id: string;
  media_url: string;
  created_at: string;
  expires_at: string;
}

export async function savePost(post: PersistedPost): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(POSTS_STORE, 'readwrite');
    tx.objectStore(POSTS_STORE).put(post);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadPersistedPosts(): Promise<PersistedPost[]> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(POSTS_STORE, 'readonly');
    const req = tx.objectStore(POSTS_STORE).getAll();
    req.onsuccess = () => resolve(req.result as PersistedPost[]);
    req.onerror = () => reject(req.error);
  });
}
