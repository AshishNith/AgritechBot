import Constants from 'expo-constants';
import axios from 'axios';

import { useAppStore } from '../store/useAppStore';
import { t, TranslationKey } from '../constants/localization';

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function isLoopbackUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1|::1|10\.0\.2\.2/.test(url);
}

function resolveBaseUrls(): string[] {
  const explicitFromConfig = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;
  const explicitFromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  const productionFallback = 'https://backend.goran.in';
  const configuredBaseUrl = (explicitFromEnv || explicitFromConfig || '').trim();
  const devExplicit =
    explicitFromEnv?.trim() ||
    (configuredBaseUrl && configuredBaseUrl !== productionFallback ? configuredBaseUrl : '');

  const expoHostUri = (Constants.expoConfig as { hostUri?: string } | undefined)?.hostUri;
  const expoGoHost = (
    Constants as unknown as { expoGoConfig?: { debuggerHost?: string } }
  ).expoGoConfig?.debuggerHost;

  const hostCandidates: string[] = [];
  if (expoHostUri) {
    hostCandidates.push(expoHostUri.split(':')[0]);
  }
  if (expoGoHost) {
    hostCandidates.push(expoGoHost.split(':')[0]);
  }

  const runtimeUrls = hostCandidates.map((host) => `http://${host}:4000`);

  if (__DEV__) {
    return unique([
      ...runtimeUrls,
      'http://10.0.2.2:4000',
      'http://localhost:4000',
      devExplicit,
    ]);
  }

  return unique([configuredBaseUrl || productionFallback]).filter((url) => url && !isLoopbackUrl(url));
}

const baseUrls = resolveBaseUrls();
let activeBaseUrl = baseUrls[0] || (__DEV__ ? 'http://localhost:4000' : 'https://backend.goran.in');

export const api = axios.create({
  baseURL: activeBaseUrl,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const store = useAppStore.getState();
    const language = store.language || 'English';

    // 1. Handle Response Errors (from Backend)
    if (error.response) {
      const { status, data } = error.response;
      
      // Auto Sign-out on 401
      if (status === 401) {
        store.signOut();
      }

      // Check for translation code from backend
      if (data?.code && typeof data.code === 'string') {
        error.message = t(language, data.code as TranslationKey);
      } else {
        // Fallback standard status mapping
        const statusMap: Record<number, TranslationKey> = {
          401: 'errAuth',
          402: 'errNoCredits',
          403: 'errForbidden',
          404: 'errNotFound',
          429: 'errServerBusy',
          500: 'errServerBusy',
        };
        const key = statusMap[status] || 'errUnknown';
        error.message = t(language, key);
      }
      throw error;
    }

    // 2. Handle Network/Connection Errors (No response)
    if (error.request) {
      error.message = t(language, 'errConnection');
      
      const config = error.config as (Record<string, unknown> & { baseURL?: string; method?: string; __baseRetryAttempted?: boolean }) | undefined;

      // Only retry safe GET requests
      if (!config || config.__baseRetryAttempted || config.method?.toLowerCase() !== 'get') {
        throw error;
      }

      config.__baseRetryAttempted = true;

      for (const candidate of baseUrls) {
        if (!candidate || candidate === (config.baseURL || api.defaults.baseURL)) {
          continue;
        }

        try {
          const response = await api.request({ ...config, baseURL: candidate });
          activeBaseUrl = candidate;
          api.defaults.baseURL = candidate;
          return response;
        } catch (retryError) {
          if ((retryError as any).response) throw retryError;
        }
      }
    }

    // 3. Handle unknown errors
    error.message = t(language, 'errUnknown');
    throw error;
  }
);

api.interceptors.request.use((config) => {
  config.baseURL = activeBaseUrl;
  const token = useAppStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
