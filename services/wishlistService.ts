import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

type Destination = Database['public']['Tables']['destinations']['Row']
type WishlistRow = Database['public']['Tables']['wishlist']['Row']

export interface WishlistItem extends WishlistRow {
  destinations: Destination
}

export class WishlistService {
  // Get semua wishlist user
  static async getUserWishlist(userId: string): Promise<WishlistItem[]> {
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        *,
        destinations (*)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching wishlist:', error)
      throw error
    }
    
    // Type assertion karena Supabase return any
    return (data || []) as WishlistItem[]
  }

  // ... method lainnya tetap sama ...
}