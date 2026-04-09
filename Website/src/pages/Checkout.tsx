import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { paymentOrderId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const apiBaseUrl = useMemo(() => getApiBaseUrl().replace(/\/$/, ''), []);

  // SEO - Checkout pages should not be indexed
  const seoHelmet = (
    <Helmet>
      <title>{t('pages.checkout.title')}</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );

  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [message, setMessage] = useState(t('checkout.preparing'));
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
        setError(t('checkout.linkIncomplete'));
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/payment/checkout/${paymentOrderId}?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || t('checkout.unableToLoad'));
        }
        if (!cancelled) {
          setSession(data);
          setMessage(t('checkout.ready'));
        }
      } catch (loadError: any) {
        if (!cancelled) {
          setError(loadError.message || t('checkout.unableToLoad'));
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
      setError(t('checkout.sdkUnavailable'));
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
          ? `${t('checkout.subscription')} checkout${session.metadata?.tier ? ` (${String(session.metadata.tier)})` : ''}`
          : `${t('checkout.order')} checkout`,
      order_id: session.providerOrderId,
      handler: async (response: Record<string, unknown>) => {
        try {
          setMessage(t('checkout.verifying'));
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
            throw new Error(verifyData.error || t('checkout.verificationFailed'));
          }

          if (verifyData.purpose === 'subscription') {
            setMessage(t('checkout.verifiedSubscription', { tier: verifyData.subscriptionTier }));
          } else {
            setMessage(t('checkout.verifiedOrder', { id: verifyData.orderId }));
          }
        } catch (verifyError: any) {
          setError(verifyError.message || t('checkout.verificationFailed'));
        } finally {
          setLaunching(false);
        }
      },
      modal: {
        ondismiss: () => {
          setLaunching(false);
          setMessage(t('checkout.closed'));
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
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant">{t('checkout.subtitle')}</p>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mt-4">
            {t('checkout.title')}
          </h1>
          <p className="text-on-surface-variant text-lg mt-4 leading-relaxed">
            {t('checkout.description')}
          </p>

          {loading ? (
            <div className="mt-10 text-on-surface-variant">{t('checkout.loading')}</div>
          ) : null}

          {session ? (
            <div className="mt-10 rounded-3xl bg-surface-container-low p-6 border border-outline-variant/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-on-surface-variant text-sm uppercase tracking-[0.2em]">
                    {session.purpose === 'subscription' ? t('checkout.subscription') : t('checkout.order')}
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
                  {launching ? t('checkout.processing') : t('checkout.openRazorpay')}
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-8 rounded-3xl bg-primary/5 border border-primary/10 p-5">
            <p className="font-semibold text-primary">{t('checkout.status')}</p>
            <p className="text-on-surface-variant mt-2 leading-relaxed">{error || message}</p>
          </div>

          <div className="mt-8 text-sm text-on-surface-variant">
            {t('checkout.footer')}
          </div>
        </div>
      </div>
    </div>
  );
}
