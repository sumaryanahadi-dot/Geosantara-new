import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const cookieStore = await cookies()
    
    try {
      // Create Supabase client with cookie handling
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Perhatikan: NEXT_PUBLIC bukan NUBLIC
        {
          auth: {
            flowType: 'pkce',
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
          },
          global: {
            headers: {
              'X-Client-Info': 'supabase-js-nextjs-callback'
            }
          }
        }
      )

      // Setup cookie handlers
      const cookieOptions = {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 7 // 7 days
      }

      // Exchange the code for a session with explicit cookie handling
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`
        )
      }

      // Set session cookies manually if needed
      if (data?.session) {
        // Set access token cookie
        cookieStore.set({
          name: 'sb-access-token',
          value: data.session.access_token,
          ...cookieOptions
        })

        // Set refresh token cookie
        cookieStore.set({
          name: 'sb-refresh-token',
          value: data.session.refresh_token,
          ...cookieOptions
        })
      }

      // Success - redirect to intended page
      return NextResponse.redirect(`${requestUrl.origin}${next}`)

    } catch (error: any) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`
      )
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login?error=No authorization code provided`)
}