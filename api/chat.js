export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message, sessionId } = req.body ?? {};
  if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 2000)
    return res.status(400).json({ error: 'Invalid message' });

  const url    = process.env.N8N_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!url) return res.status(500).json({ error: 'Server not configured' });

  const params = new URLSearchParams({ message: message.trim(), sessionId: sessionId ?? '' });
  const n8nRes = await fetch(`${url}?${params}`, {
    headers: secret ? { 'X-Webhook-Secret': secret } : {},
  });

  const raw = await n8nRes.text();
  if (!n8nRes.ok) return res.status(n8nRes.status).json({ error: `Upstream ${n8nRes.status}` });

  try   { return res.status(200).json(JSON.parse(raw)); }
  catch { return res.status(200).json({ text: raw }); }
}
