import { IconMap } from '../components/IconMap';
import { useMutation } from '@tanstack/react-query';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { apiService } from '../api/services';
import { AppText, ConcentricVisualizer, GradientButton, Screen, WaveBars } from '../components/ui';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../providers/ThemeContext';

export function VoiceScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const language = useAppStore((state) => state.language);
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  const voiceMutation = useMutation({
    mutationFn: (audioUri: string) => apiService.sendVoice(audioUri, language),
    onSuccess: async (data) => {
      if (data.audioUrl || data.audioBase64 || data.audio) {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
          });

          const sound = new Audio.Sound();
          const base64Audio = data.audioBase64 ?? data.audio;
          const uri = data.audioUrl ?? (base64Audio ? `data:audio/mp3;base64,${base64Audio}` : undefined);

          if (uri) {
            await sound.loadAsync({ uri });
            await sound.playAsync();
          }
        } catch {
          Alert.alert('Playback failed', 'Voice response arrived, but audio playback failed on device.');
        }
      }
      Alert.alert('Voice response', data.answer);
    },
    onError: () => Alert.alert('Voice request failed', 'The backend voice route is unavailable or requires authentication.'),
  });

  const handleRecordPress = async () => {
    if (!isRecording) {
      await startRecording();
      return;
    }

    const uri = await stopRecording();
    if (uri) {
      voiceMutation.mutate(uri);
    }
  };

  return (
    <Screen dark>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          {(() => { const IconComp = IconMap['X']; return IconComp ? <IconComp size={24} color={colors.textOnDark} /> : null; })()}
        </Pressable>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.center}>
        <AppText variant="display" color={colors.textOnDark}>
          {isRecording ? 'Listening...' : 'Ready'}
        </AppText>
        <AppText color="#b5d8c4" style={{ marginTop: 12, textAlign: 'center' }}>
          Ask your crop question in {language}
        </AppText>
        <ConcentricVisualizer />
        <WaveBars dark />
      </View>
      <View style={styles.bottom}>
        <GradientButton label={isRecording ? 'Stop & Send' : 'Start Recording'} onPress={handleRecordPress} />
        <AppText color="#87caaa" style={{ textAlign: 'center', marginTop: 18, fontSize: 13, paddingHorizontal: 20 }}>
          Record audio to get instant AI farming advice in your native language.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  bottom: {
    paddingBottom: 28,
  },
});
