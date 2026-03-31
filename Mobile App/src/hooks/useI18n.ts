import { t, localeForLanguage, type TranslationKey } from '../constants/localization';
import { useAppStore } from '../store/useAppStore';
import type { AppLanguage } from '../types/api';

type ExtraTranslationKey =
  | 'homeTab'
  | 'chatTab'
  | 'marketplaceTab'
  | 'historyTab'
  | 'profileTab'
  | 'alerts'
  | 'completeYourProfile'
  | 'phoneNotAvailable'
  | 'incompleteProfile'
  | 'premiumMember'
  | 'basicMember'
  | 'freeMember'
  | 'editProfile'
  | 'subscriptionStatus'
  | 'premiumPlanActive'
  | 'basicPlanActive'
  | 'freePlan'
  | 'manage'
  | 'commerce'
  | 'trackOrders'
  | 'checkStatusAndDeliveryUpdates'
  | 'myCart'
  | 'reviewItemsAndCheckout'
  | 'preferences'
  | 'appLanguage'
  | 'darkAppearance'
  | 'notifications'
  | 'on'
  | 'off'
  | 'securityAndData'
  | 'privacySettings'
  | 'close'
  | 'enterYourName'
  | 'cropsGrown'
  | 'enterLandSize'
  | 'notSelected'
  | 'change'
  | 'saving'
  | 'saveChanges'
  | 'useCurrentLocationOrPickOnMap'
  | 'noApiKeyNeeded'
  | 'newChat'
  | 'pastSessions'
  | 'toolResult'
  | 'thinking'
  | 'retry'
  | 'enterSessionTitle'
  | 'renameSession'
  | 'cancel'
  | 'imageWillBeSentWithQuestion'
  | 'seasonLabel'
  | 'rename'
  | 'archive'
  | 'listening'
  | 'ready'
  | 'askYourCropQuestionIn'
  | 'voiceResponse'
  | 'playbackFailed'
  | 'voicePlaybackFailed'
  | 'voiceRequestFailed'
  | 'voiceRouteUnavailable'
  | 'startRecording'
  | 'stopAndSend'
  | 'cropWheat'
  | 'cropRice'
  | 'cropCotton'
  | 'cropMustard'
  | 'unitAcre'
  | 'unitBigha'
  | 'unitHectare'
  | 'whatCropsDoYouGrow'
  | 'profileRequiredToContinue'
  | 'cropDetails';

export type AppTranslationKey = TranslationKey | ExtraTranslationKey;

