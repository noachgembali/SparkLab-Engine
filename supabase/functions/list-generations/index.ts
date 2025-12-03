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

    // Parse query params for pagination
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const { data: generations, error: genError, count } = await supabase
      .from('generations')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (genError) {
      console.error('Query error:', genError)
      return new Response(
        JSON.stringify({ code: 'DB_ERROR', message: 'Failed to fetch generations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formattedGenerations = (generations || []).map(gen => ({
      id: gen.id,
      engine: gen.engine,
      type: gen.type,
      status: gen.status,
      url: gen.result_url,
      meta: gen.result_meta,
      raw_response: gen.raw_response,
      prompt: gen.prompt,
      params: gen.params,
      error: gen.error,
      createdAt: gen.created_at,
      updatedAt: gen.updated_at
    }))

    console.log('Listed generations for user:', user.id, 'count:', generations?.length)

    return new Response(
      JSON.stringify({
        data: formattedGenerations,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (offset + limit) < (count || 0)
        }
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
