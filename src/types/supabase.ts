
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'checking' | 'savings' | 'credit';
          balance: number;
          goal: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: 'checking' | 'savings' | 'credit';
          balance?: number;
          goal?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: 'checking' | 'savings' | 'credit';
          balance?: number;
          goal?: number | null;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          account_id: string;
          date: string;
          amount: number;
          description: string;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          date?: string;
          amount: number;
          description: string;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          date?: string;
          amount?: number;
          description?: string;
          category?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type DbAccount = Database['public']['Tables']['accounts']['Row'];
export type DbTransaction = Database['public']['Tables']['transactions']['Row'];
