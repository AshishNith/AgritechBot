import 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import { View } from 'react-native';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AppProviders } from './src/providers/AppProviders';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppProviders>
        <RootNavigator />
      </AppProviders>
    </View>
  );
}
