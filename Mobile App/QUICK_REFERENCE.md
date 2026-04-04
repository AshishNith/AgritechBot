# 🎨 UI/UX Redesign - Developer Quick Reference

## 🚀 New Components - Copy & Paste Examples

### HeroWeatherCard
```typescript
import { HeroWeatherCard } from '../components/HeroWeatherCard';

<HeroWeatherCard
  temperature={25}
  condition="Partly Cloudy"
  locationName="Punjab, India"
  humidity={65}
  windSpeed={12}
  soilMoisture={45}
  weatherCode={2}
  advice="Good day for planting wheat!"
  onPress={() => navigate('WeatherDashboard')}
/>
```

### QuickActionGrid
```typescript
import { QuickActionGrid } from '../components/QuickActionGrid';

<QuickActionGrid />
// That's it! Auto-navigates to Chat, Planner, Voice, ImageScan
```

### EnhancedButton
```typescript
import { EnhancedButton } from '../components/ui/EnhancedButton';
import { Check } from 'lucide-react-native';

// Primary (gradient)
<EnhancedButton label="Save" variant="primary" onPress={save} />

// With icon
<EnhancedButton
  label="Confirm"
  variant="primary"
  leftIcon={<Check size={20} color="#fff" />}
  onPress={confirm}
/>

// Loading state
<EnhancedButton
  label="Saving..."
  variant="primary"
  loading={isSaving}
  onPress={save}
/>

// All variants
<EnhancedButton variant="primary" />    // Green gradient
<EnhancedButton variant="secondary" />  // Light green background
<EnhancedButton variant="outline" />    // Border only
<EnhancedButton variant="ghost" />      // Transparent
<EnhancedButton variant="danger" />     // Red gradient

// All sizes
<EnhancedButton size="sm" />  // 40px height
<EnhancedButton size="md" />  // 48px height (default)
<EnhancedButton size="lg" />  // 56px height
```

### NotificationCard
```typescript
import { NotificationCard } from '../components/NotificationCard';

{notifications.map((notif, index) => (
  <NotificationCard
    key={notif._id}
    notification={notif}
    index={index}
    onPress={(n) => handlePress(n)}
    onMarkRead={(id) => markAsRead(id)}
  />
))}
```

### EmptyState
```typescript
import { EmptyState } from '../components/ui/EmptyState';

// When no data
{items.length === 0 && (
  <EmptyState 
    type="products"  // or "tasks" | "notifications" | "chats"
    onAction={() => clearFilters()}
  />
)}
```

---

## 🎨 Using Enhanced Theme

### Import
```typescript
import { themeEnhanced, gradients } from '../constants/theme.enhanced';
import { useTheme } from '../providers/ThemeContext';

const { colors } = useTheme();
```

### Gradients
```typescript
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../constants/theme.enhanced';

<LinearGradient colors={gradients.primary} ... />
<LinearGradient colors={gradients.sunset} ... />
<LinearGradient colors={gradients.sky} ... />
<LinearGradient colors={gradients.earth} ... />
<LinearGradient colors={gradients.success} ... />
<LinearGradient colors={gradients.premium} ... />
<LinearGradient colors={gradients.danger} ... />
<LinearGradient colors={gradients.warning} ... />
```

### New Colors
```typescript
// Semantic colors with light/dark variants
backgroundColor: colors.successLight  // Light green
backgroundColor: colors.warningLight  // Light orange
backgroundColor: colors.dangerLight   // Light red
backgroundColor: colors.infoLight     // Light blue

color: colors.successDark   // Dark green
color: colors.warningDark   // Dark orange
color: colors.dangerDark    // Dark red
color: colors.infoDark      // Dark blue

// Agricultural accents
backgroundColor: colors.soil   // Brown
backgroundColor: colors.sky    // Blue
backgroundColor: colors.sun    // Yellow
backgroundColor: colors.crop   // Lime green

// Gray scale (50-900)
backgroundColor: colors.gray50    // Lightest
backgroundColor: colors.gray100
borderColor: colors.gray300
color: colors.gray600
backgroundColor: colors.gray900   // Darkest
```

