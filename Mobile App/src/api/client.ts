import Constants from 'expo-constants';
import axios from 'axios';

import { useAppStore } from '../store/useAppStore';

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
    // Handle 401 (Unauthorized) - token expired or invalid
    if (error?.response?.status === 401) {
      const store = useAppStore.getState();
      store.signOut();
      throw error;
    }

    const config = error?.config as (Record<string, unknown> & { baseURL?: string; method?: string }) | undefined;

    // MANDATORY FIX: Only retry safe, idempotent GET requests. 
    // Never retry POST/PUT/DELETE as it causes duplicate deductions/resource creation (Triple Counting Fix).
    if (!config || error?.response || config.__baseRetryAttempted || config.method?.toLowerCase() !== 'get') {
      throw error;
    }

    config.__baseRetryAttempted = true;

    for (const candidate of baseUrls) {
      if (!candidate || candidate === (config.baseURL || api.defaults.baseURL)) {
        continue;
      }

      try {
        const response = await api.request({
          ...config,
          baseURL: candidate,
        });

        activeBaseUrl = candidate;
        api.defaults.baseURL = candidate;
        return response;
      } catch (retryError) {
        if ((retryError as { response?: unknown }).response) {
          throw retryError;
        }
      }
    }

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
