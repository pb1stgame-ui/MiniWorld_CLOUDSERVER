// Room Cloud Replica - Cloudflare Worker
// Handles API endpoints. Static assets (index.html) are served automatically.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // API: Get room list
      if (path === '/get-rooms' && request.method === 'GET') {
        return handleGetRooms(corsHeaders);
      }

      // API: Get recent maps for a UID
      if (path === '/get-recent-maps' && request.method === 'GET') {
        const uid = url.searchParams.get('uid');
        const region = url.searchParams.get('region') || '1';
        return handleGetRecentMaps(uid, region, corsHeaders);
      }

      // API: Process AID/WID
      if (path === '/process' && request.method === 'POST') {
        return handleProcess(request, corsHeaders);
      }

      // Serve static assets (index.html, etc.)
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }

      // Fallback if no ASSETS binding
      return new Response('Not Found', { status: 404 });
    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, message: err.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
  },
};

const ROOMS = [
  { aid: '1001', name: '\u{1F3F0} Room of Eternity' },
  { aid: '1002', name: '\u{1F525} Flaming Chamber' },
  { aid: '1003', name: '\u{1F30A} Abyssal Depths' },
  { aid: '1004', name: '\u{26A1} Storm Shelter' },
  { aid: '1005', name: '\u{1F319} Moonlit Hall' },
  { aid: '1006', name: '\u{2744}\uFE0F Frost Sanctuary' },
  { aid: '1007', name: '\u{1F30B} Magma Core' },
  { aid: '1008', name: '\u{1F33F} Emerald Grove' },
  { aid: '1009', name: '\u{1F48E} Crystal Domain' },
  { aid: '1010', name: '\u{2601}\uFE0F Sky Haven' },
];

function handleGetRooms(corsHeaders) {
  return new Response(JSON.stringify(ROOMS), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function handleGetRecentMaps(uid, region, corsHeaders) {
  const seed = uid ? parseInt(uid.slice(-3), 10) || 1 : 1;

  const recentMaps = [
    { wid: '2001', name: `Map Alpha-${seed}` },
    { wid: '2002', name: `Map Beta-${seed + 1}` },
    { wid: '2003', name: `Map Gamma-${seed + 2}` },
    { wid: '2004', name: `Map Delta-${seed + 3}` },
    { wid: '2005', name: `Map Epsilon-${seed + 4}` },
  ];

  return new Response(JSON.stringify({ success: true, recent: recentMaps }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function handleProcess(request, corsHeaders) {
  try {
    const body = await request.json();
    const { aid, region } = body;

    if (!aid) {
      return new Response(
        JSON.stringify({ success: false, message: 'AID/WID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    await new Promise((r) => setTimeout(r, 500));

    return new Response(
      JSON.stringify({
        success: true,
        message: `Room data optimized successfully for AID: ${aid} (Region: ${region || 1})`,
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid request body' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}
