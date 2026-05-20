export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    return res.status(200).json({ error: 'Mailchimp not configured' });
  }

  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(200).json({ error: 'Invalid email address' });
    }

    const datacenter = apiKey.split('-')[1];
    const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${audienceId}/members`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        tags: ['gridacademy-website']
      })
    });

    const data = await response.json();

    if (data.status === 'subscribed') {
      return res.status(200).json({ success: true });
    } else if (data.title === 'Member Exists') {
      return res.status(200).json({ success: true, existing: true });
    } else {
      return res.status(200).json({ error: data.detail || 'Subscription failed' });
    }

  } catch (e) {
    return res.status(200).json({ error: e.message });
  }
}
