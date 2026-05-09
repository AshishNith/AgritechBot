import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Modal, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

/**
 * WebView-based Firebase Phone Auth.
 *
 * By using inline HTML with `baseUrl`, we trick the WebView into thinking
 * it's running on a secure HTTPS origin (`https://backend.goran.in`). 
 * This enables `window.crypto.subtle` (required by Firebase) and bypasses
 * the limitations of local HTTP development IPs.
 *
 * PREREQUISITE:
 *   In Firebase Console → Authentication → Settings → Authorized domains,
 *   ensure `backend.goran.in` is added.
 */

export interface WebViewRecaptchaHandle {
  /** Triggers invisible reCAPTCHA + SMS, resolves with Firebase verificationId */
  sendOtp: (phoneNumber: string) => Promise<string>;
}

const generateFirebaseHtml = (phone: string) => `<!DOCTYPE html>
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

        auth.signInWithPhoneNumber("${phone}", verifier)
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

const WebViewRecaptchaComponent = forwardRef<WebViewRecaptchaHandle, {}>(
  (_, ref) => {
    const [visible, setVisible] = useState(false);
    const [htmlContent, setHtmlContent] = useState('');
    const resolveRef = useRef<((id: string) => void) | null>(null);
    const rejectRef = useRef<((err: Error) => void) | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useImperativeHandle(ref, () => ({
      sendOtp: (phoneNumber: string) => {
        return new Promise<string>((resolve, reject) => {
          resolveRef.current = resolve;
          rejectRef.current = reject;

          // Generate HTML with the phone number baked in
          const safePhone = phoneNumber.replace(/[^+\d]/g, '').slice(0, 16);
          setHtmlContent(generateFirebaseHtml(safePhone));
          setVisible(true);

          timeoutRef.current = setTimeout(() => {
            setVisible(false);
            reject(new Error('OTP request timed out. Please try again.'));
          }, 30_000);
        });
      },
    }));

    const cleanup = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setVisible(false);
      setHtmlContent('');
    };

    const handleMessage = (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        cleanup();
        if (data.type === 'verificationId') {
          resolveRef.current?.(data.verificationId);
        } else {
          rejectRef.current?.(new Error(data.message || 'Phone verification failed'));
        }
      } catch (_) {
        cleanup();
        rejectRef.current?.(new Error('Unexpected reCAPTCHA response'));
      }
    };

    const handleError = () => {
      cleanup();
      rejectRef.current?.(new Error('Could not load verification page. Check your connection.'));
    };

    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#52B781" />
            <Text style={styles.label}>Sending OTP…</Text>
            {htmlContent ? (
              <WebView
                style={styles.webView}
                source={{ html: htmlContent, baseUrl: 'https://backend.goran.in' }}
                onMessage={handleMessage}
                onError={handleError}
                javaScriptEnabled
                domStorageEnabled
                mixedContentMode="always"
                setSupportMultipleWindows={false}
              />
            ) : null}
          </View>
        </View>
      </Modal>
    );
  }
);

WebViewRecaptchaComponent.displayName = 'WebViewRecaptcha';

export const WebViewRecaptcha = WebViewRecaptchaComponent;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 240,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    gap: 14,
  },
  label: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  webView: {
    width: 1,
    height: 1,
    opacity: 0,
    position: 'absolute',
  },
});
