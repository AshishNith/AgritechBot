import * as ExpoFileSystem from 'expo-file-system';
import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, StyleSheet, View, Image, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { IconMap } from '../components/IconMap';
import { AppText, GradientButton, Screen, ScreenCard, GlassCard, ProgressBar, StatCard, Pill } from '../components/ui';
import { apiService } from '../api/services';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../providers/ThemeContext';
import { useI18n } from '../hooks/useI18n';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { UsageLimitModal } from '../components/UsageLimitModal';
import { PaywallBottomSheet } from '../components/PaywallBottomSheet';
import { WalletCreditBadge } from '../components/WalletCreditBadge';
import { useWallet } from '../hooks/useWallet';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export function ImageScanScreen({ route }: { route: any }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const { t } = useI18n();

  const [image, setImage] = useState<string | null>(route.params?.image || null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(route.params?.result || null);
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const {
    requireScan,
    deductScan,
    scanPaywallVisible,
    dismissScanPaywall,
    refetchWallet,
  } = useWallet();

  const subscriptionStatus = useAppStore((state) => state.subscriptionStatus);
  const setSubscriptionStatus = useAppStore((state) => state.setSubscriptionStatus);

  // Sync route params when navigating from history
  useEffect(() => {
    if (route.params?.image) setImage(route.params.image);
    if (route.params?.result) setResult(route.params.result);
  }, [route.params?.image, route.params?.result]);

  const { data: scanHistory = [], refetch: refetchHistory, error: historyError, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['scan-history'],
    queryFn: async () => {
      const history = await apiService.getScanHistory();
      return history;
    },
  });

  const subStatusQuery = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => apiService.getSubscriptionStatus(),
    gcTime: 0,
  });

  useEffect(() => {
    if (subStatusQuery.data) {
      setSubscriptionStatus(subStatusQuery.data);
    }
  }, [subStatusQuery.data, setSubscriptionStatus]);

  useFocusEffect(
    useCallback(() => {
      refetchHistory();
      subStatusQuery.refetch();
    }, [refetchHistory, subStatusQuery])
  );

  const requestImageAccess = async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.granted) {
      return true;
    }

    Alert.alert(
      'Permission required',
      useCamera
        ? 'Camera access is required to capture crop images.'
        : 'Photo library access is required to select crop images.'
    );

    return false;
  };

  const pickImage = async (useCamera: boolean = false) => {
    if (analyzing) return;
    try {
      const hasPermission = await requestImageAccess(useCamera);

      if (!hasPermission) {
        return;
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      const asset = result.canceled ? null : result.assets?.[0];

      if (asset) {
        setImage(asset.uri);
        setResult(null);
        
        if (asset.base64) {
          handleAnalyze(asset.base64, asset.mimeType || 'image/jpeg');
        } else {
          try {
            const base64 = await ExpoFileSystem.readAsStringAsync(asset.uri, {
              encoding: ExpoFileSystem.EncodingType.Base64,
            });
            handleAnalyze(base64, asset.mimeType || 'image/jpeg');
          } catch (readErr) {
            Alert.alert('Error', 'Failed to process image file');
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const { language: currentLanguage } = useI18n();

  const handleAnalyze = async (base64: string, mimeType: string) => {
    if (analyzing) return;
    if (!requireScan()) return;
    deductScan();
    setAnalyzing(true);
    setResult(null);
    try {
      const response = await apiService.analyzeCrop(base64, mimeType, currentLanguage);
      setResult(response.diagnosis);
      refetchHistory();
      subStatusQuery.refetch();
    } catch (error: any) {
      console.error('[ImageScan] Analysis error:', error);
      const backendMsg = error?.response?.data?.error || error?.message || 'Could not analyze the image. Please try again.';
      
      if (error?.response?.status === 402) {
        void refetchWallet();
      } else if (error?.response?.status === 403) {
        setLimitModalVisible(true);
      } else if (error?.response?.status === 429) {
        Alert.alert('Analysis Busy', backendMsg);
      } else {
        Alert.alert('Analysis Failed', backendMsg);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const safeJsonParse = (str: string | null) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch (e) {
      try {
        const startIdx = str.indexOf('{');
        const endIdx = str.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
          const jsonStr = str.substring(startIdx, endIdx + 1);
          const sanitized = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, " "); 
          return JSON.parse(sanitized);
        }
      } catch (innerE) {
        return null;
      }
      return null;
    }
  };

  const renderDiagnosisContent = () => {
    if (!result) return null;

    const data = safeJsonParse(result);
    if (!data) {
      return (
        <GlassCard style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={[styles.resultIcon, { backgroundColor: colors.primary + '20' }]}>
              {(() => { const IconComp = IconMap['ShieldCheck']; return IconComp ? <IconComp size={20} color={colors.primary} /> : null; })()}
            </View>
            <AppText variant="heading" style={{ fontSize: 18 }}>Diagnosis Report</AppText>
          </View>
          <View style={styles.resultBody}>
            <AppText style={{ lineHeight: 24 }}>{result}</AppText>
          </View>
          <GradientButton
            label="Talk to Expert"
            onPress={() => navigation.navigate('Chat', { initialMessage: "I just scanned an image and found: " + result.substring(0, 50) + "..." })}
            style={{ marginTop: 16 }}
          />
        </GlassCard>
      );
    }

    return (
      <View style={{ marginTop: 20 }}>
        <Animated.View entering={FadeInDown.duration(600)}>
          <GlassCard style={styles.reportHeaderCard}>
            <View style={styles.reportTitleRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="caption" color={colors.primary} style={{ fontWeight: '700', letterSpacing: 1 }}>{data.crop?.toUpperCase()}</AppText>
                <AppText variant="heading" style={{ fontSize: 24, marginTop: 4 }}>{data.problem}</AppText>
              </View>
              <View style={[styles.severityBadge, { backgroundColor: data.severity === 'High' ? colors.danger + '20' : data.severity === 'Moderate' ? colors.warning + '20' : colors.primary + '20' }]}>
                <AppText variant="caption" style={{ fontWeight: 'bold' }} color={data.severity === 'High' ? colors.danger : data.severity === 'Moderate' ? colors.warning : colors.primary}>{data.severity}</AppText>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <StatCard label="AI Confidence" value={`${data.confidence}%`} icon="ShieldCheck" color={colors.primary} />
              <View style={{ width: 12 }} />
              <StatCard label="Severity Level" value={`${data.severityScore}%`} icon="AlertTriangle" color={data.severityScore > 60 ? colors.danger : colors.warning} />
            </View>

            <AppText color={colors.textMuted} style={{ marginTop: 16, lineHeight: 20 }}>{data.summary}</AppText>
          </GlassCard>
        </Animated.View>

        <SectionHeader title="Treatment Plan" />

        <View style={styles.treatmentSection}>
          <TreatCard title="Immediate Actions" icon="Zap" items={data.recommendations?.immediate} color={colors.primary} />
          <TreatCard title="Organic Solutions" icon="Leaf" items={data.recommendations?.organic} color="#52B781" />
          <TreatCard title="Chemical Control" icon="FlaskConical" items={data.recommendations?.chemical} color="#F43F5E" />
        </View>

        <SectionHeader title="Recommended Products" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {data.products?.map((prod: any, idx: number) => (
            <GlassCard key={idx} style={styles.productCard}>
              <View style={[styles.prodCategory, { backgroundColor: colors.surfaceMuted }]}>
                <AppText variant="caption" style={{ fontSize: 10 }}>{prod.category}</AppText>
              </View>
              <AppText variant="label" style={{ marginTop: 8, fontSize: 15 }}>{prod.name}</AppText>
              <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>{prod.purpose}</AppText>
              <Pressable style={[styles.buyBtn, { backgroundColor: colors.primary }]}>
                <AppText color="#fff" style={{ fontSize: 12, fontWeight: '700' }}>Check Availability</AppText>
              </Pressable>
            </GlassCard>
          ))}
        </ScrollView>

        <View style={styles.expertSection}>
          <AppText variant="heading" style={{ fontSize: 18 }}>Need more help?</AppText>
          <AppText color={colors.textMuted} style={{ marginTop: 4, marginBottom: 16 }}>{data.expertHelp}</AppText>
          <View style={styles.expertActions}>
            <GradientButton
              label="Talk to Doctor"
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('Chat', { initialMessage: `I need a professional opinion on this diagnosis: ${data.problem} in ${data.crop}.` })}
            />
            <GradientButton
              label="Find Nearest Vendor"
              secondary
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('Marketplace')}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surfaceMuted }]}
        >
          {(() => {
            const IconComp = IconMap['ArrowLeft'];
            return IconComp ? <IconComp size={22} color={colors.text} /> : null;
          })()}
        </Pressable>
        <AppText variant="title" style={{ marginLeft: 16 }}>Crop Diagnosis</AppText>
        <View style={{ flex: 1 }} />
        <WalletCreditBadge type="scan" style={{ marginRight: 12 }} />
        <Pressable
          onPress={() => navigation.navigate('MainTabs', { screen: 'ChatTab' })}
          style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surfaceMuted }]}
        >
          {(() => {
            const IconComp = IconMap['History'];
            return IconComp ? <IconComp size={20} color={colors.primary} /> : null;
          })()}
        </Pressable>
      </View>

      {/* Subscription Usage Header */}
      <View style={[styles.usageHeader, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
        <View style={styles.usageInfo}>
          <AppText variant="caption" color={colors.textMuted}>
            Monthly Scans: <AppText variant="caption" style={{ fontWeight: 'bold' }} color={colors.text}>
              {subscriptionStatus?.scansUsed || 0} / {subscriptionStatus?.scansLimit || 5}
            </AppText>
          </AppText>
        </View>
        <ProgressBar 
          progress={Math.min(1, (subscriptionStatus?.scansUsed || 0) / (subscriptionStatus?.scansLimit || 5))} 
          color={(subscriptionStatus?.scansUsed || 0) >= (subscriptionStatus?.scansLimit || 5) ? colors.danger : colors.primary}
          height={4}
        />
      </View>

      <View style={styles.content}>
        {!image && !result ? (
          <View style={styles.emptyState}>
            <GlassCard style={styles.uploadBox}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                {(() => {
                  const IconComp = IconMap['Scan'];
                  return IconComp ? <IconComp size={32} color={colors.primary} /> : null;
                })()}
              </View>
              <AppText variant="heading" style={{ marginTop: 20 }}>Scan Your Crop</AppText>
              <AppText color={colors.textMuted} style={{ textAlign: 'center', marginTop: 10 }}>
                Identify diseases and pests instantly using our AI-powered plant pathologist.
              </AppText>

              <View style={styles.buttonRow}>
                <GradientButton
                  label="Take Photo"
                  onPress={() => pickImage(true)}
                  disabled={analyzing}
                  leftIcon={(() => { const IconComp = IconMap['Camera']; return IconComp ? <IconComp size={18} color="#fff" /> : null; })()}
                  style={{ flex: 1, opacity: analyzing ? 0.6 : 1 }}
                />
                <GradientButton
                  label="Upload"
                  secondary
                  onPress={() => pickImage(false)}
                  disabled={analyzing}
                  leftIcon={(() => { const IconComp = IconMap['Upload']; return IconComp ? <IconComp size={18} color="#fff" /> : null; })()}
                  style={{ flex: 1, opacity: analyzing ? 0.6 : 1 }}
                />
              </View>
            </GlassCard>

            {Array.isArray(scanHistory) && scanHistory.length > 0 && (
              <View style={styles.historySection}>
                <View style={styles.historyHead}>
                  <AppText variant="label">Recent Scans</AppText>
                  <Pressable onPress={() => navigation.navigate('MainTabs', { screen: 'ChatTab' })}>
                    <AppText variant="caption" color={colors.primary}>View All</AppText>
                  </Pressable>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {scanHistory.slice(0, 5).map((scan: any, idx: number) => {
                    let diag: any = {};
                    try { diag = JSON.parse(scan.diagnosis); } catch (e) { }
                    const displayUri = scan.imageUri || scan.thumbnailUrl || (scan.imageBase64 ? `data:image/jpeg;base64,${scan.imageBase64}` : null);
                    
                    return (
                      <Animated.View key={scan._id} entering={FadeInRight.delay(idx * 100)}>
                        <Pressable
                          style={styles.historyItem}
                          onPress={() => {
                            if (displayUri) setImage(displayUri);
                            setResult(scan.diagnosis);
                          }}
                        >
                          {displayUri && (
                            <Image
                              source={{ uri: displayUri }}
                              style={styles.historyThumb}
                            />
                          )}
                          <View style={[styles.historyOverlay, { borderColor: colors.border }]} />
                          <AppText variant="caption" numberOfLines={1} style={styles.historyLabel}>
                            {diag.problem || 'Scan'}
                          </AppText>
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <ScreenCard style={{ marginTop: 20 }}>
              <AppText variant="label">Tips for better results:</AppText>
              <AppText color={colors.textMuted} style={{ fontSize: 13, marginTop: 6 }}>
                • Ensure good lighting (daylight is best)
              </AppText>
              <AppText color={colors.textMuted} style={{ fontSize: 13, marginTop: 4 }}>
                • Focus clearly on the affected leaves or fruit
              </AppText>
              <AppText color={colors.textMuted} style={{ fontSize: 13, marginTop: 4 }}>
                • Capture both healthy and diseased parts for context
              </AppText>
            </ScreenCard>
          </View>
        ) : (
          <View style={styles.scanView}>
            {image ? (
              <View style={styles.imageWrap}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                {analyzing && (
                  <View style={styles.analyzingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <AppText variant="label" color="#fff" style={{ marginTop: 12 }}>AI is analyzing...</AppText>
                  </View>
                )}
              </View>
            ) : (
              <GlassCard style={styles.noImageCard}>
                <AppText variant="label">Image preview unavailable</AppText>
                <AppText color={colors.textMuted} style={{ marginTop: 6 }}>
                  Diagnosis data is still available below.
                </AppText>
              </GlassCard>
            )}

            {renderDiagnosisContent()}

            {!analyzing && (
              <Pressable
                onPress={() => {
                  setImage(null);
                  setResult(null);
                }}
                style={styles.retakeBtn}
              >
                <AppText color={colors.primary}>Retake Photo</AppText>
              </Pressable>
            )}
          </View>
        )}
      </View>

      <UsageLimitModal 
        visible={limitModalVisible}
        onClose={() => setLimitModalVisible(false)}
        type="scan"
        limit={subscriptionStatus?.scansLimit || 5}
      />
      <PaywallBottomSheet
        visible={scanPaywallVisible}
        onClose={dismissScanPaywall}
        type="scan"
      />
    </Screen>
  );
}

function TreatCard({ title, icon, items, color }: { title: string; icon: string; items: string[]; color: string }) {
  const { colors, isDark } = useTheme();
  if (!items || items.length === 0) return null;

  return (
    <View style={[styles.treatCard, { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
      <View style={styles.treatHeader}>
        <View style={[styles.treatIcon, { backgroundColor: color + '15' }]}>
          {(() => { const IconComp = IconMap[icon]; return IconComp ? <IconComp size={16} color={color} /> : null; })()}
        </View>
        <AppText variant="label" style={{ color: color }}>{title}</AppText>
      </View>
      <View style={styles.treatList}>
        {items.map((item, i) => (
          <View key={i} style={styles.treatItem}>
            <View style={[styles.treatBullet, { backgroundColor: color }]} />
            <AppText style={{ flex: 1, fontSize: 14 }}>{item}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={{ marginTop: 32, marginBottom: 16 }}>
      <AppText variant="heading" style={{ fontSize: 20 }}>{title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usageHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 20,
  },
  usageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
  },
  uploadBox: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
    width: '100%',
  },
  scanView: {
    flex: 1,
  },
  imageWrap: {
    width: '100%',
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  noImageCard: {
    padding: 18,
    borderRadius: 18,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBody: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 16,
  },
  retakeBtn: {
    alignSelf: 'center',
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  reportHeaderCard: {
    padding: 24,
  },
  reportTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  treatmentSection: {
    gap: 16,
  },
  treatCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  treatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  treatIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  treatList: {
    gap: 8,
  },
  treatItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  treatBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  productCard: {
    width: width * 0.65,
    marginRight: 16,
    padding: 16,
    borderRadius: 22,
  },
  prodCategory: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  buyBtn: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  expertSection: {
    marginTop: 20,
    marginBottom: 40,
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(82,183,129,0.05)',
  },
  expertActions: {
    flexDirection: 'row',
    gap: 12,
  },
  historySection: {
    marginTop: 32,
    marginBottom: 8,
  },
  historyHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyItem: {
    width: 100,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  historyThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  historyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderRadius: 20,
  },
  historyLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    fontSize: 10,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 32,
  },
});
