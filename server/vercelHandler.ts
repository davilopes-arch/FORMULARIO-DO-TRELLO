import app from '../server/app.ts';

export default function handler(req: any, res: any) {
  try {
    if (req.url === '/api' && req.headers && req.headers['x-matched-path']) {
      req.url = req.headers['x-matched-path'];
    }
    return app(req, res);
  } catch (err: any) {
    console.error('Unhandled api error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  }
}