const extraTranslations: Record<AppLanguage, Record<ExtraTranslationKey, string>> = {
  English: {
    homeTab: 'Home',
    chatTab: 'Chat',
    marketplaceTab: 'Marketplace',
    historyTab: 'History',
    profileTab: 'Profile',
    alerts: 'Alerts',
    completeYourProfile: 'Complete your profile',
    phoneNotAvailable: 'Phone not available',
    incompleteProfile: 'Incomplete Profile',
    premiumMember: 'Premium Member',
    basicMember: 'Basic Member',
    freeMember: 'Free Member',
    editProfile: 'Edit Profile',
    subscriptionStatus: 'Subscription Status',
    premiumPlanActive: 'Premium Plan (Active)',
    basicPlanActive: 'Basic Plan (Active)',
    freePlan: 'Free Plan',
    manage: 'Manage',
    commerce: 'Commerce',
    trackOrders: 'Track Orders',
    checkStatusAndDeliveryUpdates: 'Check status and delivery updates',
    myCart: 'My Cart',
    reviewItemsAndCheckout: 'Review items and checkout',
    preferences: 'Preferences',
    appLanguage: 'App Language',
    darkAppearance: 'Dark Appearance',
    notifications: 'Notifications',
    on: 'On',
    off: 'Off',
    securityAndData: 'Security & Data',
    privacySettings: 'Privacy Settings',
    close: 'Close',
    enterYourName: 'Enter your name',
    cropsGrown: 'Crops Grown',
    enterLandSize: 'Enter land size',
    notSelected: 'Not selected',
    change: 'Change',
    saving: 'Saving...',
    saveChanges: 'Save Changes',
    useCurrentLocationOrPickOnMap: 'Use Current Location / Pick on Map',
    noApiKeyNeeded: 'No API key needed',
    newChat: 'New chat',
    pastSessions: 'Past sessions',
    toolResult: 'Tool result',
    thinking: 'Thinking...',
    retry: 'Retry',
    enterSessionTitle: 'Enter session title',
    renameSession: 'Rename session',
    cancel: 'Cancel',
    imageWillBeSentWithQuestion: 'It will be sent with your question.',
    seasonLabel: 'Season',
    rename: 'Rename',
    archive: 'Archive',
    listening: 'Listening...',
    ready: 'Ready',
    askYourCropQuestionIn: 'Ask your crop question in',
    voiceResponse: 'Voice response',
    playbackFailed: 'Playback failed',
    voicePlaybackFailed: 'Voice response arrived, but audio playback failed on device.',
    voiceRequestFailed: 'Voice request failed',
    voiceRouteUnavailable: 'The backend voice route is unavailable or requires authentication.',
    startRecording: 'Start Recording',
    stopAndSend: 'Stop & Send',
    cropWheat: 'Wheat',
    cropRice: 'Rice',
    cropCotton: 'Cotton',
    cropMustard: 'Mustard',
    unitAcre: 'Acre',
    unitBigha: 'Bigha',
    unitHectare: 'Hectare',
    whatCropsDoYouGrow: 'What crops do you grow?',
    profileRequiredToContinue: 'Profile details are required to continue.',
    cropDetails: 'Crop Details',
  },
  Hindi: {
    homeTab: 'होम',
    chatTab: 'चैट',
    marketplaceTab: 'मार्केट',
    historyTab: 'इतिहास',
    profileTab: 'प्रोफाइल',
    alerts: 'अलर्ट',
    completeYourProfile: 'अपनी प्रोफाइल पूरी करें',
    phoneNotAvailable: 'फोन उपलब्ध नहीं',
    incompleteProfile: 'अधूरी प्रोफाइल',
    premiumMember: 'प्रीमियम सदस्य',
    basicMember: 'बेसिक सदस्य',
    freeMember: 'फ्री सदस्य',
    editProfile: 'प्रोफाइल संपादित करें',
    subscriptionStatus: 'सब्सक्रिप्शन स्टेटस',
    premiumPlanActive: 'प्रीमियम प्लान (सक्रिय)',
    basicPlanActive: 'बेसिक प्लान (सक्रिय)',
    freePlan: 'फ्री प्लान',
    manage: 'प्रबंधन',
    commerce: 'कॉमर्स',
    trackOrders: 'ऑर्डर ट्रैक करें',
    checkStatusAndDeliveryUpdates: 'स्टेटस और डिलिवरी अपडेट देखें',
    myCart: 'मेरा कार्ट',
    reviewItemsAndCheckout: 'आइटम देखें और चेकआउट करें',
    preferences: 'पसंद',
    appLanguage: 'ऐप भाषा',
    darkAppearance: 'डार्क दिखावट',
    notifications: 'नोटिफिकेशन',
    on: 'चालू',
    off: 'बंद',
    securityAndData: 'सुरक्षा और डेटा',
    privacySettings: 'प्राइवेसी सेटिंग्स',
    close: 'बंद करें',
    enterYourName: 'अपना नाम दर्ज करें',
    cropsGrown: 'उगाई जाने वाली फसलें',
    enterLandSize: 'जमीन का क्षेत्र दर्ज करें',
    notSelected: 'चयन नहीं किया गया',
    change: 'बदलें',
    saving: 'सेव किया जा रहा है...',
    saveChanges: 'परिवर्तन सेव करें',
    useCurrentLocationOrPickOnMap: 'वर्तमान लोकेशन इस्तेमाल करें / मैप पर चुनें',
    noApiKeyNeeded: 'API key की जरूरत नहीं',
    newChat: 'नया चैट',
    pastSessions: 'पिछले सेशन',
    toolResult: 'टूल परिणाम',
    thinking: 'सोच रहा हूँ...',
    retry: 'फिर कोशिश करें',
    enterSessionTitle: 'सेशन शीर्षक दर्ज करें',
    renameSession: 'सेशन का नाम बदलें',
    cancel: 'रद्द करें',
    imageWillBeSentWithQuestion: 'यह आपके सवाल के साथ भेजी जाएगी।',
    seasonLabel: 'सीजन',
    rename: 'नाम बदलें',
    archive: 'आर्काइव',
    listening: 'सुन रहा हूँ...',
    ready: 'तैयार',
    askYourCropQuestionIn: 'अपना फसल सवाल इस भाषा में पूछें',
    voiceResponse: 'वॉइस जवाब',
    playbackFailed: 'प्लेबैक विफल',
    voicePlaybackFailed: 'वॉइस जवाब मिला, लेकिन डिवाइस पर ऑडियो प्लेबैक विफल रहा।',
    voiceRequestFailed: 'वॉइस अनुरोध विफल',
    voiceRouteUnavailable: 'बैकएंड वॉइस रूट उपलब्ध नहीं है या प्रमाणीकरण चाहता है।',
    startRecording: 'रिकॉर्ड शुरू करें',
    stopAndSend: 'रोकें और भेजें',
    cropWheat: 'गेहूं',
    cropRice: 'चावल',
    cropCotton: 'कपास',
    cropMustard: 'सरसों',
    unitAcre: 'एकड़',
    unitBigha: 'बीघा',
    unitHectare: 'हेक्टेयर',
    whatCropsDoYouGrow: 'आप कौन सी फसलें उगाते हैं?',
    profileRequiredToContinue: 'जारी रखने के लिए प्रोफाइल विवरण आवश्यक हैं।',
    cropDetails: 'फसल विवरण',
  },
  Gujarati: {
    homeTab: 'હોમ',
    chatTab: 'ચેટ',
    marketplaceTab: 'માર્કેટ',
    historyTab: 'ઇતિહાસ',
    profileTab: 'પ્રોફાઇલ',
    alerts: 'એલર્ટ્સ',
    completeYourProfile: 'તમારી પ્રોફાઇલ પૂર્ણ કરો',
    phoneNotAvailable: 'ફોન ઉપલબ્ધ નથી',
    incompleteProfile: 'અપૂર્ણ પ્રોફાઇલ',
    premiumMember: 'પ્રીમિયમ સભ્ય',
    basicMember: 'બેસિક સભ્ય',
    freeMember: 'ફ્રી સભ્ય',
    editProfile: 'પ્રોફાઇલ સંપાદિત કરો',
    subscriptionStatus: 'સબ્સ્ક્રિપ્શન સ્થિતિ',
    premiumPlanActive: 'પ્રીમિયમ પ્લાન (સક્રિય)',
    basicPlanActive: 'બેસિક પ્લાન (સક્રિય)',
    freePlan: 'ફ્રી પ્લાન',
    manage: 'મેનેજ',
    commerce: 'કોમર્સ',
    trackOrders: 'ઓર્ડર ટ્રેક કરો',
    checkStatusAndDeliveryUpdates: 'સ્ટેટસ અને ડિલિવરી અપડેટ જુઓ',
    myCart: 'મારો કાર્ટ',
    reviewItemsAndCheckout: 'આઇટમ જુઓ અને ચેકઆઉટ કરો',
    preferences: 'પસંદગીઓ',
    appLanguage: 'એપ ભાષા',
    darkAppearance: 'ડાર્ક દેખાવ',
    notifications: 'નોટિફિકેશન્સ',
    on: 'ચાલુ',
    off: 'બંધ',
    securityAndData: 'સુરક્ષા અને ડેટા',
    privacySettings: 'પ્રાઇવસી સેટિંગ્સ',
    close: 'બંધ કરો',
    enterYourName: 'તમારું નામ દાખલ કરો',
    cropsGrown: 'ઉગાડેલા પાક',
    enterLandSize: 'જમીનનું ક્ષેત્ર દાખલ કરો',
    notSelected: 'પસંદ કરાયું નથી',
    change: 'બદલો',
    saving: 'સેવ થઈ રહ્યું છે...',
    saveChanges: 'ફેરફાર સેવ કરો',
    useCurrentLocationOrPickOnMap: 'વર્તમાન લોકેશન વાપરો / મેપ પર પસંદ કરો',
    noApiKeyNeeded: 'API key ની જરૂર નથી',
    newChat: 'નવી ચેટ',
    pastSessions: 'પહેલાના સેશન',
    toolResult: 'ટૂલ પરિણામ',
    thinking: 'વિચારી રહ્યું છે...',
    retry: 'ફરી પ્રયાસ કરો',
    enterSessionTitle: 'સેશન શીર્ષક દાખલ કરો',
    renameSession: 'સેશનનું નામ બદલો',
    cancel: 'રદ કરો',
    imageWillBeSentWithQuestion: 'આ તમારા પ્રશ્ન સાથે મોકલાશે.',
    seasonLabel: 'સીઝન',
    rename: 'નામ બદલો',
    archive: 'આર્કાઇવ',
    listening: 'સાંભળી રહ્યું છે...',
    ready: 'તૈયાર',
    askYourCropQuestionIn: 'આ ભાષામાં તમારો પાક પ્રશ્ન પૂછો',
    voiceResponse: 'વૉઇસ જવાબ',
    playbackFailed: 'પ્લેબેક નિષ્ફળ',
    voicePlaybackFailed: 'વૉઇસ જવાબ મળ્યો, પરંતુ ડિવાઇસ પર ઑડિયો પ્લેબેક નિષ્ફળ રહ્યો.',
    voiceRequestFailed: 'વૉઇસ વિનંતી નિષ્ફળ',
    voiceRouteUnavailable: 'બેકએન્ડ વૉઇસ રૂટ ઉપલબ્ધ નથી અથવા ઓથેન્ટિકેશન જોઈએ.',
    startRecording: 'રેકોર્ડ શરૂ કરો',
    stopAndSend: 'બંધ કરો અને મોકલો',
    cropWheat: 'ઘઉં',
    cropRice: 'ચોખા',
    cropCotton: 'કપાસ',
    cropMustard: 'રાઈ',
    unitAcre: 'એકર',
    unitBigha: 'વીઘા',
    unitHectare: 'હેક્ટર',
    whatCropsDoYouGrow: 'તમે કયો પાક ઉગાડો છો?',
    profileRequiredToContinue: 'આગળ વધવા માટે પ્રોફાઇલ વિગતો આવશ્યક છે.',
    cropDetails: 'પાકની વિગતો',
  },
  Punjabi: {
    homeTab: 'ਹੋਮ',
    chatTab: 'ਚੈਟ',
    marketplaceTab: 'ਮਾਰਕੀਟ',
    historyTab: 'ਇਤਿਹਾਸ',
    profileTab: 'ਪ੍ਰੋਫਾਈਲ',
    alerts: 'ਅਲਰਟ',
    completeYourProfile: 'ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਪੂਰੀ ਕਰੋ',
    phoneNotAvailable: 'ਫੋਨ ਉਪਲਬਧ ਨਹੀਂ',
    incompleteProfile: 'ਅਧੂਰੀ ਪ੍ਰੋਫਾਈਲ',
    premiumMember: 'ਪ੍ਰੀਮੀਅਮ ਮੈਂਬਰ',
    basicMember: 'ਬੇਸਿਕ ਮੈਂਬਰ',
    freeMember: 'ਫ੍ਰੀ ਮੈਂਬਰ',
    editProfile: 'ਪ੍ਰੋਫਾਈਲ ਸੋਧੋ',
    subscriptionStatus: 'ਸਬਸਕ੍ਰਿਪਸ਼ਨ ਸਟੇਟਸ',
    premiumPlanActive: 'ਪ੍ਰੀਮੀਅਮ ਪਲਾਨ (ਸਰਗਰਮ)',
    basicPlanActive: 'ਬੇਸਿਕ ਪਲਾਨ (ਸਰਗਰਮ)',
    freePlan: 'ਫ੍ਰੀ ਪਲਾਨ',
    manage: 'ਮੈਨੇਜ',
    commerce: 'ਕਾਮਰਸ',
    trackOrders: 'ਆਰਡਰ ਟ੍ਰੈਕ ਕਰੋ',
    checkStatusAndDeliveryUpdates: 'ਸਟੇਟਸ ਅਤੇ ਡਿਲਿਵਰੀ ਅਪਡੇਟ ਵੇਖੋ',
    myCart: 'ਮੇਰਾ ਕਾਰਟ',
    reviewItemsAndCheckout: 'ਸਮਾਨ ਵੇਖੋ ਅਤੇ ਚੈਕਆਉਟ ਕਰੋ',
    preferences: 'ਪਸੰਦਾਂ',
    appLanguage: 'ਐਪ ਭਾਸ਼ਾ',
    darkAppearance: 'ਡਾਰਕ ਰੂਪ',
    notifications: 'ਨੋਟਿਫਿਕੇਸ਼ਨ',
    on: 'ਚਾਲੂ',
    off: 'ਬੰਦ',
    securityAndData: 'ਸੁਰੱਖਿਆ ਅਤੇ ਡਾਟਾ',
    privacySettings: 'ਪ੍ਰਾਈਵੇਸੀ ਸੈਟਿੰਗਾਂ',
    close: 'ਬੰਦ ਕਰੋ',
    enterYourName: 'ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ',
    cropsGrown: 'ਉਗਾਈਆਂ ਫਸਲਾਂ',
    enterLandSize: 'ਜ਼ਮੀਨ ਦਾ ਆਕਾਰ ਦਰਜ ਕਰੋ',
    notSelected: 'ਚੁਣਿਆ ਨਹੀਂ ਗਿਆ',
    change: 'ਬਦਲੋ',
    saving: 'ਸੇਵ ਹੋ ਰਿਹਾ ਹੈ...',
    saveChanges: 'ਬਦਲਾਵ ਸੇਵ ਕਰੋ',
    useCurrentLocationOrPickOnMap: 'ਮੌਜੂਦਾ ਲੋਕੇਸ਼ਨ ਵਰਤੋ / ਨਕਸ਼ੇ ਤੇ ਚੁਣੋ',
    noApiKeyNeeded: 'API key ਦੀ ਲੋੜ ਨਹੀਂ',
    newChat: 'ਨਵਾਂ ਚੈਟ',
    pastSessions: 'ਪਿਛਲੇ ਸੈਸ਼ਨ',
    toolResult: 'ਟੂਲ ਨਤੀਜਾ',
    thinking: 'ਸੋਚ ਰਿਹਾ ਹਾਂ...',
    retry: 'ਫਿਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    enterSessionTitle: 'ਸੈਸ਼ਨ ਸਿਰਲੇਖ ਦਰਜ ਕਰੋ',
    renameSession: 'ਸੈਸ਼ਨ ਦਾ ਨਾਮ ਬਦਲੋ',
    cancel: 'ਰੱਦ ਕਰੋ',
    imageWillBeSentWithQuestion: 'ਇਹ ਤੁਹਾਡੇ ਸਵਾਲ ਨਾਲ ਭੇਜੀ ਜਾਵੇਗੀ।',
    seasonLabel: 'ਸੀਜ਼ਨ',
    rename: 'ਨਾਮ ਬਦਲੋ',
    archive: 'ਆਰਕਾਈਵ',
    listening: 'ਸੁਣ ਰਿਹਾ ਹਾਂ...',
    ready: 'ਤਿਆਰ',
    askYourCropQuestionIn: 'ਇਸ ਭਾਸ਼ਾ ਵਿੱਚ ਆਪਣਾ ਫਸਲ ਸਵਾਲ ਪੁੱਛੋ',
    voiceResponse: 'ਵੌਇਸ ਜਵਾਬ',
    playbackFailed: 'ਪਲੇਬੈਕ ਅਸਫਲ',
    voicePlaybackFailed: 'ਵੌਇਸ ਜਵਾਬ ਆ ਗਿਆ, ਪਰ ਡਿਵਾਈਸ ਤੇ ਆਡੀਓ ਪਲੇਬੈਕ ਅਸਫਲ ਰਿਹਾ।',
    voiceRequestFailed: 'ਵੌਇਸ ਬੇਨਤੀ ਅਸਫਲ',
    voiceRouteUnavailable: 'ਬੈਕਐਂਡ ਵੌਇਸ ਰੂਟ ਉਪਲਬਧ ਨਹੀਂ ਹੈ ਜਾਂ ਪ੍ਰਮਾਣੀਕਰਨ ਮੰਗਦਾ ਹੈ।',
    startRecording: 'ਰਿਕਾਰਡ ਸ਼ੁਰੂ ਕਰੋ',
    stopAndSend: 'ਰੋਕੋ ਅਤੇ ਭੇਜੋ',
    cropWheat: 'ਗੇਹਾਂ',
    cropRice: 'ਚੌਲ',
    cropCotton: 'ਕਪਾਹ',
    cropMustard: 'ਸਰ੍ਹੋਂ',
    unitAcre: 'ਏਕੜ',
    unitBigha: 'ਬੀਘਾ',
    unitHectare: 'ਹੈਕਟੇਅਰ',
    whatCropsDoYouGrow: 'ਤੁਸੀਂ ਕਿਹੜੀਆਂ ਫਸਲਾਂ ਉਗਾਉਂਦੇ ਹੋ?',
    profileRequiredToContinue: 'ਜਾਰੀ ਰੱਖਣ ਲਈ ਪ੍ਰੋਫਾਈਲ ਵੇਰਵੇ ਲੋੜੀਂਦੇ ਹਨ।',
    cropDetails: 'ਫਸਲ ਦੇ ਵੇਰਵੇ',
  },
};

function translateExtra(language: AppLanguage, key: ExtraTranslationKey): string {
  return extraTranslations[language][key] ?? extraTranslations.English[key];
}

export function useI18n() {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  return {
    language,
    setLanguage,
    locale: localeForLanguage(language),
    t: (key: AppTranslationKey) =>
      key in extraTranslations.English
        ? translateExtra(language, key as ExtraTranslationKey)
        : t(language, key as TranslationKey),
  };
}
