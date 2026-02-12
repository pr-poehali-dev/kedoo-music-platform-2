const API_URLS = {
  auth: 'https://functions.poehali.dev/7255614f-e5e1-4591-b4cb-6d2f9ec79fe9',
  releases: 'https://functions.poehali.dev/ea735cc3-975b-4145-b478-0f741a8549a9',
  tickets: 'https://functions.poehali.dev/90e9cc69-808e-474f-9212-99358394ac20',
  smartlinks: 'https://functions.poehali.dev/1b0240ee-799b-4d68-9df1-dfe1ee4dc606',
  studio: 'https://functions.poehali.dev/6740f311-8715-475c-8c47-261ac5b85d75',
};

export interface User {
  id: number;
  email: string;
  username: string;
  role: 'user' | 'moderator';
  theme: string;
}

export interface Release {
  id: number;
  user_id: number;
  album_name: string;
  artists: string;
  cover_url?: string;
  upc?: string;
  old_release_date?: string;
  is_rerelease: boolean;
  status: 'draft' | 'on_moderation' | 'accepted' | 'rejected';
  rejection_reason?: string;
  tracks?: Track[];
  created_at: string;
  updated_at: string;
}

export interface Track {
  id?: number;
  track_name: string;
  artists: string;
  audio_url?: string;
  isrc?: string;
  version: string;
  musicians?: string;
  lyricists?: string;
  tiktok_moment?: string;
  has_explicit: boolean;
  has_lyrics: boolean;
  language?: string;
  lyrics?: string;
  track_order?: number;
}

export interface Smartlink {
  id: number;
  user_id: number;
  release_name: string;
  artists: string;
  cover_url?: string;
  upc?: string;
  status: 'draft' | 'on_moderation' | 'accepted' | 'rejected';
  rejection_reason?: string;
  smartlink_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PromoRelease {
  id: number;
  user_id: number;
  upc: string;
  release_description?: string;
  key_track_isrc?: string;
  key_track_name?: string;
  key_track_description?: string;
  artists?: string;
  smartlink_url?: string;
  status: 'on_moderation' | 'accepted' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: number;
  user_id: number;
  video_url?: string;
  video_name: string;
  artist_name: string;
  cover_url?: string;
  status: 'on_moderation' | 'accepted' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformAccount {
  id: number;
  user_id: number;
  platform: 'yandex_music' | 'vk_music' | 'spotify' | 'apple_music' | 'youtube_music';
  artist_description?: string;
  latest_release_upc?: string;
  upcoming_release_upc?: string;
  artist_photo_url?: string;
  artist_video_url?: string;
  links?: Record<string, string>;
  youtube_channel_url?: string;
  youtube_artist_card_url?: string;
  status: 'on_moderation' | 'accepted' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: number;
  user_id: number;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  moderator_response?: string;
  created_at: string;
  updated_at: string;
}

async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const authAPI = {
  register: async (email: string, username: string, password: string) => {
    return apiRequest(API_URLS.auth, {
      method: 'POST',
      body: JSON.stringify({ action: 'register', email, username, password }),
    });
  },

  login: async (email: string, password: string) => {
    return apiRequest(API_URLS.auth, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email, password }),
    });
  },

  updateProfile: async (user_id: number, email?: string, password?: string) => {
    return apiRequest(API_URLS.auth, {
      method: 'POST',
      body: JSON.stringify({ action: 'update_profile', user_id, email, password }),
    });
  },

  updateTheme: async (user_id: number, theme: string) => {
    return apiRequest(API_URLS.auth, {
      method: 'POST',
      body: JSON.stringify({ action: 'update_theme', user_id, theme }),
    });
  },
};

