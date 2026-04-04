import React from 'react';
import { View, StyleSheet, Pressable, Image, ScrollView, Dimensions } from 'react-native';
import { AppText } from '../ui';
import { ChatMessage, Product } from '../../types/api';
import { useTheme } from '../../providers/ThemeContext';
import { themeMinimal } from '../../constants/theme.minimal';
import { IconMap } from '../IconMap';
import { t } from '../../constants/localization';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChatMessageItemProps {
  message: ChatMessage;
  onPlayAudio?: (url: string) => void;
  onProductPress?: (product: Product) => void;
  activeTimestampId: string | null;
  onPress: () => void;
  onLongPress: () => void;
  language: string;
}

export function ChatMessageItem({
  message,
  onPlayAudio,
  onProductPress,
  activeTimestampId,
  onPress,
  onLongPress,
  language,
}: ChatMessageItemProps) {
  const { isDark, colors } = useTheme();

  if (message.type === 'tool_call' || message.type === 'tool_result') {
    // Hide raw tool calls/results as per part 4D cleanup
    return null;
  }

  const isUser = message.role === 'user';

  // Simple Markdown-like formatter for bold and bullets
  const renderContent = (content: any) => {
    if (!content) return null;
    const contentStr = String(content);

    // Split by newlines and process each line
    const lines = contentStr.split('\n');
    return lines.map((line, idx) => {
      // Bold detection: **text**
      const parts = line.split(/(\*\*.*?\*\*)/);
      
      return (
        <AppText
          key={idx}
          color={isUser ? colors.textOnDark : colors.text}
          style={[
            styles.messageText,
            line.trim().startsWith('•') && styles.bulletLine,
            idx > 0 && { marginTop: 4 }
          ]}
        >
          {parts.map((part, pIdx) => {
            if (part && part.startsWith('**') && part.endsWith('**')) {
              return (
                <AppText
                  key={pIdx}
                  color={isUser ? colors.textOnDark : colors.text}
                  style={{ fontWeight: 'bold' }}
                >
                  {part.slice(2, -2)}
                </AppText>
              );
            }
            return part;
          })}
        </AppText>
      );
    });
  };

  const renderProductCard = (product: Product) => (
    <Pressable
      key={product.id || Math.random().toString()}
      style={[
        styles.productCard,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surface, borderColor: colors.border }
      ]}
      onPress={() => onProductPress?.(product)}
    >
      <Image
        source={{ uri: (product.images && product.images[0]) || 'https://via.placeholder.com/150' }}
        style={styles.productImage as any}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <AppText variant="label" numberOfLines={1} style={{ fontSize: 13, fontWeight: '600' }} color={colors.text}>
          {product.name}
        </AppText>
        <AppText variant="caption" color={colors.primary} style={{ fontWeight: '700', marginTop: 2 }}>
          ₹{product.price}
        </AppText>
        <View style={[styles.buyButton, { backgroundColor: colors.primary }]}>
          <AppText variant="caption" color={colors.textOnDark} style={{ fontSize: 10, fontWeight: 'bold' }}>
             {t(language as any, 'buyNow')}
          </AppText>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.primary }]
            : [styles.aiBubble, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surface, borderColor: colors.border }],
        ]}
      >
        <View style={styles.contentWrapper}>
          {renderContent(message.content)}
        </View>

        {message.metadata?.recommendedProducts && message.metadata.recommendedProducts.length > 0 && (
          <View style={[styles.productsContainer, { borderTopColor: themeMinimal.colors.border }]}>
            <AppText variant="caption" color={colors.textMuted} style={{ marginBottom: 8, fontWeight: '600' }}>
              {t(language as any, 'recommendedProducts')}
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsScroll}
            >
              {message.metadata.recommendedProducts.map(renderProductCard)}
            </ScrollView>
          </View>
        )}

        <View style={styles.messageMeta}>
          {message.voiceInput && (
            <View style={styles.voiceIndicator}>
              {(() => {
                const IconComp = IconMap['Mic'];
                return IconComp ? <IconComp size={10} color={isUser ? 'rgba(255,255,255,0.7)' : colors.textMuted} /> : null;
              })()}
              <AppText
                variant="caption"
                color={isUser ? 'rgba(255,255,255,0.7)' : colors.textMuted}
                style={{ marginLeft: 4 }}
              >
                 {t(language as any, 'recordVoice')}
              </AppText>
            </View>
          )}
          {(activeTimestampId === message.id || !isUser) && message.createdAt && (
            <AppText
              variant="caption"
              color={isUser ? 'rgba(255,255,255,0.6)' : colors.textMuted}
              style={styles.timestamp}
            >
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </AppText>
          )}
        </View>

        {!isUser && (message.audioUrl || message.metadata?.audioBase64) && (
          <Pressable
            onPress={() => onPlayAudio?.(message.audioUrl || `data:audio/mp3;base64,${message.metadata?.audioBase64}`)}
            style={[
              styles.audioButton,
              { backgroundColor: isDark ? 'rgba(82,183,129,0.1)' : 'rgba(82,183,129,0.05)' }
            ]}
          >
            {(() => {
              const IconComp = IconMap['PlayCircle'];
              return IconComp ? <IconComp size={18} color={colors.primaryDark} /> : null;
            })()}
            <AppText variant="caption" color={colors.primaryDark} style={{ marginLeft: 6, fontWeight: '600' }}>
              {t(language as any, 'audioPlayback')}
            </AppText>
          </Pressable>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    marginBottom: themeMinimal.spacing.base,
    paddingHorizontal: themeMinimal.spacing.md,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: SCREEN_WIDTH * 0.85,
    paddingHorizontal: themeMinimal.spacing.base,
    paddingVertical: themeMinimal.spacing.md,
    borderRadius: themeMinimal.radius.xl,
  },
  userBubble: {
    borderBottomRightRadius: 4,
    ...themeMinimal.shadows.sm,
  },
  aiBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  contentWrapper: {
    flexShrink: 1,
  },
  messageText: {
    fontSize: themeMinimal.typography.body,
    lineHeight: themeMinimal.typography.body * (themeMinimal.typography.lineHeights as any).normal,
  },
  bulletLine: {
    paddingLeft: 4,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 10,
  },
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  productsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  productsScroll: {
    paddingRight: 10,
  },
  productCard: {
    width: 140,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  productImage: {
    width: 140,
    height: 90,
  },
  productInfo: {
    padding: 8,
  },
  buyButton: {
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 6,
    alignItems: 'center',
  },
});
