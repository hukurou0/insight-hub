import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/auth';
import { auth } from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initAuth = async () => {
      try {
        const user = await auth.getSession();
        if (mounted) {
          setUser(user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const unsubscribe = auth.onAuthStateChange((updatedUser) => {
      if (mounted) {
        setUser(updatedUser);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const user = await auth.signIn(email, password);
      setUser(user);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'ログインに失敗しました');
      }
      throw new Error('ログインに失敗しました');
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await auth.signUp(email, password);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'アカウント作成に失敗しました');
      }
      throw new Error('アカウント作成に失敗しました');
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'ログアウトに失敗しました');
      }
      throw new Error('ログアウトに失敗しました');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}