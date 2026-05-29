import { FastifyInstance } from 'fastify';
import { verifyFirebaseOtp } from '../controllers/authController';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const firebaseRateLimit = {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: 15 * 60 * 1000
      }
    }
  };

  // Firebase Phone Auth (primary endpoint used by mobile app)
  app.post('/auth/firebase/verify', firebaseRateLimit, verifyFirebaseOtp);

  // ── Firebase reCAPTCHA page (served so WebView has a real authorized domain) ──
  app.get('/auth/recaptcha-page', async (request, reply) => {
    const { phone } = request.query as { phone?: string };

    if (!phone) {
      reply.code(400).send('Missing phone query parameter');
      return;
    }

    // Sanitize: only allow E.164 format (+digits)
    const safePhone = phone.replace(/[^+\d]/g, '').slice(0, 16);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin: 0; padding: 0; background: transparent; }
  </style>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
</head>
<body>
  <div id="recaptcha-container"></div>
  <script>
    (function () {
      try {
        var app = firebase.initializeApp({
          apiKey: "${process.env.FIREBASE_WEB_API_KEY || 'AIzaSyBo-QxqxbeP1CFzVsIh9UL3WlKXoiq7Fxc'}",
          authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || 'otp-service-cd1f2.firebaseapp.com'}",
          projectId: "${process.env.FIREBASE_PROJECT_ID || 'otp-service-cd1f2'}",
          appId: "${process.env.FIREBASE_APP_ID || '1:390819207417:web:be271d809adeeafc71aa28'}"
        });

        var auth = firebase.auth(app);

        var verifier = new firebase.auth.RecaptchaVerifier(
          'recaptcha-container',
          {
            size: 'invisible',
            callback: function () { /* reCAPTCHA solved */ }
          }
        );

        auth.signInWithPhoneNumber("${safePhone}", verifier)
          .then(function (result) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'verificationId',
              verificationId: result.verificationId
            }));
          })
          .catch(function (err) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: err.message || String(err)
            }));
          });
      } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          message: e.message || String(e)
        }));
      }
    })();
  </script>
</body>
</html>`;

    reply
      .header('Content-Type', 'text/html; charset=utf-8')
      .header('X-Frame-Options', 'ALLOWALL')
      .header('Content-Security-Policy', "default-src 'self' 'unsafe-inline' https://www.gstatic.com https://*.googleapis.com https://*.firebaseapp.com https://*.firebase.com;")
      .send(html);
  });
}
