import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface RecordedAudioClip {
  uri: string;
  fileName: string;
  mimeType: string;
  durationMs: number;
}

function getMimeTypeFromUri(uri: string): string {
  const extension = uri.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'aac':
      return 'audio/aac';
    case 'amr':
      return 'audio/amr';
    case 'caf':
      return 'audio/x-caf';
    case 'mp3':
      return 'audio/mpeg';
    case 'mp4':
      return 'audio/mp4';
    case 'wav':
      return 'audio/wav';
    case '3gp':
      return 'audio/3gpp';
    case 'm4a':
    default:
      return 'audio/m4a';
  }
}

function buildRecordedClip(uri: string, durationMs: number): RecordedAudioClip {
  const cleanUri = uri.split('?')[0];
  const fileName = cleanUri.split('/').pop() || `voice-query.${cleanUri.split('.').pop() || 'm4a'}`;

  return {
    uri,
    fileName,
    mimeType: getMimeTypeFromUri(cleanUri),
    durationMs,
  };
}

export function useAudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioClip, setAudioClip] = useState<RecordedAudioClip | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    if (recording) {
      await recording.stopAndUnloadAsync().catch(() => undefined);
      setRecording(null);
    }

    const permission = await Audio.requestPermissionsAsync();

    if (!permission.granted) {
      throw new Error('Microphone permission denied');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const nextRecording = new Audio.Recording();
    const recordingOptions = {
        android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 64000,
        },
        ios: {
            extension: '.m4a',
            outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
            audioQuality: Audio.IOSAudioQuality.MIN,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 64000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
        },
        web: {}
    };
    await nextRecording.prepareToRecordAsync(recordingOptions as any);
    await nextRecording.startAsync();
    recordingStartedAtRef.current = Date.now();
    setRecording(nextRecording);
    setIsRecording(true);
  }, [recording]);

  const stopRecording = useCallback(async () => {
    if (!recording) {
      return null;
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const durationMs = recordingStartedAtRef.current ? Date.now() - recordingStartedAtRef.current : 0;

      if (!uri) {
        return null;
      }

      const clip = buildRecordedClip(uri, durationMs);
      setAudioClip(clip);
      return clip;
    } finally {
      recordingStartedAtRef.current = null;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      }).catch(() => undefined);
      setIsRecording(false);
      setRecording(null);
    }
  }, [recording]);

  useEffect(() => {
    return () => {
      if (!recording) {
        return;
      }

      recording.stopAndUnloadAsync().catch(() => undefined);
    };
  }, [recording]);

  return {
    audioClip,
    isRecording,
    startRecording,
    stopRecording,
  };
}
