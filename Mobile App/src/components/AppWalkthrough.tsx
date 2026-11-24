import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText, GradientButton } from './ui';
import { IconMap } from './IconMap';
import { useTheme } from '../providers/ThemeContext';
import { useI18n, type AppTranslationKey } from '../hooks/useI18n';

const STEPS: { icon: string; title: AppTranslationKey; body: AppTranslationKey }[] = [
  { icon: 'Mic', title: 'tour1Title', body: 'tour1Body' },
  { icon: 'Scan', title: 'tour2Title', body: 'tour2Body' },
  { icon: 'Calendar', title: 'tour3Title', body: 'tour3Body' },
  { icon: 'CloudSun', title: 'tour4Title', body: 'tour4Body' },
];

/** First-run tour of the main features. Can be skipped at any step. */
export function AppWalkthrough({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { isDark, colors } = useTheme();
  const { t } = useI18n();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (visible) setIndex(0);
  }, [visible]);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const Icon = IconMap[step.icon];

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: isDark ? colors.surface : colors.background }]}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.skip} accessibilityRole="button">
            <AppText variant="label" color={colors.textMuted}>{t('skip')}</AppText>
          </Pressable>

          <View style={[styles.iconWrap, { backgroundColor: colors.primary + '20' }]}>
            {Icon ? <Icon size={40} color={colors.primary} /> : null}
          </View>

          <AppText variant="title" style={styles.title}>{t(step.title)}</AppText>
          <AppText color={colors.textMuted} style={styles.body}>{t(step.body)}</AppText>

          <View style={styles.dots}>
            {STEPS.map((s, i) => (
              <View
                key={s.title}
                style={[
                  styles.dot,
                  { backgroundColor: i === index ? colors.primary : colors.border, width: i === index ? 22 : 8 },
                ]}
              />
            ))}
          </View>

          <GradientButton
            label={isLast ? t('done') : t('next')}
            onPress={() => (isLast ? onClose() : setIndex(index + 1))}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  skip: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  title: {
    marginTop: 20,
    textAlign: 'center',
  },
  body: {
    marginTop: 10,
    textAlign: 'center',
    minHeight: 66,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 18,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    marginTop: 22,
    alignSelf: 'stretch',
  },
});
