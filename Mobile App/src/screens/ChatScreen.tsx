import { IconMap } from '../components/IconMap';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Animated } from 'react-native';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { apiService } from '../api/services';
import { AppText, GradientButton, Pill, Screen, TypingDots } from '../components/ui';
import { designImages } from '../constants/designData';
import { t } from '../constants/localization';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { ChatMessage, ChatSummary } from '../types/api';
import { useTheme } from '../providers/ThemeContext';
import { languageOptions } from '../constants/designData';
import { useI18n } from '../hooks/useI18n';
import { RecordedAudioClip, useAudioRecorder } from '../hooks/useAudioRecorder';

const starterId = 'starter';

function buildStarterMessage(language: string): ChatMessage {
  return {
    id: starterId,
    chatId: starterId,
    role: 'assistant',
    content: t(language as any, 'greeting'),
  };
}

export function ChatScreen() {
  const { isDark, colors } = useTheme();
  const { t: tx } = useI18n();
  const route = useRoute<RouteProp<MainTabParamList, 'ChatTab'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const [messages, setMessages] = useState<ChatMessage[]>([buildStarterMessage(language)]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState<string | undefined>(route.params?.chatId);
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [pickedImageBase64, setPickedImageBase64] = useState<string | null>(null);
  const [pickedImageMimeType, setPickedImageMimeType] = useState<string | null>(null);
  const [isHydratingHistory, setIsHydratingHistory] = useState(false);
  const [sessionDrawerOpen, setSessionDrawerOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);
  const [activeTimestampId, setActiveTimestampId] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [lastFailedDraft, setLastFailedDraft] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  // Voice status: idle | recording | transcribing | processing
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'recording' | 'transcribing' | 'processing'>('idle');
  const scrollRef = useRef<ScrollView>(null);
  const activeSoundRef = useRef<Audio.Sound | null>(null);
  const recordingModeRef = useRef<'transcribe' | 'voice' | null>(null);
  const ignoreNextTapRef = useRef(false);
  // Pulsing animation for mic button while recording
  const micPulse = useRef(new Animated.Value(1)).current;
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  // Start pulsing animation when recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, { toValue: 1.25, duration: 500, useNativeDriver: true }),
          Animated.timing(micPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      micPulse.stopAnimation();
      Animated.timing(micPulse, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    }
  }, [isRecording, micPulse]);

  const sessionsQuery = useQuery({
    queryKey: ['chat-history'],
    queryFn: () => apiService.getChatHistory(),
  });

  const contextQuery = useQuery({
    queryKey: ['chat-context'],
    queryFn: () => apiService.getChatContext(),
  });

  const currentSession = useMemo<ChatSummary | undefined>(
    () => sessionsQuery.data?.chats.find((item) => item.id === chatId),
    [chatId, sessionsQuery.data?.chats]
  );

  useEffect(() => {
    if (route.params?.chatId) {
      setChatId(route.params.chatId);
    }
  }, [route.params?.chatId]);

  useEffect(() => {
    setMessages((current) => {
      if (!current.length || current[0]?.id !== starterId) {
        return current;
      }

      return [buildStarterMessage(language)];
    });
  }, [language]);

  useEffect(() => {
    if (!chatId) {
      setMessages([buildStarterMessage(language)]);
      return;
    }

    let cancelled = false;
    setIsHydratingHistory(true);

    apiService
      .getChatMessages(chatId)
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (!data.messages.length) {
          setMessages([buildStarterMessage(language)]);
          return;
        }

        setMessages(data.messages);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setMessages([
          buildStarterMessage(language),
          {
            id: `${Date.now()}-load-error`,
            chatId,
            role: 'assistant',
            content: t(language, 'backendsConnectionError'),
          },
        ]);
      })
      .finally(() => {
        if (!cancelled) {
          setIsHydratingHistory(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chatId, language]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    return () => {
      activeSoundRef.current?.unloadAsync().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const askMutation = useMutation({
    mutationFn: (payload: { message: string; imageBase64?: string; imageMimeType?: string }) =>
      apiService.askChat({
        message: payload.message,
        language,
        chatId,
        imageBase64: payload.imageBase64,
        imageMimeType: payload.imageMimeType,
      }),
    onSuccess: async (data, variables) => {
      setChatId(data.chatId);
      setLastFailedDraft(null);
      setPickedImageUri(null);
      setPickedImageBase64(null);
      setPickedImageMimeType(null);
      const responseAudioUrl = data.audioBase64
        ? `data:${data.audioMimeType || 'audio/mp3'};base64,${data.audioBase64}`
        : undefined;

      setMessages((current) => [
        ...current.filter((message) => message.id !== starterId),
        {
          id: `${Date.now()}-assistant`,
          chatId: data.chatId,
          role: 'assistant',
          content: data.answer,
          audioUrl: responseAudioUrl,
          audioMimeType: data.audioMimeType,
        },
      ]);

      await queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      if (!chatId || chatId !== data.chatId) {
        await queryClient.invalidateQueries({ queryKey: ['chat-context'] });
      }

      if (variables.imageBase64) {
        Alert.alert(t(language, 'aiAssistant'), tx('imageWillBeSentWithQuestion'));
      }

      if (responseAudioUrl) {
        await playAudio(responseAudioUrl);
      }
    },
    onError: (error, variables) => {
      let message = t(language, 'backendsConnectionError');
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message = t(language, 'sessionExpired');
        } else if (
          typeof error.response?.data === 'object' &&
          error.response?.data &&
          'error' in error.response.data
        ) {
          message = String((error.response.data as { error?: unknown }).error || message);
        }
      }

      setLastFailedDraft(variables.message);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant-error`,
          chatId: chatId ?? 'local',
          role: 'assistant',
          content: message,
          error: { message },
        },
      ]);
    },
  });

  const renameMutation = useMutation({
    mutationFn: (title: string) => apiService.renameChatSession(chatId!, title),
    onSuccess: async () => {
      setRenameModalOpen(false);
      setRenameValue('');
      await queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (sessionId: string) => apiService.archiveChatSession(sessionId),
    onSuccess: async (_, sessionId) => {
      if (chatId === sessionId) {
        setChatId(undefined);
        setMessages([buildStarterMessage(language)]);
      }

      await queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: (sessionId: string) => apiService.clearChatHistory(sessionId),
    onSuccess: () => {
      setMessages([buildStarterMessage(language)]);
    },
  });

  const sendMessage = (overrideText?: string) => {
    const outgoing = (overrideText ?? input).trim();
    if (!outgoing) {
      return;
    }

    const localChatId = chatId ?? 'local';
    setMessages((current) => [
      ...current.filter((message) => message.id !== starterId),
      {
        id: `${Date.now()}-user`,
        chatId: localChatId,
        role: 'user',
        content: outgoing,
        type: pickedImageBase64 ? 'image' : 'text',
      },
    ]);
    setInput('');

    askMutation.mutate({
      message: outgoing,
      imageBase64: pickedImageBase64 || undefined,
      imageMimeType: pickedImageMimeType || undefined,
    });
  };

  const retryLastFailed = () => {
    if (!lastFailedDraft) {
      return;
    }

    sendMessage(lastFailedDraft);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setPickedImageUri(asset.uri);
      setPickedImageBase64(asset.base64 || null);
      setPickedImageMimeType(asset.mimeType || 'image/jpeg');
    }
  };

  const removePickedImage = () => {
    setPickedImageUri(null);
    setPickedImageBase64(null);
    setPickedImageMimeType(null);
  };

  const playAudio = async (audioUrl?: string) => {
    if (!audioUrl) {
      Alert.alert(t(language, 'noAudio'), t(language, 'noAudioPayload'));
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    await activeSoundRef.current?.unloadAsync();
    const sound = new Audio.Sound();
    activeSoundRef.current = sound;
    await sound.loadAsync({ uri: audioUrl });
    await sound.playAsync();
  };

  // ── Full voice pipeline: STT → AI → TTS ──────────────────────────────────
  const voiceMutation = useMutation({
    mutationFn: (audioClip: RecordedAudioClip) => apiService.sendVoiceMessage(audioClip, language, chatId),
    onMutate: () => setVoiceStatus('processing'),
    onSettled: () => setVoiceStatus('idle'),
    onSuccess: async (data) => {
      const voiceAudioUrl = data.audioUrl
        ?? (data.audioBase64 ? `data:${data.audioMimeType || 'audio/mp3'};base64,${data.audioBase64}` : undefined);

      setChatId(data.chatId);
      setLastFailedDraft(null);
      setMessages((current) => [
        ...current.filter((message) => message.id !== starterId),
        {
          id: `${Date.now()}-voice-user`,
          chatId: data.chatId,
          role: 'user',
          content: data.transcript || '',
          type: 'text',
          voiceInput: true,
        },
        {
          id: `${Date.now()}-voice-assistant`,
          chatId: data.chatId,
          role: 'assistant',
          content: data.answer,
          audioUrl: voiceAudioUrl,
          audioMimeType: data.audioMimeType,
        },
      ]);

      await queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      await queryClient.invalidateQueries({ queryKey: ['chat-context'] });

      if (voiceAudioUrl) {
        await playAudio(voiceAudioUrl);
      }
    },
    onError: (error) => {
      let message = tx('voiceRouteUnavailable');

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message = t(language, 'sessionExpired');
        } else if (error.code === 'ECONNABORTED') {
          message = 'Voice request timed out. Please try again.';
        } else if (typeof error.response?.data === 'object' && error.response?.data && 'error' in error.response.data) {
          message = String((error.response.data as { error?: unknown }).error || message);
        } else if (error.message) {
          message = error.message;
        }
      }

      setMessages((current) => [
        ...current.filter((message) => message.id !== starterId),
        {
          id: `${Date.now()}-voice-error`,
          chatId: chatId ?? 'local',
          role: 'assistant',
          content: message,
          error: { message },
        },
      ]);
    },
  });

  // ── STT-only: transcribe → auto-fill input box ────────────────────────────
  const transcribeMutation = useMutation({
    mutationFn: (audioClip: RecordedAudioClip) => apiService.transcribeVoice(audioClip, language),
    onMutate: () => setVoiceStatus('transcribing'),
    onSettled: () => setVoiceStatus('idle'),
    onSuccess: (data) => {
      if (data.transcript) {
        setInput((prev) => prev ? `${prev} ${data.transcript}` : data.transcript);
      }
    },
    onError: () => {
      Alert.alert(tx('voiceRequestFailed'), tx('voiceRouteUnavailable'));
    },
  });

  const beginVoiceRecording = useCallback(
    async (mode: 'transcribe' | 'voice') => {
      try {
        recordingModeRef.current = mode;
        setVoiceStatus('recording');
        await startRecording();
      } catch {
        recordingModeRef.current = null;
        setVoiceStatus('idle');
        Alert.alert(t(language, 'microphoneNotAvailable'), t(language, 'enableMicrophone'));
      }
    },
    [language, startRecording]
  );

  const finishVoiceRecording = useCallback(
    async (mode: 'transcribe' | 'voice') => {
      recordingModeRef.current = null;
      setVoiceStatus(mode === 'voice' ? 'processing' : 'transcribing');
      const clip = await stopRecording();

      if (!clip) {
        setVoiceStatus('idle');
        return;
      }

      if (mode === 'voice') {
        voiceMutation.mutate(clip);
        return;
      }

      transcribeMutation.mutate(clip);
    },
    [stopRecording, transcribeMutation, voiceMutation]
  );

  const handleMicTap = useCallback(async () => {
    if (voiceMutation.isPending || transcribeMutation.isPending) {
      return;
    }

    if (ignoreNextTapRef.current) {
      ignoreNextTapRef.current = false;
      return;
    }

    if (!isRecording) {
      await beginVoiceRecording('transcribe');
      return;
    }

    if (recordingModeRef.current === 'transcribe') {
      await finishVoiceRecording('transcribe');
    }
  }, [beginVoiceRecording, finishVoiceRecording, isRecording, transcribeMutation.isPending, voiceMutation.isPending]);

  const handleMicHoldStart = useCallback(async () => {
    if (voiceMutation.isPending || transcribeMutation.isPending || isRecording) {
      return;
    }

    ignoreNextTapRef.current = true;
    await beginVoiceRecording('voice');
  }, [beginVoiceRecording, isRecording, transcribeMutation.isPending, voiceMutation.isPending]);

  const handleMicHoldEnd = useCallback(async () => {
    if (recordingModeRef.current !== 'voice' || !isRecording) {
      return;
    }

    await finishVoiceRecording('voice');
  }, [finishVoiceRecording, isRecording]);

  const newChat = () => {
    setChatId(undefined);
    setMessages([buildStarterMessage(language)]);
    setInput('');
    removePickedImage();
    setSessionDrawerOpen(false);
  };

  const onMessageLongPress = async (message: ChatMessage) => {
    await Share.share({ message: message.content });
  };

  const displayedMessages = messages.length ? messages : [buildStarterMessage(language)];

  return (
    <Screen dark={isDark} padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: isDark ? colors.backgroundAlt : '#eaf3ee',
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <Pressable
              onPress={() => setSessionDrawerOpen(true)}
              style={[
                styles.topIconButton,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              {(() => {
                const IconComp = IconMap['ChevronRight'];
                return IconComp ? <IconComp size={20} color={isDark ? colors.textOnDark : colors.text} /> : null;
              })()}
            </Pressable>
            <Image source={{ uri: designImages.chatAvatar }} style={styles.avatar} />
            <Pressable
              onPress={() => {
                if (chatId && currentSession) {
                  setRenameValue(currentSession.title);
                  setRenameModalOpen(true);
                }
              }}
            >
              <AppText variant="heading" color={isDark ? colors.textOnDark : colors.text}>
                {currentSession?.title || tx('newChat')}
              </AppText>
              <AppText color={isDark ? '#8de2b2' : colors.primaryDark}>
                {contextQuery.data?.location || t(language, 'online')}
              </AppText>
            </Pressable>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setLanguagePickerOpen(true)}
              style={[
                styles.topIconButton,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              {(() => {
                const IconComp = IconMap['Languages'];
                return IconComp ? <IconComp size={18} color={isDark ? colors.textOnDark : colors.text} /> : null;
              })()}
            </Pressable>
            {chatId ? (
              <Pressable
                onPress={() => clearMutation.mutate(chatId)}
                style={[
                  styles.topIconButton,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                ]}
              >
                {(() => {
                  const IconComp = IconMap['Trash2'];
                  return IconComp ? <IconComp size={18} color={isDark ? colors.textOnDark : colors.text} /> : null;
                })()}
              </Pressable>
            ) : null}
            <Pressable
              onPress={newChat}
              style={[
                styles.topIconButton,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              {(() => {
                const IconComp = IconMap['Plus'];
                return IconComp ? <IconComp size={20} color={isDark ? colors.textOnDark : colors.text} /> : null;
              })()}
            </Pressable>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          contentContainerStyle={[styles.messages, { backgroundColor: colors.background }]}
          onScroll={(event) => {
            const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
            const isNearBottom =
              layoutMeasurement.height + contentOffset.y >= contentSize.height - 120;
            setShowScrollToBottom(!isNearBottom);
          }}
          scrollEventThrottle={16}
        >
          <AppText color={colors.textMuted} style={styles.dateLabel}>
            {contextQuery.data?.season
              ? `${tx('seasonLabel')}: ${contextQuery.data.season} • ${t(language, 'today')}`
              : t(language, 'today')}
          </AppText>

          {displayedMessages.map((message) => (
            <View
              key={message.id}
              style={[styles.messageRow, message.role === 'user' && styles.messageRowUser]}
            >
              <Pressable
                onPress={() =>
                  setActiveTimestampId((current) => (current === message.id ? null : message.id))
                }
                onLongPress={() => onMessageLongPress(message)}
                style={[
                  styles.bubble,
                  message.role === 'user'
                    ? [styles.userBubble, { backgroundColor: colors.primary }]
                    : [
                        styles.aiBubble,
                        {
                          backgroundColor: isDark ? colors.surface : '#ffffff',
                          borderColor: colors.border,
                          borderWidth: 1,
                        },
                      ],
                ]}
              >
                {message.type === 'tool_result' ? (
                  <AppText
                    variant="caption"
                    color={message.role === 'user' ? colors.textOnDark : colors.textMuted}
                    style={{ marginBottom: 6 }}
                  >
                    {tx('toolResult')}
                  </AppText>
                ) : null}
                <AppText
                  color={message.role === 'user' ? colors.textOnDark : isDark ? colors.textOnDark : colors.text}
                  numberOfLines={0}
                  selectable
                  style={{ flexShrink: 1, flexWrap: 'wrap' }}
                >
                  {message.content}
                </AppText>
                {message.voiceInput ? (
                  <AppText
                    variant="caption"
                    color={message.role === 'user' ? 'rgba(255,255,255,0.8)' : colors.textMuted}
                    style={{ marginTop: 8 }}
                  >
                    {tx('recordVoice')}
                  </AppText>
                ) : null}
                {message.role === 'assistant' && message.audioUrl ? (
                  <Pressable onPress={() => playAudio(message.audioUrl)} style={styles.audioButton}>
                    {(() => {
                      const IconComp = IconMap['PlayCircle'];
                      return IconComp ? <IconComp size={18} color={colors.primaryDark} /> : null;
                    })()}
                    <AppText variant="label" color={colors.primaryDark}>
                      {t(language, 'audioPlayback')}
                    </AppText>
                  </Pressable>
                ) : null}
                {activeTimestampId === message.id && message.createdAt ? (
                  <AppText
                    variant="caption"
                    color={message.role === 'user' ? 'rgba(255,255,255,0.8)' : colors.textMuted}
                    style={{ marginTop: 8 }}
                  >
                    {new Date(message.createdAt).toLocaleString()}
                  </AppText>
                ) : null}
                {message.error ? (
                  <GradientButton
                    label={tx('retry')}
                    secondary
                    onPress={retryLastFailed}
                    style={{ marginTop: 12 }}
                  />
                ) : null}
              </Pressable>
            </View>
          ))}

          {(askMutation.isPending || voiceMutation.isPending || isHydratingHistory) && (
            <View style={styles.messageRow}>
              <View
                style={[
                  styles.aiBubble,
                  {
                    backgroundColor: isDark ? colors.surface : '#ffffff',
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <TypingDots isDark={isDark} />
                <AppText color={colors.textMuted}>
                  {voiceMutation.isPending ? t(language, 'processing') : tx('thinking')}
                </AppText>
              </View>
            </View>
          )}

          {showScrollToBottom ? <View style={{ height: 56 }} /> : null}
        </ScrollView>

        {showScrollToBottom ? (
          <Pressable
            onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
            style={[styles.scrollFab, { backgroundColor: colors.primary }]}
          >
            {(() => {
              const IconComp = IconMap['ChevronRight'];
              return IconComp ? (
                <IconComp
                  size={20}
                  color={colors.textOnDark}
                  style={{ transform: [{ rotate: '90deg' }] }}
                />
              ) : null;
            })()}
          </Pressable>
        ) : null}

        <View
          style={[
            styles.footer,
            {
              backgroundColor: isDark ? colors.backgroundAlt : '#eaf3ee',
              borderTopColor: colors.border,
            },
          ]}
        >
          {pickedImageUri ? (
            <View style={styles.imagePreviewRow}>
              <Image source={{ uri: pickedImageUri }} style={styles.previewImage} />
              <View style={{ flex: 1 }}>
                <AppText color={isDark ? colors.textOnDark : colors.text}>{t(language, 'imageAttached')}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {tx('imageWillBeSentWithQuestion')}
                </AppText>
              </View>
              <Pressable onPress={removePickedImage} style={styles.removeImageButton}>
                {(() => {
                  const IconComp = IconMap['X'];
                  return IconComp ? <IconComp size={18} color={colors.textMuted} /> : null;
                })()}
              </Pressable>
            </View>
          ) : null}

          <View style={styles.languageRow}>
            <Pill label={language} active />
          </View>

          {/* Voice status banner */}
          {voiceStatus !== 'idle' && (
            <View
              style={[
                styles.voiceStatusBanner,
                {
                  backgroundColor: voiceStatus === 'recording'
                    ? 'rgba(212, 95, 95, 0.12)'
                    : 'rgba(82, 183, 129, 0.12)',
                  borderColor: voiceStatus === 'recording'
                    ? 'rgba(212, 95, 95, 0.3)'
                    : colors.border,
                },
              ]}
            >
              {(() => {
                const IconComp = voiceStatus === 'recording' ? IconMap['Mic'] : IconMap['Sparkles'];
                return IconComp ? (
                  <IconComp
                    size={14}
                    color={voiceStatus === 'recording' ? '#d45f5f' : colors.primary}
                  />
                ) : null;
              })()}
              <AppText
                variant="caption"
                color={voiceStatus === 'recording' ? '#d45f5f' : colors.primary}
              >
                {voiceStatus === 'recording'
                  ? tx('listening')
                  : voiceStatus === 'transcribing'
                    ? 'Transcribing...'
                    : t(language, 'processing')}
              </AppText>
              {voiceStatus === 'recording' && (
                <AppText variant="caption" color={colors.textMuted}>
                  {'Tap to fill input. Hold for AI reply.'}
                </AppText>
              )}
            </View>
          )}

          <View style={styles.inputRow}>
            <Pressable
              onPress={pickImage}
              style={[
                styles.iconAction,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              {(() => {
                const IconComp = IconMap['ImagePlus'];
                return IconComp ? <IconComp size={20} color={isDark ? colors.textOnDark : colors.text} /> : null;
              })()}
            </Pressable>
            <TextInput
              placeholder={t(language, 'typeHere')}
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                  color: isDark ? colors.textOnDark : colors.text,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
              multiline
            />
            {/* Mic button: tap = STT to box | long-press = full voice reply */}
            <Animated.View style={{ transform: [{ scale: micPulse }] }}>
              <Pressable
                onPress={handleMicTap}
                onLongPress={handleMicHoldStart}
                onPressOut={handleMicHoldEnd}
                delayLongPress={400}
                disabled={voiceMutation.isPending || transcribeMutation.isPending}
                style={[
                  styles.iconAction,
                  {
                    backgroundColor: isRecording
                      ? '#d45f5f'
                      : voiceMutation.isPending || transcribeMutation.isPending
                        ? isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
                        : isDark
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.05)',
                  },
                ]}
              >
                {(() => {
                  const IconComp = IconMap['Mic'];
                  return IconComp ? (
                    <IconComp
                      size={20}
                      color={
                        isRecording
                          ? '#ffffff'
                          : voiceMutation.isPending || transcribeMutation.isPending
                            ? colors.textMuted
                            : isDark ? colors.textOnDark : colors.text
                      }
                    />
                  ) : null;
                })()}
              </Pressable>
            </Animated.View>
            <GradientButton label={t(language, 'sendMessage')} onPress={() => sendMessage()} style={styles.sendButton} />
          </View>

        </View>

          <Modal
          visible={sessionDrawerOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setSessionDrawerOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setSessionDrawerOpen(false)} />
            <View
              style={[
                styles.drawer,
                {
                  backgroundColor: isDark ? colors.backgroundAlt : '#f6fbf7',
                  borderRightColor: colors.border,
                },
              ]}
            >
              <View style={styles.drawerHeader}>
                <AppText variant="heading">{tx('pastSessions')}</AppText>
                <GradientButton label={tx('newChat')} onPress={newChat} />
              </View>
              <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
                {(sessionsQuery.data?.chats || []).map((session) => (
                  <Pressable
                    key={session.id}
                    onPress={() => {
                      setChatId(session.id);
                      setSessionDrawerOpen(false);
                    }}
                    style={[
                      styles.sessionCard,
                      {
                        backgroundColor:
                          chatId === session.id
                            ? isDark
                              ? 'rgba(82,183,129,0.18)'
                              : 'rgba(82,183,129,0.14)'
                            : isDark
                              ? colors.surface
                              : '#ffffff',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <AppText variant="label">{session.title}</AppText>
                    {session.preview ? (
                      <AppText color={colors.textMuted} numberOfLines={2}>
                        {session.preview}
                      </AppText>
                    ) : null}
                    <AppText variant="caption" color={colors.textMuted}>
                      {session.language}
                    </AppText>
                    <View style={styles.sessionActions}>
                      <Pressable
                        onPress={() => {
                          setChatId(session.id);
                          setRenameValue(session.title);
                          setRenameModalOpen(true);
                          setSessionDrawerOpen(false);
                        }}
                      >
                        <AppText color={colors.primaryDark}>{tx('rename')}</AppText>
                      </Pressable>
                      <Pressable onPress={() => archiveMutation.mutate(session.id)}>
                        <AppText color="#b35757">{tx('archive')}</AppText>
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
          visible={renameModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setRenameModalOpen(false)}
        >
          <View style={styles.centeredModalBackdrop}>
            <View
              style={[
                styles.renameModal,
                {
                  backgroundColor: isDark ? colors.surface : '#ffffff',
                  borderColor: colors.border,
                },
              ]}
            >
              <AppText variant="heading">{tx('renameSession')}</AppText>
              <TextInput
                value={renameValue}
                onChangeText={setRenameValue}
                placeholder={tx('enterSessionTitle')}
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.renameInput,
                  {
                    borderColor: colors.border,
                    color: isDark ? colors.textOnDark : colors.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f7faf8',
                  },
                ]}
              />
              <View style={styles.renameActions}>
                <GradientButton label={tx('cancel')} secondary onPress={() => setRenameModalOpen(false)} />
                <GradientButton
                  label={renameMutation.isPending ? tx('saving') : t(language, 'save')}
                  onPress={() => {
                    if (!renameValue.trim() || !chatId) {
                      return;
                    }
                    renameMutation.mutate(renameValue.trim());
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={languagePickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setLanguagePickerOpen(false)}
        >
          <View style={styles.centeredModalBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setLanguagePickerOpen(false)} />
            <View
              style={[
                styles.languageModal,
                {
                  backgroundColor: isDark ? colors.surface : '#ffffff',
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <AppText variant="heading">{t(language, 'language')}</AppText>
                <Pressable onPress={() => setLanguagePickerOpen(false)} style={styles.topIconButton}>
                  {(() => {
                    const IconComp = IconMap['X'];
                    return IconComp ? <IconComp size={18} color={colors.textMuted} /> : null;
                  })()}
                </Pressable>
              </View>
              <View style={{ gap: 10 }}>
                {languageOptions.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setLanguage(option);
                      setLanguagePickerOpen(false);
                    }}
                    style={[
                      styles.languageOption,
                      {
                        backgroundColor:
                          option === language
                            ? isDark
                              ? 'rgba(82,183,129,0.18)'
                              : 'rgba(82,183,129,0.14)'
                            : isDark
                              ? colors.backgroundAlt
                              : '#f7faf8',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <AppText variant="label">{option}</AppText>
                    {option === language ? (
                      (() => {
                        const IconComp = IconMap['CheckCircle2'];
                        return IconComp ? <IconComp size={18} color={colors.primaryDark} /> : null;
                      })()
                    ) : null}
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
  },
  messagesScroll: {
    flex: 1,
  },
  messages: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    flexGrow: 1,
  },
  dateLabel: {
    textAlign: 'center',
    marginVertical: 12,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '84%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    flexShrink: 1,
    minWidth: 0,
  },
  aiBubble: {
    borderTopLeftRadius: 8,
  },
  userBubble: {
    borderTopRightRadius: 8,
  },
  audioButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  imagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  removeImageButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 0,
  },
  sendButton: {
    minWidth: 74,
  },
  scrollFab: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
  },
  drawer: {
    width: '82%',
    maxWidth: 360,
    height: '100%',
    paddingTop: 60,
    paddingHorizontal: 16,
    borderRightWidth: 1,
  },
  drawerHeader: {
    gap: 12,
    marginBottom: 16,
  },
  sessionCard: {
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  sessionActions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centeredModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  renameModal: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  renameInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  renameActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  languageModal: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  languageOption: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiceStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
});
