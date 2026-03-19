import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppText, GlassCard, GradientButton, ProgressDots, Screen, WaveBars } from '../components/ui';
import { designImages } from '../constants/designData';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'VoiceIntro'>;

export function VoiceIntroScreen({ navigation }: Props) {
  return (
    <Screen dark>
      <LinearGradient colors={['#0f241b', '#19422f', '#0f241b']} style={StyleSheet.absoluteFillObject} />
      <AppText color="#7fd8a3" variant="label" style={{ marginTop: 12 }}>
        KrishiVani
      </AppText>
      <View style={styles.heroWrap}>
        <Image source={{ uri: designImages.voiceIntro }} style={styles.heroImage} />
        <GlassCard style={styles.waveOverlay}>
          <WaveBars dark />
        </GlassCard>
      </View>
      <View style={styles.textWrap}>
        <AppText color={theme.colors.textOnDark} variant="title" style={styles.title}>
          Talk to your crops
        </AppText>
        <AppText color="#d7f0e2" style={styles.body}>
          अपनी फसलों से बात करें | તમારા પાક સાથે વાત કરો | ਆਪਣੀਆਂ ਫਸਲਾਂ ਨਾਲ ਗੱਲ ਕਰੋ
        </AppText>
        <AppText color="#9ec7b0" style={styles.body}>
          Ask questions in native language and get AI advice.
        </AppText>
      </View>
      <View style={styles.bottom}>
        <ProgressDots total={3} active={0} />
        <GradientButton label="Continue" onPress={() => navigation.navigate('CropIntro')} style={{ marginTop: 18 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    marginTop: 18,
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 320,
    borderRadius: 30,
  },
  waveOverlay: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 20,
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 8,
  },
  title: { textAlign: 'center' },
  body: { textAlign: 'center' },
  bottom: { paddingBottom: 24 },
});
