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
        // Pre-load fonts, make any API calls you need here
        // For now, we just wait a bit to ensure everything is mounted
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately!
      await SplashScreen.hideAsync();
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
