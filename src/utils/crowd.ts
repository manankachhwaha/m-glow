// Crowd Level Computation Utilities

import type { Post, CrowdLevel } from '../data/models';

export function computeCrowdLevel(posts: Post[], now: Date = new Date()): { level: CrowdLevel; score: number } {
  // Filter posts from last 90 minutes
  const ninetyMinutesAgo = new Date(now.getTime() - 90 * 60 * 1000);
  const recentPosts = posts.filter(post => 
    post.status === 'approved' && 
    new Date(post.created_at) >= ninetyMinutesAgo
  );

  if (recentPosts.length === 0) {
    return { level: 'none', score: 0 };
  }

  // Weight newer posts higher (linear decay 0.2 → 1.0)
  const weightedSum = recentPosts.reduce((sum, post) => {
    const postTime = new Date(post.created_at).getTime();
    const ageMinutes = (now.getTime() - postTime) / (1000 * 60);
    const weight = Math.max(0.2, 1.0 - (ageMinutes / 90) * 0.8);
    return sum + weight;
  }, 0);

  // Normalize based on expected max posts in window (assume 8-10 for busy venue)
  const maxPostsWindow = 8;
  const postScore = Math.min(1.0, weightedSum / maxPostsWindow);

  // Add venue popularity proxy (elegance * 0.3 + (3-price_level) * 0.1)
  // For now, use a default since we don't have venue context here
  const popularityProxy = 0.5; // Will be computed in data source with venue info

  const finalScore = 0.7 * postScore + 0.3 * popularityProxy;

  // Map to badge levels
  let level: CrowdLevel;
  if (finalScore < 0.22) {
    level = 'quiet';
  } else if (finalScore < 0.45) {
    level = 'moderate';
  } else {
    level = 'busy';
  }

  return { level, score: finalScore };
}

export function getCrowdBadgeColor(level: CrowdLevel): string {
  switch (level) {
    case 'quiet': return 'crowd-quiet';
    case 'moderate': return 'crowd-moderate';
    case 'busy': return 'crowd-busy';
    case 'none': return 'crowd-none';
  }
}

export function getCrowdBadgeText(level: CrowdLevel): string {
  switch (level) {
    case 'quiet': return 'Quiet';
    case 'moderate': return 'Moderate';
    case 'busy': return 'Busy';
    case 'none': return 'No live update';
  }
}

export function getPostAge(createdAt: string): string {
  const now = new Date();
  const postTime = new Date(createdAt);
  const diffMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function isPostLive(createdAt: string, thresholdMinutes: number = 90): boolean {
  const now = new Date();
  const postTime = new Date(createdAt);
  const diffMinutes = (now.getTime() - postTime.getTime()) / (1000 * 60);
  return diffMinutes <= thresholdMinutes;
}