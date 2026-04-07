import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useSearchParams } from 'react-router-dom';

import { getApiBaseUrl } from '../utils/runtime';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

interface CheckoutSession {
  paymentOrderId: string;
  provider: 'razorpay';
  keyId: string;
  providerOrderId: string;
  amount: number;
  currency: string;
  purpose: 'order' | 'subscription';
  status: 'created' | 'verified' | 'failed' | 'expired';
  metadata?: Record<string, unknown>;
}

export default function Checkout() {
  const { paymentOrderId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const apiBaseUrl = useMemo(() => getApiBaseUrl().replace(/\/$/, ''), []);

  // SEO - Checkout pages should not be indexed
  const seoHelmet = (
    <Helmet>
      <title>Secure Checkout - Anaaj.ai</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );

  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [message, setMessage] = useState('Preparing secure checkout...');
  const [error, setError] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      if (!paymentOrderId || !token) {
        setError('The checkout link is incomplete. Please start the payment again from the app.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/payment/checkout/${paymentOrderId}?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Unable to load checkout session');
        }
        if (!cancelled) {
          setSession(data);
          setMessage('Secure checkout is ready.');
        }
      } catch (loadError: any) {
        if (!cancelled) {
          setError(loadError.message || 'Unable to load checkout session');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSession();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, paymentOrderId, token]);

  const launchCheckout = async () => {
    if (!session || !window.Razorpay) {
      setError('Checkout SDK is not available. Please refresh and try again.');
      return;
    }

    setLaunching(true);
    setError('');

    const razorpay = new window.Razorpay({
      key: session.keyId,
      amount: session.amount,
      currency: session.currency,
      name: 'Anaaj AI',
      description:
        session.purpose === 'subscription'
          ? `Subscription checkout${session.metadata?.tier ? ` (${String(session.metadata.tier)})` : ''}`
          : 'Order checkout',
      order_id: session.providerOrderId,
      handler: async (response: Record<string, unknown>) => {
        try {
          setMessage('Verifying payment...');
          const verifyResponse = await fetch(`${apiBaseUrl}/api/payment/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentOrderId: session.paymentOrderId,
              clientToken: token,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyResponse.json();
          if (!verifyResponse.ok) {
            throw new Error(verifyData.error || 'Payment verification failed');
          }

          if (verifyData.purpose === 'subscription') {
            setMessage(`Payment verified. Your ${verifyData.subscriptionTier} subscription is active. You can return to the app.`);
          } else {
            setMessage(`Payment verified. Order ${verifyData.orderId} is confirmed. You can return to the app.`);
          }
        } catch (verifyError: any) {
          setError(verifyError.message || 'Payment verification failed');
        } finally {
          setLaunching(false);
        }
      },
      modal: {
        ondismiss: () => {
          setLaunching(false);
          setMessage('Checkout was closed. You can reopen it whenever you are ready.');
        },
      },
      theme: {
        color: '#0d5c35',
      },
    });

    razorpay.open();
  };

  return (
    <div className="min-h-screen bg-surface pt-28 pb-20 px-6">
      {seoHelmet}
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[2rem] shadow-xl p-8 md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant">Secure checkout</p>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mt-4">
            Complete your payment
          </h1>
          <p className="text-on-surface-variant text-lg mt-4 leading-relaxed">
            This page verifies your payment directly with AnaajAI before activating your order or subscription.
          </p>

          {loading ? (
            <div className="mt-10 text-on-surface-variant">Loading checkout session...</div>
          ) : null}

          {session ? (
            <div className="mt-10 rounded-3xl bg-surface-container-low p-6 border border-outline-variant/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-on-surface-variant text-sm uppercase tracking-[0.2em]">
                    {session.purpose === 'subscription' ? 'Subscription' : 'Order'}
                  </p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    Rs {(session.amount / 100).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={launchCheckout}
                  disabled={launching}
                  className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-bold hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:hover:scale-100"
                >
                  {launching ? 'Processing...' : 'Open Razorpay Checkout'}
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-8 rounded-3xl bg-primary/5 border border-primary/10 p-5">
            <p className="font-semibold text-primary">Status</p>
            <p className="text-on-surface-variant mt-2 leading-relaxed">{error || message}</p>
          </div>

          <div className="mt-8 text-sm text-on-surface-variant">
            After the status changes to verified, you can return to the mobile app and refresh payment status there.
          </div>
        </div>
      </div>
    </div>
  );
}
