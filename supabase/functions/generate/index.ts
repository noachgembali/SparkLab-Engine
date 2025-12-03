import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateRequest {
  engineKey?: string
  engine?: string
  type: 'image' | 'video'
  prompt: string
  params?: Record<string, unknown>
}

type GenerationStatus = 'success' | 'failed'

interface NormalizedGenerationResult {
  engine: string
  type: 'image' | 'video'
  status: GenerationStatus
  url: string | null
  meta: Record<string, unknown>
  raw_response: Record<string, unknown>
}

const SUPPORTED_ENGINES = ['image_engine_a', 'image_engine_b', 'image_engine_c', 'video_engine_a']
const STUB_IMAGE_URL = 'https://example.com/fake.jpg'
const STUB_VIDEO_URL = 'https://example.com/fake-video-result.mp4'

const parseImageMeta = (params: Record<string, unknown> = {}) => {
  const outputCount = Math.min(Math.max((params.outputCount as number) || 1, 1), 4)
  const urls = Array.from({ length: outputCount }, () => STUB_IMAGE_URL)

  return {
    urls,
    aspectRatio: typeof params.aspectRatio === 'string' ? params.aspectRatio : undefined,
    style: typeof params.style === 'string' ? params.style : undefined,
    steps: typeof params.steps === 'number' ? params.steps : undefined,
    promptStrength: typeof params.promptStrength === 'number' ? params.promptStrength : undefined,
    seed: typeof params.seed === 'number' ? params.seed : undefined,
    outputCount,
  }
}

const parseVideoMeta = (params: Record<string, unknown> = {}) => ({
  aspectRatio: typeof params.aspectRatio === 'string' ? params.aspectRatio : undefined,
  style: typeof params.style === 'string' ? params.style : undefined,
  steps: typeof params.steps === 'number' ? params.steps : undefined,
})

const simulateImageEngine = (
  engineKey: string,
  type: 'image' | 'video',
  params: Record<string, unknown> | undefined
): NormalizedGenerationResult => {
  if (type !== 'image') {
    throw new Error(`Engine ${engineKey} only supports image generations`)
  }

  const meta = parseImageMeta(params || {})

  return {
    engine: engineKey,
    type,
    status: 'success',
    url: STUB_IMAGE_URL,
    meta,
    raw_response: {
      stub: true,
      engineKey,
      type,
      params,
    },
  }
}

const simulateVideoEngine = (
  engineKey: string,
  type: 'image' | 'video',
  params: Record<string, unknown> | undefined
): NormalizedGenerationResult => {
  if (type !== 'video') {
    throw new Error(`Engine ${engineKey} only supports video generations`)
  }

  const meta = parseVideoMeta(params || {})

  return {
    engine: engineKey,
    type,
    status: 'success',
    url: STUB_VIDEO_URL,
    meta,
    raw_response: {
      stub: true,
      engineKey,
      type,
      params,
    },
  }
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
    const engineKey = body.engineKey || body.engine
    
    if (!engineKey || !body.type || !body.prompt) {
      return new Response(
        JSON.stringify({ code: 'INVALID_REQUEST', message: 'Missing required fields: engineKey, type, prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate engine
    if (!SUPPORTED_ENGINES.includes(engineKey)) {
      return new Response(
        JSON.stringify({ code: 'INVALID_ENGINE', message: `Invalid engine. Valid options: ${SUPPORTED_ENGINES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requiredType = engineKey.startsWith('video') ? 'video' : 'image'
    if (requiredType !== body.type) {
      return new Response(
        JSON.stringify({ code: 'INVALID_TYPE', message: `Engine ${engineKey} only supports ${requiredType} generations` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let normalizedResult: NormalizedGenerationResult

    switch (engineKey) {
      case 'image_engine_a':
        normalizedResult = simulateImageEngine(engineKey, body.type, body.params)
        break
      case 'image_engine_b':
        normalizedResult = simulateImageEngine(engineKey, body.type, body.params)
        break
      case 'image_engine_c':
        normalizedResult = simulateImageEngine(engineKey, body.type, body.params)
        break
      case 'video_engine_a':
        normalizedResult = simulateVideoEngine(engineKey, body.type, body.params)
        break
      default:
        throw new Error('Unsupported engine')
    }

    // Create generation record with normalized result
    const { data: generation, error: insertError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        engine: normalizedResult.engine,
        type: normalizedResult.type,
        status: normalizedResult.status,
        prompt: body.prompt,
        params: body.params || {},
        result_url: normalizedResult.url,
        result_meta: normalizedResult.meta,
        raw_response: normalizedResult.raw_response,
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

    console.log('Generation completed:', generation.id, 'for user:', user.id)

    return new Response(
      JSON.stringify({
        id: generation.id,
        engine: generation.engine,
        type: generation.type,
        status: generation.status,
        url: generation.result_url,
        meta: generation.result_meta,
        raw_response: generation.raw_response,
        prompt: generation.prompt,
        params: generation.params,
        createdAt: generation.created_at,
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
