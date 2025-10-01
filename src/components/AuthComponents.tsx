// Real Authentication Components with Proper Logos

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthButtonProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function AuthButton({ onClick, className, children }: AuthButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full py-3 px-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 active:scale-95',
        className
      )}
    >
      {children}
    </button>
  );
}

// Google Sign In Button
export function GoogleSignInButton({ onClick }: { onClick?: () => void }) {
  return (
    <AuthButton
      onClick={onClick}
      className="bg-white text-gray-900 hover:bg-gray-100 border border-gray-300 flex items-center justify-center gap-3"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </AuthButton>
  );
}

// Apple Sign In Button
export function AppleSignInButton({ onClick }: { onClick?: () => void }) {
  return (
    <AuthButton
      onClick={onClick}
      className="bg-black text-white hover:bg-gray-900 flex items-center justify-center gap-3"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.05 2.5.74 3.29.74.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
      Continue with Apple
    </AuthButton>
  );
}

// Facebook Sign In Button
export function FacebookSignInButton({ onClick }: { onClick?: () => void }) {
  return (
    <AuthButton
      onClick={onClick}
      className="bg-[#1877F2] text-white hover:bg-[#166FE5] flex items-center justify-center gap-3"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      Continue with Facebook
    </AuthButton>
  );
}

// Email/Password Form
interface EmailPasswordFormProps {
  onSubmit: (email: string, password: string) => void;
  isSignUp?: boolean;
}

export function EmailPasswordForm({ onSubmit, isSignUp = false }: EmailPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 bg-input border border-card-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-12 py-3 bg-input border border-card-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isSignUp && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 bg-input border border-card-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      <AuthButton
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/80"
      >
        {isSignUp ? 'Create Account' : 'Sign In'}
      </AuthButton>
    </form>
  );
}

// Social Login Container
interface SocialLoginProps {
  onGoogleSignIn?: () => void;
  onAppleSignIn?: () => void;
  onFacebookSignIn?: () => void;
  onEmailSignIn?: (email: string, password: string) => void;
  onEmailSignUp?: (email: string, password: string) => void;
  showEmailForm?: boolean;
  isSignUp?: boolean;
}

export function SocialLogin({
  onGoogleSignIn,
  onAppleSignIn,
  onFacebookSignIn,
  onEmailSignIn,
  onEmailSignUp,
  showEmailForm = false,
  isSignUp = false
}: SocialLoginProps) {
  return (
    <div className="space-y-4">
      {showEmailForm ? (
        <EmailPasswordForm
          onSubmit={isSignUp ? onEmailSignUp || (() => {}) : onEmailSignIn || (() => {})}
          isSignUp={isSignUp}
        />
      ) : (
        <>
          <GoogleSignInButton onClick={onGoogleSignIn} />
          <AppleSignInButton onClick={onAppleSignIn} />
          <FacebookSignInButton onClick={onFacebookSignIn} />
        </>
      )}
    </div>
  );
}


