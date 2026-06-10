// Self-contained demo content used when BACKEND_READY is false so the app
// renders a believable experience offline (and for App Store screenshots).

export type FeedPost = {
  id: string;
  author: string;
  initials: string;
  time: string;
  body: string;
  likes: number;
  comments: number;
  tag: string;
};

export type AppNotification = {
  id: string;
  icon: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
};

export const FEED: FeedPost[] = [
  {
    id: '1',
    author: 'Marcus J.',
    initials: 'MJ',
    time: '12m',
    body: 'Six months out and just signed the lease on my own place. To anyone still inside counting days — it gets real out here. Keep your head up.',
    likes: 142,
    comments: 28,
    tag: 'Milestone',
  },
  {
    id: '2',
    author: 'Alicia R.',
    initials: 'AR',
    time: '1h',
    body: 'Fresh Start Kitchens is hiring line cooks, no questions about your record. DM me and I’ll connect you with the manager directly.',
    likes: 89,
    comments: 41,
    tag: 'Opportunity',
  },
  {
    id: '3',
    author: 'Devon W.',
    initials: 'DW',
    time: '3h',
    body: 'Parole check-in went smooth today. Pro tip: show up 15 minutes early and bring every document twice. Preparation is respect.',
    likes: 67,
    comments: 12,
    tag: 'Resources',
  },
  {
    id: '4',
    author: 'Keisha M.',
    initials: 'KM',
    time: '5h',
    body: 'Posted a new guide on expungement in the Resources tab — walks through the paperwork step by step. We rise by lifting each other.',
    likes: 203,
    comments: 54,
    tag: 'Guide',
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: '1', icon: '🤝', title: 'New connection', detail: 'Devon W. connected with you', time: '8m', unread: true },
  { id: '2', icon: '💼', title: 'Job match', detail: '3 new roles match your profile', time: '40m', unread: true },
  { id: '3', icon: '❤️', title: 'Respect received', detail: 'Alicia R. and 11 others backed your post', time: '2h', unread: false },
  { id: '4', icon: '📅', title: 'Reminder', detail: 'Parole check-in Thursday, 9:00 AM', time: '1d', unread: false },
  { id: '5', icon: '✦', title: 'Welcome to New Horizon', detail: 'Your fresh start begins today', time: '2d', unread: false },
];

export const STATS = [
  { label: 'Connections', value: '12' },
  { label: 'Day Streak', value: '34' },
  { label: 'Respect', value: '418' },
];

export const JOURNEY = [
  { icon: '💼', title: 'Find Work', detail: '6 felony-friendly roles near you', accent: 'gold' as const },
  { icon: '🏠', title: 'Housing Help', detail: 'Second-chance rentals & shelters', accent: 'info' as const },
  { icon: '📊', title: 'Sentence Calculator', detail: 'Estimate your release timeline', accent: 'success' as const },
  { icon: '🧠', title: 'Mental Health', detail: 'Free counseling & crisis support', accent: 'rose' as const },
];
