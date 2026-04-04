export type QueryType = "simple" | "image" | "complex";

export type ModelTier = "gemini-2.5-flash-lite" | "gemini-2.5-flash";

export type ImageMimeType = "image/jpeg" | "image/png" | "image/webp";

export interface AnaajRequest {
  userId: string;
  message: string;
  imageBase64?: string;
  imageMimeType?: ImageMimeType;
  audioBuffer?: Buffer;
  languageCode?: string;
  isVoiceInput?: boolean;
}

export interface AnaajResponse {
  text: string;
  modelUsed: ModelTier;
  queryType: QueryType;
  transcribedText?: string;
  audioBase64?: string;
}
