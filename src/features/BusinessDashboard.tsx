// Business Owner Dashboard — property list + add venue + upload
import { useState, useEffect } from 'react';
import { Plus, Store, MapPin, Phone, Clock, Camera, ChevronRight, ArrowLeft, CheckCircle, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { simpleBlurFaces } from '@/utils/simpleFaceBlur';
import { MockDataSource } from '@/data/sources/MockDataSource';
import type { VenueType, PriceLevel } from '@/data/models';

const dataSource = new MockDataSource();

export interface OwnerVenue {
  id: string;
  name: string;
  type: VenueType;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  open_hours: string;
  price_level: PriceLevel;
  createdAt: string;
}

const STORAGE_KEY = 'owner_venues';

function loadOwnerVenues(): OwnerVenue[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveOwnerVenues(venues: OwnerVenue[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(venues));
}

// ── Add Venue Form ───────────────────────────────────────────────────────────

interface AddVenueFormProps {
  onSave: (venue: OwnerVenue) => void;
  onCancel: () => void;
}

function AddVenueForm({ onSave, onCancel }: AddVenueFormProps) {
  const [form, setForm] = useState({
    name: '',
    type: 'club' as VenueType,
    address: '',
    phone: '',
    open_hours: '',
    price_level: 2 as PriceLevel,
  });
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        // Default Mumbai if denied
        setCoords({ lat: 19.076, lng: 72.8777 });
        setLocating(false);
      }
    );
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.address.trim()) return;
    const venue: OwnerVenue = {
      id: `ov_${Date.now()}`,
      ...form,
      lat: coords?.lat ?? 19.076,
      lng: coords?.lng ?? 72.8777,
      createdAt: new Date().toISOString(),
    };
    onSave(venue);
  };

  const field = 'w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400/60 text-sm';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="p-2 rounded-xl bg-white/5 hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Add Property</h2>
      </div>

      <div>
        <label className="text-xs text-white/60 mb-1 block">Venue Name *</label>
        <input className={field} placeholder="e.g. Skybar Lounge" value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
      </div>

      <div>
        <label className="text-xs text-white/60 mb-1 block">Type *</label>
        <select className={field} value={form.type}
          onChange={e => setForm(p => ({ ...p, type: e.target.value as VenueType }))}>
          <option value="club">Club / Nightclub</option>
          <option value="restaurant">Restaurant / Bar</option>
          <option value="event">Event Space</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-white/60 mb-1 block">Address *</label>
        <input className={field} placeholder="e.g. BKC, Mumbai" value={form.address}
          onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
      </div>

      <div>
        <label className="text-xs text-white/60 mb-1 block">Location</label>
        <button
          onClick={detectLocation}
          disabled={locating}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-400/20 hover:border-purple-400/40 text-purple-300 text-sm transition-all"
        >
          <MapPin className="w-4 h-4" />
          {locating ? 'Detecting...' : coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)} ✓` : 'Use my current location'}
        </button>
      </div>

      <div>
        <label className="text-xs text-white/60 mb-1 block">Phone</label>
        <input className={field} placeholder="+91 98765 43210" value={form.phone}
          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
      </div>

      <div>
        <label className="text-xs text-white/60 mb-1 block">Opening Hours</label>
        <input className={field} placeholder="Today 8 PM – 3 AM" value={form.open_hours}
          onChange={e => setForm(p => ({ ...p, open_hours: e.target.value }))} />
      </div>

      <div>
        <label className="text-xs text-white/60 mb-1 block">Price Level</label>
        <div className="flex gap-2">
          {([1, 2, 3] as PriceLevel[]).map(lvl => (
            <button
              key={lvl}
              onClick={() => setForm(p => ({ ...p, price_level: lvl }))}
              className={cn(
                'flex-1 py-2 rounded-xl text-sm font-medium transition-all border',
                form.price_level === lvl
                  ? 'bg-purple-500/30 border-purple-400/50 text-white'
                  : 'bg-black/20 border-white/10 text-white/50 hover:border-white/20'
              )}
            >
              {'₹'.repeat(lvl)}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!form.name.trim() || !form.address.trim()}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold disabled:opacity-40 hover:opacity-90 transition-all mt-2"
      >
        Save Property
      </button>
    </div>
  );
}

// ── Upload Panel ─────────────────────────────────────────────────────────────

interface UploadPanelProps {
  venue: OwnerVenue;
  onClose: () => void;
}

function UploadPanel({ venue, onClose }: UploadPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blurredDataUrl, setBlurredDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [facesDetected, setFacesDetected] = useState(0);
  const inputRef = { current: null as HTMLInputElement | null };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const result = await simpleBlurFaces(file);
      setPreviewUrl(result.blurredDataUrl);
      setBlurredDataUrl(result.blurredDataUrl);
      setFacesDetected(result.facesDetected);
    } catch {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setBlurredDataUrl(url);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!blurredDataUrl) return;
    setIsProcessing(true);
    try {
      await dataSource.createOwnerPost({ venue_id: venue.id, file: blurredDataUrl });
      window.dispatchEvent(new CustomEvent('venue-post-uploaded', { detail: { venueId: venue.id } }));
      setUploadSuccess(true);
      setTimeout(onClose, 2500);
    } catch {
      alert('Upload failed — please try again');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Upload Photo</h2>
          <p className="text-sm text-purple-300">{venue.name}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <input
        ref={(el) => { inputRef.current = el; }}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {!previewUrl ? (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
          className="w-full p-10 border-2 border-dashed border-slate-600 hover:border-purple-500 rounded-2xl text-center transition-colors"
        >
          {isProcessing ? (
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
          ) : (
            <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          )}
          <p className="text-white font-medium">{isProcessing ? 'Detecting faces...' : 'Take Photo'}</p>
          <p className="text-slate-400 text-sm">Camera only • faces auto-blurred</p>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <img src={previewUrl} alt="Preview" className="w-full h-56 object-cover rounded-2xl" />
            <button onClick={() => { setPreviewUrl(null); setBlurredDataUrl(null); }}
              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {facesDetected > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-300 bg-green-500/10 border border-green-400/20 rounded-xl px-3 py-2">
              <CheckCircle className="w-4 h-4" />
              {facesDetected} face{facesDetected > 1 ? 's' : ''} blurred
            </div>
          )}

          {uploadSuccess ? (
            <div className="flex items-center gap-2 text-sm text-green-300 bg-green-500/10 border border-green-400/20 rounded-xl px-3 py-2">
              <CheckCircle className="w-4 h-4" /> Uploaded! Appearing on home screen…
            </div>
          ) : (
            <button onClick={handleUpload} disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {isProcessing
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
                : <><Upload className="w-4 h-4" /> Post to {venue.name}</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

type View = 'list' | 'add' | 'upload';

interface BusinessDashboardProps {
  onBack?: () => void;
}

export function BusinessDashboard({ onBack }: BusinessDashboardProps) {
  const [venues, setVenues] = useState<OwnerVenue[]>([]);
  const [view, setView] = useState<View>('list');
  const [selectedVenue, setSelectedVenue] = useState<OwnerVenue | null>(null);

  useEffect(() => {
    setVenues(loadOwnerVenues());
  }, []);

  const handleAddVenue = (venue: OwnerVenue) => {
    const updated = [...venues, venue];
    setVenues(updated);
    saveOwnerVenues(updated);
    setView('list');
  };

  const handleSelectVenue = (venue: OwnerVenue) => {
    setSelectedVenue(venue);
    setView('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-4">
      <div className="max-w-2xl mx-auto">

        {view === 'add' && (
          <AddVenueForm onSave={handleAddVenue} onCancel={() => setView('list')} />
        )}

        {view === 'upload' && selectedVenue && (
          <UploadPanel venue={selectedVenue} onClose={() => setView('list')} />
        )}

        {view === 'list' && (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              {onBack && (
                <button onClick={onBack} className="p-2 rounded-xl bg-white/5 hover:bg-white/10">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">My Properties</h1>
                <p className="text-sm text-white/50">{venues.length} venue{venues.length !== 1 ? 's' : ''} linked</p>
              </div>
            </div>

            {/* Venue list */}
            {venues.length === 0 ? (
              <div className="text-center py-16">
                <Store className="w-14 h-14 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 mb-1">No properties yet</p>
                <p className="text-white/40 text-sm">Add your first venue to start uploading</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {venues.map(venue => (
                  <button
                    key={venue.id}
                    onClick={() => handleSelectVenue(venue)}
                    className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 hover:bg-purple-500/10 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                          <Store className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{venue.name}</p>
                          <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{venue.address}</span>
                            {venue.open_hours && (
                              <>
                                <span>·</span>
                                <Clock className="w-3 h-3" />
                                <span>{venue.open_hours}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full capitalize">{venue.type}</span>
                        <ChevronRight className="w-4 h-4 text-white/30" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Add property button */}
            <button
              onClick={() => setView('add')}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-purple-400/30 hover:border-purple-400/60 text-purple-300 hover:text-purple-200 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Property
            </button>

            <p className="text-center text-xs text-white/30 mt-4">
              Tap a venue to upload a photo to its live feed
            </p>
          </>
        )}
      </div>
    </div>
  );
}
