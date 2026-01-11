const functions = require('firebase-functions');
const next = require('next');

const isDev = process.env.NODE_ENV !== 'production';
const nextjsDistDir = '../.next';

const nextjsApp = next({
  dev: isDev,
  conf: {
    distDir: nextjsDistDir,
  },
});

const nextjsHandle = nextjsApp.getRequestHandler();

exports.nextjsServer = functions.https.onRequest(async (req, res) => {
  await nextjsApp.prepare();
  return nextjsHandle(req, res);
});
