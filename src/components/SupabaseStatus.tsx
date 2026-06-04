// Shows a small connection status badge — remove once Supabase is confirmed working
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export function SupabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'no-config'>('checking');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('no-config');
      setDetail('No env vars found');
      return;
    }

    supabase
      .from('venues')
      .select('id', { count: 'exact', head: true })
      .then(({ error, count }) => {
        if (error) {
          setStatus('error');
          setDetail(error.message);
        } else {
          setStatus('connected');
          setDetail(`${count ?? 0} venues in DB`);
        }
      });
  }, []);

  const colours = {
    checking:  'bg-yellow-500',
    connected: 'bg-green-500',
    error:     'bg-red-500',
    'no-config': 'bg-gray-500',
  };

  const labels = {
    checking:  '⏳ Connecting…',
    connected: '✅ Supabase',
    error:     '❌ Supabase error',
    'no-config': '⚠️ No Supabase config',
  };

  return (
    <div className="fixed top-16 left-3 z-50 flex flex-col gap-1 pointer-events-none">
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-medium shadow ${colours[status]}`}>
        {labels[status]}
      </div>
      {detail && (
        <div className="px-2.5 py-1 rounded-full bg-black/60 text-white/80 text-xs">
          {detail}
        </div>
      )}
    </div>
  );
}
