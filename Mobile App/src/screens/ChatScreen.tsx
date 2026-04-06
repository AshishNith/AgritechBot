import { IconMap } from '../components/IconMap';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
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
import { AppText, GradientButton, Pill, ProgressBar, Screen, TypingDots } from '../components/ui';
import { UsageLimitModal } from '../components/UsageLimitModal';
import { designImages } from '../constants/designData';
import { t } from '../constants/localization';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { ChatMessage, ChatSummary } from '../types/api';
import { useTheme } from '../providers/ThemeContext';
import { languageOptions } from '../constants/designData';
import { useI18n } from '../hooks/useI18n';
import { theme } from '../constants/theme';
import { RecordedAudioClip, useAudioRecorder } from '../hooks/useAudioRecorder';
import { ChatMessageItem } from '../components/chat/ChatMessageItem';
import { PaywallBottomSheet } from '../components/PaywallBottomSheet';
import { Product } from '../types/api';
import { useWallet } from '../hooks/useWallet';
import { PLAN_CONFIGS } from '../store/useWalletStore';

const starterId = 'starter';
const MIN_TRANSCRIBE_DURATION_MS = 700;

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
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const hasPlayedGreeting = useAppStore((state) => state.hasPlayedGreeting);
  const setHasPlayedGreeting = useAppStore((state) => state.setHasPlayedGreeting);
  
  const { 
    wallet, 
    requireChat, 
    deductChat, 
    chatPaywallVisible, 
    dismissChatPaywall, 
    refetchWallet 
  } = useWallet();

  const [messages, setMessages] = useState<ChatMessage[]>([buildStarterMessage(language)]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState<string | undefined>(route?.params?.chatId);
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
  const [lastFailedDraft, setLastFailedDraft] = useState<
    | { type: 'text'; message: string; imageBase64?: string; imageMimeType?: string }
    | { type: 'voice'; clip: RecordedAudioClip }
    | null
  >(null);
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

  useFocusEffect(
    useCallback(() => {
      void refetchWallet();
    }, [refetchWallet])
  );

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

  // Handle initialMessage from other screens (e.g., ImageScan)
  useEffect(() => {
    if (route.params?.initialMessage) {
      // If we have an initial message and hasn't been sent yet
      setInput(route.params.initialMessage);
      // We wait a tiny bit to ensure the UI is ready
      const timer = setTimeout(() => {
        sendMessage(route.params?.initialMessage);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [route.params?.initialMessage]);

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

  // Play Default Greeting Voice on first load
  useEffect(() => {
    const playGreeting = async () => {
      if (hasPlayedGreeting || chatId) return;

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/InitialAudio.wav')
        );
        activeSoundRef.current = sound;
        setHasPlayedGreeting(true);
        await sound.playAsync();
      } catch (error) {
        console.warn('Failed to play greeting audio:', error);
      }
    };

    // Small delay to ensure UI is ready
    const timer = setTimeout(playGreeting, 1000);
    return () => clearTimeout(timer);
  }, [hasPlayedGreeting, chatId, setHasPlayedGreeting]);

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
          createdAt: new Date().toISOString(),
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

      // Refresh wallet to update usage progress
      void refetchWallet();
    },
    onError: (error: any, variables) => {
      const statusCode = error?.response?.status;
      
      // Refresh wallet first to get accurate credit state
      void refetchWallet();
      
      if (statusCode === 402 || statusCode === 403) {
        // Show paywall immediately when out of credits
        setTimeout(() => requireChat(true), 100);
      } else {
        const errorMessage = error?.message || t(language, 'errUnknown');
        Alert.alert(tx('alerts'), errorMessage);
      }

      setLastFailedDraft({
        type: 'text',
        message: variables.message,
        imageBase64: variables.imageBase64,
        imageMimeType: variables.imageMimeType,
      });

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant-error`,
          chatId: chatId ?? 'local',
          role: 'assistant',
          content: error?.message || t(language, 'errUnknown'),
          error: { message: error?.message },
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

    if (!requireChat()) return;
    deductChat();

    const localChatId = chatId ?? 'local';
    setMessages((current) => [
      ...current.filter((message) => message.id !== starterId),
      {
        id: `${Date.now()}-user`,
        chatId: localChatId,
        role: 'user',
        content: outgoing,
        type: pickedImageBase64 ? 'image' : 'text',
        createdAt: new Date().toISOString(),
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

    if (lastFailedDraft.type === 'text') {
      const outgoing = lastFailedDraft.message.trim();
      if (!outgoing) return;

      if (!requireChat()) return;
      deductChat();

      const localChatId = chatId ?? 'local';
      setMessages((current) => [
        ...current.filter((message) => message.id !== starterId),
        {
          id: `${Date.now()}-user`,
          chatId: localChatId,
          role: 'user',
          content: outgoing,
          type: lastFailedDraft.imageBase64 ? 'image' : 'text',
          createdAt: new Date().toISOString(),
        },
      ]);
      askMutation.mutate({
        message: outgoing,
        imageBase64: lastFailedDraft.imageBase64,
        imageMimeType: lastFailedDraft.imageMimeType,
      });
    } else if (lastFailedDraft.type === 'voice') {
      if (!requireChat()) return;
      deductChat();
      voiceMutation.mutate(lastFailedDraft.clip);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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

  // Full voice pipeline: STT → AI → TTS
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
          createdAt: new Date().toISOString(),
        },
        {
          id: `${Date.now()}-voice-assistant`,
          chatId: data.chatId,
          role: 'assistant',
          content: data.answer,
          audioUrl: voiceAudioUrl,
          audioMimeType: data.audioMimeType,
          createdAt: new Date().toISOString(),
        },
      ]);

      await queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      await queryClient.invalidateQueries({ queryKey: ['chat-context'] });

      if (voiceAudioUrl) {
        await playAudio(voiceAudioUrl);
      }

      // Refresh wallet
      void refetchWallet();
    },
    onError: (error: any, variables) => {
      const statusCode = error?.response?.status;
      
      // Refresh wallet to get accurate credit state
      void refetchWallet();
      
      if (statusCode === 402 || statusCode === 403) {
        setTimeout(() => requireChat(true), 100);
      } else {
        const errorMessage = error?.message || tx('voiceRouteUnavailable');
        Alert.alert(tx('alerts'), errorMessage);
      }

      setLastFailedDraft({ type: 'voice', clip: variables });
      
      setMessages((current) => [
        ...current.filter((message) => message.id !== starterId),
        {
          id: `${Date.now()}-voice-error`,
          chatId: chatId ?? 'local',
          role: 'assistant',
          content: error?.message || tx('voiceRouteUnavailable'),
          error: { message: error?.message },
        },
      ]);
    },
  });

  // STT-only: transcribe → auto-fill input box
  const transcribeMutation = useMutation({
    mutationFn: (audioClip: RecordedAudioClip) => apiService.transcribeVoice(audioClip, language),
    onMutate: () => setVoiceStatus('transcribing'),
    onSettled: () => setVoiceStatus('idle'),
    onSuccess: (data) => {
      if (data.transcript) {
        setInput((prev) => prev ? `${prev} ${data.transcript}` : data.transcript);
      }
    },
    onError: (error: any) => {
      const statusCode = error?.response?.status;
      
      // Refresh wallet to get accurate credit state
      void refetchWallet();
      
      if (statusCode === 402 || statusCode === 403) {
        setTimeout(() => requireChat(true), 100);
      } else {
        Alert.alert(tx('voiceRequestFailed'), error?.message || tx('voiceRouteUnavailable'));
      }
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

      if (mode === 'transcribe' && clip.durationMs < MIN_TRANSCRIBE_DURATION_MS) {
        setVoiceStatus('idle');
        Alert.alert('Recording too short', 'Please speak for a moment and try again.');
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

  // Calculate usage from wallet
  const currentPlan = PLAN_CONFIGS.find(p => p.tier === wallet?.plan);
  const chatsLimit = currentPlan?.chatCredits || 20;
  const usedChats = Math.max(0, chatsLimit - (wallet?.chatCredits || 0));
  const usagePercentage = Math.min(1, usedChats / chatsLimit);

  return (
    <Screen dark={isDark} padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: isDark ? colors.backgroundAlt : colors.surface,
              borderBottomColor: colors.border,
              paddingTop: Platform.OS === 'ios' ? 44 : 12,
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={[
                styles.topIconButton,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', marginRight: 4 },
              ]}
            >
              {(() => {
                const IconComp = IconMap['ChevronLeft'];
                return IconComp ? <IconComp size={24} color={isDark ? colors.textOnDark : colors.text} /> : null;
              })()}
            </Pressable>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => {
                if (currentSession) {
                  setRenameValue(currentSession.title);
                  setRenameModalOpen(true);
                }
              }}
            >
              <AppText variant="label" color={isDark ? colors.textOnDark : colors.text} numberOfLines={1} style={{ fontSize: 17, fontWeight: '600' }}>
                {currentSession?.title || tx('newChat')}
              </AppText>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
                <AppText variant="caption" color={colors.textMuted}>
                   {contextQuery.data?.location || t(language, 'online')}
                </AppText>
              </View>
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

        {/* Usage Progress Bar */}
        <View style={[styles.usageBarContainer, { backgroundColor: isDark ? colors.backgroundAlt : colors.surface }]}>
           <ProgressBar 
              progress={usagePercentage} 
              color={usagePercentage > 0.9 ? colors.danger : colors.primary} 
              height={3}
           />
           <View style={styles.usageTextRow}>
              <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                {usedChats} / {chatsLimit} Used
              </AppText>
              {usedChats >= chatsLimit * 0.8 && (
                <Pressable onPress={() => navigation.navigate('Subscription', { tab: 'plans' })}>
                  <AppText variant="caption" color={colors.primary} style={{ fontSize: 10, fontWeight: '700' }}>
                    {tx('upgradeNow')}
                  </AppText>
                </Pressable>
              )}
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
            <ChatMessageItem
              key={message.id}
              message={message}
              language={language}
              onPress={() => setActiveTimestampId(current => current === message.id ? null : message.id)}
              onLongPress={() => onMessageLongPress(message)}
              activeTimestampId={activeTimestampId}
              onPlayAudio={playAudio}
              onProductPress={(product: Product) => {
                navigation.navigate('ProductDetail', { productId: product.id });
              }}
            />
          ))}

          {(askMutation.isPending || voiceMutation.isPending || transcribeMutation.isPending || isHydratingHistory) && (
            <View style={styles.messageRow}>
              <View
                style={[
                  styles.aiBubble,
                  {
                    backgroundColor: isDark ? '#1f2924' : '#f0f4f2',
                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderWidth: 1,
                  },
                  styles.aiBubbleTail
                ]}
              >
                <TypingDots isDark={isDark} />
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
              backgroundColor: isDark ? colors.backgroundAlt : '#ffffff',
              borderTopColor: colors.border,
            },
          ]}
        >
          {pickedImageUri ? (
            <View style={styles.imagePreviewRow}>
              <Image source={{ uri: pickedImageUri }} style={styles.previewImage} />
              <View style={{ flex: 1 }}>
                <AppText color={isDark ? colors.textOnDark : colors.text} style={{ fontWeight: '600' }}>{t(language, 'imageAttached')}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {tx('imageWillBeSentWithQuestion')}
                </AppText>
              </View>
              <Pressable onPress={removePickedImage} style={[styles.removeImageButton, { backgroundColor: colors.surface }]}>
                {(() => {
                  const IconComp = IconMap['X'];
                  return IconComp ? <IconComp size={16} color={colors.textMuted} /> : null;
                })()}
              </Pressable>
            </View>
          ) : null}

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
              <Animated.View style={{ transform: [{ scale: micPulse }] }}>
                {(() => {
                    const IconComp = voiceStatus === 'recording' ? IconMap['Mic'] : IconMap['Sparkles'];
                    return IconComp ? (
                    <IconComp
                        size={14}
                        color={voiceStatus === 'recording' ? '#d45f5f' : colors.primary}
                    />
                    ) : null;
                })()}
              </Animated.View>
              <AppText
                variant="caption"
                color={voiceStatus === 'recording' ? '#d45f5f' : colors.primary}
                style={{ fontWeight: '600' }}
              >
                {voiceStatus === 'recording'
                  ? tx('listening')
                  : voiceStatus === 'transcribing'
                    ? 'Transcribing...'
                    : t(language, 'processing')}
              </AppText>
              {voiceStatus === 'recording' && (
                <AppText variant="caption" color={colors.textMuted}>
                  {' (Hold for AI)'}
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
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f3f7f5',
                  color: isDark ? colors.textOnDark : colors.text,
                  borderColor: 'transparent',
                },
              ]}
              multiline
            />
            
            <View style={{ flexDirection: 'row', gap: 8 }}>
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
                            : isDark ? colors.textOnDark : colors.text
                        }
                        />
                    ) : null;
                    })()}
                </Pressable>
                </Animated.View>

                <Pressable
                    onPress={() => sendMessage()}
                    disabled={!input.trim()}
                    style={({ pressed }) => [
                        styles.sendBtn,
                        { 
                            backgroundColor: input.trim() ? colors.primary : colors.border,
                            opacity: pressed ? 0.8 : 1
                        }
                    ]}
                >
                    {(() => {
                    const IconComp = IconMap['Send'];
                    return IconComp ? <IconComp size={20} color="#fff" /> : null;
                    })()}
                </Pressable>
            </View>
          </View>
        </View>

        <PaywallBottomSheet
          visible={chatPaywallVisible}
          onClose={dismissChatPaywall}
          type="chat"
        />

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
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    ...theme.shadow.card,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usageBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  usageTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  messagesScroll: {
    flex: 1,
  },
  messages: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
    flexGrow: 1,
  },
  dateLabel: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 12,
    opacity: 0.7,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    position: 'relative',
  },
  aiBubble: {
    borderTopLeftRadius: 4,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  aiBubbleTail: {
    // Tail logic
  },
  userBubbleTail: {
    // Tail logic
  },
  messageMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 4,
  },
  timestamp: {
      fontSize: 10,
      opacity: 0.6,
  },
  audioButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  footer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 14,
    borderTopWidth: 1,
    gap: 8,
  },
  imagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(82,183,129,0.05)',
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  removeImageButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  iconAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.glow,
  },
  scrollFab: {
    position: 'absolute',
    right: 20,
    bottom: 140,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.card,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
  },
  drawer: {
    width: '85%',
    maxWidth: 360,
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    borderRightWidth: 1,
  },
  drawerHeader: {
    gap: 16,
    marginBottom: 24,
  },
  sessionCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  sessionActions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centeredModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  renameModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    gap: 20,
  },
  renameInput: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  renameActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  languageModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    gap: 20,
  },
  languageOption: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiceStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 6,
  },
});
