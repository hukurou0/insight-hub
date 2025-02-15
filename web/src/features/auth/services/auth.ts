import { User } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('Missing API environment variables');
}

export const auth = {
  async getSession(): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/api/auth/session`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        const error = await response.json();
        throw new Error(error.detail || 'セッションの取得に失敗しました');
      }

      const data = await response.json();
      return {
        id: data.id,
        email: data.email,
      };
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  async signIn(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'ログインに失敗しました');
    }

    const data = await response.json();
    return {
      id: data.id,
      email: data.email,
    };
  },

  async signUp(email: string, password: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'アカウント作成に失敗しました');
    }
  },

  async signOut(): Promise<void> {
    const response = await fetch(`${API_URL}/api/auth/signout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'ログアウトに失敗しました');
    }
  },

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    // Since we can't use WebSocket or real-time updates with REST API,
    // we'll poll the session endpoint every minute to check for changes
    const interval = setInterval(async () => {
      try {
        const user = await this.getSession();
        callback(user);
      } catch (error) {
        console.error('Error checking auth state:', error);
        callback(null);
      }
    }, 60000);

    // Initial check
    this.getSession().then(callback);

    return () => clearInterval(interval);
  },
};