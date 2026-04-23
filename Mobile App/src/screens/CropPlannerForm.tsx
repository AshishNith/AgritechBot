import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, AppText, GlassCard, GradientButton, Pill } from '../components/ui';
import { useTheme } from '../providers/ThemeContext';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../api/services';

const WATER_OPTIONS = [
  { id: 'low', label: 'Low (Rainfed)', icon: 'water-outline' },
  { id: 'medium', label: 'Medium (Canal/Well)', icon: 'water' },
  { id: 'high', label: 'High (Borewell/Drip)', icon: 'water-boiler' },
];

const FARMING_TYPES = [
  { id: 'organic', label: 'Organic', icon: 'leaf' },
  { id: 'traditional', label: 'Traditional', icon: 'account-group' },
  { id: 'hybrid', label: 'Hybrid/Modern', icon: 'chip' },
];

export const CropPlannerForm: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    crop: '',
    state: user?.location?.state || '',
    district: user?.location?.district || '',
    landSize: '',
    soilType: '',
    waterAvailability: 'medium' as 'low' | 'medium' | 'high',
    farmingType: 'traditional' as 'organic' | 'traditional' | 'hybrid',
  });

  const handleSubmit = async () => {
    if (!formData.crop || !formData.landSize || !formData.state || !formData.district) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.generateCropPlan({
        crop: formData.crop,
        location: {
          state: formData.state,
          district: formData.district,
        },
        landSize: formData.landSize,
        soilType: formData.soilType,
        waterAvailability: formData.waterAvailability,
        farmingType: formData.farmingType,
      });

      if (response.success) {
        navigation.navigate('CropPlanResult', { planId: response.data._id });
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      Alert.alert('Generation Error', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title: string, icon: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon as any} size={20} color={colors.primary} />
        <AppText weight="bold" style={styles.sectionTitle}>{title}</AppText>
      </View>
      {children}
    </View>
  );

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <AppText variant="title" style={styles.title}>AI Crop Planner</AppText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <GlassCard style={styles.card}>
          <AppText color={colors.textMuted} style={styles.introText}>
            Provide details about your farm, and our AI will generate a comprehensive roadmap for your crop.
          </AppText>

          {renderSection('Basic Information', 'form-select', (
            <View style={styles.inputGroup}>
              <View style={styles.inputWrap}>
                <AppText variant="caption" style={styles.label}>Crop Name *</AppText>
                <GlassCard style={styles.inputField}>
                  <Feather name="search" size={16} color={colors.textMuted} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="e.g., Wheat"
                    placeholderTextColor={colors.textMuted}
                    value={formData.crop}
                    onChangeText={(val) => setFormData({ ...formData, crop: val })}
                  />
                </GlassCard>
              </View>

              <View style={styles.inputWrap}>
                <AppText variant="caption" style={styles.label}>Land Size (Acres) *</AppText>
                <GlassCard style={styles.inputField}>
                  <MaterialCommunityIcons name="ruler" size={16} color={colors.textMuted} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="e.g., 5"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={formData.landSize}
                    onChangeText={(val) => setFormData({ ...formData, landSize: val })}
                  />
                </GlassCard>
              </View>

              <View style={styles.inputWrap}>
                <AppText variant="caption" style={styles.label}>District *</AppText>
                <GlassCard style={styles.inputField}>
                  <Feather name="map-pin" size={16} color={colors.textMuted} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="e.g., Ludhiana"
                    placeholderTextColor={colors.textMuted}
                    value={formData.district}
                    onChangeText={(val) => setFormData({ ...formData, district: val })}
                  />
                </GlassCard>
              </View>

              <View style={styles.inputWrap}>
                <AppText variant="caption" style={styles.label}>Soil Type (Optional)</AppText>
                <GlassCard style={styles.inputField}>
                  <MaterialCommunityIcons name="texture-box" size={16} color={colors.textMuted} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="e.g., Alluvial / Sandy"
                    placeholderTextColor={colors.textMuted}
                    value={formData.soilType}
                    onChangeText={(val) => setFormData({ ...formData, soilType: val })}
                  />
                </GlassCard>
              </View>
            </View>
          ))}

          {renderSection('Water Availability', 'water', (
            <View style={styles.optionsGrid}>
              {WATER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionCard,
                    formData.waterAvailability === opt.id && { backgroundColor: colors.primary + '15', borderColor: colors.primary }
                  ]}
                  onPress={() => setFormData({ ...formData, waterAvailability: opt.id as any })}
                >
                  <MaterialCommunityIcons name={opt.icon as any} size={24} color={formData.waterAvailability === opt.id ? colors.primary : colors.textMuted} />
                  <AppText
                    variant="caption"
                    weight={formData.waterAvailability === opt.id ? 'bold' : 'regular'}
                    style={{ marginTop: 8, color: formData.waterAvailability === opt.id ? colors.primary : colors.text }}
                  >
                    {opt.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {renderSection('Farming Method', 'clover', (
            <View style={styles.optionsGrid}>
              {FARMING_TYPES.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionCard,
                    formData.farmingType === opt.id && { backgroundColor: colors.primary + '15', borderColor: colors.primary }
                  ]}
                  onPress={() => setFormData({ ...formData, farmingType: opt.id as any })}
                >
                  <MaterialCommunityIcons name={opt.icon as any} size={24} color={formData.farmingType === opt.id ? colors.primary : colors.textMuted} />
                  <AppText
                    variant="caption"
                    weight={formData.farmingType === opt.id ? 'bold' : 'regular'}
                    style={{ marginTop: 8, color: formData.farmingType === opt.id ? colors.primary : colors.text }}
                  >
                    {opt.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.footer}>
            <GradientButton
              label={loading ? 'Generating...' : 'Generate Farming Plan'}
              onPress={handleSubmit}
              disabled={loading}
              loading={loading}
              leftIcon={(() => { const Icon = IconMap['Sparkles']; return Icon ? <Icon size={18} color="#fff" /> : null; })()}
            />
          </View>
        </GlassCard>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <GlassCard style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText weight="bold" style={{ marginTop: 16 }}>Consulting Digital Agronomist...</AppText>
            <AppText variant="caption" style={{ marginTop: 8, textAlign: 'center' }}>
              Analyzing climate, soil, and resource data to build your custom roadmap.
            </AppText>
          </GlassCard>
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    borderRadius: 24,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
  },
  inputGroup: {
    gap: 16,
  },
  inputWrap: {
    gap: 8,
  },
  label: {
    marginLeft: 4,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    padding: 0, // Reset default padding
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  optionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  footer: {
    marginTop: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingCard: {
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
  },
});
