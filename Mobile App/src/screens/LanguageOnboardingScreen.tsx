import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Languages } from 'lucide-react-native';

import { AppText, FloatingOrb, GradientButton, Pill, ProgressDots, Screen } from '../components/ui';
import { languageOptions } from '../constants/designData';
import { t } from '../constants/localization';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

import { isProfileComplete } from '../utils/profile';

type Props = NativeStackScreenProps<RootStackParamList, 'LanguageOnboarding'>;

export function LanguageOnboardingScreen({ navigation }: Props) {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);

  const handleContinue = () => {
    if (!language) return;

    if (token) {
      if (isProfileComplete(user)) {
        navigation.navigate('MainTabs', { screen: 'HomeTab' } as any);
      } else {
        navigation.navigate('ProfileSetup');
      }
    } else {
      navigation.navigate('VoiceIntro');
    }
  };

  return (
    <Screen dark>
      <LinearGradient colors={['#113325', '#173b2d', '#10241b']} style={StyleSheet.absoluteFillObject} />
      <FloatingOrb size={130} style={{ top: 24, left: -26 }} />
      <FloatingOrb size={96} style={{ top: 180, right: -12 }} />
      <View style={styles.hero}>
        {/* Local icon instead of the old remote mockup image, which now loads a map tile. */}
        <View style={styles.globe}>
          <Languages size={110} color={theme.colors.textOnDark} strokeWidth={1.4} />
        </View>
        <View style={[styles.bubble, { top: 18, left: 0 }]}>
          <AppText color={theme.colors.textOnDark}>नमस्ते</AppText>
        </View>
        <View style={[styles.bubble, { right: 8, top: 62 }]}>
          <AppText color={theme.colors.textOnDark}>કેમ છો</AppText>
        </View>
        <View style={[styles.bubble, { bottom: 10, left: 22 }]}>
          <AppText color={theme.colors.textOnDark}>ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ</AppText>
        </View>
      </View>
      <View style={styles.content}>
        <AppText color={theme.colors.textOnDark} variant="display" style={styles.centered}>
          {t(language, 'yourLanguageYourApp')}
        </AppText>
        <AppText color="#c3dfcf" style={styles.centered}>
          {t('Hindi', 'yourLanguageYourApp')} | {t('Gujarati', 'yourLanguageYourApp')} | {t('Punjabi', 'yourLanguageYourApp')}
        </AppText>
        <View style={styles.grid}>
          {languageOptions.map((item) => (
            <Pill
              key={item}
              label={item}
              active={item === language}
              onPress={() => setLanguage(item)}
              style={styles.languagePill}
            />
          ))}
        </View>
        <AppText color="#9ac9b0" style={styles.footerText}>
          {t(language, 'youCanChangeLanguageAnytime')}
        </AppText>
      </View>
      <View style={styles.bottom}>
        <ProgressDots total={3} active={0} />
        <GradientButton 
          label={t(language, 'getStarted')} 
          onPress={handleContinue} 
          style={{ marginTop: 18, opacity: language ? 1 : 0.5 }} 
          disabled={!language}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  globe: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    position: 'absolute',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  centered: {
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 8,
  },
  languagePill: {
    minWidth: '44%',
    justifyContent: 'center',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 8,
  },
  bottom: {
    paddingBottom: 24,
  },
});
