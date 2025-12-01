import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ code: 'UNAUTHORIZED', message: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ code: 'UNAUTHORIZED', message: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Auto-create profile if it doesn't exist (handles users who signed up before trigger)
    if (profileError || !profile) {
      console.log('Profile not found, creating for user:', user.id)
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          plan: 'free',
          used_generations: 0
        })
        .select()
        .single()

      if (createError) {
        // Check if it's a duplicate key error (race condition - another request created it)
        if (createError.code === '23505') {
          console.log('Profile already exists (race condition), fetching it now')
          
          // Re-fetch the profile that was created by the concurrent request
          const { data: existingProfile, error: refetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (refetchError || !existingProfile) {
            console.error('Failed to fetch existing profile after race condition:', refetchError)
            return new Response(
              JSON.stringify({ code: 'PROFILE_FETCH_FAILED', message: 'Failed to fetch user profile' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          profile = existingProfile
          console.log('Existing profile fetched successfully after race condition')
        } else {
          console.error('Failed to create profile:', createError)
          return new Response(
            JSON.stringify({ code: 'PROFILE_CREATE_FAILED', message: 'Failed to create user profile' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } else {
        profile = newProfile
        console.log('Profile created for user:', user.id)
      }
    } else {
      console.log('Profile fetched for user:', user.id)
    }

    return new Response(
      JSON.stringify({
        id: profile.id,
        email: profile.email,
        plan: profile.plan,
        usedGenerations: profile.used_generations,
        remainingGenerations: profile.plan === 'free' ? Math.max(0, 5 - profile.used_generations) : 'unlimited',
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})