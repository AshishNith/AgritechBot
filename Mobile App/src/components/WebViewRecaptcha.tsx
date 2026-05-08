import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Modal, StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { ApplicationVerifier, RecaptchaVerifier } from 'firebase/auth';
import { auth, firebaseConfig } from '../config/firebase';

/**
 * A drop-in replacement for FirebaseRecaptchaVerifierModal from the
 * defunct expo-firebase-recaptcha package.
 *
 * Uses a WebView to render Firebase's invisible reCAPTCHA, which is
 * the only approach compatible with expo-modules-core v2.x / Expo SDK 52.
 */

export interface WebViewRecaptchaHandle {
  verify: () => Promise<string>;
}

interface Props {
  /** Not used directly but kept for API compatibility */
  firebaseConfig?: object;
  attemptInvisibleVerification?: boolean;
}

// This is a real ApplicationVerifier that wraps a RecaptchaVerifier
// but we can't render DOM in RN – so we build an HTML page inside a WebView.
const RECAPTCHA_HTML = (siteKey: string, apiKey: string, authDomain: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
</head>
<body style="margin:0;padding:0;background:#fff;">
  <div id="recaptcha-container"></div>
  <script>
    var app = firebase.initializeApp({
      apiKey: "${apiKey}",
      authDomain: "${authDomain}"
    });
    var auth = firebase.auth(app);
    auth.settings.appVerificationDisabledForTesting = false;

    var verifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: function(token) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'token', token: token }));
      },
      'expired-callback': function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'expired' }));
      },
      'error-callback': function(err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: String(err) }));
      }
    });

    // Expose render function to be called from RN
    window.renderRecaptcha = function() {
      verifier.render().then(function(widgetId) {
        verifier.verify().then(function(token) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'token', token: token }));
        }).catch(function(err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: err.message || String(err) }));
        });
      }).catch(function(err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: err.message || String(err) }));
      });
    };
  </script>
</body>
</html>
`;

/**
 * A ref-based component that wraps Firebase reCAPTCHA in a WebView.
 *
 * Usage (same as FirebaseRecaptchaVerifierModal):
 *   const recaptchaRef = useRef<WebViewRecaptchaHandle>(null);
 *   ...
 *   <WebViewRecaptcha ref={recaptchaRef} firebaseConfig={firebaseConfig} />
 *
 * The ref exposes a `verify()` method that resolves to a reCAPTCHA token.
 * Pass this token to FirebaseAuthApplicationVerifier-compatible calls.
 */
const WebViewRecaptchaComponent = forwardRef<WebViewRecaptchaHandle, Props>(
  ({ attemptInvisibleVerification = true }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const [visible, setVisible] = useState(false);
    const resolveRef = useRef<((token: string) => void) | null>(null);
    const rejectRef = useRef<((err: Error) => void) | null>(null);

    useImperativeHandle(ref, () => ({
      verify: () => {
        return new Promise<string>((resolve, reject) => {
          resolveRef.current = resolve;
          rejectRef.current = reject;
          setVisible(true);
          // Give the WebView time to load, then trigger verify
          setTimeout(() => {
            webViewRef.current?.injectJavaScript('window.renderRecaptcha && window.renderRecaptcha(); true;');
          }, 1500);
        });
      },
    }));

    const handleMessage = (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'token') {
          setVisible(false);
          resolveRef.current?.(data.token);
        } else if (data.type === 'error' || data.type === 'expired') {
          setVisible(false);
          rejectRef.current?.(new Error(data.message || 'reCAPTCHA expired or failed'));
        }
      } catch (_) {}
    };

    const html = RECAPTCHA_HTML(
      '',
      firebaseConfig.apiKey,
      firebaseConfig.authDomain
    );

    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#52B781" />
            <WebView
              ref={webViewRef}
              style={styles.webView}
              source={{ html }}
              onMessage={handleMessage}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
            />
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 280,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  webView: {
    width: 280,
    height: 100,
    backgroundColor: 'transparent',
  },
});
