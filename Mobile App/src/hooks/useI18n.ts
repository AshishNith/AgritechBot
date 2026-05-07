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
  | 'cropDetails'
  | 'weatherDashboard'
  | 'viewDashboard'
  | 'yourFarm'
  | 'liveForecastAutoSuggestions'
  | 'todayMaxLabel'
  | 'todayMinLabel'
  | 'peakRainChance'
  | 'avgHumidityLabel'
  | 'temperaturePrediction'
  | 'rainProbability'
  | 'humidityTrend'
  | 'hourByHourTemperatureTrend'
  | 'nextHourPrecipitationOutlook'
  | 'moistureStressIndicator'
  | 'autoSuggestionsTitle'
  | 'fiveDayOutlook'
  | 'rainChance'
  | 'refreshForecast'
  | 'nextHours'
  | 'smartAssistantTitle'
  | 'tasksForToday'
  | 'allCaughtUpNoTasks'
  | 'myCrops'
  | 'noCropsRegistered'
  | 'registerCropForSchedules'
  | 'registerNewCrop'
  | 'plantedLabel'
  | 'inYourArea'
  | 'done'
  | 'skip'
  | 'suggestRainSkipWatering'
  | 'suggestHeatIncreaseWatering'
  | 'suggestColdProtectPlants'
  | 'suggestWindAvoidSpraying'
  | 'suggestSoilDryIrrigation'
  | 'suggestHighHumidityMonitorFungus'
  | 'suggestStableWeather'
  | 'suggestCoolHours'
  | 'suggestMonitor12Hours'
  | 'markAllRead'
  | 'all'
  | 'weather'
  | 'order'
  | 'loadingNotifications'
  | 'failedToLoadNotifications'
  | 'stayUpdated'
  | 'stayUpdatedSubtitle'
  | 'farmer'
  | 'manageData'
  | 'updatePersonalDetails'
  | 'myFarmingPlans'
  | 'noPlansYet'
  | 'generatePlanIntro'
  | 'generateNewPlan'
  | 'aiCropPlanner'
  | 'aiPlannerSubtitle'
  | 'basicInformation'
  | 'cropName'
  | 'landSizeAcres'
  | 'district'
  | 'soilTypeOptional'
  | 'waterAvailability'
  | 'farmingMethod'
  | 'generateFarmingPlan'
  | 'generatingPlan'
  | 'consultingAgronomist'
  | 'analyzingData'
  | 'cropRoadmap'
  | 'totalCost'
  | 'expYield'
  | 'profitEst'
  | 'criticalRiskAlerts'
  | 'alternativeStrategies'
  | 'lowBudgetApproach'
  | 'highBudgetApproach'
  | 'loadingPlan'
  | 'roadmapLabel'
  | 'plannerTitle'
  | 'plannerSubtitle'
  | 'aiBadge'
  | 'cropLabel'
  | 'completed'
  | 'noCropsWidget'
  | 'suggestedStages'
  | 'readyToGenerate';

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
    weatherDashboard: 'Weather Dashboard',
    viewDashboard: 'View Dashboard',
    yourFarm: 'Your farm',
    liveForecastAutoSuggestions: 'Live forecast with auto suggestions for the next few hours',
    todayMaxLabel: 'Today Max',
    todayMinLabel: 'Today Min',
    peakRainChance: 'Peak Rain Chance',
    avgHumidityLabel: 'Avg Humidity',
    temperaturePrediction: 'Temperature Prediction',
    rainProbability: 'Rain Probability',
    humidityTrend: 'Humidity Trend',
    hourByHourTemperatureTrend: 'Hour-by-hour temperature trend',
    nextHourPrecipitationOutlook: 'Next-hour precipitation outlook',
    moistureStressIndicator: 'Moisture stress indicator for field planning',
    autoSuggestionsTitle: 'Auto Suggestions',
    fiveDayOutlook: '5-Day Outlook',
    rainChance: 'Rain chance',
    refreshForecast: 'Refresh Forecast',
    nextHours: 'Next hours',
    smartAssistantTitle: 'Smart Assistant',
    tasksForToday: 'Tasks for Today',
    allCaughtUpNoTasks: 'All caught up! No tasks left for today.',
    myCrops: 'My Crops',
    noCropsRegistered: 'No crops registered yet.',
    registerCropForSchedules: 'Register a crop to get personalized schedules.',
    registerNewCrop: 'Register New Crop',
    plantedLabel: 'Planted',
    inYourArea: 'in your area',
    done: 'Done',
    skip: 'Skip',
    suggestRainSkipWatering: 'Rain expected - skip watering today and inspect drainage.',
    suggestHeatIncreaseWatering: 'High temperature - increase watering frequency in the evening.',
    suggestColdProtectPlants: 'Cold conditions - protect tender plants before nightfall.',
    suggestWindAvoidSpraying: 'Strong wind - avoid spraying and secure lightweight covers.',
    suggestSoilDryIrrigation: 'Soil is drying - plan a short irrigation cycle soon.',
    suggestHighHumidityMonitorFungus: 'High humidity - monitor leaves closely for fungal risk.',
    suggestStableWeather: 'Weather looks stable - continue normal field maintenance.',
    suggestCoolHours: 'Use the cooler hours for irrigation and nutrient application.',
    suggestMonitor12Hours: 'Monitor the next 12 hours before changing your care plan.',
    markAllRead: 'Mark All Read',
    all: 'All',
    weather: 'Weather',
    order: 'Order',
    loadingNotifications: 'Loading notifications...',
    failedToLoadNotifications: 'Failed to load notifications.',
    stayUpdated: 'Stay Updated',
    stayUpdatedSubtitle: 'New alerts appear automatically based on your crops and location. Pull down to refresh.',
    farmer: 'Farmer',
    manageData: 'Manage your data and privacy',
    updatePersonalDetails: 'Update your personal details',
    myFarmingPlans: 'My Farming Plans',
    noPlansYet: 'No Plans Yet',
    generatePlanIntro: 'Generate your first AI-powered farming roadmap to get started.',
    generateNewPlan: 'Generate New Plan',
    aiCropPlanner: 'AI Crop Planner',
    aiPlannerSubtitle: 'Provide details about your farm, and our AI will generate a comprehensive roadmap for your crop.',
    basicInformation: 'Basic Information',
    cropName: 'Crop Name',
    landSizeAcres: 'Land Size (Acres)',
    district: 'District',
    soilTypeOptional: 'Soil Type (Optional)',
    waterAvailability: 'Water Availability',
    farmingMethod: 'Farming Method',
    generateFarmingPlan: 'Generate Farming Plan',
    generatingPlan: 'Generating...',
    consultingAgronomist: 'Consulting Digital Agronomist...',
    analyzingData: 'Analyzing climate, soil, and resource data to build your custom roadmap.',
    cropRoadmap: 'Roadmap',
    totalCost: 'Total Cost',
    expYield: 'Exp. Yield',
    profitEst: 'Profit Est.',
    criticalRiskAlerts: 'Critical Risk Alerts',
    alternativeStrategies: 'Alternative Strategies',
    lowBudgetApproach: 'Low Budget Approach',
    highBudgetApproach: 'High Budget/Yield Approach',
    loadingPlan: 'Loading your plan...',
    roadmapLabel: 'Roadmaps',
    plannerTitle: 'Crop Roadmap',
    plannerSubtitle: 'Keep your harvest on track with AI',
    aiBadge: 'AI GENERATED',
    cropLabel: 'CURRENT CROP',
    completed: 'COMPLETE',
    noCropsWidget: 'No Crops',
    suggestedStages: 'Suggested Stages',
    readyToGenerate: 'Ready to Generate',
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
    weatherDashboard: 'मौसम डैशबोर्ड',
    viewDashboard: 'डैशबोर्ड देखें',
    yourFarm: 'आपका खेत',
    liveForecastAutoSuggestions: 'अगले कुछ घंटों के लिए लाइव मौसम पूर्वानुमान और स्मार्ट सुझाव',
    todayMaxLabel: 'आज का अधिकतम',
    todayMinLabel: 'आज का न्यूनतम',
    peakRainChance: 'बारिश की अधिकतम संभावना',
    avgHumidityLabel: 'औसत नमी',
    temperaturePrediction: 'तापमान पूर्वानुमान',
    rainProbability: 'बारिश की संभावना',
    humidityTrend: 'नमी का रुझान',
    hourByHourTemperatureTrend: 'घंटे दर घंटे तापमान का रुझान',
    nextHourPrecipitationOutlook: 'अगले घंटों में वर्षा का अनुमान',
    moistureStressIndicator: 'खेत की योजना के लिए नमी तनाव संकेतक',
    autoSuggestionsTitle: 'स्वचालित सुझाव',
    fiveDayOutlook: '5 दिन का पूर्वानुमान',
    rainChance: 'बारिश की संभावना',
    refreshForecast: 'पूर्वानुमान रीफ्रेश करें',
    nextHours: 'अगले घंटे',
    smartAssistantTitle: 'स्मार्ट असिस्टेंट',
    tasksForToday: 'आज के कार्य',
    allCaughtUpNoTasks: 'बहुत बढ़िया! आज के लिए कोई कार्य बाकी नहीं है।',
    myCrops: 'मेरी फसलें',
    noCropsRegistered: 'अभी तक कोई फसल दर्ज नहीं है।',
    registerCropForSchedules: 'व्यक्तिगत शेड्यूल पाने के लिए फसल दर्ज करें।',
    registerNewCrop: 'नई फसल दर्ज करें',
    plantedLabel: 'बोई गई',
    inYourArea: 'आपके क्षेत्र में',
    done: 'पूरा',
    skip: 'छोड़ें',
    suggestRainSkipWatering: 'बारिश की संभावना है - आज सिंचाई छोड़ें और जल निकासी जांचें।',
    suggestHeatIncreaseWatering: 'तापमान अधिक है - शाम में सिंचाई की आवृत्ति बढ़ाएं।',
    suggestColdProtectPlants: 'ठंड का असर है - रात से पहले कोमल पौधों की सुरक्षा करें।',
    suggestWindAvoidSpraying: 'तेज हवा है - छिड़काव टालें और हल्के कवर सुरक्षित करें।',
    suggestSoilDryIrrigation: 'मिट्टी सूख रही है - जल्द एक छोटी सिंचाई चक्र की योजना बनाएं।',
    suggestHighHumidityMonitorFungus: 'नमी अधिक है - फफूंद के जोखिम के लिए पत्तियों पर नजर रखें।',
    suggestStableWeather: 'मौसम स्थिर दिख रहा है - सामान्य खेत रखरखाव जारी रखें।',
    suggestCoolHours: 'सिंचाई और पोषण देने के लिए ठंडे घंटों का उपयोग करें।',
    suggestMonitor12Hours: 'देखभाल योजना बदलने से पहले अगले 12 घंटे पर नजर रखें।',
    markAllRead: 'सभी को पढ़ा हुआ मार्क करें',
    all: 'सभी',
    weather: 'मौसम',
    order: 'ऑर्डर',
    loadingNotifications: 'नोटिफिकेशन लोड हो रहे हैं...',
    failedToLoadNotifications: 'नोटिफिकेशन लोड करने में विफल।',
    stayUpdated: 'अपडेट रहें',
    stayUpdatedSubtitle: 'आपकी फसलों और स्थान के आधार पर नए अलर्ट अपने आप दिखाई देते हैं। रिफ्रेश करने के लिए नीचे खींचें।',
    farmer: 'किसान',
    manageData: 'अपने डेटा और गोपनीयता को प्रबंधित करें',
    updatePersonalDetails: 'अपने व्यक्तिगत विवरण अपडेट करें',
    myFarmingPlans: 'मेरी खेती योजनाएं',
    noPlansYet: 'अभी तक कोई योजना नहीं',
    generatePlanIntro: 'शुरू करने के लिए अपना पहला AI-संचालित खेती रोडमैप बनाएं।',
    generateNewPlan: 'नई योजना बनाएं',
    aiCropPlanner: 'AI फसल योजनाकार',
    aiPlannerSubtitle: 'अपने खेत के बारे में विवरण दें, और हमारा AI आपकी फसल के लिए एक व्यापक रोडमैપ तैयार करेगा।',
    basicInformation: 'मूल जानकारी',
    cropName: 'फसल का नाम',
    landSizeAcres: 'भूमि का आकार (एकड़)',
    district: 'जिला',
    soilTypeOptional: 'मिट्टी का प्रकार (वैकल्पिक)',
    waterAvailability: 'पानी की उपलब्धता',
    farmingMethod: 'खेती का तरीका',
    generateFarmingPlan: 'खेती की योजना बनाएं',
    generatingPlan: 'बनाया जा रहा है...',
    consultingAgronomist: 'डिजिटल कृषिविज्ञानी से परामर्श...',
    analyzingData: 'कस्टम रोडमैप बनाने के लिए जलवायु, मिट्टी और संसाधन डेटा का विश्लेषण।',
    cropRoadmap: 'रोडमैप',
    totalCost: 'कुल लागत',
    expYield: 'अनुमानित उपज',
    profitEst: 'लाभ अनुमान',
    criticalRiskAlerts: 'महत्वपूर्ण जोखिम अलर्ट',
    alternativeStrategies: 'वैकल्पिक रणनीतियाँ',
    lowBudgetApproach: 'कम बजट दृष्टिकोण',
    highBudgetApproach: 'उच्च बजट/उपज दृष्टिकोण',
    loadingPlan: 'आपकी योजना लोड हो रही है...',
    roadmapLabel: 'रोडमैप',
    plannerTitle: 'फसल रोडमैप',
    plannerSubtitle: 'AI के साथ अपनी फसल को ट्रैक पर रखें',
    aiBadge: 'AI उत्पन्न',
    cropLabel: 'वर्तमान फसल',
    completed: 'पूर्ण',
    noCropsWidget: 'कोई फसल नहीं',
    suggestedStages: 'सुझाए गए चरण',
    readyToGenerate: 'बनाने के लिए तैयार',
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
    weatherDashboard: 'હવામાન ડેશબોર્ડ',
    viewDashboard: 'ડેશબોર્ડ જુઓ',
    yourFarm: 'તમારું ખેતર',
    liveForecastAutoSuggestions: 'આગામી થોડા કલાકો માટે જીવંત હવામાન અને સ્માર્ટ સૂચનો',
    todayMaxLabel: 'આજનો મહત્તમ',
    todayMinLabel: 'આજનો નીચોતમ',
    peakRainChance: 'વરસાદની સૌથી વધુ શક્યતા',
    avgHumidityLabel: 'સરેરાશ ભેજ',
    temperaturePrediction: 'તાપમાન અનુમાન',
    rainProbability: 'વરસાદની શક્યતા',
    humidityTrend: 'ભેજનો ટ્રેન્ડ',
    hourByHourTemperatureTrend: 'કલાકવાર તાપમાનનો ટ્રેન્ડ',
    nextHourPrecipitationOutlook: 'આગામી કલાકો માટે વરસાદી અંદાજ',
    moistureStressIndicator: 'ખેતી આયોજન માટે ભેજ તાણ સૂચક',
    autoSuggestionsTitle: 'ઓટો સૂચનો',
    fiveDayOutlook: '5 દિવસનો અંદાજ',
    rainChance: 'વરસાદની શક્યતા',
    refreshForecast: 'અંદાજ ફરી મેળવો',
    nextHours: 'આગામી કલાકો',
    smartAssistantTitle: 'સ્માર્ટ આસિસ્ટન્ટ',
    tasksForToday: 'આજના કાર્યો',
    allCaughtUpNoTasks: 'સરસ! આજે માટે કોઈ કાર્ય બાકી નથી.',
    myCrops: 'મારા પાક',
    noCropsRegistered: 'હજુ સુધી કોઈ પાક નોંધાયેલો નથી.',
    registerCropForSchedules: 'વ્યક્તિગત શેડ્યૂલ માટે પાક નોંધાવો.',
    registerNewCrop: 'નવો પાક નોંધાવો',
    plantedLabel: 'વાવેલ',
    inYourArea: 'તમારા વિસ્તારમાં',
    done: 'પૂર્ણ',
    skip: 'છોડો',
    suggestRainSkipWatering: 'વરસાદની શક્યતા છે - આજે પાણી ન આપો અને ડ્રેનેજ તપાસો.',
    suggestHeatIncreaseWatering: 'ઉંચું તાપમાન છે - સાંજે પાણી આપવાની આવર્તન વધારો.',
    suggestColdProtectPlants: 'ઠંડી છે - રાત્રિ પહેલાં નાજુક છોડને સુરક્ષિત કરો.',
    suggestWindAvoidSpraying: 'જોરદાર પવન છે - છંટકાવ ટાળો અને હળવા કવર સુરક્ષિત કરો.',
    suggestSoilDryIrrigation: 'જમીન સુકાઈ રહી છે - ટૂંકા સિંચાઈ ચક્રની યોજના બનાવો.',
    suggestHighHumidityMonitorFungus: 'ભેજ વધારે છે - ફૂગના જોખમ માટે પાંદડાઓ પર નજર રાખો.',
    suggestStableWeather: 'હવામાન સ્થિર લાગે છે - સામાન્ય ખેતીકામ ચાલુ રાખો.',
    suggestCoolHours: 'સિંચાઈ અને પોષક આપવાના કામ માટે ઠંડા કલાકો પસંદ કરો.',
    suggestMonitor12Hours: 'સંભાળ યોજના બદલતા પહેલાં આવતા 12 કલાક પર નજર રાખો.',
    markAllRead: 'બધા વંચાયેલા તરીકે માર્ક કરો',
    all: 'બધા',
    weather: 'હવામાન',
    order: 'ઓર્ડર',
    loadingNotifications: 'નોટિફિકેશન લોડ થઈ રહ્યા છે...',
    failedToLoadNotifications: 'નોટિફિકેશન લોડ કરવામાં નિષ્ફળ.',
    stayUpdated: 'અપડેટ રહો',
    stayUpdatedSubtitle: 'તમારા પાક અને સ્થાનના આધારે નવા એલર્ટ આપમેળે દેખાય છે. રિફ્રેશ કરવા માટે નીચે ખેંચો.',
    farmer: 'ખેડૂત',
    manageData: 'તમારા ડેટા અને ગોપનીયતાનું સંચાલન કરો',
    updatePersonalDetails: 'તમારી વ્યક્તિગત વિગતો અપડેટ કરો',
    myFarmingPlans: 'મારી ખેતી યોજનાઓ',
    noPlansYet: 'હજુ સુધી કોઈ યોજના નથી',
    generatePlanIntro: 'શરૂ કરવા માટે તમારો પહેલો AI-સંચાલિત ખેતી રોડમેપ બનાવો.',
    generateNewPlan: 'નવી યોજના બનાવો',
    aiCropPlanner: 'AI પાક આયોજક',
    aiPlannerSubtitle: 'તમારા ખેતર વિશે વિગતો આપો, અને અમારું AI તમારા પાક માટે એક વ્યાપક રોડમેપ તૈયાર કરશે.',
    basicInformation: 'મૂળભૂત માહિતી',
    cropName: 'પાકનું નામ',
    landSizeAcres: 'જમીનનું કદ (એકર)',
    district: 'જિલ્લો',
    soilTypeOptional: 'જમીનનો પ્રકાર (વૈકલ્પિક)',
    waterAvailability: 'પાણીની ઉપલબ્ધતા',
    farmingMethod: 'ખેતી પદ્ધતિ',
    generateFarmingPlan: 'ખેતી યોજના બનાવો',
    generatingPlan: 'બનાવી રહ્યું છે...',
    consultingAgronomist: 'ડિજિટલ કૃષિવિજ્ઞાની સાથે પરામર્શ...',
    analyzingData: 'કસ્ટમ રોડમેપ બનાવવા માટે આબોહવા, જમીન અને સંસાધન ડેટાનું વિશ્લેષણ.',
    cropRoadmap: 'રોડમેપ',
    totalCost: 'કુલ ખર્ચ',
    expYield: 'અંદાજિત ઉપજ',
    profitEst: 'નફાનો અંદાજ',
    criticalRiskAlerts: 'ક્રિટિકલ રિસ્ક એલર્ટ્સ',
    alternativeStrategies: 'વૈકલ્પિક વ્યૂહરચનાઓ',
    lowBudgetApproach: 'ઓછા બજેટનો અભિગમ',
    highBudgetApproach: 'ઉચ્ચ બજેટ/ઉપજ અભિગમ',
    loadingPlan: 'તમારી યોજના લોડ થઈ રહી છે...',
    roadmapLabel: 'રોડમેપ',
    plannerTitle: 'પાક રોડમેપ',
    plannerSubtitle: 'AI સાથે તમારા પાકને ટ્રેક પર રાખો',
    aiBadge: 'AI દ્વારા બનાવાયેલ',
    cropLabel: 'વર્તમાન પાક',
    completed: 'પૂર્ણ',
    noCropsWidget: 'કોઈ પાક નથી',
    suggestedStages: 'સૂચવેલા તબક્કાઓ',
    readyToGenerate: 'બનાવવા માટે તૈયાર',
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
    weatherDashboard: 'ਮੌਸਮ ਡੈਸ਼ਬੋਰਡ',
    viewDashboard: 'ਡੈਸ਼ਬੋਰਡ ਵੇਖੋ',
    yourFarm: 'ਤੁਹਾਡਾ ਖੇਤ',
    liveForecastAutoSuggestions: 'ਅਗਲੇ ਕੁਝ ਘੰਟਿਆਂ ਲਈ ਲਾਈਵ ਮੌਸਮ ਅਤੇ ਸਮਾਰਟ ਸੁਝਾਅ',
    todayMaxLabel: 'ਅੱਜ ਦਾ ਵੱਧ ਤੋਂ ਵੱਧ',
    todayMinLabel: 'ਅੱਜ ਦਾ ਘੱਟ ਤੋਂ ਘੱਟ',
    peakRainChance: 'ਬਰਸਾਤ ਦੀ ਸਭ ਤੋਂ ਵੱਧ ਸੰਭਾਵਨਾ',
    avgHumidityLabel: 'ਔਸਤ ਨਮੀ',
    temperaturePrediction: 'ਤਾਪਮਾਨ ਅਨੁਮਾਨ',
    rainProbability: 'ਬਰਸਾਤ ਦੀ ਸੰਭਾਵਨਾ',
    humidityTrend: 'ਨਮੀ ਦਾ ਰੁਝਾਨ',
    hourByHourTemperatureTrend: 'ਘੰਟੇ ਅਨੁਸਾਰ ਤਾਪਮਾਨ ਦਾ ਰੁਝਾਨ',
    nextHourPrecipitationOutlook: 'ਅਗਲੇ ਘੰਟਿਆਂ ਦੀ ਵਰਖਾ ਝਲਕ',
    moistureStressIndicator: 'ਖੇਤ ਯੋਜਨਾ ਲਈ ਨਮੀ ਤਣਾਅ ਸੰਕੇਤਕ',
    autoSuggestionsTitle: 'ਆਟੋ ਸੁਝਾਅ',
    fiveDayOutlook: '5 ਦਿਨਾਂ ਦੀ ਝਲਕ',
    rainChance: 'ਬਰਸਾਤ ਦੀ ਸੰਭਾਵਨਾ',
    refreshForecast: 'ਪੂਰਵ ਅਨੁਮਾਨ ਤਾਜ਼ਾ ਕਰੋ',
    nextHours: 'ਅਗਲੇ ਘੰਟੇ',
    smartAssistantTitle: 'ਸਮਾਰਟ ਅਸਿਸਟੈਂਟ',
    tasksForToday: 'ਅੱਜ ਦੇ ਕੰਮ',
    allCaughtUpNoTasks: 'ਵਧੀਆ! ਅੱਜ ਲਈ ਕੋਈ ਕੰਮ ਬਾਕੀ ਨਹੀਂ ਹੈ।',
    myCrops: 'ਮੇਰੀਆਂ ਫਸਲਾਂ',
    noCropsRegistered: 'ਹਾਲੇ ਤੱਕ ਕੋਈ ਫਸਲ ਦਰਜ ਨਹੀਂ ਕੀਤੀ ਗਈ।',
    registerCropForSchedules: 'ਨਿੱਜੀ ਸ਼ਡਿਊਲ ਲਈ ਫਸਲ ਦਰਜ ਕਰੋ।',
    registerNewCrop: 'ਨਵੀਂ ਫਸਲ ਦਰਜ ਕਰੋ',
    plantedLabel: 'ਬੀਜੀ ਗਈ',
    inYourArea: 'ਤੁਹਾਡੇ ਖੇਤਰ ਵਿੱਚ',
    done: 'ਮੁਕੰਮਲ',
    skip: 'ਛੱਡੋ',
    suggestRainSkipWatering: 'ਬਰਸਾਤ ਦੀ ਸੰਭਾਵਨਾ ਹੈ - ਅੱਜ ਸਿੰਚਾਈ ਨਾ ਕਰੋ ਅਤੇ ਨਿਕਾਸੀ ਜਾਂਚੋ।',
    suggestHeatIncreaseWatering: 'ਤਾਪਮਾਨ ਉੱਚਾ ਹੈ - ਸ਼ਾਮ ਵੇਲੇ ਪਾਣੀ ਦੇਣ ਦੀ ਆਵਰਤੀ ਵਧਾਓ।',
    suggestColdProtectPlants: 'ਠੰਢ ਹੈ - ਰਾਤ ਤੋਂ ਪਹਿਲਾਂ ਨਰਮ ਪੌਧਿਆਂ ਦੀ ਰੱਖਿਆ ਕਰੋ।',
    suggestWindAvoidSpraying: 'ਤੇਜ਼ ਹਵਾ ਹੈ - ਛਿੜਕਾਅ ਤੋਂ ਬਚੋ ਅਤੇ ਹਲਕੇ ਕਵਰ ਸੁਰੱਖਿਅਤ ਕਰੋ।',
    suggestSoilDryIrrigation: 'ਮਿੱਟੀ ਸੁੱਕ ਰਹੀ ਹੈ - ਜਲਦੀ ਇੱਕ ਛੋਟਾ ਸਿੰਚਾਈ ਚੱਕਰ ਬਣਾਓ।',
    suggestHighHumidityMonitorFungus: 'ਨਮੀ ਵੱਧ ਹੈ - ਫਫੂੰਦ ਦੇ ਜੋਖਮ ਲਈ ਪੱਤਿਆਂ ਨੂੰ ਧਿਆਨ ਨਾਲ ਵੇਖੋ।',
    suggestStableWeather: 'ਮੌਸਮ ਸਥਿਰ ਲੱਗਦਾ ਹੈ - ਆਮ ਖੇਤ ਸੰਭਾਲ ਜਾਰੀ ਰੱਖੋ।',
    suggestCoolHours: 'ਸਿੰਚਾਈ ਅਤੇ ਪੋਸ਼ਣ ਲਈ ਠੰਢੇ ਘੰਟਿਆਂ ਦੀ ਵਰਤੋਂ ਕਰੋ।',
    suggestMonitor12Hours: 'ਦੇਖਭਾਲ ਯੋਜਨਾ ਬਦਲਣ ਤੋਂ ਪਹਿਲਾਂ ਅਗਲੇ 12 ਘੰਟੇ ਵੇਖੋ।',
    markAllRead: 'ਸਾਰੇ ਪੜ੍ਹੇ ਹੋਏ ਮਾਰਕ ਕਰੋ',
    all: 'ਸਾਰੇ',
    weather: 'ਮੌਸਮ',
    order: 'ਆਰਡਰ',
    loadingNotifications: 'ਨੋਟਿਫਿਕੇਸ਼ਨ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...',
    failedToLoadNotifications: 'ਨੋਟਿਫਿਕੇਸ਼ਨ ਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਫਲ।',
    stayUpdated: 'ਅਪਡੇਟ ਰਹੋ',
    stayUpdatedSubtitle: 'ਤੁਹਾਡੀਆਂ ਫਸਲਾਂ ਅਤੇ ਲੋਕੇਸ਼ਨ ਦੇ ਅਧਾਰ ਤੇ ਨਵੇਂ ਅਲਰਟ ਆਪਣੇ ਆਪ ਦਿਖਾਈ ਦਿੰਦੇ ਹਨ। ਤਾਜ਼ਾ ਕਰਨ ਲਈ ਹੇਠਾਂ ਖਿੱਚੋ।',
    farmer: 'ਕਿਸਾਨ',
    manageData: 'ਆਪਣੇ ਡੇਟਾ ਅਤੇ ਗੋਪਨੀਯਤਾ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ',
    updatePersonalDetails: 'ਆਪਣੇ ਨਿੱਜੀ ਵੇਰਵੇ ਅਪਡੇਟ ਕਰੋ',
    myFarmingPlans: 'ਮੇਰੀਆਂ ਖੇਤੀ ਯੋਜਨਾਵਾਂ',
    noPlansYet: 'ਹਾਲੇ ਤੱਕ ਕੋਈ ਯੋਜਨਾ ਨਹੀਂ',
    generatePlanIntro: 'ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਆਪਣਾ ਪਹਿਲਾ AI-ਸੰਚਾਲਿਤ ਖੇਤੀ ਰੋਡਮੈਪ ਬਣਾਓ।',
    generateNewPlan: 'ਨਵੀਂ ਯੋਜਨਾ ਬਣਾਓ',
    aiCropPlanner: 'AI ਫਸਲ ਯੋਜਨਾਕਾਰ',
    aiPlannerSubtitle: 'ਆਪਣੇ ਖੇਤ ਬਾਰੇ ਵੇਰਵੇ ਦਿਓ, ਅਤੇ ਸਾਡਾ AI ਤੁਹਾਡੀ ਫਸਲ ਲਈ ਇੱਕ ਵਿਆਪਕ ਰੋਡਮੈਪ ਤਿਆર ਕਰੇਗਾ।',
    basicInformation: 'ਮੂਲ ਜਾਣਕਾਰੀ',
    cropName: 'ਫਸਲ ਦਾ ਨਾਮ',
    landSizeAcres: 'ਜ਼ਮੀਨ ਦਾ ਆਕਾਰ (ਏਕੜ)',
    district: 'ਜ਼ਿਲ੍ਹਾ',
    soilTypeOptional: 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ (ਵਿਕਲਪਿਕ)',
    waterAvailability: 'ਪਾਣੀ ਦੀ ਉਪਲਬਧਤਾ',
    farmingMethod: 'ਖੇਤੀ ਦਾ ਤਰੀਕਾ',
    generateFarmingPlan: 'ਖੇਤੀ ਯੋਜਨਾ ਬਣਾਓ',
    generatingPlan: 'ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...',
    consultingAgronomist: 'ਡਿਜੀਟਲ ਖੇਤੀ ਮਾਹਿਰ ਨਾਲ ਸਲਾਹ...',
    analyzingData: 'ਕਸਟਮ ਰੋਡਮੈਪ ਬਣਾਉਣ ਲਈ ਜਲਵਾਯੂ, ਮਿੱਟੀ ਅਤੇ ਸਾਧਨਾਂ ਦੇ ਡੇਟਾ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ।',
    cropRoadmap: 'ਰੋਡਮੈਪ',
    totalCost: 'ਕੁੱਲ ਲਾਗਤ',
    expYield: 'ਅਨੁਮਾਨਿਤ ਝਾੜ',
    profitEst: 'ਮੁਨਾਫਾ ਅਨੁਮਾਨ',
    criticalRiskAlerts: 'ਮਹੱਤਵਪੂਰਨ ਜੋਖਮ ਅਲਰਟ',
    alternativeStrategies: 'ਵਿਕਲਪਿਕ ਰਣਨੀਤੀਆਂ',
    lowBudgetApproach: 'ਘੱਟ ਬਜਟ ਪਹੁੰਚ',
    highBudgetApproach: 'ਉੱਚ ਬਜટ/ਝਾੜ ਪਹੁੰਚ',
    loadingPlan: 'ਤੁਹਾਡੀ ਯੋਜਨਾ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...',
    roadmapLabel: 'ਰੋਡਮੈਪ',
    plannerTitle: 'ਫਸਲ ਰੋਡਮੈਪ',
    plannerSubtitle: 'AI ਨਾਲ ਆਪਣੀ ਫਸਲ ਨੂੰ ਟ੍ਰੈਕ ਤੇ ਰੱਖੋ',
    aiBadge: 'AI ਦੁਆਰਾ ਤਿਆਰ',
    cropLabel: 'ਮੌਜੂਦਾ ਫਸਲ',
    completed: 'ਮੁਕੰਮਲ',
    noCropsWidget: 'ਕੋਈ ਫਸਲ ਨਹੀਂ',
    suggestedStages: 'ਸੁਝਾਏ ਗਏ ਪੜਾਅ',
    readyToGenerate: 'ਬਣਾਉਣ ਲਈ ਤਿਆਰ',
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
    locale: localeForLanguage(language || 'English'),
    t: (key: AppTranslationKey) =>
      key in extraTranslations.English
        ? translateExtra(language || 'English', key as ExtraTranslationKey)
        : t(language || 'English', key as TranslationKey),
  };
}
