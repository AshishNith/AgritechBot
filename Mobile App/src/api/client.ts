import Constants from 'expo-constants';
import axios from 'axios';

import { useAppStore } from '../store/useAppStore';

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function resolveBaseUrls(): string[] {
  const explicit = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;

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
  return unique([
    explicit || '',
    ...runtimeUrls,
    'http://10.0.2.2:4000',
    'http://localhost:4000',
  ]);
}

const baseUrls = resolveBaseUrls();
let activeBaseUrl = baseUrls[0] || 'http://localhost:4000';

if (__DEV__) {
  // Helpful when debugging "backend unreachable" on changing LAN IPs.
  console.log('[api] base URL candidates:', baseUrls.join(', '));
}

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
      // Navigation would be handled by the app's splash screen detecting token is null
      throw error;
    }

    const config = error?.config as (Record<string, unknown> & { baseURL?: string }) | undefined;

    // Only retry pure network failures. HTTP errors (401/500/etc.) should surface directly.
    if (!config || error?.response || config.__baseRetryAttempted) {
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
  // Keep requests pinned to last known working base URL.
  config.baseURL = activeBaseUrl;

  const token = useAppStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
