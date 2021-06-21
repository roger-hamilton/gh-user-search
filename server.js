const fs = require('fs')
const path = require('path')
const express = require('express')
const { createServer: createViteServer } = require('vite')
const qs = require('querystring');
const axios = require('axios');
require('dotenv').config();

async function createServer() {
  const app = express()

  // Create vite server in middleware mode. This disables Vite's own HTML
  // serving logic and let the parent server take control.
  //
  // If you want to use Vite's own HTML serving logic (using Vite as
  // a development middleware), using 'html' instead.
  const vite = await createViteServer({
    server: { middlewareMode: 'html' }
  });

  // custom endpoint to send access token to spa
  app.use('/auth-callback', async (req, res) => {

    // don't know how to corrilate state here...
    const { code, state } = req.query;

    const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      client_secret: process.env.CLIENT_SECRET,
      client_id: process.env.VITE_CLIENT_ID,
      code,
      redirect_uri: process.env.VITE_REDIRECT_URI,
    }, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });

    const { access_token } = tokenRes.data;

    res.redirect(`/#access_token=${access_token}`);
  });

  // use vite's connect instance as middleware
  app.use(vite.middlewares)

  app.listen(3000)
}

createServer()