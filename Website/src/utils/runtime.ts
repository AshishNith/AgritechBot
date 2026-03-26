export function getAndroidDownloadUrl(): string {
  return ((import.meta as any).env?.VITE_ANDROID_APP_URL as string | undefined)?.trim() || '';
}

export function getApiBaseUrl(): string {
  return ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined)?.trim() || 'http://localhost:4000';
}