### Typography
```typescript
// Import enhanced theme
import { themeEnhanced } from '../constants/theme.enhanced';

<Text style={themeEnhanced.typography.display}>Hero Title</Text>
<Text style={themeEnhanced.typography.displaySmall}>Large Title</Text>
<Text style={themeEnhanced.typography.title}>Section Title</Text>
<Text style={themeEnhanced.typography.heading}>Card Title</Text>
<Text style={themeEnhanced.typography.subheading}>Subheading</Text>
<Text style={themeEnhanced.typography.body}>Body text</Text>
<Text style={themeEnhanced.typography.bodyLarge}>Large body</Text>
<Text style={themeEnhanced.typography.label}>Button Label</Text>
<Text style={themeEnhanced.typography.caption}>Small text</Text>
<Text style={themeEnhanced.typography.overline}>LABEL</Text>
```

### Spacing
```typescript
import { themeEnhanced } from '../constants/theme.enhanced';

padding: themeEnhanced.spacing.xs      // 4px
padding: themeEnhanced.spacing.sm      // 8px
padding: themeEnhanced.spacing.md      // 12px
padding: themeEnhanced.spacing.lg      // 16px
padding: themeEnhanced.spacing.xl      // 20px
padding: themeEnhanced.spacing.xxl     // 24px
padding: themeEnhanced.spacing.xxxl    // 32px
padding: themeEnhanced.spacing.xxxxl   // 40px
padding: themeEnhanced.spacing.xxxxxl  // 48px
```

### Border Radius
```typescript
borderRadius: themeEnhanced.radius.xs     // 8px
borderRadius: themeEnhanced.radius.sm     // 12px
borderRadius: themeEnhanced.radius.md     // 16px
borderRadius: themeEnhanced.radius.lg     // 20px
borderRadius: themeEnhanced.radius.xl     // 24px
borderRadius: themeEnhanced.radius.xxl    // 32px
borderRadius: themeEnhanced.radius.round  // 999px (fully rounded)
```

### Shadows
```typescript
...themeEnhanced.shadow.subtle   // 2dp, 5% opacity
...themeEnhanced.shadow.sm       // 2dp, 5% opacity
...themeEnhanced.shadow.medium   // 6dp, 10% opacity
...themeEnhanced.shadow.card     // 8dp, 9% opacity
...themeEnhanced.shadow.high     // 12dp, 15% opacity
...themeEnhanced.shadow.glow     // Primary color shadow
```

### Touch Targets
```typescript
minWidth: themeEnhanced.touchTarget.min          // 44px
minHeight: themeEnhanced.touchTarget.comfortable // 48px
minHeight: themeEnhanced.touchTarget.large       // 56px
```

### Icon Sizes
```typescript
<Icon size={themeEnhanced.iconSize.xs} />     // 16px
<Icon size={themeEnhanced.iconSize.sm} />     // 20px
<Icon size={themeEnhanced.iconSize.md} />     // 24px
<Icon size={themeEnhanced.iconSize.lg} />     // 32px
<Icon size={themeEnhanced.iconSize.xl} />     // 48px
<Icon size={themeEnhanced.iconSize.hero} />   // 64px
```

---

## 🎬 Animations (Reanimated)

### Entry Animations
```typescript
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

// Fade in
<Animated.View entering={FadeIn}>

// Fade in from bottom
<Animated.View entering={FadeInDown}>

// With delay
<Animated.View entering={FadeInDown.delay(200)}>

// Springy
<Animated.View entering={FadeInDown.springify()}>

// Combined
<Animated.View entering={FadeInDown.delay(100).springify()}>
```

### Press Animations
```typescript
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

const handlePressIn = () => {
  scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
};

const handlePressOut = () => {
  scale.value = withSpring(1, { damping: 15, stiffness: 400 });
};

<Animated.View style={animatedStyle}>
  <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
    {/* content */}
  </Pressable>
</Animated.View>
```

