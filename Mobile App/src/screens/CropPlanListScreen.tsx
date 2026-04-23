import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, AppText, GlassCard, GradientButton } from '../components/ui';
import { IconMap } from '../components/IconMap';
import { useTheme } from '../providers/ThemeContext';
import { apiService } from '../api/services';

export const CropPlanListScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = React.useState(true);
  const [plans, setPlans] = React.useState<any[]>([]);

  const fetchPlans = async () => {
    try {
      const response = await apiService.getCropPlans();
      if (response.success) {
        setPlans(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPlans();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('CropPlanResult', { planId: item._id })}
    >
      <GlassCard style={styles.planCard}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
          <MaterialCommunityIcons name="sprout" size={24} color={colors.primary} />
        </View>
        
        <View style={styles.planInfo}>
          <View style={styles.row}>
            <AppText weight="bold" style={styles.cropTitle}>{item.crop}</AppText>
            <View style={styles.badge}>
              <AppText variant="caption" color={colors.primary} weight="bold">
                {item.generatedPlan.total_duration}
              </AppText>
            </View>
          </View>
          
          <AppText variant="caption" color={colors.textMuted}>
            {item.location.district}, {item.location.state} • {item.inputData.farmingType}
          </AppText>
          
          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Feather name="trending-up" size={12} color="#059669" />
              <AppText style={styles.footerText}>{item.generatedPlan.profit_estimation}</AppText>
            </View>
            <AppText variant="caption" color={colors.textMuted}>
              {new Date(item.createdAt).toLocaleDateString()}
            </AppText>
          </View>
        </View>
        
        <Feather name="chevron-right" size={20} color={colors.textMuted} />
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <AppText variant="title">My Farming Plans</AppText>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => navigation.navigate('CropPlannerForm')}
        >
          <Feather name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : plans.length === 0 ? (
        <View style={styles.emptyState}>
          <Image 
            source={{ uri: 'https://res.cloudinary.com/dvwpxb2oa/image/upload/v1713865000/empty-farm_zxcvbn.png' }}
            style={styles.emptyImage}
          />
          <AppText variant="title" style={styles.emptyTitle}>No Plans Yet</AppText>
          <AppText color={colors.textMuted} style={styles.emptySub}>
            Generate your first AI-powered farming roadmap to get started.
          </AppText>
          <GradientButton 
            label="Generate New Plan" 
            onPress={() => navigation.navigate('CropPlannerForm')}
            style={styles.emptyBtn}
            leftIcon={(() => { const Icon = IconMap['Sparkles']; return Icon ? <Icon size={18} color="#fff" /> : null; })()}
          />
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 8,
  },
  addBtn: {
    padding: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    gap: 12,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: {
    flex: 1,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cropTitle: {
    fontSize: 17,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(5, 150, 105, 0.05)',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  emptyTitle: {
    marginTop: 24,
    fontSize: 20,
  },
  emptySub: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  emptyBtn: {
    width: '100%',
  },
});
