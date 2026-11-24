import { Linking, Platform, Share } from 'react-native';

const ANDROID_PACKAGE = 'com.anaajai.mobile';

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

/** Opens the system share sheet with the given message and the Play Store link. */
export async function shareApp(message: string): Promise<void> {
  try {
    await Share.share({ message: `${message} ${PLAY_STORE_URL}` });
  } catch {
    // The share sheet was unavailable or dismissed with an error; nothing to do.
  }
}

/** Opens the Play Store listing so the user can rate the app. */
export async function openStoreListing(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      await Linking.openURL(`market://details?id=${ANDROID_PACKAGE}`);
      return;
    } catch {
      // No Play Store app on this device; fall through to the web listing.
    }
  }
  try {
    await Linking.openURL(PLAY_STORE_URL);
  } catch {
    // No browser available either; nothing to do.
  }
}
