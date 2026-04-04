import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, GradientButton } from '../ui';
import { ThemeMode, Language, TaskCategory, CropTask } from '../../types/planner';
import { getPlannerTheme } from '../../constants/plannerTheme';
import { translations } from '../../constants/plannerTranslations';
import { generateCropSchedule } from '../../services/geminiPlanner';

interface AddTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (task: Partial<CropTask>) => void;
  lang: Language;
  themeMode: ThemeMode;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ 
  isVisible, onClose, onSave, lang, themeMode 
}) => {
  const theme = getPlannerTheme(themeMode);
  const t = (key: string) => translations[lang][key] || key;

  const [title, setTitle] = useState('');
  const [crop, setCrop] = useState('');
  const [field, setField] = useState('');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [isGenerating, setIsGenerating] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['70%', '90%'], []);

  const categories: { key: TaskCategory; icon: string }[] = [
    { key: 'sowing', icon: 'grid' },
    { key: 'irrigation', icon: 'droplet' },
    { key: 'fertilizer', icon: 'package' },
    { key: 'pesticide', icon: 'shield' },
    { key: 'harvest', icon: 'scissors' },
  ];

  const handleAISuggest = async () => {
    if (!crop || !field) {
      Alert.alert("Input Required", "Please enter a Crop and Field name first.");
      return;
    }
    setIsGenerating(true);
    try {
      const tasks = await generateCropSchedule({
        cropName: crop,
        fieldName: field,
        sowingDate: new Date().toISOString().split('T')[0],
        language: lang,
      });
      // For now, let's just take the first suggested task as an example
      if (tasks.length > 0) {
        const first = tasks[0];
        setTitle(first.titleTranslations[lang] || first.title);
        setCategory(first.category);
      }
    } catch (e) {
      Alert.alert("AI Error", "Failed to generate suggestions.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!title || !crop) return;
    onSave({
      title,
      cropName: crop,
      fieldName: field || 'Main Field',
      category,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      progress: 0,
      isAISuggested: false,
    });
    // Reset and close
    setTitle('');
    setCrop('');
    setField('');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      )}
      backgroundStyle={{ backgroundColor: theme.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.text3 }}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <AppText variant="display" style={{ fontSize: 24 }}>{t('addTask')}</AppText>
          <TouchableOpacity onPress={handleAISuggest} disabled={isGenerating}>
            <View style={[styles.aiButton, { backgroundColor: theme.purpleLight }]}>
              {isGenerating ? (
                <View style={styles.loader} />
              ) : (
                <MaterialCommunityIcons name="robot" size={18} color={theme.purple} />
              )}
              <AppText style={{ color: theme.purple, fontSize: 12, fontWeight: '700' }}>
                {isGenerating ? t('generating') : t('addTaskAI')}
              </AppText>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <AppText style={[styles.label, { color: theme.text2 }]}>{t('taskName')}</AppText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface2, color: theme.text }]}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., First Irrigation"
              placeholderTextColor={theme.text3}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <AppText style={[styles.label, { color: theme.text2 }]}>{t('cropLabel')}</AppText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface2, color: theme.text }]}
                value={crop}
                onChangeText={setCrop}
                placeholder="Wheat"
                placeholderTextColor={theme.text3}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <AppText style={[styles.label, { color: theme.text2 }]}>{t('fieldLabel')}</AppText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface2, color: theme.text }]}
                value={field}
                onChangeText={setField}
                placeholder="North Field"
                placeholderTextColor={theme.text3}
              />
            </View>
          </View>

          <AppText style={[styles.label, { color: theme.text2 }]}>Category</AppText>
          <View style={styles.catGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setCategory(cat.key)}
                style={[
                  styles.catItem,
                  { backgroundColor: theme.surface2 },
                  category === cat.key && { borderColor: theme.accent, borderWidth: 1 }
                ]}
              >
                <Feather name={cat.icon as any} size={18} color={category === cat.key ? theme.accent : theme.text2} />
                <AppText style={{ fontSize: 11, color: category === cat.key ? theme.accent : theme.text2 }}>
                  {cat.key}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={{ height: 40 }} />
          
          <GradientButton 
            label={t('save')} 
            onPress={handleSave}
            disabled={!title || !crop}
          />
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <AppText style={{ color: theme.text3 }}>{t('cancel')}</AppText>
          </TouchableOpacity>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    padding: 14,
    borderRadius: 16,
    fontSize: 15,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  catItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  loader: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#8b5cf6',
    borderTopColor: 'transparent',
  },
});
