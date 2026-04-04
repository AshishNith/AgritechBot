import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiService } from '../api/services';
import { LocationSelector } from '../components/LocationSelector';
import { AppText, GradientButton, Pill, Screen, ScreenCard } from '../components/ui';
import { theme } from '../constants/theme';
import { useI18n } from '../hooks/useI18n';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddCrop'>;

export function AddCropScreen({ navigation }: Props) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [cropType, setCropType] = useState('');
  const [variety, setVariety] = useState('');
  const [plantingDate, setPlantingDate] = useState(new Date());
  const [currentStage, setCurrentStage] = useState<'seedling' | 'growing' | 'flowering' | 'fruiting' | 'harvesting' | 'dormant'>('seedling');
  const [soilType, setSoilType] = useState('');
  const [landSize, setLandSize] = useState('');
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stages = [
    { label: t('stageSeedling') || 'Seedling', value: 'seedling' },
    { label: t('stageGrowing') || 'Growing', value: 'growing' },
    { label: t('stageFlowering') || 'Flowering', value: 'flowering' },
    { label: t('stageFruiting') || 'Fruiting', value: 'fruiting' },
    { label: t('stageHarvesting') || 'Harvesting', value: 'harvesting' }
  ];

  const addCropMutation = useMutation({
    mutationFn: (data: any) => apiService.addCrop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      navigation.navigate('SmartAssistant');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to add crop');
    }
  });

  const handleAddCrop = () => {
    if (!cropType) return setError('Please enter crop type');
    if (!location) return setError('Please select farm location');

    addCropMutation.mutate({
      cropType,
      variety,
      plantingDate,
      currentStage,
      soilType,
      landSize: landSize ? Number(landSize) : undefined,
      location
    });
  };

  return (
    <Screen scrollable headerProps={{ title: 'Register New Crop', showBack: true }}>
      <ScrollView contentContainerStyle={styles.container}>
        {error && (
           <View style={styles.errorBox}>
             <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
             <AppText color={theme.colors.danger} style={{ marginLeft: 8 }}>{error}</AppText>
           </View>
        )}

        <ScreenCard>
          <AppText variant="label">Crop Name (e.g. Wheat, Rice)</AppText>
          <TextInput 
            style={styles.input}
            value={cropType}
            onChangeText={setCropType}
            placeholder="Enter crop name"
          />

          <AppText variant="label" style={{ marginTop: 16 }}>Variety (Optional)</AppText>
          <TextInput 
            style={styles.input}
            value={variety}
            onChangeText={setVariety}
            placeholder="e.g. PBW 343"
          />
        </ScreenCard>

        <AppText variant="title" style={{ marginTop: 24, marginBottom: 12 }}>Growth Stage</AppText>
        <View style={styles.stageGrid}>
           {stages.map((s) => (
             <Pill 
               key={s.value}
               label={s.label}
               active={currentStage === s.value}
               onPress={() => setCurrentStage(s.value as any)}
               style={{ marginBottom: 8 }}
             />
           ))}
        </View>

        <ScreenCard style={{ marginTop: 20 }}>
          <View style={styles.locationHeader}>
            <View>
              <AppText variant="label">Location</AppText>
              <AppText color={location ? theme.colors.text : theme.colors.textMuted}>
                {location ? (location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`) : 'No location selected'}
              </AppText>
            </View>
            <Pressable onPress={() => setShowLocationPicker(true)}>
              <AppText color={theme.colors.primary}>Change</AppText>
            </Pressable>
          </View>
        </ScreenCard>

        <View style={styles.footer}>
          <GradientButton 
            label={addCropMutation.isPending ? 'Generating Schedule...' : 'Generate Farming Schedule'}
            onPress={handleAddCrop}
            disabled={addCropMutation.isPending}
            leftIcon={addCropMutation.isPending ? <ActivityIndicator color="#fff" /> : undefined}
          />
          <AppText variant="caption" style={{ textAlign: 'center', marginTop: 12 }}>
            AI will generate a 14-day personalized care plan
          </AppText>
        </View>
      </ScrollView>

      <Modal visible={showLocationPicker} animationType="slide">
        <LocationSelector 
          onCancel={() => setShowLocationPicker(false)}
          onSelect={(picked) => {
            setLocation({
              latitude: picked.latitude,
              longitude: picked.longitude,
              address: picked.address || picked.city
            });
            setShowLocationPicker(false);
          }}
        />
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40
  },
  input: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  footer: {
    marginTop: 40
  }
});
