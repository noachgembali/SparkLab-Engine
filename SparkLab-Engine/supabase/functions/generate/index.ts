import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateRequest {
  engine: string
  type: 'image' | 'video'
  prompt: string
  params?: Record<string, unknown>
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get auth token from header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ code: 'UNAUTHORIZED', message: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ code: 'UNAUTHORIZED', message: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ code: 'PROFILE_NOT_FOUND', message: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check free tier limit
    if (profile.plan === 'free' && profile.used_generations >= 5) {
      console.log('Free tier limit reached for user:', user.id)
      return new Response(
        JSON.stringify({ 
          code: 'LIMIT_REACHED', 
          message: 'Free trial limit reached. Please upgrade to continue generating.' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: GenerateRequest = await req.json()
    
    if (!body.engine || !body.type || !body.prompt) {
      return new Response(
        JSON.stringify({ code: 'INVALID_REQUEST', message: 'Missing required fields: engine, type, prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate engine
    const validEngines = ['image_engine_a', 'image_engine_b', 'image_engine_c', 'video_engine_a']
    if (!validEngines.includes(body.engine)) {
      return new Response(
        JSON.stringify({ code: 'INVALID_ENGINE', message: `Invalid engine. Valid options: ${validEngines.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create generation record
    const { data: generation, error: insertError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        engine: body.engine,
        type: body.type,
        status: 'queued',
        prompt: body.prompt,
        params: body.params || {}
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ code: 'DB_ERROR', message: 'Failed to create generation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Increment used_generations for free users
    if (profile.plan === 'free') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ used_generations: profile.used_generations + 1 })
        .eq('id', user.id)

      if (updateError) {
        console.error('Update error:', updateError)
      }
    }

    // Simulate async processing - update to success with fake result
    setTimeout(async () => {
      const fakeImageUrl = 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800'
      const fakeVideoUrl = 'https://example.com/fake-video-result.mp4'
      
      // Handle multiple outputs for images
      const outputCount = body.type === 'image' 
        ? Math.min(Math.max((body.params?.outputCount as number) || 1, 1), 4)
        : 1
      
      // Build result_meta with urls array for images
      const resultMeta: Record<string, unknown> = { 
        note: 'Stubbed response - will be replaced with real engine integration',
        engine_version: '1.0.0',
        processing_time_ms: 2500
      }
      
      if (body.type === 'image') {
        // Create array of URLs (using same stub URL for now)
        const urls = Array.from({ length: outputCount }, () => fakeImageUrl)
        resultMeta.urls = urls
      }

      await supabase
        .from('generations')
        .update({
          status: 'success',
          result_url: body.type === 'image' ? fakeImageUrl : fakeVideoUrl,
          result_meta: resultMeta
        })
        .eq('id', generation.id)
      
      console.log('Generation completed:', generation.id, 'with', outputCount, 'outputs')
    }, 2000)

    console.log('Generation created:', generation.id, 'for user:', user.id)

    return new Response(
      JSON.stringify({
        id: generation.id,
        engine: generation.engine,
        type: generation.type,
        status: generation.status,
        prompt: generation.prompt,
        createdAt: generation.created_at,
        message: 'Generation queued successfully'
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})