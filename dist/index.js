import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
let app = new Hono();
app.use("*", serveStatic({ root: './public' }));
app.use("api/*", cors());
let api = new Hono();
let urls = new Map();
api.post('/shorten', async (c) => {
    let jsonData = await c.req.json();
    let originalUrl = jsonData.longUrl;
    let id = crypto.randomUUID().slice(0, 8);
    if (urls.get(id)) {
        return c.json({ shortUrl: './short/' + id });
    }
    urls.set(id, originalUrl);
    return c.json({ shortUrl: './short/' + id });
});
app.get('/short/:id', c => {
    let id = c.req.param('id');
    let longUrl = urls.get(id);
    if (longUrl) {
        return c.redirect(longUrl, 301);
    }
    return c.json({ error: 'URL not found' }, 404);
});
app.route('/api', api);
serve({
    fetch: app.fetch,
    port: process.env.PORT || 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
