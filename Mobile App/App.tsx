import 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AppProviders } from './src/providers/AppProviders';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load assets/fonts if needed. 
        // We add a small delay to ensure the native bridge is fully initialized.
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (e) {
        console.warn('Initialization error:', e);
      } finally {
        setAppIsReady(true);
        // Failsafe: Hide splash after 3.5 seconds even if onLayout fails.
        // This prevents the user from being stuck indefinitely.
        setTimeout(async () => {
          try {
            await SplashScreen.hideAsync();
          } catch (e) {
            // Splash might have been hidden by onLayout already
          }
        }, 3500);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        // This tells the splash screen to hide immediately!
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Failed to hide splash screen:', e);
      }
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <AppProviders>
        <RootNavigator />
      </AppProviders>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
