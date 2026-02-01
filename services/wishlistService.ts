import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Destination =
  Database['public']['Tables']['destinations']['Row']

type WishlistRow =
  Database['public']['Tables']['wishlist']['Row']

export interface WishlistItem extends WishlistRow {
  destinations: Destination
}
