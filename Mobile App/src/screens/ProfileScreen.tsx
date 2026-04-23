import { Switch, Image, Pressable, StyleSheet, View, Modal, TextInput, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

import { AppText, IconRow, GradientButton, Screen, ScreenCard, Pill, GlassCard } from '../components/ui';
import { IconMap } from '../components/IconMap';
import { apiService } from '../api/services';
import { LocationPicker } from '../components/LocationPicker';
import { designImages } from '../constants/designData';
import { t } from '../constants/localization';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../providers/ThemeContext';
import { useI18n } from '../hooks/useI18n';
import { useWallet } from '../hooks/useWallet';

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDark, setThemeMode, colors } = useTheme();
  const { t: tx } = useI18n();
  
  const user = useAppStore((state) => state.user);
  const language = useAppStore((state) => state.language);
  const setUser = useAppStore((state) => state.setUser);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const signOut = useAppStore((state) => state.signOut);
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useAppStore((state) => state.setNotificationsEnabled);
  
  const { 
    wallet, 
    refetchWallet, 
    isLoading: isWalletLoading,
    isError: isWalletError,
    isRefetching: isWalletRefetching 
  } = useWallet();

  // Refetch wallet when entering the screen to ensure fresh data
  useFocusEffect(
    useCallback(() => {
      void refetchWallet();
    }, [refetchWallet])
  );
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedLanguage, setEditedLanguage] = useState(user?.language || 'English');
  const [editedCrops, setEditedCrops] = useState(user?.crops || []);
  const [editedLandSize, setEditedLandSize] = useState(user?.landSize?.toString() || '');
  const [editedLandUnit, setEditedLandUnit] = useState(user?.landUnit || 'Acre');
  const [editedLocation, setEditedLocation] = useState<{
    state?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  }>(user?.location || { state: '', district: '' });
  
  const [editError, setEditError] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const cropOptions = useMemo(() => [
    { label: tx('cropWheat'), value: 'Wheat' },
    { label: tx('cropRice'), value: 'Rice' },
    { label: tx('cropCotton'), value: 'Cotton' },
    { label: tx('cropMustard'), value: 'Mustard' }
  ], [tx]);

  const languages = ['English', 'Hindi', 'Gujarati', 'Punjabi'];

  const units = useMemo(() => [
    { label: tx('unitAcre'), value: 'Acre' },
    { label: tx('unitBigha'), value: 'Bigha' },
    { label: tx('unitHectare'), value: 'Hectare' }
  ], [tx]);

  // Indian states and major agricultural districts
  const INDIAN_LOCATIONS: Record<string, string[]> = {
    'Punjab': ['Bathinda', 'Ludhiana', 'Amritsar', 'Gurdaspur', 'Jalandhar', 'Ferozpur'],
    'Maharashtra': ['Pune', 'Nashik', 'Aurangabad', 'Nagpur', 'Ahmednagar', 'Kolhapur'],
    'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Ujjain', 'Sehore', 'Vidisha'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Bikaner', 'Ajmer', 'Nagaur', 'Barmer'],
    'Uttar Pradesh': ['Lucknow', 'Meerut', 'Varanasi', 'Noida', 'Kanpur', 'Mathura'],
    'Karnataka': ['Bangalore', 'Mysore', 'Belgaum', 'Hubballi', 'Tumkur', 'Kolar'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tirunelveli', 'Namakkal', 'Villupuram'],
    'Andhra Pradesh': ['Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Tirupati', 'Guntur', 'Krishna'],
    'Gujarat': ['Ahmedabad', 'Rajkot', 'Surat', 'Vadodara', 'Gandhinagar', 'Junagadh'],
    'Haryana': ['Hisar', 'Rohtak', 'Faridabad', 'Yamunanagar', 'Panipat', 'Sonipat'],
  };

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      apiService.updateProfile({
        name: editedName.trim(),
        language: editedLanguage,
        crops: editedCrops.length > 0 ? editedCrops : undefined,
        landSize: editedLandSize ? Number(editedLandSize) : undefined,
        landUnit: editedLandUnit,
        location:
          editedLocation.state && editedLocation.district
            ? {
                state: editedLocation.state,
                district: editedLocation.district,
                latitude: editedLocation.latitude,
                longitude: editedLocation.longitude,
                address: editedLocation.address,
              }
            : undefined,
      }),
    onSuccess: (data) => {
      setEditError(null);
      setUser(data.user);
      if (data.user.language) {
        setLanguage(data.user.language as any);
      }
      setEditModalVisible(false);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || t(language, 'failedToUpdateProfile');
      setEditError(message);
    },
  });

  const handleEditProfile = () => {
    setEditError(null);
    if (!editedName.trim()) {
      setEditError(t(language, 'nameCannotBeEmpty'));
      return;
    }
    updateProfileMutation.mutate();
  };

  return (
    <Screen scrollable withTabBar>
      <View style={styles.header}>
        <AppText variant="heading" style={{ fontSize: 28 }}>{t(language, 'profile')}</AppText>
        <View style={styles.headerActions}>
          <Pressable onPress={() => navigation.navigate('Notifications')} style={[styles.headerIconButton, { backgroundColor: colors.primary + '15' }]}>
            {(() => { const BellIcon = IconMap['Bell']; return BellIcon ? <BellIcon size={20} color={colors.primary} /> : null; })()}
          </Pressable>
        </View>
      </View>

      <GlassCard style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: designImages.profilePortrait }} style={styles.avatar} />
            <View style={[styles.onlineBadge, { backgroundColor: colors.success }]} />
          </View>
          <View style={styles.heroDetails}>
            <AppText variant="title" style={{ fontSize: 22 }}>
              {user?.name || tx('completeYourProfile')}
            </AppText>
            <AppText color={colors.textMuted} style={{ fontSize: 13, marginTop: 2 }}>{user?.phone || tx('phoneNotAvailable')}</AppText>
            <View style={[styles.membershipBadge, { backgroundColor: colors.primary + '15' }]}>
               {(() => { const Crown = IconMap['ShieldCheck']; return Crown ? <Crown size={12} color={colors.primary} /> : null; })()}
               <AppText variant="caption" color={colors.primary} weight="bold" style={{ fontSize: 10, marginLeft: 4 }}>
                  {!user?.name 
                    ? tx('incompleteProfile').toUpperCase() 
                    : wallet?.plan === 'pro' 
                      ? tx('premiumMember').toUpperCase() 
                      : wallet?.plan === 'basic' 
                        ? tx('basicMember').toUpperCase() 
                        : tx('freeMember').toUpperCase()}
               </AppText>
            </View>
          </View>
        </View>
        <GradientButton label={tx('editProfile')} secondary style={{ marginTop: 20, height: 48 }} onPress={() => setEditModalVisible(true)} />
      </GlassCard>

      <View style={{ marginTop: 20 }}>
        {(!wallet && (isWalletLoading || isWalletRefetching)) ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator color={colors.primary} />
            <AppText variant="caption" style={{ marginTop: 8 }}>{tx('loading')}</AppText>
          </View>
        ) : (!wallet || isWalletError) ? (
          <GlassCard style={styles.planCard}>
            <View style={styles.planInfo}>
              <View style={[styles.planIcon, { backgroundColor: colors.danger + '10' }]}>
                {(() => { const Icon = IconMap['AlertCircle']; return Icon ? <Icon size={20} color={colors.danger} /> : null; })()}
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="label">{tx('unableToLoadPlan') || 'Unable to load plan'}</AppText>
                <AppText variant="caption" color={colors.textMuted}>{tx('checkConnection') || 'Check your connection'}</AppText>
              </View>
              <Pressable 
                onPress={() => refetchWallet()}
                style={({ pressed }) => [
                  { 
                    backgroundColor: colors.primary, 
                    paddingHorizontal: 12, 
                    paddingVertical: 6, 
                    borderRadius: 8,
                    opacity: pressed ? 0.8 : 1
                  }
                ]}
              >
                <AppText color="#fff" variant="caption" weight="bold">{tx('retry')}</AppText>
              </Pressable>
            </View>
          </GlassCard>
        ) : (
          <GlassCard style={styles.planCard}>
            <View style={styles.planInfo}>
              <View style={[styles.planIcon, { backgroundColor: colors.primary + '15' }]}>
                {(() => { const Icon = IconMap['ShieldCheck']; return Icon ? <Icon size={20} color={colors.primary} /> : null; })()}
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="label" weight="bold">
                  {(wallet?.plan || 'free').toUpperCase()} {tx('plan') || 'PLAN'}
                </AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {(wallet?.chatCredits || 0) + (wallet?.topupCredits || 0)} {tx('chats') || 'chats'} · {(wallet?.imageCredits || 0) + (wallet?.topupImageCredits || 0)} {tx('scans') || 'scans'} {tx('left') || 'left'}
                </AppText>
              </View>
              <Pressable
                onPress={() => navigation.navigate('Subscription', { tab: 'plans' })}
                style={[styles.manageBtn, { backgroundColor: colors.primary + '10' }]}
              >
                <AppText color={colors.primary} variant="caption" weight="bold">{tx('manage')}</AppText>
              </Pressable>
            </View>
          </GlassCard>
        )}
      </View>

      <AppText variant="caption" color={theme.colors.textMuted} style={styles.sectionLabel}>
        {tx('commerce')}
      </AppText>
      <ScreenCard>
        <Pressable onPress={() => navigation.navigate('OrderHistory')}>
          <IconRow icon="Truck" title={tx('trackOrders')} subtitle={tx('checkStatusAndDeliveryUpdates')} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('OrderHistory')}>
          <IconRow icon="ClipboardList" title={t(language, 'orderHistory')} subtitle={t(language, 'viewOrderHistory')} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Cart')}>
          <IconRow icon="ShoppingCart" title={tx('myCart')} subtitle={tx('reviewItemsAndCheckout')} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Marketplace')}>
          <IconRow icon="Store" title={t(language, 'continueShopping')} subtitle={t(language, 'searchPlaceholder')} />
        </Pressable>
      </ScreenCard>

      <AppText variant="caption" color={theme.colors.textMuted} style={styles.sectionLabel}>
        {tx('preferences')}
      </AppText>
      <ScreenCard>
        <Pressable onPress={() => setShowLanguagePicker(true)}>
          <IconRow icon="Languages" title={tx('appLanguage')} subtitle={language} />
        </Pressable>
        <IconRow 
          icon="MoonStar" 
          title={tx('darkAppearance')} 
          right={
            <Switch 
              value={isDark} 
              onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')} 
              trackColor={{ true: colors.primary }} 
            />
          } 
        />
        <Pressable onPress={() => navigation.navigate('Notifications')}>
          <IconRow
            icon="Bell"
            title={tx('notifications')}
            subtitle={notificationsEnabled ? tx('on') : tx('off')}
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ true: theme.colors.primary }}
              />
            }
          />
        </Pressable>
      </ScreenCard>

      <AppText variant="caption" weight="bold" color={theme.colors.textMuted} style={styles.sectionLabel}>
        {tx('securityAndData').toUpperCase()}
      </AppText>
      <ScreenCard style={{ marginBottom: 40 }}>
        <IconRow icon="ShieldCheck" title={tx('privacySettings')} subtitle={tx('manageData')} />
        <Pressable onPress={() => signOut()} style={styles.signOutBtn}>
          <View style={[styles.signOutIcon, { backgroundColor: theme.colors.danger + '10' }]}>
            {(() => { const LogOut = IconMap['X']; return LogOut ? <LogOut size={18} color={theme.colors.danger} /> : null; })()}
          </View>
          <AppText variant="label" weight="bold" color={theme.colors.danger}>
            {t(language, 'signOut')}
          </AppText>
        </Pressable>
      </ScreenCard>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark ? styles.modalContentDark : styles.modalContentLight]}>
            <View style={styles.modalHeader}>
              <View>
                <AppText variant="title" style={{ fontSize: 22 }}>{tx('editProfile')}</AppText>
                <AppText variant="caption" color={colors.textMuted}>{tx('updatePersonalDetails') || 'Update your personal details'}</AppText>
              </View>
              <Pressable onPress={() => setEditModalVisible(false)} style={[styles.modalCloseBtn, { backgroundColor: colors.primary + '15' }]}>
                {(() => { const XIcon = IconMap['X']; return XIcon ? <XIcon size={20} color={colors.primary} /> : null; })()}
              </Pressable>
            </View>

            <ScrollView 
              style={{ maxHeight: '80%', marginTop: 24 }} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Name */}
              <ScreenCard>
                <AppText variant="label">{t(language, 'name')}</AppText>
                <TextInput
                  value={editedName}
                  onChangeText={setEditedName}
                  editable={!updateProfileMutation.isPending}
                  placeholder={tx('enterYourName')}
                  placeholderTextColor={theme.colors.textMuted}
                  style={[styles.editInput, isDark ? styles.editInputDark : styles.editInputLight]}
                />
              </ScreenCard>

              {/* Language */}
              <View style={{ marginTop: 20 }}>
                <AppText variant="label" weight="bold" style={{ marginBottom: 8, marginLeft: 4 }}>{t(language, 'language')}</AppText>
                <View style={styles.languageRow}>
                  {languages.map((lang) => (
                    <Pill
                      key={lang}
                      label={lang}
                      active={lang === editedLanguage}
                      onPress={() => setEditedLanguage(lang)}
                      style={{ paddingHorizontal: 16 }}
                    />
                  ))}
                </View>
              </View>

              {/* Crops */}
              <View style={{ marginTop: 20 }}>
                <AppText variant="label" weight="bold" style={{ marginBottom: 12, marginLeft: 4 }}>{tx('cropsGrown')}</AppText>
                <View style={styles.cropsGrid}>
                  {cropOptions.map((crop) => {
                    const active = editedCrops.includes(crop.value);
                    return (
                      <Pressable
                        key={crop.value}
                        onPress={() =>
                          setEditedCrops(
                            active ? editedCrops.filter((c) => c !== crop.value) : [...editedCrops, crop.value]
                          )
                        }
                        disabled={updateProfileMutation.isPending}
                        style={[
                          styles.cropTag,
                          { 
                            backgroundColor: active ? colors.primary : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            borderColor: active ? colors.primary : colors.border,
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <AppText
                          variant="label"
                          color={active ? '#fff' : colors.text}
                          style={{ fontSize: 13 }}
                        >
                          {crop.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Land Size */}
              <ScreenCard style={{ marginTop: 12 }}>
                <AppText variant="label">{t(language, 'landSize')}</AppText>
                <View style={styles.landRow}>
                  <TextInput
                    value={editedLandSize}
                    onChangeText={setEditedLandSize}
                    keyboardType="decimal-pad"
                    editable={!updateProfileMutation.isPending}
                    placeholder={tx('enterLandSize')}
                    placeholderTextColor={theme.colors.textMuted}
                    style={[styles.editInput, isDark ? styles.editInputDark : styles.editInputLight, { flex: 1, marginBottom: 12 }]}
                  />
                  <View style={styles.unitsRow}>
                    {units.map((unit) => (
                      <Pill
                        key={unit.value}
                        label={unit.label}
                        active={unit.value === editedLandUnit}
                        onPress={() => setEditedLandUnit(unit.value)}
                      />
                    ))}
                  </View>
                </View>
              </ScreenCard>

              {/* Location */}
              <ScreenCard style={{ marginTop: 12 }}>
                <View style={styles.locationHeader}>
                  <View>
                    <AppText variant="label">{t(language, 'location')}</AppText>
                    <AppText color={theme.colors.textMuted}>
                      {editedLocation.state && editedLocation.district
                        ? `${editedLocation.district}, ${editedLocation.state}`
                        : tx('notSelected')}
                    </AppText>
                    {!!editedLocation.address && (
                      <AppText color={theme.colors.textMuted} style={{ marginTop: 4 }}>
                        {editedLocation.address}
                      </AppText>
                    )}
                  </View>
                  <Pressable
                    onPress={() => setShowLocationPicker(true)}
                    disabled={updateProfileMutation.isPending}
                  >
                    <AppText color={theme.colors.primary}>{tx('change')}</AppText>
                  </Pressable>
                </View>
              </ScreenCard>

              {editError && (
                <View style={[styles.errorBox, { marginTop: 12 }]}>
                  <AppText color={theme.colors.danger}>{editError}</AppText>
                </View>
              )}

              <GradientButton
                label={updateProfileMutation.isPending ? tx('saving') : tx('saveChanges')}
                onPress={handleEditProfile}
                disabled={updateProfileMutation.isPending}
                style={{ marginTop: 16 }}
                loading={updateProfileMutation.isPending}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Location Picker Modal */}
      <Modal visible={showLocationPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.locationModalContent, isDark ? styles.modalContentDark : styles.modalContentLight]}>
            <View style={styles.modalHeader}>
              <AppText variant="heading">{t(language, 'selectLocation')}</AppText>
              <Pressable onPress={() => setShowLocationPicker(false)}>
                <AppText color={theme.colors.primary}>{tx('close')}</AppText>
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                setShowLocationPicker(false);
                setShowMapPicker(true);
              }}
              style={styles.mapPickerCta}
            >
              <AppText variant="label" color={theme.colors.primaryDark}>
                {tx('useCurrentLocationOrPickOnMap')}
              </AppText>
              <AppText color={theme.colors.textMuted} style={{ marginTop: 2 }}>
                {tx('noApiKeyNeeded')}
              </AppText>
            </Pressable>

            <ScrollView style={{ maxHeight: '70%', marginTop: 16 }}>
              {Object.entries(INDIAN_LOCATIONS).map(([state, districts]) => (
                <View key={state}>
                  <AppText
                    variant="label"
                    style={{ paddingHorizontal: 12, marginTop: 12, marginBottom: 8 }}
                  >
                    {state}
                  </AppText>
                  {districts.map((district) => (
                    <Pressable
                      key={district}
                      onPress={() => {
                        setEditedLocation({
                          state,
                          district,
                          address: `${district}, ${state}`,
                        });
                        setShowLocationPicker(false);
                      }}
                      style={[
                        styles.districtOption,
                        isDark ? styles.districtOptionDark : styles.districtOptionLight,
                        editedLocation.state === state &&
                        editedLocation.district === district &&
                        styles.districtOptionSelected,
                      ]}
                    >
                      <AppText
                        color={
                          editedLocation.state === state &&
                          editedLocation.district === district
                            ? theme.colors.primary
                            : theme.colors.text
                        }
                      >
                        {district}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showMapPicker} animationType="slide">
        <LocationPicker
          initialLocation={editedLocation}
          onCancel={() => setShowMapPicker(false)}
          onLocationSelect={(pickedLocation) => {
            setEditedLocation({
              state: pickedLocation.state,
              district: pickedLocation.district,
              latitude: pickedLocation.latitude,
              longitude: pickedLocation.longitude,
              address: pickedLocation.address,
            });
            setShowMapPicker(false);
          }}
        />
      </Modal>

      <Modal visible={showLanguagePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark ? styles.modalContentDark : styles.modalContentLight]}>
            <View style={styles.modalHeader}>
              <AppText variant="heading">{tx('appLanguage')}</AppText>
              <Pressable onPress={() => setShowLanguagePicker(false)}>
                <AppText color={theme.colors.primary}>{tx('close')}</AppText>
              </Pressable>
            </View>
            <View style={styles.languageRow}>
              {languages.map((lang) => (
                <Pill
                  key={lang}
                  label={lang}
                  active={lang === language}
                  onPress={() => {
                    setLanguage(lang as any);
                    setShowLanguagePicker(false);
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    marginBottom: 24,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    padding: 20,
    borderRadius: 24,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: 'rgba(82,183,129,0.2)',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  heroDetails: {
    flex: 1,
  },
  membershipBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '80%',
  },
  modalContentDark: {
    backgroundColor: '#121a16',
  },
  modalContentLight: {
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editInput: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
    fontSize: 16,
  },
  editInputDark: {
    borderColor: 'rgba(255,255,255,0.14)',
    color: theme.colors.textOnDark,
    backgroundColor: '#1d2a24',
  },
  editInputLight: {
    borderColor: theme.colors.border,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceMuted,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.danger,
  },
  languageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  cropTag: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  cropTagDark: {
    backgroundColor: '#1b2721',
    borderColor: 'rgba(255,255,255,0.14)',
  },
  cropTagLight: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
  },
  cropTagActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  landRow: {
    marginTop: 12,
    gap: 10,
  },
  unitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '80%',
  },
  mapPickerCta: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(82,183,129,0.08)',
  },
  districtOption: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  districtOptionDark: {
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  districtOptionLight: {
    borderBottomColor: theme.colors.border,
  },
  districtOptionSelected: {
    backgroundColor: 'rgba(82,183,129,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  planCard: {
    padding: 16,
    borderRadius: 18,
    marginTop: 8,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  planIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(82,183,129,0.1)',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
    paddingVertical: 12,
  },
  signOutIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planFooter: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
});