### Staggered Lists
```typescript
{items.map((item, index) => (
  <Animated.View
    key={item.id}
    entering={FadeInDown.delay(index * 50).springify()}
  >
    <ItemCard item={item} />
  </Animated.View>
))}
```

---

## 📏 Layout Patterns

### Card Layout
```typescript
<View style={{
  backgroundColor: colors.surface,
  borderRadius: themeEnhanced.radius.md,  // 16px
  padding: themeEnhanced.spacing.lg,      // 16px
  gap: themeEnhanced.spacing.md,          // 12px
  ...themeEnhanced.shadow.card,
}}>
  {/* content */}
</View>
```

### Section Header
```typescript
<View style={{
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: themeEnhanced.spacing.md,
}}>
  <Text style={themeEnhanced.typography.heading}>Section Title</Text>
  <Pressable>
    <Text style={[themeEnhanced.typography.label, { color: colors.primary }]}>
      See All
    </Text>
  </Pressable>
</View>
```

### Grid (2 columns)
```typescript
<View style={{
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: themeEnhanced.spacing.md,
}}>
  {items.map(item => (
    <View key={item.id} style={{ width: '48%' }}>
      <ItemCard item={item} />
    </View>
  ))}
</View>
```

### Icon + Text Row
```typescript
<View style={{
  flexDirection: 'row',
  alignItems: 'center',
  gap: themeEnhanced.spacing.sm,
}}>
  <Icon size={20} color={colors.textMuted} />
  <Text style={[themeEnhanced.typography.body, { color: colors.textMuted }]}>
    Label text
  </Text>
</View>
```

---

## 🎯 Common Patterns

### Priority Badge
```typescript
const priorityConfig = {
  urgent: { bg: colors.dangerLight, text: colors.danger },
  high: { bg: colors.warningLight, text: colors.warning },
  medium: { bg: colors.infoLight, text: colors.info },
  low: { bg: colors.gray100, text: colors.gray600 },
};

const config = priorityConfig[priority];

<View style={{
  backgroundColor: config.bg,
  paddingHorizontal: 12,
  paddingVertical: 4,
  borderRadius: themeEnhanced.radius.round,
}}>
  <Text style={[themeEnhanced.typography.caption, { color: config.text }]}>
    {priority.toUpperCase()}
  </Text>
</View>
```

### Unread Indicator Dot
```typescript
{!item.read && (
  <View style={{
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 12,
    right: 12,
  }} />
)}
```

### Loading Placeholder
```typescript
{isLoading ? (
  <ActivityIndicator size="large" color={colors.primary} />
) : (
  <Content />
)}
```

---

## 🔧 Quick Fixes

### Component not found?
```typescript
// Make sure import path is correct
import { HeroWeatherCard } from '../components/HeroWeatherCard';
// NOT from '../components/ui/...'
```

### Colors not working?
```typescript
// Use theme hook, not direct import
const { colors } = useTheme();
// NOT: import { theme } from '...'
```

### Animation not smooth?
```typescript
// Always use native driver for transform/opacity
useNativeDriver: true

// DON'T animate: width, height, padding, margin
// DO animate: transform (scale, translate), opacity
```

### TypeScript error?
```typescript
// Check if you're importing from enhanced theme
import { themeEnhanced } from '../constants/theme.enhanced';
// Not the old theme
```

---

## 📚 Files Location

```
Mobile App/
├── src/
│   ├── components/
│   │   ├── HeroWeatherCard.tsx        ← Weather hero card
│   │   ├── QuickActionGrid.tsx        ← Quick actions
│   │   ├── NotificationCard.tsx       ← Notification item
│   │   └── ui/
│   │       ├── EnhancedButton.tsx     ← New button
│   │       └── EmptyState.tsx         ← Empty states
│   └── constants/
│       └── theme.enhanced.ts          ← Enhanced theme
├── REDESIGN_GUIDE.md                  ← Setup guide
├── REDESIGN_SUMMARY.md                ← Full summary
└── VERIFICATION_CHECKLIST.md          ← Test checklist
```

---

**Pro Tip:** Keep this file open while developing. It has all the code snippets you need! 🚀
