import { Audio } from 'expo-av';
import { useCallback, useEffect, useState } from 'react';

export interface RecordedAudioClip {
  uri: string;
  fileName: string;
  mimeType: string;
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

function buildRecordedClip(uri: string): RecordedAudioClip {
  const cleanUri = uri.split('?')[0];
  const fileName = cleanUri.split('/').pop() || `voice-query.${cleanUri.split('.').pop() || 'm4a'}`;

  return {
    uri,
    fileName,
    mimeType: getMimeTypeFromUri(cleanUri),
  };
}

export function useAudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioClip, setAudioClip] = useState<RecordedAudioClip | null>(null);

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
    await nextRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await nextRecording.startAsync();
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

      if (!uri) {
        return null;
      }

      const clip = buildRecordedClip(uri);
      setAudioClip(clip);
      return clip;
    } finally {
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
