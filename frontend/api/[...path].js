const backendApiUrl = (process.env.BACKEND_API_URL || 'https://school-portal-2-bb5g.onrender.com/api').replace(/\/$/, '');

export default async function handler(req, res) {
  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path || '';
  const targetUrl = `${backendApiUrl}/${path}`;
  const headers = {};

  if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
  if (req.headers.authorization) headers.authorization = req.headers.authorization;

  const requestBody = ['GET', 'HEAD'].includes(req.method) ? undefined : (
    typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {})
  );

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: requestBody
    });
    const responseText = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(responseText);
  } catch (error) {
    res.status(502).json({ success: false, message: 'Backend API unavailable' });
  }
}
