// Profile Screen with User Settings and Logout

import { useState, useEffect } from 'react';
import { LogOut, User, Settings, Heart, MapPin, Clock, Bell, Shield, HelpCircle, Edit3, Camera, Eye, EyeOff, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileProps {
  onLogout: () => void;
}

export function Profile({ onLogout }: ProfileProps) {
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isBusinessMode, setIsBusinessMode] = useState(false);
  const [ownerVenueId, setOwnerVenueId] = useState('');
  const [availableVenues, setAvailableVenues] = useState<{ id: string; name: string }[]>([]);

  // Load settings from localStorage
  useEffect(() => {
    const savedBusinessMode = localStorage.getItem('business-mode');
    if (savedBusinessMode) setIsBusinessMode(savedBusinessMode === 'true');
    setOwnerVenueId(localStorage.getItem('owner_venue_id') || '');
  }, []);

  // Load venue list when business mode is on
  useEffect(() => {
    if (!isBusinessMode) return;
    dataSource.listVenues({ lat: 19.076, lng: 72.8777 }).then(venues => {
      setAvailableVenues(venues.map(v => ({ id: v.id, name: v.name })));
    });
  }, [isBusinessMode]);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    bio: 'Nightlife enthusiast exploring Mumbai\'s best venues',
    profileImage: null as string | null
  });

  const handleLogout = () => {
    // Clear any stored data
    localStorage.removeItem('music-enabled');
    localStorage.removeItem('user-preferences');
    localStorage.removeItem('profile-data');
    localStorage.removeItem('anonymous-mode');
    localStorage.removeItem('business-mode');
    
    // Call logout callback
    onLogout();
  };

  const handleSaveProfile = () => {
    localStorage.setItem('profile-data', JSON.stringify(profileData));
    localStorage.setItem('anonymous-mode', isAnonymous.toString());
    localStorage.setItem('business-mode', isBusinessMode.toString());
    localStorage.setItem('owner_venue_id', ownerVenueId);
    const venue = availableVenues.find(v => v.id === ownerVenueId);
    if (venue) localStorage.setItem('owner_venue_name', venue.name);
    setIsEditing(false);
  };

  const handleVenueSelect = (venueId: string) => {
    setOwnerVenueId(venueId);
    localStorage.setItem('owner_venue_id', venueId);
    const venue = availableVenues.find(v => v.id === venueId);
    if (venue) {
      localStorage.setItem('owner_venue_name', venue.name);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleBusinessModeToggle = (enabled: boolean) => {
    setIsBusinessMode(enabled);
    localStorage.setItem('business-mode', enabled.toString());
    // Trigger storage event for other components to listen
    window.dispatchEvent(new Event('storage'));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profileImage: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">
              Profile
            </h1>
        </div>

        {/* User Info Card */}
        <div className="glass-card rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Profile</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105"
            >
              <div className="w-6 h-6 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                <Edit3 className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-white font-semibold text-sm">
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </span>
            </button>
          </div>

          {isEditing ? (
            /* Edit Profile Form */
            <div className="space-y-4">
              {/* Profile Image Upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-neon flex items-center justify-center overflow-hidden">
                    {profileData.profileImage ? (
                      <img 
                        src={profileData.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-smooth">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Tap to change photo</p>
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-light border border-card-border/50 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-light border border-card-border/50 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-light border border-card-border/50 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Bio Input */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-light border border-card-border/50 focus:border-primary focus:outline-none resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveProfile}
                className="w-full py-3 rounded-xl bg-gradient-neon text-white font-semibold hover:scale-105 transition-smooth"
              >
                Save Changes
              </button>
            </div>
          ) : (
            /* Display Profile Info */
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-neon flex items-center justify-center overflow-hidden">
                {profileData.profileImage ? (
                  <img 
                    src={profileData.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{profileData.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">{profileData.email}</p>
                <p className="text-xs text-muted-foreground">{profileData.bio}</p>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Settings</h2>
          <p className="text-gray-300/80 font-medium">Manage your preferences</p>
        </div>
        
        <div className="space-y-4">
          {/* Notifications */}
          <div className="rounded-3xl p-4 bg-black/5 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all duration-300" 
               style={{ backdropFilter: 'blur(20px) saturate(180%)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 backdrop-blur-xl border border-primary/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Notifications</h3>
                  <p className="text-sm text-gray-300/70">Get updates about venues</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={cn(
                  'w-12 h-6 rounded-full transition-all duration-300',
                  'backdrop-blur-xl border border-white/10',
                  notifications 
                    ? 'bg-primary/80 shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                    : 'bg-muted-foreground/20 hover:bg-muted-foreground/30'
                )}
                style={{ backdropFilter: 'blur(20px) saturate(180%)' }}
              >
                <div className={cn(
                  'w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-lg',
                  notifications ? 'translate-x-6' : 'translate-x-0.5'
                )} />
              </button>
            </div>
          </div>

          {/* Location Sharing */}
          <div className="rounded-3xl p-4 bg-black/5 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all duration-300" 
               style={{ backdropFilter: 'blur(20px) saturate(180%)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-secondary/10 backdrop-blur-xl border border-secondary/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Location Sharing</h3>
                  <p className="text-sm text-gray-300/70">Help find nearby venues</p>
                </div>
              </div>
              <button
                onClick={() => setLocationSharing(!locationSharing)}
                className={cn(
                  'w-12 h-6 rounded-full transition-all duration-300',
                  locationSharing 
                    ? 'bg-secondary' 
                    : 'bg-muted-foreground/30'
                )}
              >
                <div className={cn(
                  'w-5 h-5 bg-white rounded-full transition-transform duration-300',
                  locationSharing ? 'translate-x-6' : 'translate-x-0.5'
                )} />
              </button>
            </div>
          </div>

          {/* Business Mode */}
          <div className="rounded-3xl p-4 bg-black/5 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all duration-300" 
               style={{ backdropFilter: 'blur(20px) saturate(180%)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-400/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Business Mode</h3>
                  <p className="text-sm text-gray-300/70">
                    {isBusinessMode 
                      ? 'Switch to business tools and venue management' 
                      : 'Enable business features for venue owners'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleBusinessModeToggle(!isBusinessMode)}
                className={cn(
                  'w-12 h-6 rounded-full transition-all duration-300 relative',
                  'backdrop-blur-xl border border-white/10',
                  isBusinessMode 
                    ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                    : 'bg-muted-foreground/20 hover:bg-muted-foreground/30'
                )}
                style={{ backdropFilter: 'blur(20px) saturate(180%)' }}
              >
                <div className={cn(
                  'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg',
                  isBusinessMode ? 'translate-x-6' : 'translate-x-0.5'
                )} />
              </button>
            </div>
            {isBusinessMode && (
              <div className="mt-3 p-3 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl border border-purple-400/10 backdrop-blur-xl space-y-3">
                <p className="text-xs text-purple-300/90">
                  Business mode active — select your venue below to link your uploads.
                </p>
                <div>
                  <label className="text-xs text-purple-300 font-medium flex items-center gap-1.5 mb-1.5">
                    <Store className="w-3.5 h-3.5" /> Your Venue
                  </label>
                  <select
                    value={ownerVenueId}
                    onChange={(e) => handleVenueSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-400/30 text-white text-sm focus:outline-none focus:border-purple-400/60"
                  >
                    <option value="">— Select your venue —</option>
                    {availableVenues.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Anonymous Chat */}
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                  {isAnonymous ? (
                    <EyeOff className="w-5 h-5 text-warning" />
                  ) : (
                    <Eye className="w-5 h-5 text-warning" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">Anonymous Chat</h3>
                  <p className="text-sm text-muted-foreground">
                    {isAnonymous 
                      ? 'Your identity is hidden in chats' 
                      : 'Your name will be visible in chats'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={cn(
                  'w-12 h-6 rounded-full transition-all duration-300',
                  isAnonymous 
                    ? 'bg-warning' 
                    : 'bg-muted-foreground/30'
                )}
              >
                <div className={cn(
                  'w-5 h-5 bg-white rounded-full transition-transform duration-300',
                  isAnonymous ? 'translate-x-6' : 'translate-x-0.5'
                )} />
              </button>
            </div>
          </div>

          {/* Favorites */}
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">My Favorites</h3>
                <p className="text-sm text-muted-foreground">View your saved venues</p>
              </div>
              <div className="text-2xl font-bold text-success">12</div>
            </div>
          </div>

          {/* Visit History */}
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Visit History</h3>
                <p className="text-sm text-muted-foreground">See where you've been</p>
              </div>
              <div className="text-2xl font-bold text-warning">8</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          {/* Settings */}
          <button className="w-full glass-card rounded-3xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-smooth">
            <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold">Settings</h3>
              <p className="text-sm text-muted-foreground">App preferences</p>
            </div>
          </button>

          {/* Privacy */}
          <button className="w-full glass-card rounded-3xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-smooth">
            <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold">Privacy & Security</h3>
              <p className="text-sm text-muted-foreground">Manage your data</p>
            </div>
          </button>

          {/* Help */}
          <button className="w-full glass-card rounded-3xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-smooth">
            <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold">Help & Support</h3>
              <p className="text-sm text-muted-foreground">Get assistance</p>
            </div>
          </button>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="group w-full rounded-3xl p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-xl border border-red-400/20 hover:border-red-400/40 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                <LogOut className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-white text-lg">Sign Out</h3>
                <p className="text-red-300/80 font-medium">Log out of your account</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
