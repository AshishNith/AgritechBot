import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText, GlassCard } from './ui';
import { useTheme } from '../providers/ThemeContext';
import { useI18n } from '../hooks/useI18n';
import { IconMap } from './IconMap';

interface AIAssistantWidgetProps {
  onPress: () => void;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({ onPress }) => {
  const { isDark, colors } = useTheme();
  const { t } = useI18n();

  const botIconUrl = 'https://res.cloudinary.com/dvwpxb2oa/image/upload/v1741072488/AI_Bot_Icon_qxjvxc.png';

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.container}>
      <GlassCard style={styles.card}>
        <LinearGradient
          colors={isDark ? [colors.primary + '15', colors.primary + '05'] : ['#f0f9f4', colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        
        <View style={styles.content}>
          <View style={styles.textSection}>
            <View style={styles.headerRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
              <AppText variant="label" style={{ color: colors.primary }}>AI Assistant</AppText>
            </View>
            <AppText weight="bold" style={styles.title}>
              Ask Anaaj AI anything...
            </AppText>
            <AppText color={colors.textMuted} style={styles.subtitle}>
              Get expert advice on crops, soil, and weather instantly.
            </AppText>
          </View>
          
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.iconBg}
            >
              <Image 
                source={{ uri: botIconUrl }} 
                style={styles.botIcon} 
                resizeMode="contain"
              />
            </LinearGradient>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={[styles.cta, { backgroundColor: colors.primary + '15' }]}>
            <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>
              Start Chatting
            </AppText>
            {(() => { 
                const Arrow = IconMap['ArrowRight']; 
                return Arrow ? <Arrow size={14} color={colors.primary} style={{ marginLeft: 4 }} /> : null; 
            })()}
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 4,
    width: '100%',
  },
  card: {
    padding: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(82,183,129,0.2)',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
    paddingRight: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  iconContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#52b781',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  botIcon: {
    width: 40,
    height: 40,
  },
  footer: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(82,183,129,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
});
