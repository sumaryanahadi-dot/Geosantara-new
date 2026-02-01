import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper untuk format response
interface DestinationResponse {
  id: string;
  name: string;
  location: string;
  price: number;
  image_url: string | null;
  category: string;
  rating: number;
  description: string;
}

interface WishlistResponse {
  id: string;
  destination_id: string;
  added_at: string;
  notes: string | null;
  destinations: DestinationResponse | DestinationResponse[];
}

// GET: Untuk kompatibilitas dengan kode lama
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    
    // Jika ada user_id di query, gunakan itu
    if (user_id) {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          destination_id,
          added_at,
          notes,
          destinations (
            id,
            name,
            location,
            price,
            image_url,
            category,
            rating,
            description
          )
        `)
        .eq('user_id', user_id)
        .order('added_at', { ascending: false });

      if (error) throw error;

      // Type assertion
      const wishlistData = data as WishlistResponse[] | null;
      
      // Format untuk kompatibilitas
      const formattedData = wishlistData?.map(item => {
        // Handle array vs single object
        const destination = Array.isArray(item.destinations) 
          ? item.destinations[0] 
          : item.destinations;
          
        return {
          id: item.id,
          destinasi: {
            id: item.destination_id,
            title: destination?.name || '',
            location: destination?.location || '',
            price: destination?.price?.toString() || '0',
            image: destination?.image_url || '/default-destination.jpg'
          }
        };
      }) || [];

      return NextResponse.json(formattedData);
    }

    // Jika tidak ada user_id, coba dari session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        id,
        destination_id,
        added_at,
        notes,
        destinations (
          id,
          name,
          location,
          price,
          image_url,
          category,
          rating,
          description
        )
      `)
      .eq('user_id', session.user.id)
      .order('added_at', { ascending: false });

    if (error) throw error;

    // Type assertion
    const wishlistData = data as WishlistResponse[] | null;
    
    // Format untuk kompatibilitas
    const formattedData = wishlistData?.map(item => {
      const destination = Array.isArray(item.destinations) 
        ? item.destinations[0] 
        : item.destinations;
        
      return {
        id: item.id,
        destinasi: {
          id: item.destination_id,
          title: destination?.name || '',
          location: destination?.location || '',
          price: destination?.price?.toString() || '0',
          image: destination?.image_url || '/default-destination.jpg'
        }
      };
    }) || [];

    return NextResponse.json(formattedData);

  } catch (error: any) {
    console.error('API Wishlist GET Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST: Untuk toggle wishlist (kompatibilitas)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destinasi_id, user_id } = body;
    
    let userId = user_id;
    
    // Jika tidak ada user_id di body, coba dari session
    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      userId = session.user.id;
    }

    if (!destinasi_id) {
      return NextResponse.json(
        { error: 'Missing destinasi_id' },
        { status: 400 }
      );
    }

    // Cek apakah sudah ada
    const { data: existing } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('destination_id', destinasi_id)
      .single();

    let action = '';
    
    if (existing) {
      // Hapus jika sudah ada
      const { error: deleteError } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', existing.id);

      if (deleteError) throw deleteError;
      action = 'removed';
    } else {
      // Tambah jika belum ada
      const { error: insertError } = await supabase
        .from('wishlist')
        .insert({
          user_id: userId,
          destination_id: destinasi_id
        });

      if (insertError) throw insertError;
      action = 'added';
    }

    return NextResponse.json({ 
      success: true, 
      action,
      message: action === 'added' 
        ? 'Ditambahkan ke wishlist' 
        : 'Dihapus dari wishlist'
    });

  } catch (error: any) {
    console.error('API Wishlist POST Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update wishlist' },
      { status: 500 }
    );
  }
}

// DELETE: Untuk hapus spesifik
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const destination_id = searchParams.get('destination_id');
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!destination_id) {
      return NextResponse.json(
        { error: 'Missing destination_id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', session.user.id)
      .eq('destination_id', destination_id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: 'Berhasil dihapus dari wishlist'
    });

  } catch (error: any) {
    console.error('API Wishlist DELETE Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete from wishlist' },
      { status: 500 }
    );
  }
}