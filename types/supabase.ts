// Types untuk Supabase response
export type Database = {
  public: {
    Tables: {
      destinations: {
        Row: {
          id: string;
          name: string;
          description: string;
          location: string;
          latitude: number | null;
          longitude: number | null;
          category: string;
          image_url: string | null;
          price: number;
          rating: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          location: string;
          latitude?: number | null;
          longitude?: number | null;
          category: string;
          image_url?: string | null;
          price: number;
          rating?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          location?: string;
          latitude?: number | null;
          longitude?: number | null;
          category?: string;
          image_url?: string | null;
          price?: number;
          rating?: number;
          created_at?: string;
        };
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          destination_id: string;
          added_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          destination_id: string;
          added_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          destination_id?: string;
          added_at?: string;
          notes?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};