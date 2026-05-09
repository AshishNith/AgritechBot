import { FastifyInstance } from 'fastify';
import { sendOtp, verifyOtp, send2FactorOtp, verify2FactorOtp, sendFast2SmsOtp, verifyFast2SmsOtp, verifyFirebaseOtp } from '../controllers/authController';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const otpRateLimit = {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: 15 * 60 * 1000 // 15 mins
      }
    }
  };

  const fast2SmsRateLimit = {
    config: {
      rateLimit: {
        max: 3, // 3 requests per 15 minutes as requested
        timeWindow: 15 * 60 * 1000
      }
    }
  };

  const firebaseRateLimit = {
    config: {
      rateLimit: {
        max: 10, // Firebase verify is lightweight; slightly higher limit
        timeWindow: 15 * 60 * 1000
      }
    }
  };

  // Legacy endpoints (kept for backward compatibility)
  app.post('/auth/send-otp', otpRateLimit, sendOtp);
  app.post('/auth/verify-otp', otpRateLimit, verifyOtp);

  // 2Factor.in SMS OTP Integration Routes
  app.post('/auth/2factor/send', otpRateLimit, send2FactorOtp);
  app.post('/auth/2factor/verify', otpRateLimit, verify2FactorOtp);

  // Fast2SMS OTP Integration Routes
  app.post('/auth/fast2sms/send', fast2SmsRateLimit, sendFast2SmsOtp);
  app.post('/auth/fast2sms/verify', fast2SmsRateLimit, verifyFast2SmsOtp);

  // Firebase Phone Auth (active endpoint used by mobile app)
  app.post('/auth/firebase/verify', firebaseRateLimit, verifyFirebaseOtp);

  // ── Firebase reCAPTCHA page (served so WebView has a real authorized domain) ──
  // The mobile app loads this URL in a WebView; the page runs signInWithPhoneNumber
  // using Firebase compat SDK (domain backend.goran.in must be in Firebase authorized domains).
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
          apiKey: "AIzaSyBo-QxqxbeP1CFzVsIh9UL3WlKXoiq7Fxc",
          authDomain: "otp-service-cd1f2.firebaseapp.com",
          projectId: "otp-service-cd1f2",
          appId: "1:390819207417:web:be271d809adeeafc71aa28"
        });

        var auth = firebase.auth(app);

        var verifier = new firebase.auth.RecaptchaVerifier(
          'recaptcha-container',
          {
            size: 'invisible',
            callback: function () { /* reCAPTCHA solved, SMS will be sent */ }
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
      // Allow this page to be loaded in a WebView from any origin
      .header('X-Frame-Options', 'ALLOWALL')
      .header('Content-Security-Policy', "default-src 'self' 'unsafe-inline' https://www.gstatic.com https://*.googleapis.com https://*.firebaseapp.com https://*.firebase.com;")
      .send(html);
  });
}
