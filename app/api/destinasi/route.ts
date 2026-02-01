import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('name');

    if (error) throw error;

    // Format untuk kompatibilitas dengan kode lama
    const formattedData = data.map(dest => ({
      id: dest.id,
      title: dest.name,
      location: dest.location,
      price: dest.price,
      description: dest.description,
      image: dest.image_url || '/default-destination.jpg',
      tag: dest.category,
      rating: dest.rating
    }));

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}