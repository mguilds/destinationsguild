// Polo & Polly — travel concierge helper (Netlify Function)
// Your secret key is read from the ANTHROPIC_API_KEY environment variable,
// which you set inside Netlify. It NEVER appears in your website's code.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { system, messages } = JSON.parse(event.body || '{}');

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        // Fast & affordable. For richer replies, change to 'claude-sonnet-4-6'.
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: system || 'You are a friendly travel concierge.',
        messages: messages || []
      })
    });

    const data = await resp.json();
    const reply =
      (data && data.content && data.content[0] && data.content[0].text)
        ? data.content[0].text
        : "I seem to have lost my signal — please try again in a moment.";

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reply: "Our concierge desk hit a snag — please try again in a moment." })
    };
  }
};
