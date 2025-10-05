// Profile Screen with User Settings and Logout

import { useState } from 'react';
import { LogOut, User, Settings, Heart, MapPin, Clock, Bell, Shield, HelpCircle, Edit3, Camera, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileProps {
  onLogout: () => void;
}

export function Profile({ onLogout }: ProfileProps) {
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
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
    
    // Call logout callback
    onLogout();
  };

  const handleSaveProfile = () => {
    // Save profile data to localStorage
    localStorage.setItem('profile-data', JSON.stringify(profileData));
    localStorage.setItem('anonymous-mode', isAnonymous.toString());
    setIsEditing(false);
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
          <h1 className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">
            Profile
          </h1>
        </div>

        {/* User Info Card */}
        <div className="glass-card rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Profile</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl glass-light hover:scale-105 transition-smooth"
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isEditing ? 'Cancel' : 'Edit'}
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

        {/* Settings Cards */}
        <div className="space-y-4">
          {/* Notifications */}
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Get updates about venues and events</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={cn(
                  'w-12 h-6 rounded-full transition-all duration-300',
                  notifications 
                    ? 'bg-primary' 
                    : 'bg-muted-foreground/30'
                )}
              >
                <div className={cn(
                  'w-5 h-5 bg-white rounded-full transition-transform duration-300',
                  notifications ? 'translate-x-6' : 'translate-x-0.5'
                )} />
              </button>
            </div>
          </div>

          {/* Location Sharing */}
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Location Sharing</h3>
                  <p className="text-sm text-muted-foreground">Help us find nearby venues</p>
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
            className="w-full glass-card rounded-3xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-smooth border-2 border-destructive/20 hover:border-destructive/40"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-destructive">Sign Out</h3>
              <p className="text-sm text-muted-foreground">Log out of your account</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
