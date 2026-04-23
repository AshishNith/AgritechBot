import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { AppText, GlassCard } from '../ui';
import { CropTask, Language, ThemeMode, TaskCategory } from '../../types/planner';
import { getPlannerTheme } from '../../constants/plannerTheme';
import { translations } from '../../constants/plannerTranslations';

interface ListViewProps {
  tasks: CropTask[];
  lang: Language;
  themeMode: ThemeMode;
  onEdit: (task: CropTask) => void;
  onDelete: (taskId: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({ 
  tasks, lang, themeMode, onEdit, onDelete 
}) => {
  const theme = getPlannerTheme(themeMode);
  const t = (key: string) => translations[lang][key] || key;
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const getCategoryIcon = (cat: TaskCategory) => {
    switch(cat) {
      case 'sowing': return 'grid';
      case 'irrigation': return 'droplet';
      case 'fertilizer': return 'package';
      case 'pesticide': return 'shield';
      case 'harvest': return 'scissors';
      default: return 'check-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return theme.accent;
      case 'pending': return theme.amber;
      case 'overdue': return theme.red;
      case 'ai-suggested': return theme.purple;
      default: return theme.text2;
    }
  };

  return (
    <View style={styles.container}>
      {sortedTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="list" size={48} color={theme.border} />
          <AppText style={{ color: theme.text3, marginTop: 12 }}>{t('noTasks')}</AppText>
        </View>
      ) : (
        <View style={styles.listContent}>
          {sortedTasks.map((task, index) => {
            const isExpanded = expandedId === task.id;
            const statusColor = getStatusColor(task.status);
            
            return (
              <TouchableOpacity 
                key={task.id} 
                activeOpacity={0.9} 
                onPress={() => setExpandedId(isExpanded ? null : task.id)}
              >
                <GlassCard 
                  style={[
                    styles.card, 
                    { 
                      backgroundColor: theme.surface, 
                      borderColor: isExpanded ? statusColor : theme.border,
                      borderLeftWidth: task.isAISuggested ? 4 : 1,
                      borderLeftColor: task.isAISuggested ? theme.purple : (isExpanded ? statusColor : theme.border)
                    }
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconWrap, { backgroundColor: statusColor + '15' }]}>
                      <Feather name={getCategoryIcon(task.category)} size={18} color={statusColor} />
                    </View>
                    
                    <View style={styles.headerText}>
                      <View style={styles.titleRow}>
                        <AppText weight="bold" style={{ fontSize: 16, flex: 1 }}>
                          {task.titleTranslations[lang] || task.title}
                        </AppText>
                        {task.isAISuggested && (
                          <View style={[styles.aiBadge, { backgroundColor: theme.purpleLight }]}>
                            <AppText style={{ color: theme.purple, fontSize: 9, fontWeight: '800' }}>AI</AppText>
                          </View>
                        )}
                      </View>
                      <AppText variant="caption" color={theme.text2}>
                        {task.cropName} • {format(parseISO(task.startDate), 'EEEE, MMM d')}
                      </AppText>
                    </View>

                    <Feather 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={18} 
                      color={theme.text3} 
                    />
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={[styles.divider, { backgroundColor: theme.border }]} />
                      
                      <AppText style={styles.description}>
                        {task.notes || "No additional instructions provided."}
                      </AppText>

                      {task.aiReason && (
                        <View style={[styles.aiReasonBox, { backgroundColor: theme.purple + '08' }]}>
                          <AppText variant="caption" color={theme.purple} weight="bold">AI Analysis:</AppText>
                          <AppText variant="caption" color={theme.text2} style={{ marginTop: 2 }}>
                            {task.aiReason}
                          </AppText>
                        </View>
                      )}

                      <View style={styles.cardFooter}>
                        <View style={styles.footerInfo}>
                          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                          <AppText variant="caption" weight="bold" style={{ color: statusColor }}>
                            {task.status.toUpperCase()}
                          </AppText>
                        </View>
                        
                        <View style={styles.actionButtons}>
                          <TouchableOpacity onPress={() => onEdit(task)} style={styles.iconBtn}>
                            <Feather name="check-square" size={16} color={theme.accent} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.iconBtn}>
                            <Feather name="trash-2" size={16} color={theme.red} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  expandedContent: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    marginBottom: 12,
  },
  aiReasonBox: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#8b5cf6',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconBtn: {
    padding: 4,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
