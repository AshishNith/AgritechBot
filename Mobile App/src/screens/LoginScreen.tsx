import { IconMap } from '../components/IconMap';
import { useMutation } from '@tanstack/react-query';

import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { apiService } from '../api/services';
import { AppText, GradientButton, Screen, ScreenCard } from '../components/ui';
import { t } from '../constants/localization';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../providers/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

import { WebViewRecaptcha, WebViewRecaptchaHandle } from '../components/WebViewRecaptcha';
import { PhoneAuthProvider } from 'firebase/auth';
import { auth, firebaseConfig } from '../config/firebase';
import { useRef } from 'react';

function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');

  // If user typed 10 digits, assume India (+91)
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  // If user typed 12 digits starting with 91, assume it's already +91...
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  // Otherwise handle other international lengths
  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }

  return null;
}

export function LoginScreen({ navigation }: Props) {
  const phoneDraft = useAppStore((state) => state.phoneDraft);
  const setPhoneDraft = useAppStore((state) => state.setPhoneDraft);
  const language = useAppStore((state) => state.language);
  const { colors, isDark } = useTheme();
  
  // Strip +91 if it exists in the stored draft so the user only sees the 10 digits
  const initialPhone = phoneDraft?.startsWith('+91') ? phoneDraft.slice(3) : phoneDraft;
  const [phone, setPhone] = useState(initialPhone || '');
  const [error, setError] = useState<string | null>(null);
  
  const recaptchaVerifier = useRef<WebViewRecaptchaHandle>(null);

  const sendOtpMutation = useMutation({
    mutationFn: async (normalizedPhone: string) => {
      // Get reCAPTCHA token from WebView verifier, then pass as ApplicationVerifier stub
      const token = await recaptchaVerifier.current!.verify();
      const verifier = {
        type: 'recaptcha' as const,
        verify: async () => token,
      };
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        normalizedPhone,
        verifier
      );
      return verificationId;
    },
    onSuccess: (verificationId, normalizedPhone) => {
      setError(null);
      // Store the raw phone (what user sees) instead of normalized
      setPhoneDraft(phone); 
      navigation.navigate('Otp', { phone: normalizedPhone, verificationId });
    },
    onError: (err: any) => {
      console.error('Send OTP error', err);
      const message = err.message || t(language, 'sendOtpFailed');
      setError(message);
    },
  });

  const handleSendOtp = () => {
    setError(null);
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      setError(t(language, 'invalidPhone'));
      return;
    }

    sendOtpMutation.mutate(normalizedPhone);
  };

  return (
    <Screen>
      <WebViewRecaptcha
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification={true}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.hero}>
          <View style={styles.blurCircleOne} />
          <View style={styles.blurCircleTwo} />
          <AppText variant="display">{t(language, 'welcomeBack')}</AppText>
          <AppText color={theme.colors.textMuted} style={{ marginTop: 10 }}>
            {t(language, 'loginSubtitle')}
          </AppText>
        </View>
        <ScreenCard style={styles.formCard}>
          <AppText variant="label">{t(language, 'mobileNumber')}</AppText>
          <View style={[styles.inputWrap, { borderColor: colors.border }]}>
            <View style={[styles.countryCode, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.surfaceMuted }]}>
              <AppText variant="label" style={{ color: colors.text }}>+91</AppText>
            </View>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="98765 43210"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, { color: colors.text }]}
              editable={!sendOtpMutation.isPending}
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              {(() => { const IconComp = IconMap['AlertCircle']; return IconComp ? <IconComp size={16} color={theme.colors.danger} /> : null; })()}
              <AppText color={theme.colors.danger} style={{ flex: 1, marginLeft: 8 }}>
                {error}
              </AppText>
            </View>
          )}

          <GradientButton
            label={sendOtpMutation.isPending ? t(language, 'sending') : t(language, 'getOtp')}
            onPress={handleSendOtp}
            disabled={sendOtpMutation.isPending}
            leftIcon={
              sendOtpMutation.isPending ? (
                <ActivityIndicator size={18} color={theme.colors.textOnDark} />
              ) : undefined
            }
          />

        </ScreenCard>
          <AppText color={theme.colors.textMuted} style={styles.terms}>
            By continuing, you agree to our{' '}
            <AppText 
              color={theme.colors.primary} 
              onPress={() => Linking.openURL('https://www.anaaj.ai/privacy')}
            >
              Privacy Policy
            </AppText>
          </AppText>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 32,
    position: 'relative',
  },
  blurCircleOne: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(82,183,129,0.16)',
    top: 20,
    right: -50,
  },
  blurCircleTwo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(200,241,105,0.12)',
    bottom: 12,
    left: -38,
  },
  formCard: {
    gap: 16,
    paddingVertical: 22,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    overflow: 'hidden',
  },
  countryCode: {
    width: 72,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
  },
  input: {
    flex: 1,
    height: 58,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.danger,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: { flex: 1 },
  terms: {
    textAlign: 'center',
    marginVertical: 24,
  },
});
