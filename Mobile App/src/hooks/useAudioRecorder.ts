import { Audio } from 'expo-av';
import { useCallback, useState } from 'react';

export function useAudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
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
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) {
      return null;
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setAudioUri(uri);
    setIsRecording(false);
    setRecording(null);
    return uri;
  }, [recording]);

  return {
    audioUri,
    isRecording,
    startRecording,
    stopRecording,
  };
}