export const releasesAPI = {
  getAll: async (user_id?: number, status?: string) => {
    const params = new URLSearchParams();
    if (user_id) params.append('user_id', user_id.toString());
    if (status) params.append('status', status);
    
    return apiRequest(`${API_URLS.releases}?${params.toString()}`);
  },

  getById: async (release_id: number) => {
    return apiRequest(`${API_URLS.releases}?release_id=${release_id}`);
  },

  create: async (releaseData: Partial<Release>) => {
    return apiRequest(API_URLS.releases, {
      method: 'POST',
      body: JSON.stringify(releaseData),
    });
  },

  update: async (release_id: number, releaseData: Partial<Release>) => {
    return apiRequest(API_URLS.releases, {
      method: 'PUT',
      body: JSON.stringify({ release_id, ...releaseData }),
    });
  },
};

export const ticketsAPI = {
  getAll: async (user_id?: number, status?: string) => {
    const params = new URLSearchParams();
    if (user_id) params.append('user_id', user_id.toString());
    if (status) params.append('status', status);
    
    return apiRequest(`${API_URLS.tickets}?${params.toString()}`);
  },

  getById: async (ticket_id: number) => {
    return apiRequest(`${API_URLS.tickets}?ticket_id=${ticket_id}`);
  },

  create: async (user_id: number, subject: string, message: string) => {
    return apiRequest(API_URLS.tickets, {
      method: 'POST',
      body: JSON.stringify({ user_id, subject, message }),
    });
  },

  update: async (ticket_id: number, status?: string, moderator_response?: string) => {
    return apiRequest(API_URLS.tickets, {
      method: 'PUT',
      body: JSON.stringify({ ticket_id, status, moderator_response }),
    });
  },
};

export const smartlinksAPI = {
  getAll: async (user_id?: number, status?: string) => {
    const params = new URLSearchParams();
    if (user_id) params.append('user_id', user_id.toString());
    if (status) params.append('status', status);
    
    return apiRequest(`${API_URLS.smartlinks}?${params.toString()}`);
  },

  getById: async (smartlink_id: number) => {
    return apiRequest(`${API_URLS.smartlinks}?smartlink_id=${smartlink_id}`);
  },

  create: async (data: Partial<Smartlink>) => {
    return apiRequest(API_URLS.smartlinks, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (smartlink_id: number, data: Partial<Smartlink>) => {
    return apiRequest(API_URLS.smartlinks, {
      method: 'PUT',
      body: JSON.stringify({ smartlink_id, ...data }),
    });
  },
};

export const studioAPI = {
  promo: {
    getAll: async (user_id?: number, status?: string) => {
      const params = new URLSearchParams({ type: 'promo' });
      if (user_id) params.append('user_id', user_id.toString());
      if (status) params.append('status', status);
      
      return apiRequest(`${API_URLS.studio}?${params.toString()}`);
    },

    create: async (data: Partial<PromoRelease>) => {
      return apiRequest(`${API_URLS.studio}?type=promo`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: Partial<PromoRelease>) => {
      return apiRequest(`${API_URLS.studio}?type=promo`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      });
    },
  },

  video: {
    getAll: async (user_id?: number, status?: string) => {
      const params = new URLSearchParams({ type: 'video' });
      if (user_id) params.append('user_id', user_id.toString());
      if (status) params.append('status', status);
      
      return apiRequest(`${API_URLS.studio}?${params.toString()}`);
    },

    create: async (data: Partial<Video>) => {
      return apiRequest(`${API_URLS.studio}?type=video`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: Partial<Video>) => {
      return apiRequest(`${API_URLS.studio}?type=video`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      });
    },
  },

  platform: {
    getAll: async (user_id?: number, status?: string) => {
      const params = new URLSearchParams({ type: 'platform' });
      if (user_id) params.append('user_id', user_id.toString());
      if (status) params.append('status', status);
      
      return apiRequest(`${API_URLS.studio}?${params.toString()}`);
    },

    create: async (data: Partial<PlatformAccount>) => {
      return apiRequest(`${API_URLS.studio}?type=platform`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: Partial<PlatformAccount>) => {
      return apiRequest(`${API_URLS.studio}?type=platform`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      });
    },
  },
};