import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

type ChatSessionSummary = {
  sessionId: string;
  title: string;
  preview?: string;
  updatedAt: string;
};

type ChatMessage = {
  _id: string;
  role: 'user' | 'assistant' | 'system';
  content: {
    text?: string;
    type?: 'text' | 'image' | 'tool_call' | 'tool_result';
  };
  metadata?: {
    audioBase64?: string;
    audioMimeType?: string;
    voiceInput?: boolean;
  };
  createdAt?: string;
};

const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:4000'
  : import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const TOKEN_STORAGE_KEY = 'anaajai_website_token';

async function apiRequest<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData;
  const shouldSendJsonContentType = Boolean(options?.body) && !isFormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(shouldSendJsonContentType ? { 'Content-Type': 'application/json' } : {}),
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(
      typeof payload?.error === 'string' ? payload.error : `Request failed with ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

export default function ChatWidget() {
  const [tokenDraft, setTokenDraft] = useState('');
  const [token, setToken] = useState('');
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const activeSession = useMemo(
    () => sessions.find((session) => session.sessionId === activeSessionId) || null,
    [activeSessionId, sessions]
  );

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) || '';
    if (savedToken) {
      setToken(savedToken);
      setTokenDraft(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadSessions(token);
  }, [token]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
    };
  }, []);

  async function loadSessions(nextToken = token) {
    if (!nextToken) {
      return;
    }

    setIsLoadingSessions(true);
    setError(null);
    try {
      const data = await apiRequest<{
        sessions: Array<{
          sessionId: string;
          title: string;
          preview?: string;
          updatedAt: string;
        }>;
      }>('/api/v1/chat/sessions', nextToken);

      setSessions(data.sessions);
      if (!activeSessionId && data.sessions.length > 0) {
        setActiveSessionId(data.sessions[0].sessionId);
        void loadMessages(data.sessions[0].sessionId, nextToken);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  }

  async function loadMessages(sessionId: string, nextToken = token) {
    if (!nextToken) {
      return;
    }

    setActiveSessionId(sessionId);
    setIsLoadingMessages(true);
    setError(null);
    try {
      const data = await apiRequest<{ messages: ChatMessage[] }>(
        `/api/v1/chat/sessions/${sessionId}/messages`,
        nextToken
      );
      setMessages(data.messages.filter((message) => message.role !== 'system'));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }

  async function createSession() {
    if (!token) {
      return;
    }

    try {
      const data = await apiRequest<{ sessionId: string; title: string; createdAt: string }>(
        '/api/v1/chat/sessions',
        token,
        { method: 'POST' }
      );

      const nextSession: ChatSessionSummary = {
        sessionId: data.sessionId,
        title: data.title,
        updatedAt: data.createdAt,
      };
      setSessions((current) => [nextSession, ...current]);
      setActiveSessionId(data.sessionId);
      setMessages([]);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to create session');
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !token) {
      return;
    }

    let sessionId = activeSessionId;
    if (!sessionId) {
      const created = await apiRequest<{ sessionId: string; title: string; createdAt: string }>(
        '/api/v1/chat/sessions',
        token,
        { method: 'POST' }
      );
      sessionId = created.sessionId;
      setActiveSessionId(created.sessionId);
      setSessions((current) => [
        {
          sessionId: created.sessionId,
          title: created.title,
          updatedAt: created.createdAt,
        },
        ...current,
      ]);
    }

    const optimisticUserMessage: ChatMessage = {
      _id: `local-${Date.now()}`,
      role: 'user',
      content: { text: trimmed, type: 'text' },
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticUserMessage]);
    setInput('');
    setIsSending(true);
    setError(null);

    try {
      const data = await apiRequest<{
        response: string;
        audioBase64?: string;
        audioMimeType?: string;
      }>(
        `/api/v1/chat/sessions/${sessionId}/message`,
        token,
        {
          method: 'POST',
          body: JSON.stringify({ text: trimmed }),
        }
      );

      setMessages((current) => [
        ...current,
        {
          _id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: { text: data.response, type: 'text' },
          createdAt: new Date().toISOString(),
          metadata: {
            audioBase64: data.audioBase64,
            audioMimeType: data.audioMimeType,
          },
        },
      ]);

      await loadSessions(token);
      await playAssistantAudio(data.audioBase64, data.audioMimeType);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }

  async function ensureSession(nextToken = token) {
    if (activeSessionId) {
      return activeSessionId;
    }

    const created = await apiRequest<{ sessionId: string; title: string; createdAt: string }>(
      '/api/v1/chat/sessions',
      nextToken,
      { method: 'POST' }
    );

    setActiveSessionId(created.sessionId);
    setSessions((current) => [
      {
        sessionId: created.sessionId,
        title: created.title,
        updatedAt: created.createdAt,
      },
      ...current,
    ]);

    return created.sessionId;
  }

  async function playAssistantAudio(base64Audio?: string, mimeType?: string) {
    if (!base64Audio) {
      return;
    }

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    const audio = new Audio(`data:${mimeType || 'audio/mp3'};base64,${base64Audio}`);
    activeAudioRef.current = audio;
    await audio.play();
  }

  async function stopRecordingAndSend() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) {
      return;
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => {
        const recordedBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        resolve(recordedBlob);
      };
      recorder.onerror = () => reject(new Error('Recording failed'));
      recorder.stop();
    });

    recorder.stream.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    setIsRecording(false);

    if (!token) {
      return;
    }

    const sessionId = await ensureSession(token);
    const optimisticId = `voice-${Date.now()}`;
    setMessages((current) => [
      ...current,
      {
        _id: optimisticId,
        role: 'user',
        content: { text: 'Transcribing voice message...', type: 'text' },
        createdAt: new Date().toISOString(),
        metadata: { voiceInput: true },
      },
    ]);

    setIsSending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('language', 'English');
      formData.append('file', blob, `voice-query.${blob.type.includes('webm') ? 'webm' : 'm4a'}`);

      const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions/${sessionId}/voice`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        transcript?: string;
        answer?: string;
        audioBase64?: string;
        audioMimeType?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || `Voice request failed with ${response.status}`);
      }

      setMessages((current) => [
        ...current.filter((message) => message._id !== optimisticId),
        {
          _id: `voice-user-${Date.now()}`,
          role: 'user',
          content: { text: payload.transcript || '', type: 'text' },
          createdAt: new Date().toISOString(),
          metadata: { voiceInput: true },
        },
        {
          _id: `voice-assistant-${Date.now()}`,
          role: 'assistant',
          content: { text: payload.answer || '', type: 'text' },
          createdAt: new Date().toISOString(),
          metadata: {
            audioBase64: payload.audioBase64,
            audioMimeType: payload.audioMimeType,
          },
        },
      ]);

      await loadSessions(token);
      await playAssistantAudio(payload.audioBase64, payload.audioMimeType);
    } catch (requestError) {
      setMessages((current) => current.filter((message) => message._id !== optimisticId));
      setError(requestError instanceof Error ? requestError.message : 'Failed to send voice message');
    } finally {
      setIsSending(false);
    }
  }

  async function toggleRecording() {
    setRecordingError(null);

    if (isRecording) {
      await stopRecordingAndSend();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setRecordingError('Voice recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (requestError) {
      setRecordingError(requestError instanceof Error ? requestError.message : 'Microphone permission denied');
    }
  }

  function saveToken() {
    const trimmed = tokenDraft.trim();
    if (!trimmed) {
      setToken('');
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(TOKEN_STORAGE_KEY, trimmed);
    setToken(trimmed);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
              Sessions
            </p>
            <h2 className="mt-2 text-2xl font-headline font-bold text-primary">
              Farm conversations
            </h2>
          </div>
          <button
            type="button"
            onClick={createSession}
            className="rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-on-primary"
          >
            New chat
          </button>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-low p-4">
          <label className="block text-sm font-semibold text-on-surface">User JWT</label>
          <textarea
            value={tokenDraft}
            onChange={(event) => setTokenDraft(event.target.value)}
            rows={4}
            placeholder="Paste a valid farmer JWT to use the live chat API"
            className="mt-3 w-full rounded-2xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm outline-none"
          />
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={saveToken}
              className="rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-on-primary"
            >
              Save token
            </button>
            <button
              type="button"
              onClick={() => {
                setToken('');
                setTokenDraft('');
                setSessions([]);
                setMessages([]);
                setActiveSessionId(null);
                window.localStorage.removeItem(TOKEN_STORAGE_KEY);
              }}
              className="rounded-2xl border border-outline-variant/20 px-4 py-3 text-sm font-bold"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {isLoadingSessions ? (
            <p className="text-sm text-on-surface-variant">Loading sessions...</p>
          ) : sessions.length ? (
            sessions.map((session) => (
              <button
                type="button"
                key={session.sessionId}
                onClick={() => void loadMessages(session.sessionId)}
                className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                  activeSessionId === session.sessionId
                    ? 'border-primary/40 bg-primary/10'
                    : 'border-outline-variant/20 bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <p className="font-bold text-on-surface">{session.title}</p>
                {session.preview ? (
                  <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">
                    {session.preview}
                  </p>
                ) : null}
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-on-surface-variant">
                  {new Date(session.updatedAt).toLocaleString()}
                </p>
              </button>
            ))
          ) : (
            <p className="text-sm text-on-surface-variant">
              Save a valid JWT and start a new session to use the live assistant on the web.
            </p>
          )}
        </div>
      </aside>

      <section className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant/10 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
              Live assistant
            </p>
            <h2 className="mt-2 text-3xl font-headline font-bold text-primary">
              {activeSession?.title || 'New agricultural advisory chat'}
            </h2>
          </div>
          <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            Backend: <span className="font-bold text-on-surface">{API_BASE_URL}</span>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-900">
            {error}
          </div>
        ) : null}

        {recordingError ? (
          <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-950">
            {recordingError}
          </div>
        ) : null}

        <div className="mt-5 h-[28rem] overflow-y-auto rounded-[1.75rem] border border-outline-variant/20 bg-surface p-4">
          {isLoadingMessages ? (
            <p className="text-sm text-on-surface-variant">Loading messages...</p>
          ) : messages.length ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 ${
                    message.role === 'user'
                      ? 'ml-auto bg-primary text-on-primary'
                      : 'bg-white text-slate-900 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content.text || ''}
                  </p>
                  {message.metadata?.voiceInput ? (
                    <p
                      className={`mt-2 text-[11px] uppercase tracking-[0.12em] ${
                        message.role === 'user' ? 'text-on-primary/80' : 'text-slate-500'
                      }`}
                    >
                      Voice message
                    </p>
                  ) : null}
                  {message.role === 'assistant' && message.metadata?.audioBase64 ? (
                    <button
                      type="button"
                      onClick={() =>
                        void playAssistantAudio(
                          message.metadata?.audioBase64,
                          message.metadata?.audioMimeType
                        )
                      }
                      className="mt-3 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                    >
                      Play voice reply
                    </button>
                  ) : null}
                  {message.createdAt ? (
                    <p
                      className={`mt-2 text-[11px] uppercase tracking-[0.12em] ${
                        message.role === 'user' ? 'text-on-primary/80' : 'text-slate-500'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              ))}
              {isSending ? (
                <div className="max-w-[85%] rounded-[1.5rem] bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  Krishi is thinking...
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <p className="text-lg font-bold text-on-surface">
                  Ask your first question about your crops
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  This widget talks to the same production chat API used by the app.
                </p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="mt-5 flex gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={3}
            placeholder="Describe the crop issue, weather concern, or farming decision you need help with"
            className="min-h-[84px] flex-1 rounded-[1.5rem] border border-outline-variant/20 bg-surface px-4 py-3 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => void toggleRecording()}
            disabled={isSending || !token}
            className={`min-w-[120px] rounded-[1.5rem] px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
              isRecording ? 'bg-red-600' : 'bg-emerald-600'
            }`}
          >
            {isRecording ? 'Stop voice' : 'Record voice'}
          </button>
          <button
            type="submit"
            disabled={isSending || !input.trim() || !token}
            className="min-w-[120px] rounded-[1.5rem] bg-primary px-5 py-4 font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </section>
    </div>
  );
}
