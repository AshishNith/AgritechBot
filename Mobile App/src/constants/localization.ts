import { AppLanguage } from '../types/api';

export type TranslationKey =
  | 'marketTitle'
  | 'marketSubtitle'
  | 'searchPlaceholder'
  | 'aiPick'
  | 'viewNow'
  | 'topFertilizers'
  | 'essentialSeeds'
  | 'modernTools'
  | 'cropCare'
  | 'noProductsFound'
  | 'tryDifferentFilters'
  | 'cart'
  | 'cartEmptyTitle'
  | 'cartEmptySubtitle'
  | 'startShopping'
  | 'checkout'
  | 'continueShopping'
  | 'subtotal'
  | 'tax'
  | 'shipping'
  | 'discount'
  | 'total'
  | 'deliveryDetails'
  | 'perKg'
  | 'perPacket'
  | 'perUnit'
  | 'perLiter'
  | 'Wheat'
  | 'Rice'
  | 'Cotton'
  | 'Mustard'
  | 'Sugarcane'
  | 'Maize'
  | 'Vegetables'
  | 'Fruits'
  | 'Soil Health'
  | 'Growth'
  | 'Yield'
  | 'Pest Control'
  | 'Disease Prevention'
  | 'kg'
  | 'liter'
  | 'packet'
  | 'unit'
  | 'bag'
  | 'premiumPlan'
  | 'unlockFullPotential'
  | 'advancedAIExperience'
  | 'advancedAI'
  | 'deeperReasoning'
  | 'personalizedAdvisory'
  | 'tailoredSuggestions'
  | 'fasterResponses'
  | 'priorityProcessing'
  | 'annualPlan'
  | 'monthlyPlan'
  | 'perYear'
  | 'perMonth'
  | 'save40'
  | 'secureCheckoutReady'
  | 'finishPaymentPrompt'
  | 'reopenSecureCheckout'
  | 'checkingPaymentStatus'
  | 'iCompletedPayment'
  | 'openingSecureCheckout'
  | 'continueToSecurePayment'
  | 'plansActivateAfterVerification'
  | 'personalInfo'
  | 'name'
  | 'phone'
  | 'email'
  | 'address'
  | 'city'
  | 'state'
  | 'pincode'
  | 'orderSummary'
  | 'placeOrder'
  | 'processing'
  | 'orderFailed'
  | 'fillRequiredFields'
  | 'orderSuccess'
  | 'orderSuccessSubtitle'
  | 'orderId'
  | 'deliveryInfo'
  | 'deliveryInfoSubtitle'
  | 'viewOrderHistory'
  | 'noOrders'
  | 'noOrdersSubtitle'
  | 'orderHistory'
  | 'order'
  | 'statusPending'
  | 'statusConfirmed'
  | 'statusShipped'
  | 'statusDelivered'
  | 'moreItems'
  | 'viewDetails'
  | 'productDetails'
  | 'back'
  | 'share'
  | 'certified'
  | 'reviews'
  | 'unitsInStock'
  | 'whatItDoes'
  | 'whyUse'
  | 'keyBenefits'
  | 'farmerFriendlyFormula'
  | 'safeUsage'
  | 'cropSupport'
  | 'resultIn'
  | 'safety'
  | 'useCases'
  | 'howToUse'
  | 'followLabel'
  | 'bestFor'
  | 'applyRecommended'
  | 'expectedDelivery'
  | 'repeatUsage'
  | 'farmerReviews'
  | 'rating'
  | 'addToCart'
  | 'buyNow'
  | 'added'
  | 'productAddedToCart'
  | 'loginRequired'
  | 'verifyOtpFirst'
  | 'orderCreated'
  | 'orderCreatedSuccess'
  | 'orderFailedAuth'
  | 'loginTitle'
  | 'loginSubtitle'
  | 'welcomeBack'
  | 'mobileNumber'
  | 'invalidPhone'
  | 'getOtp'
  | 'sending'
  | 'sendOtpFailed'
  | 'goodMorning'
  | 'todaysInsight'
  | 'viewAll'
  | 'aiCropAssistant'
  | 'cropInsight'
  | 'tapToSpeak'
  | 'voiceFarmingHelp'
  | 'startListening'
  | 'yourLanguageYourApp'
  | 'youCanChangeLanguageAnytime'
  | 'getStarted'
  | 'profile'
  | 'profileSettings'
  | 'crops'
  | 'landSize'
  | 'landUnit'
  | 'location'
  | 'edit'
  | 'save'
  | 'signOut'
  | 'language'
  | 'farmDetails'
  | 'nameCannotBeEmpty'
  | 'selectLocation'
  | 'selectDistrict'
  | 'failedToUpdateProfile'
  | 'wheat'
  | 'rice'
  | 'cotton'
  | 'mustard'
  | 'acre'
  | 'hectare'
  | 'chatTitle'
  | 'greeting'
  | 'enableMicrophone'
  | 'microphoneNotAvailable'
  | 'selectImage'
  | 'takePhoto'
  | 'chooseFromGallery'
  | 'sendMessage'
  | 'recordVoice'
  | 'sessionExpired'
  | 'pleaseLoginAgain'
  | 'backendsConnectionError'
  | 'aiAssistant'
  | 'online'
  | 'today'
  | 'imageAttached'
  | 'noAudio'
  | 'noAudioPayload'
  | 'typeHere'
  | 'audioPlayback'
  | 'otpVerification'
  | 'enterTheCode'
  | 'verifySentence'
  | 'sentCodeTo'
  | 'tooManyAttempts'
  | 'enterAllSixDigits'
  | 'invalidOrExpiredOtp'
  | 'failedToResendOtp'
  | 'verifying'
  | 'verify'
  | 'resend'
  | 'devModeOnly'
  | 'resendOtpIn'
  | 'sendingResend'
  | 'didntReceiveCode'
  | 'secureConnection'
  | 'stepTwoOfThree'
  | 'thinking'
  | 'listening'
  | 'ready'
  | 'askYourCropQuestionIn'
  | 'voiceResponse'
  | 'stopAndSend'
  | 'startRecording'
  | 'playbackFailed'
  | 'voicePlaybackFailed'
  | 'voiceRequestFailed'
  | 'voiceRouteUnavailable'
  | 'chatTab'
  | 'yourConversations'
  | 'searchChats'
  | 'noConversations'
  | 'pastSessions'
  | 'rename'
  | 'archive'
  | 'renameSession'
  | 'enterSessionTitle'
  | 'saving'
  | 'newChat'
  | 'seasonLabel'
  | 'retry'
  | 'toolResult'
  | 'recommendedForYou'
  | 'sellerInfo'
  | 'callSeller'
  | 'chatWithSeller'
  | 'pickupAvailable'
  | 'verifiedSeller'
  | 'mandi'
  | 'alerts'
  | 'shareFailed'
  | 'unableToShare'
  | 'contactUnavailable'
  | 'noPublicPhone'
  | 'farmMap'
  | 'soilMoisture'
  | 'humidity'
  | 'wind'
  | 'weatherFeed'
  | 'goodAfternoon'
  | 'goodEvening'
  | 'goodNight'
  | 'mandiSeedBank'
  | 'equipmentRental'
  | 'fertilizerStore'
  | 'delivery'
  | 'selfPickup'
  | 'paySecurely'
  | 'checkoutUnavailable'
  | 'unableToOpenCheckout'
  | 'paymentFailed'
  | 'paymentPending'
  | 'paymentCheckFailed'
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
  | 'useCurrentLocationOrPickOnMap'
  | 'noApiKeyNeeded'
  | 'saveChanges'
  | 'orContinueWith'
  | 'google'
  | 'termsAndPrivacy'
  | 'otpPreview'
  | 'yourOtp'
  | 'otpDisabled'
  | 'agriAssistant'
  | 'optimizingFields'
  | 'poweredByAgri'
  | 'soilHealth'
  | 'nutrientAnalysis'
  | 'pestControl'
  | 'smartDetection'
  | 'yieldForecast'
  | 'marketPrediction'
  | 'cropType'
  | 'personalizedSelection'
  | 'expertAiAdvice'
  | 'continueToAdvisor'
  | 'krishiVani'
  | 'talkToCrops'
  | 'askInNative'
  | 'continueButton'
  | 'recommendedProducts'
  | 'listen'
  | 'limitReached'
  | 'cancel'
  | 'upgradeNow'
  | 'stageSeedling'
  | 'stageGrowing'
  | 'stageFlowering'
  | 'stageFruiting'
  | 'stageHarvesting'
  | 'soil'
  | 'smartAdvisory'
  | 'weatherOptimal'
  | 'weatherDry'
  | 'weatherSaturated'
  | 'weatherRainyAdvice'
  | 'weatherClear'
  | 'weatherCloudy'
  | 'weatherPartlyCloudy'
  | 'weatherRainy'
  | 'weatherStormy'
  | 'quickServices'
  | 'weatherFoggy'
  // --- Error Keys ---
  | 'later'
  | 'loading'
  | 'unableToLoadPlan'
  | 'checkConnection'
  | 'upgradeToPremium'
  | 'plan'
  | 'chats'
  | 'scans'
  | 'left'
  | 'expires'
  | 'retry'
  | 'errConnection'
  | 'errServerBusy'
  | 'errNoCredits'
  | 'errLimitReached'
  | 'errSubscriptionExpired'
  | 'errInvalidOtp'
  | 'errOtpExpired'
  | 'errInvalidOtpSession'
  | 'errAuth'
  | 'errForbidden'
  | 'errNotFound'
  | 'errUnknown'
  // --- Subscription Screen Keys ---
  | 'subscriptionTitle'
  | 'masterYourHarvest'
  | 'subscriptionSubtitle'
  | 'remainingCredits'
  | 'aiChatsLabel'
  | 'cropScansLabel'
  | 'monthlyPlansLabel'
  | 'topUpsLabel'
  | 'whyUpgrade'
  | 'aiCropDoctorTitle'
  | 'aiCropDoctorSub'
  | 'krishiAssistantTitle'
  | 'krishiAssistantSub'
  | 'multiLingualTitle'
  | 'multiLingualSub'
  | 'expertPriorityTitle'
  | 'expertPrioritySub'
  | 'basicPlanTitle'
  | 'proPlanTitle'
  | 'planPerk1'
  | 'planPerk2'
  | 'planPerk3'
  | 'planPerk4'
  | 'planPerk5'
  | 'planPerk6'
  | 'planPerk7'
  | 'addExtraCredits'
  | 'topupDisclaimer'
  | 'aiChatPacks'
  | 'imageScanPacks'
  | 'scanLabel'
  | 'scansLabel'
  | 'renewPlan'
  | 'buyCredits'
  | 'paymentSuccessTitle'
  | 'paymentSuccessSub'
  | 'completingTransaction'
  | 'verifyingBank'
  | 'doNotCloseApp'
  | 'mostPopular'
  | 'currentPlan'
  // --- Chat History Keys ---
  | 'historyTitle'
  | 'historySubtitle'
  | 'messagesLabel'
  | 'startNewConversation'
  | 'cropDiagnosisLabel'
  | 'noChatsFound'
  | 'noScansFound'
  // --- Location Selector Keys ---
  | 'confirmLocationTitle'
  | 'locationPermissionError'
  | 'autoLocationError'
  | 'locationHelpText'
  | 'useCurrentLocation'
  | 'selectManually'
  | 'selectState'
  | 'backToStates'
  | 'locationUsagePrivacy'
  | 'locationErrorTitle'
  | 'confirm';


const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  English: {
    marketTitle: 'Market',
    marketSubtitle: 'Premium Agri Market',
    searchPlaceholder: 'Search fertilizers, seeds, tools...',
    aiPick: 'AI Pick',
    viewNow: 'View Now',
    topFertilizers: 'Top Fertilizers',
    essentialSeeds: 'Essential Seeds',
    modernTools: 'Modern Tools',
    cropCare: 'Crop Care',
    noProductsFound: 'No products found',
    tryDifferentFilters: 'Try different filters or search terms.',
    cart: 'Cart',
    cartEmptyTitle: 'Your cart is empty',
    cartEmptySubtitle: 'Add products to start shopping.',
    startShopping: 'Start Shopping',
    checkout: 'Proceed to Checkout',
    continueShopping: 'Continue Shopping',
    subtotal: 'Subtotal',
    tax: 'Tax',
    shipping: 'Shipping',
    discount: 'Discount',
    total: 'Total',
    deliveryDetails: 'Delivery Details',
    perKg: 'per kg',
    perPacket: 'per packet',
    perUnit: 'per unit',
    perLiter: 'per liter',
    // --- Crops ---
    Wheat: 'Wheat',
    Rice: 'Rice',
    Cotton: 'Cotton',
    Mustard: 'Mustard',
    Sugarcane: 'Sugarcane',
    Maize: 'Maize',
    Vegetables: 'Vegetables',
    Fruits: 'Fruits',
    // --- Use cases ---
    'Soil Health': 'Soil Health',
    Growth: 'Growth',
    Yield: 'Yield',
    'Pest Control': 'Pest Control',
    'Disease Prevention': 'Disease Prevention',
    // --- Units ---
    kg: 'kg',
    liter: 'liter',
    packet: 'packet',
    unit: 'unit',
    bag: 'bag',
    // --- Others ---
    premiumPlan: 'Premium Plan',
    unlockFullPotential: 'Unlock full potential',
    advancedAIExperience: 'Experience advanced AI with multilingual guidance',
    advancedAI: 'Advanced AI',
    deeperReasoning: 'Deeper reasoning capabilities',
    personalizedAdvisory: 'Personalized advisory',
    tailoredSuggestions: 'Tailored suggestions',
    fasterResponses: 'Faster responses',
    priorityProcessing: 'Priority processing',
    annualPlan: 'Annual Plan',
    monthlyPlan: 'Monthly Plan',
    perYear: 'per year',
    perMonth: 'per month',
    save40: 'Save 40%',
    secureCheckoutReady: 'Secure subscription checkout ready',
    finishPaymentPrompt: 'Complete the payment in your browser, then return here and refresh the status.',
    reopenSecureCheckout: 'Reopen Secure Checkout',
    checkingPaymentStatus: 'Checking payment status...',
    plansActivateAfterVerification: 'Plans activate only after payment verification.',
    iCompletedPayment: 'I Completed Payment',
    openingSecureCheckout: 'Opening secure checkout...',
    personalInfo: 'Personal Information',
    name: 'Name',
    phone: 'Phone Number',
    email: 'Email',
    address: 'Address',
    city: 'City',
    state: 'State',
    pincode: 'Pincode',
    orderSummary: 'Order Summary',
    placeOrder: 'Place Order',
    processing: 'Processing...',
    orderFailed: 'Order Failed',
    fillRequiredFields: 'Please fill all required fields',
    orderSuccess: 'Order Successful!',
    orderSuccessSubtitle: 'Your order has been placed successfully.',
    orderId: 'Order ID',
    deliveryInfo: 'Delivery Information',
    deliveryInfoSubtitle: 'Tracking details will be shared on your email.',
    viewOrderHistory: 'View Order History',
    noOrders: 'No orders yet',
    noOrdersSubtitle: 'You have not placed any orders yet.',
    orderHistory: 'Order History',
    order: 'Order',
    statusPending: 'Pending',
    statusConfirmed: 'Confirmed',
    statusShipped: 'Shipped',
    statusDelivered: 'Delivered',
    moreItems: 'more items',
    viewDetails: 'View Details',
    productDetails: 'Product Details',
    back: 'Back',
    share: 'Share',
    certified: 'Certified',
    reviews: 'reviews',
    unitsInStock: 'Units in stock',
    whatItDoes: 'What it does',
    whyUse: 'Why use',
    keyBenefits: 'Key Benefits',
    farmerFriendlyFormula: 'Farmer friendly formula',
    safeUsage: 'Safe usage with instructions',
    cropSupport: 'Crops supported across conditions',
    resultIn: 'Result in',
    safety: 'Safety',
    useCases: 'Use cases',
    howToUse: 'How to use',
    followLabel: 'Follow label instructions for dosage.',
    bestFor: 'Best for',
    applyRecommended: 'Apply during recommended crop stage.',
    expectedDelivery: 'Expected delivery',
    repeatUsage: 'Repeat based on crop requirement.',
    farmerReviews: 'Farmer Reviews',
    rating: 'Rating',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    added: 'Added',
    productAddedToCart: 'Product added to cart',
    loginRequired: 'Login required',
    verifyOtpFirst: 'Please verify OTP before creating orders.',
    orderCreated: 'Order created',
    orderCreatedSuccess: 'The backend accepted the order request.',
    orderFailedAuth: 'Orders require an authenticated backend session.',
    loginTitle: 'Welcome back',
    loginSubtitle: 'Enter your mobile number to get started',
    welcomeBack: 'Welcome back',
    mobileNumber: 'Mobile Number',
    invalidPhone: 'Enter a valid 10-15 digit phone number',
    getOtp: 'Get OTP',
    sending: 'Sending...',
    sendOtpFailed: 'Failed to send OTP. Please try again.',
    goodMorning: 'Good morning',
    todaysInsight: "Today's Insight",
    viewAll: 'View All',
    aiCropAssistant: 'AI Crop Assistant',
    cropInsight: 'Your wheat field is holding moisture well. Consider a light nutrient application before evening irrigation.',
    tapToSpeak: 'Tap to Speak',
    voiceFarmingHelp: 'Voice-first farming help',
    startListening: 'Start Listening',
    yourLanguageYourApp: 'Your Language, Your App',
    youCanChangeLanguageAnytime: 'You can change language anytime in settings',
    getStarted: 'Get Started',
    profile: 'Profile',
    profileSettings: 'Profile Settings',
    crops: 'Crops',
    landSize: 'Land Size',
    landUnit: 'Land Unit',
    location: 'Location',
    edit: 'Edit',
    save: 'Save',
    signOut: 'Sign Out',
    language: 'Language',
    farmDetails: 'Farm Details',
    nameCannotBeEmpty: 'Name cannot be empty',
    selectLocation: 'Select Location',
    selectDistrict: 'Select District',
    failedToUpdateProfile: 'Failed to update profile',
    wheat: 'Wheat',
    rice: 'Rice',
    cotton: 'Cotton',
    mustard: 'Mustard',
    acre: 'Acre',
    hectare: 'Hectare',
    chatTitle: 'Chat',
    greeting: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?',
    enableMicrophone: 'Enable microphone access',
    microphoneNotAvailable: 'Microphone not available',
    selectImage: 'Select Image',
    takePhoto: 'Take Photo',
    chooseFromGallery: 'Choose from Gallery',
    sendMessage: 'Send',
    recordVoice: 'Record Voice',
    sessionExpired: 'Session expired. Please login again.',
    pleaseLoginAgain: 'Please login again.',
    backendsConnectionError: 'Unable to reach backend. Check backend server and mobile API network.',
    aiAssistant: 'AI Sahayak',
    online: 'Online',
    today: 'Today',
    imageAttached: 'Image attached',
    noAudio: 'No audio',
    noAudioPayload: 'This response has no audio payload.',
    typeHere: 'Type in Hindi, English...',
    audioPlayback: 'Audio playback',
    otpVerification: 'OTP Verification',
    enterTheCode: 'Enter the code',
    verifySentence: 'Verify',
    sentCodeTo: "We've sent code to",
    tooManyAttempts: 'Too many failed attempts. Please resend OTP.',
    enterAllSixDigits: 'Enter all 6 digits',
    invalidOrExpiredOtp: 'Invalid or expired OTP',
    failedToResendOtp: 'Failed to resend OTP',
    verifying: 'Verifying...',
    verify: 'Verify',
    resend: 'Resend',
    devModeOnly: 'Dev Mode Only:',
    resendOtpIn: 'Resend OTP in',
    sendingResend: 'Sending...',
    didntReceiveCode: "Didn't receive the code? Resend",
    secureConnection: 'Secure, encrypted connection',
    stepTwoOfThree: 'Step 2 of 3',
    thinking: 'Thinking...',
    listening: 'Listening...',
    ready: 'Tap to speak',
    askYourCropQuestionIn: 'Ask your crop question in',
    voiceResponse: 'AI Response',
    stopAndSend: 'Stop & Send',
    startRecording: 'Start Recording',
    playbackFailed: 'Playback Failed',
    voicePlaybackFailed: 'Could not play the voice response.',
    voiceRequestFailed: 'Voice Request Failed',
    voiceRouteUnavailable: 'Voice service is currently unavailable. Please try again later.',
    chatTab: 'Chat',
    yourConversations: 'All your conversations',
    searchChats: 'Search chats...',
    noConversations: 'No conversations found',
    pastSessions: 'Past Sessions',
    rename: 'Rename',
    archive: 'Archive',
    renameSession: 'Rename Session',
    enterSessionTitle: 'Enter session title',
    saving: 'Saving...',
    newChat: 'New Chat',
    seasonLabel: 'Current Season',
    retry: 'Retry',
    toolResult: 'Tool Result',
    recommendedForYou: 'Recommended for You',
    sellerInfo: 'Seller Information',
    callSeller: 'Call Seller',
    chatWithSeller: 'Chat',
    pickupAvailable: 'Pickup available at this location',
    verifiedSeller: 'Anaaj Verified Seller',
    mandi: 'Mandi, Himachal Pradesh',
    alerts: 'Alerts',
    shareFailed: 'Share failed',
    unableToShare: 'Unable to share product details right now.',
    contactUnavailable: 'Contact Unavailable',
    noPublicPhone: 'This seller does not have a public contact number.',
    farmMap: 'Farm Location Map',
    soilMoisture: 'Soil Moisture',
    humidity: 'Humidity',
    wind: 'Wind',
    weatherFeed: 'Free weather feed',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    goodNight: 'Good night',
    mandiSeedBank: 'Mandi Seed Bank',
    equipmentRental: 'Equipment Rental Co.',
    fertilizerStore: 'Green Fertilizer Store',
    delivery: 'Delivery',
    selfPickup: 'Self Pickup',
    paySecurely: 'Pay Securely',
    checkoutUnavailable: 'Checkout unavailable',
    unableToOpenCheckout: 'Unable to open the secure checkout page on this device.',
    paymentFailed: 'Payment failed',
    paymentPending: 'Payment pending',
    paymentCheckFailed: 'Payment check failed',
    completeYourProfile: 'Complete your Profile',
    phoneNotAvailable: 'Phone not available',
    incompleteProfile: 'Incomplete Profile',
    premiumMember: 'Premium Member',
    basicMember: 'Basic Member',
    freeMember: 'Free Member',
    editProfile: 'Edit Profile',
    subscriptionStatus: 'Subscription Status',
    premiumPlanActive: 'Premium Plan Active',
    basicPlanActive: 'Basic Plan Active',
    freePlan: 'Free Plan',
    manage: 'Manage',
    commerce: 'COMMERCE',
    trackOrders: 'Track Orders',
    checkStatusAndDeliveryUpdates: 'Check status and delivery updates',
    myCart: 'My Cart',
    reviewItemsAndCheckout: 'Review items and checkout',
    preferences: 'PREFERENCES',
    appLanguage: 'App Language',
    darkAppearance: 'Dark Appearance',
    on: 'On',
    off: 'Off',
    securityAndData: 'SECURITY & DATA',
    privacySettings: 'Privacy Settings',
    close: 'Close',
    enterYourName: 'Enter your name',
    cropsGrown: 'Crops Grown',
    enterLandSize: 'Enter land size',
    notSelected: 'Not Selected',
    change: 'Change',
    useCurrentLocationOrPickOnMap: 'Use Current Location or Pick on Map',
    noApiKeyNeeded: 'No API keys needed',
    saveChanges: 'Save Changes',
    continueToSecurePayment: 'Continue to secure payment',
    orContinueWith: 'or continue with',
    google: 'Google',
    termsAndPrivacy: 'Terms of Service & Privacy Policy',
    otpPreview: 'OTP preview',
    yourOtp: 'Your OTP:',
    otpDisabled: 'OTP preview is disabled for this environment.',
    agriAssistant: 'AI Agri Assistant',
    optimizingFields: 'Optimizing Fields',
    poweredByAgri: 'Powered by Advanced Agri-Intelligence',
    soilHealth: 'Soil Health',
    nutrientAnalysis: 'AI Nutrients Analysis',
    pestControl: 'Pest Control',
    smartDetection: 'Smart Detection',
    yieldForecast: 'Yield Forecast',
    marketPrediction: 'Market Prediction',
    cropType: 'Crop Type',
    personalizedSelection: 'Personalized Selection',
    expertAiAdvice: 'Get Expert AI Advice',
    continueToAdvisor: 'Continue to Advisor',
    krishiVani: 'KrishiVani',
    talkToCrops: 'Talk to your crops',
    askInNative: 'Ask questions in native language and get AI advice.',
    continueButton: 'Continue',
    recommendedProducts: 'Recommended Products',
    listen: 'Listen',
    limitReached: 'Limit Reached',
    cancel: 'Cancel',
    upgradeNow: 'Upgrade Now',
    stageSeedling: 'Seedling',
    stageGrowing: 'Growing',
    stageFlowering: 'Flowering',
    stageFruiting: 'Fruiting',
    stageHarvesting: 'Harvesting',
    soil: 'Soil',
    smartAdvisory: 'Smart Advisory',
    weatherOptimal: 'Conditions are optimal for field maintenance.',
    weatherDry: 'Soil is dry. Optimal time for irrigation.',
    weatherSaturated: 'Soil is saturated. Avoid further watering.',
    weatherRainyAdvice: 'Stay indoors. Perfect for natural irrigation.',
    weatherClear: 'Sunny & Clear',
    weatherCloudy: 'Cloudy',
    weatherPartlyCloudy: 'Partly Cloudy',
    weatherRainy: 'Raining',
    weatherStormy: 'Thunderstorm',
    quickServices: 'Quick Services',
    weatherFoggy: 'Foggy',
    later: 'Later',
    loading: 'Loading...',
    unableToLoadPlan: 'Unable to load plan',
    checkConnection: 'Check your connection',
    upgradeToPremium: 'Upgrade to Premium',
    plan: 'PLAN',
    chats: 'chats',
    scans: 'scans',
    left: 'left',
    expires: 'Expires',
    // --- Error Messages ---
    errConnection: 'Network trouble. Please check your internet or SIM signal.',
    errServerBusy: 'Server is busy helping other farmers. Please try again in 2 minutes.',
    errNoCredits: 'You have no credits left. Please top up or subscribe to continue.',
    errLimitReached: 'You have reached your daily limit. Please upgrade for more.',
    errSubscriptionExpired: 'Your plan has expired. Please renew to keep using this service.',
    errInvalidOtp: 'Wrong code entered. Please check the SMS and try again.',
    errOtpExpired: 'Code has expired. Please request a new one.',
    errInvalidOtpSession: 'OTP session expired. Please start login again.',
    errAuth: 'Login failed. Please try again.',
    errForbidden: 'Access denied. You do not have permission for this task.',
    errNotFound: 'Requested service not found.',
    errUnknown: 'Something went wrong. Please restart the app or try later.',
    // --- Subscription Screen ---
    subscriptionTitle: 'Subscription',
    masterYourHarvest: 'Master Your Harvest',
    subscriptionSubtitle: 'Join 50,000+ farmers using Anaaj.ai to increase their yield by up to 30%.',
    remainingCredits: 'Remaining Credits',
    aiChatsLabel: 'AI Chats',
    cropScansLabel: 'Crop Scans',
    monthlyPlansLabel: 'Monthly Plans',
    topUpsLabel: 'Top-ups',
    whyUpgrade: 'Why Upgrade?',
    aiCropDoctorTitle: 'AI Crop Doctor',
    aiCropDoctorSub: 'Identify diseases from photos instantly',
    krishiAssistantTitle: 'Krishi Assistant',
    krishiAssistantSub: 'Unlimited specialized farming chat',
    multiLingualTitle: 'Multi-lingual',
    multiLingualSub: 'Support for 10+ local Indian languages',
    expertPriorityTitle: 'Expert Priority',
    expertPrioritySub: 'Get answers up to 3x faster',
    basicPlanTitle: 'Basic',
    proPlanTitle: 'Pro',
    planPerk1: '50 AI Chats',
    planPerk2: '3 Image Scans',
    planPerk3: 'Topup Enabled',
    planPerk4: '100 AI Chats',
    planPerk5: '10 Image Scans',
    planPerk6: '7-day rollover',
    planPerk7: 'Mandi alerts',
    addExtraCredits: 'Add Extra Credits',
    topupDisclaimer: 'Top-up credits never expire and are used only after your plan credits run out.',
    aiChatPacks: 'AI Chat Packs',
    imageScanPacks: 'Image Scan Packs',
    scanLabel: 'Scan',
    scansLabel: 'Scans',
    renewPlan: 'RENEW PLAN',
    buyCredits: 'BUY CREDITS',
    paymentSuccessTitle: 'Payment Successful',
    paymentSuccessSub: 'Your plan and wallet have been updated.',
    completingTransaction: 'Completing Transaction...',
    verifyingBank: 'Verifying with Bank...',
    doNotCloseApp: 'Please do not close the app',
    mostPopular: 'MOST POPULAR',
    currentPlan: 'CURRENT PLAN',
    // --- Chat History ---
    historyTitle: 'Your History',
    historySubtitle: 'Previously analyzed crops and chats',
    messagesLabel: 'Messages',
    startNewConversation: 'Start a new conversation...',
    cropDiagnosisLabel: 'Crop Diagnosis',
    noChatsFound: 'No chats found',
    noScansFound: 'No scans found',
    // --- Location Selector ---
    confirmLocationTitle: 'Confirm Location',
    locationPermissionError: 'Please enable location permissions in your settings.',
    autoLocationError: 'Unable to fetch location automatically. Please search manually.',
    locationHelpText: 'Help us personalize your agricultural advice based on your region.',
    useCurrentLocation: 'Use Current Location (GPS)',
    selectManually: 'SELECT MANUALLY',
    selectState: 'Select your State',
    backToStates: 'Back to States',
    locationUsagePrivacy: 'We only use your location to provide accurate weather and crop data.',
    locationErrorTitle: 'Location Error',
    confirm: 'Confirm',
  },
  Hindi: {
    marketTitle: 'मार्केट',
    marketSubtitle: 'प्रीमियम कृषि बाजार',
    searchPlaceholder: 'खाद, बीज, उपकरण खोजें...',
    aiPick: 'AI सुझाव',
    viewNow: 'अभी देखें',
    topFertilizers: 'टॉप खाद',
    essentialSeeds: 'जरूरी बीज',
    modernTools: 'आधुनिक उपकरण',
    cropCare: 'फसल देखभाल',
    noProductsFound: 'कोई उत्पाद नहीं मिला',
    tryDifferentFilters: 'अलग फिल्टर या खोज शब्द आज़माएं।',
    cart: 'कार्ट',
    cartEmptyTitle: 'आपका कार्ट खाली है',
    cartEmptySubtitle: 'खरीदारी शुरू करने के लिए उत्पाद जोड़ें।',
    startShopping: 'खरीदारी शुरू करें',
    checkout: 'चेकआउट पर जाएं',
    continueShopping: 'खरीदारी जारी रखें',
    subtotal: 'उप-योग',
    tax: 'कर',
    shipping: 'शिपिंग',
    discount: 'छूट',
    total: 'कुल',
    deliveryDetails: 'डिलीवरी विवरण',
    perKg: 'प्रति किलो',
    perPacket: 'प्रति पैकेट',
    perUnit: 'प्रति यूनिट',
    perLiter: 'प्रति लीटर',
    // --- Crops ---
    Wheat: 'गेहूं',
    Rice: 'चावल',
    Cotton: 'कपास',
    Mustard: 'सरसों',
    Sugarcane: 'गन्ना',
    Maize: 'मक्का',
    Vegetables: 'सब्जियाँ',
    Fruits: 'फल',
    // --- Use cases ---
    'Soil Health': 'मिट्टी का स्वास्थ्य',
    Growth: 'वृद्धि',
    Yield: 'पैदावार',
    'Pest Control': 'कीट नियंत्रण',
    'Disease Prevention': 'रोग रोकथाम',
    // --- Units ---
    kg: 'किलो',
    liter: 'लीटर',
    packet: 'पैकेट',
    unit: 'यूनिट',
    bag: 'बोरी',
    // --- Others ---
    premiumPlan: 'प्रीमियम प्लान',
    unlockFullPotential: 'पूरी क्षमता को अनलॉक करें',
    advancedAIExperience: 'बहुभाषी मार्गदर्शन के साथ उन्नत AI का अनुभव करें',
    advancedAI: 'उन्नत AI',
    deeperReasoning: 'गहरी तर्क क्षमता',
    personalizedAdvisory: 'व्यक्तिगत सलाह',
    tailoredSuggestions: 'आपकी जरूरत के अनुसार सुझाव',
    fasterResponses: 'तेज जवाब',
    priorityProcessing: 'प्राथमिकता के आधार पर प्रोसेसिंग',
    annualPlan: 'वार्षिक प्लान',
    monthlyPlan: 'मासिक प्लान',
    perYear: 'प्रति वर्ष',
    perMonth: 'प्रति माह',
    save40: '40% बचाएं',
    secureCheckoutReady: 'सुरक्षित सब्सक्रिप्शन चेकआउट तैयार है',
    finishPaymentPrompt: 'ब्राउज़र में भुगतान पूरा करें, फिर यहां वापस आएं और स्थिति को रिफ्रेश करें।',
    reopenSecureCheckout: 'सुरक्षित चेकआउट फिर से खोलें',
    checkingPaymentStatus: 'भुगतान स्थिति की जांच की जा रही है...',
    iCompletedPayment: 'मैंने भुगतान पूरा कर लिया है',
    openingSecureCheckout: 'सुरक्षित चेकआउट खोला जा रहा है...',
    continueToSecurePayment: 'सुरक्षित भुगतान के लिए जारी रखें',
    plansActivateAfterVerification: 'प्लान केवल भुगतान की पुष्टि के बाद सक्रिय होते हैं।',
    personalInfo: 'व्यक्तिगत जानकारी',
    name: 'नाम',
    phone: 'फोन नंबर',
    email: 'ईमेल',
    address: 'पता',
    city: 'शहर',
    state: 'राज्य',
    pincode: 'पिनकोड',
    orderSummary: 'ऑर्डर सारांश',
    placeOrder: 'ऑर्डर करें',
    processing: 'प्रोसेस हो रहा है...',
    orderFailed: 'ऑर्डर विफल',
    fillRequiredFields: 'कृपया सभी आवश्यक फील्ड भरें',
    orderSuccess: 'ऑर्डर सफल!',
    orderSuccessSubtitle: 'आपका ऑर्डर सफलतापूर्वक हो गया है।',
    orderId: 'ऑर्डर ID',
    deliveryInfo: 'डिलीवरी जानकारी',
    deliveryInfoSubtitle: 'ट्रैकिंग विवरण ईमेल पर भेजा जाएगा।',
    viewOrderHistory: 'ऑर्डर हिस्ट्री देखें',
    noOrders: 'अभी तक कोई ऑर्डर नहीं',
    noOrdersSubtitle: 'आपने अभी तक कोई ऑर्डर नहीं किया।',
    orderHistory: 'ऑर्डर हिस्ट्री',
    order: 'ऑर्डर',
    statusPending: 'लंबित',
    statusConfirmed: 'पुष्ट',
    statusShipped: 'भेजा गया',
    statusDelivered: 'डिलीवर',
    moreItems: 'और आइटम',
    viewDetails: 'विवरण देखें',
    productDetails: 'उत्पाद विवरण',
    back: 'वापस',
    share: 'शेयर',
    certified: 'प्रमाणित',
    reviews: 'समीक्षाएं',
    unitsInStock: 'स्टॉक यूनिट',
    whatItDoes: 'यह क्या करता है',
    whyUse: 'क्यों उपयोग करें',
    keyBenefits: 'मुख्य लाभ',
    farmerFriendlyFormula: 'किसान अनुकूल फॉर्मूला',
    safeUsage: 'निर्देशों के साथ सुरक्षित उपयोग',
    cropSupport: 'अलग स्थितियों में उपयोगी',
    resultIn: 'परिणाम',
    safety: 'सुरक्षा',
    useCases: 'उपयोग मामले',
    howToUse: 'कैसे उपयोग करें',
    followLabel: 'डोज़ के लिए लेबल निर्देश का पालन करें।',
    bestFor: 'सबसे उपयुक्त',
    applyRecommended: 'अनुशंसित चरण में लगाएं।',
    expectedDelivery: 'अनुमानित डिलीवरी',
    repeatUsage: 'आवश्यकता अनुसार दोहराएं।',
    farmerReviews: 'किसान समीक्षा',
    rating: 'रेटिंग',
    addToCart: 'कार्ट में जोड़ें',
    buyNow: 'अभी खरीदें',
    added: 'जोड़ दिया गया',
    productAddedToCart: 'उत्पाद कार्ट में जोड़ दिया गया',
    loginRequired: 'लॉगिन आवश्यक',
    verifyOtpFirst: 'ऑर्डर से पहले OTP सत्यापित करें।',
    orderCreated: 'ऑर्डर बना',
    orderCreatedSuccess: 'बैकएंड ने ऑर्डर स्वीकार कर लिया।',
    orderFailedAuth: 'ऑर्डर के लिए प्रमाणित सत्र आवश्यक है।',
    loginTitle: 'स्वागत है',
    loginSubtitle: 'शुरू करने के लिए अपना मोबाइल नंबर दर्ज करें',
    welcomeBack: 'स्वागत है',
    mobileNumber: 'मोबाइल नंबर',
    invalidPhone: 'एक मान्य 10-15 अंकीय फोन नंबर दर्ज करें',
    getOtp: 'OTP प्राप्त करें',
    sending: 'भेज रहे हैं...',
    sendOtpFailed: 'OTP भेजने में विफल। कृपया दोबारा प्रयास करें।',
    goodMorning: 'सुप्रभात',
    todaysInsight: 'आज की जानकारी',
    viewAll: 'सभी देखें',
    aiCropAssistant: 'AI फसल सहायक',
    cropInsight: 'आपका गेहूं का खेत नमी को अच्छी तरह रख रहा है। शाम की सिंचाई से पहले हल्के पोषक तत्व का आवेदन करने पर विचार करें।',
    tapToSpeak: 'बोलने के लिए टैप करें',
    voiceFarmingHelp: 'वॉयस-पहली खेती की सहायता',
    startListening: 'सुनना शुरू करें',
    yourLanguageYourApp: 'आपकी भाषा, आपका ऐप',
    youCanChangeLanguageAnytime: 'आप किसी भी समय सेटिंग्स में भाषा बदल सकते हैं',
    getStarted: 'शुरू करें',
    profile: 'प्रोफाइल',
    profileSettings: 'प्रोफाइल सेटिंग्स',
    crops: 'फसलें',
    landSize: 'भूमि का आकार',
    landUnit: 'भूमि की इकाई',
    location: 'स्थान',
    edit: 'संपादित करें',
    save: 'सहेजें',
    signOut: 'साइन आउट',
    language: 'भाषा',
    farmDetails: 'खेत की विस्तृत जानकारी',
    nameCannotBeEmpty: 'नाम खाली नहीं हो सकता',
    selectLocation: 'स्थान चुनें',
    selectDistrict: 'जिला चुनें',
    failedToUpdateProfile: 'प्रोफाइल अपडेट करने में विफल',
    wheat: 'गेहूं',
    rice: 'चावल',
    cotton: 'कपास',
    mustard: 'सरसों',
    acre: 'एकड़',
    hectare: 'हेक्टेयर',
    chatTitle: 'चैट',
    greeting: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?',
    enableMicrophone: 'माइक्रोफोन एक्सेस सक्षम करें',
    microphoneNotAvailable: 'माइक्रोफोन उपलब्ध नहीं है',
    selectImage: 'छवि चुनें',
    takePhoto: 'फोटो लें',
    chooseFromGallery: 'गैलरी से चुनें',
    sendMessage: 'भेजें',
    recordVoice: 'वॉयस रिकॉर्ड करें',
    sessionExpired: 'सत्र समाप्त हो गया। कृपया दोबारा लॉगिन करें।',
    pleaseLoginAgain: 'कृपया दोबारा लॉगिन करें।',
    backendsConnectionError: 'बैकएंड तक नहीं पहुंच सकते। बैकएंड सर्वर और मोबाइल API नेटवर्क की जांच करें।',
    aiAssistant: 'AI सहायक',
    online: 'ऑनलाइन',
    today: 'आज',
    imageAttached: 'छवि जोड़ी गई',
    noAudio: 'कोई ऑडियो नहीं',
    noAudioPayload: 'इस प्रतिक्रिया में कोई ऑडियो नहीं है।',
    typeHere: 'हिंदी, अंग्रेजी में टाइप करें...',
    audioPlayback: 'ऑडियो प्लेबैक',
    otpVerification: 'OTP सत्यापन',
    enterTheCode: 'कोड दर्ज करें',
    verifySentence: 'सत्यापित करें',
    sentCodeTo: 'हमने कोड भेजा है',
    tooManyAttempts: 'बहुत सारे असफल प्रयास। कृपया OTP फिर से भेजें।',
    enterAllSixDigits: 'सभी 6 अंक दर्ज करें',
    invalidOrExpiredOtp: 'अमान्य या समाप्त OTP',
    failedToResendOtp: 'OTP फिर से भेजने में विफल',
    verifying: 'सत्यापन जारी है...',
    verify: 'सत्यापित करें',
    resend: 'फिर से भेजें',
    devModeOnly: 'केवल डेव मोड:',
    resendOtpIn: 'OTP फिर से भेजें',
    sendingResend: 'भेज रहे हैं...',
    didntReceiveCode: 'कोड नहीं मिला? फिर से भेजें',
    secureConnection: 'सुरक्षित एन्क्रिप्टेड कनेक्शन',
    stepTwoOfThree: 'चरण 2 (3 में से)',
    thinking: 'सोच रहे हैं...',
    listening: 'सुन रहे हैं...',
    ready: 'बोलने के लिए टैप करें',
    askYourCropQuestionIn: 'अपना फसल प्रश्न पूछें',
    voiceResponse: 'AI जवाब',
    stopAndSend: 'रोकें और भेजें',
    startRecording: 'रिकॉर्डिंग शुरू करें',
    playbackFailed: 'प्लेबैक विफल',
    voicePlaybackFailed: 'वॉयस रिस्पॉन्स नहीं चला सका।',
    voiceRequestFailed: 'वॉयस अनुरोध विफल',
    voiceRouteUnavailable: 'वॉयस सेवा वर्तमान में उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।',
    chatTab: 'चैट',
    yourConversations: 'आपकी बातचीत',
    searchChats: 'चैट खोजें...',
    noConversations: 'कोई बातचीत नहीं मिली',
    pastSessions: 'पिछली बातचीत',
    rename: 'नाम बदलें',
    archive: 'संग्रહ करें',
    renameSession: 'नाम बदलें',
    enterSessionTitle: 'शीर्षक दर्ज करें',
    saving: 'सहेज रहे हैं...',
    newChat: 'नयी चैट',
    seasonLabel: 'वर्तमान मौसम',
    retry: 'पुनः प्रयास करें',
    toolResult: 'टूल परिणाम',
    recommendedForYou: 'आपके लिए अनुशंसित',
    sellerInfo: 'विक्रेता की जानकारी',
    callSeller: 'विक्रेता को कॉल करें',
    chatWithSeller: 'चैट करें',
    pickupAvailable: 'इस स्थान पर पिकअप उपलब्ध है',
    verifiedSeller: 'अनाज सत्यापित विक्रेता',
    mandi: 'मंडी, हिमाचल प्रदेश',
    alerts: 'अलर्ट',
    shareFailed: 'साझा करना विफल रहा',
    unableToShare: 'अभी उत्पाद विवरण साझा करने में असमर्थ।',
    contactUnavailable: 'संपर्क उपलब्ध नहीं है',
    noPublicPhone: 'इस विक्रेता के पास सार्वजनिक संपर्क नंबर नहीं है।',
    farmMap: 'खेत का नक्शा',
    soilMoisture: 'मिट्टी की नमी',
    humidity: 'नमी',
    wind: 'हवा',
    weatherFeed: 'मुफ्त मौसम फीड',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    goodNight: 'शुभ रात्रि',
    mandiSeedBank: 'मंडी बीज बैंक',
    equipmentRental: 'उपकरण किराया कंपनी',
    fertilizerStore: 'ग्रीन फर्टिलाइजर स्टोर',
    delivery: 'डिलीवरी',
    selfPickup: 'स्वयं पिकअप',
    paySecurely: 'सुरक्षित भुगतान करें',
    checkoutUnavailable: 'चेकआउट अनुपलब्ध',
    unableToOpenCheckout: 'इस डिवाइस पर सुरक्षित चेकआउट पेज खोलने में असमर्थ।',
    paymentFailed: 'भुगतान विफल',
    paymentPending: 'भुगतान लंबित',
    paymentCheckFailed: 'भुगतान जाँच विफल रही',
    completeYourProfile: 'अपनी प्रोफाइल पूरी करें',
    phoneNotAvailable: 'फोन उपलब्ध नहीं है',
    incompleteProfile: 'अधूरी प्रोफाइल',
    premiumMember: 'प्रीमियम सदस्य',
    basicMember: 'बेसिक सदस्य',
    freeMember: 'मुफ्त सदस्य',
    editProfile: 'प्रोफाइल संपादित करें',
    subscriptionStatus: 'सब्सक्रिप्शन स्थिति',
    premiumPlanActive: 'प्रीमियम प्लान सक्रिय',
    basicPlanActive: 'बेसिक प्लान सक्रिय',
    freePlan: 'मुफ्त प्लान',
    manage: 'प्रबंधित करें',
    commerce: 'वाणिज्य',
    trackOrders: 'ऑर्डर ट्रैक करें',
    checkStatusAndDeliveryUpdates: 'स्थिति और डिलीवरी अपडेट देखें',
    myCart: 'मेरा कार्ट',
    reviewItemsAndCheckout: 'आइटम की समीक्षा करें और चेकआउट करें',
    preferences: 'प्राथमिकताएं',
    appLanguage: 'ऐप की भाषा',
    darkAppearance: 'डार्क मोड',
    on: 'चालू',
    off: 'बंद',
    securityAndData: 'सुरक्षा और डेटा',
    privacySettings: 'गोपनीयता सेटिंग्स',
    close: 'बंद करें',
    enterYourName: 'अपना नाम दर्ज करें',
    cropsGrown: 'उगाई गई फसलें',
    enterLandSize: 'भूमि का आकार दर्ज करें',
    notSelected: 'चयनित नहीं',
    change: 'बदलें',
    useCurrentLocationOrPickOnMap: 'वर्तमान स्थान का उपयोग करें या नक्शे पर चुनें',
    noApiKeyNeeded: 'किसी API कुंजी की आवश्यकता नहीं है',
    saveChanges: 'परिवर्तन सहेजें',
    orContinueWith: 'या इसके साथ जारी रखें',
    google: 'गूगल',
    termsAndPrivacy: 'सेवा की शर्तें और गोपनीयता नीति',
    otpPreview: 'OTP पूर्वावलोकन',
    yourOtp: 'आपका OTP:',
    otpDisabled: 'इस वातावरण के लिए OTP पूर्वावलोकन अक्षम है।',
    agriAssistant: 'एआई कृषि सहायक',
    optimizingFields: 'खेतों का अनुकूलन',
    poweredByAgri: 'उन्नत कृषि-इंटेलिजेंस द्वारा संचालित',
    soilHealth: 'मिट्टी का स्वास्थ्य',
    nutrientAnalysis: 'AI पोषक तत्व विश्लेषण',
    pestControl: 'कीट नियंत्रण',
    smartDetection: 'स्मार्ट पहचान',
    yieldForecast: 'उपज का पूर्वानुमान',
    marketPrediction: 'बाजार की भविष्यवाणी',
    cropType: 'फसल का प्रकार',
    personalizedSelection: 'व्यक्तिगत चयन',
    expertAiAdvice: 'विशेषज्ञ एआई सलाह प्राप्त करें',
    continueToAdvisor: 'सलाहकार के पास जाएं',
    krishiVani: 'कृषिवाणी',
    talkToCrops: 'अपनी फसलों से बात करें',
    askInNative: 'अपनी भाषा में प्रश्न पूछें और एआई सलाह लें।',
    continueButton: 'जारी रखें',
    recommendedProducts: 'अनुशंसित उत्पाद',
    listen: 'सुनें',
    limitReached: 'सीमा समाप्त',
    cancel: 'रद्द करें',
    upgradeNow: 'अभी अपग्रेड करें',
    stageSeedling: 'नन्हा पौधा',
    stageGrowing: 'बढ़ रहा है',
    stageFlowering: 'फूल आ रहे हैं',
    stageFruiting: 'फल लग रहे हैं',
    stageHarvesting: 'कटाई',
    soil: 'मिट्टी',
    smartAdvisory: 'स्मार्ट सलाह',
    weatherOptimal: 'खेती के काम के लिए स्थितियां अनुकूल हैं।',
    weatherDry: 'मिट्टी सूखी है। सिंचाई के लिए सही समय है।',
    weatherSaturated: 'मिट्टी पूरी तरह गीली है। और पानी देने से बचें।',
    weatherRainyAdvice: 'घर के अंदर रहें। प्राकृतिक सिंचाई के लिए बिल्कुल सही।',
    weatherClear: 'साफ आसमान',
    weatherCloudy: 'बादल छाए हैं',
    weatherPartlyCloudy: 'आंशिक रूप से बादल',
    weatherRainy: 'बारिश हो रही है',
    weatherStormy: 'तूफान',
    quickServices: 'त्वरित सेवाएं',
    weatherFoggy: 'कोहरा',
    later: 'बाद में देखेंगे',
    loading: 'लोड हो रहा है...',
    unableToLoadPlan: 'योजना लोड करने में असमर्थ',
    checkConnection: 'अपना कनेक्शन चेक करें',
    upgradeToPremium: 'प्रीमियम में अपग्रेड करें',
    plan: 'प्लान',
    chats: 'चैट',
    scans: 'स्कैन',
    left: 'शेष',
    expires: 'समाप्त होता है',
    // --- Error Messages ---
    errConnection: 'नेटवर्क की समस्या. कृपया अपना इंटरनेट या सिम सिग्नल चेक करें.',
    errServerBusy: 'सर्वर अभी बिजी है. कृपया 2 मिनट बाद फिर से कोशिश करें.',
    errNoCredits: 'आपके क्रेडिट खत्म हो गए हैं. कृपया रिचार्ज या सब्सक्राइब करें.',
    errLimitReached: 'आपकी दैनिक सीमा समाप्त हो गई है. कृपया अपग्रेड करें.',
    errSubscriptionExpired: 'आपका प्लान खत्म हो गया है. कृपया जारी रखने के लिए रिन्यू करें.',
    errInvalidOtp: 'गलत कोड. कृपया मैसेज चेक करें और फिर से कोशिश करें.',
    errOtpExpired: 'कोड की समय सीमा समाप्त हो गई है. कृपया नया कोड मंगाएं.',
    errInvalidOtpSession: 'लॉगिन सेशन खत्म हो गया है. कृपया फिर से शुरू करें.',
    errAuth: 'लॉगिन नहीं हो सका. कृपया फिर से कोशिश करें.',
    errForbidden: 'अनुमति नहीं है.',
    errNotFound: 'सर्विस नहीं मिली.',
    errUnknown: 'कुछ गलत हो गया. कृपया ऐप को फिर से खोलें या बाद में कोशिश करें.',
    // --- Subscription Screen ---
    subscriptionTitle: 'सदस्यता',
    masterYourHarvest: 'अपनी फसल को बेहतर बनाएं',
    subscriptionSubtitle: 'अपनी उपज को 30% तक बढ़ाने के लिए Anaaj.ai का उपयोग करने वाले 50,000+ किसानों से जुड़ें।',
    remainingCredits: 'शेष क्रेडिट',
    aiChatsLabel: 'AI चैट',
    cropScansLabel: 'फसल स्कैन',
    monthlyPlansLabel: 'मासिक योजनाएं',
    topUpsLabel: 'टॉप-अप',
    whyUpgrade: 'अपग्रेड क्यों करें?',
    aiCropDoctorTitle: 'AI फसल डॉक्टर',
    aiCropDoctorSub: 'फोटो से तुरंत बीमारियों की पहचान करें',
    krishiAssistantTitle: 'कृषि सहायक',
    krishiAssistantSub: 'असीमित विशेषज्ञ खेती चैट',
    multiLingualTitle: 'बहुभाषी',
    multiLingualSub: '10+ स्थानीय भाषाओं में सहायता',
    expertPriorityTitle: 'विशेषज्ञ प्राथमिकता',
    expertPrioritySub: '3 गुना तेज जवाब पाएं',
    basicPlanTitle: 'बेसिक',
    proPlanTitle: 'प्रो',
    planPerk1: '50 AI चैट',
    planPerk2: '3 इमेज स्कैन',
    planPerk3: 'टॉप-अप उपलब्ध',
    planPerk4: '100 AI चैट',
    planPerk5: '10 इमेज स्कैन',
    planPerk6: '7 दिनी रोलओवर',
    planPerk7: 'मंडी सूचनाएं',
    addExtraCredits: 'अतिरिक्त क्रेडिट जोड़ें',
    topupDisclaimer: 'टॉप-अप क्रेडिट कभी समाप्त नहीं होते और आपके प्लान क्रेडिट खत्म होने के बाद ही उपयोग किए जाते हैं।',
    aiChatPacks: 'AI चैट पैक',
    imageScanPacks: 'इमेज स्कैन पैक',
    scanLabel: 'स्कैन',
    scansLabel: 'स्कैन',
    renewPlan: 'प्लान रिन्यू करें',
    buyCredits: 'क्रेडिट खरीदें',
    paymentSuccessTitle: 'भुगतान सफल',
    paymentSuccessSub: 'आपकी योजना और वॉलेट अपडेट कर दिए गए हैं।',
    completingTransaction: 'लेनदेन पूरा हो रहा है...',
    verifyingBank: 'बैंक से सत्यापन हो रहा है...',
    doNotCloseApp: 'कृपया ऐप बंद न करें',
    mostPopular: 'सबसे लोकप्रिय',
    currentPlan: 'वर्तमान योजना',
    // --- Chat History ---
    historyTitle: 'आपका इतिहास',
    historySubtitle: 'पहले विश्लेषण की गई फसलें और चैट',
    messagesLabel: 'संदेश',
    startNewConversation: 'नई बातचीत शुरू करें...',
    cropDiagnosisLabel: 'फसल निदान',
    noChatsFound: 'कोई चैट नहीं मिली',
    noScansFound: 'कोई स्कैन नहीं मिला',
    // --- Location Selector ---
    confirmLocationTitle: 'स्थान की पुष्टि करें',
    locationPermissionError: 'कृपया अपनी सेटिंग्स में स्थान अनुमति सक्षम करें।',
    autoLocationError: 'स्वचालित रूप से स्थान प्राप्त करने में असमर्थ। कृपया मैन्युअल रूप से खोजें।',
    locationHelpText: 'हमें अपने क्षेत्र के आधार पर अपनी कृषि सलाह को वैयक्तिकृत करने में मदद करें।',
    useCurrentLocation: 'वर्तमान स्थान का उपयोग करें (GPS)',
    selectManually: 'मैन्युअल रूप से चुनें',
    selectState: 'अपना राज्य चुनें',
    backToStates: 'राज्यों पर वापस जाएं',
    locationUsagePrivacy: 'हम आपके स्थान का उपयोग केवल सटीक मौसम और फसल डेटा प्रदान करने के लिए करते हैं।',
    locationErrorTitle: 'स्थान त्रुटि',
    confirm: 'पुष्टि करें',
  },
  Gujarati: {
    marketTitle: 'ખેતી બજાર',
    marketSubtitle: 'પ્રીમિયમ કૃષિ બજાર',
    searchPlaceholder: 'ખાતર, બીજ, સાધનો શોધો...',
    aiPick: 'AI પસંદગી',
    viewNow: 'હમણાં જુઓ',
    topFertilizers: 'ટોચના ખાતર',
    essentialSeeds: 'જરૂરી બીજ',
    modernTools: 'આધુનિક સાધનો',
    cropCare: 'ફસલ સંભાળ',
    noProductsFound: 'ઉત્પાદન મળ્યું નહીં',
    tryDifferentFilters: 'અલગ ફિલ્ટર અથવા સર્ચ શબ્દ અજમાવો.',
    cart: 'કાર્ટ',
    cartEmptyTitle: 'તમારું કાર્ટ ખાલી છે',
    cartEmptySubtitle: 'ખરીદી શરૂ કરવા માટે ઉત્પાદ ઉમેરો.',
    startShopping: 'ખરીદી શરૂ કરો',
    checkout: 'ચેકઆઉટ તરફ આગળ વધો',
    continueShopping: 'વધુ શોપિંગ કરો',
    subtotal: 'સબટોટલ',
    tax: 'કર',
    shipping: 'શિપિંગ',
    discount: 'છૂટ',
    total: 'કુલ',
    deliveryDetails: 'ડિલિવરી વિગતો',
    perKg: 'પ્રતિ કિલો',
    perPacket: 'પ્રતિ પેકેટ',
    perUnit: 'પ્રતિ યુનિટ',
    perLiter: 'પ્રતિ લીટર',
    // --- Crops ---
    Wheat: 'ઘઉં',
    Rice: 'ચોખા',
    Cotton: 'કપાસ',
    Mustard: 'સરસવ',
    Sugarcane: 'શેરડી',
    Maize: 'મકાઈ',
    Vegetables: 'શાકભાજી',
    Fruits: 'ફળો',
    // --- Use cases ---
    'Soil Health': 'જમીનનું સ્વાસ્થ્ય',
    Growth: 'વિકાસ',
    Yield: 'ઉપજ',
    'Pest Control': 'જીવાત નિયંત્રણ',
    'Disease Prevention': 'રોગ નિવારણ',
    // --- Units ---
    kg: 'કિલો',
    liter: 'લીટર',
    packet: 'પેકેટ',
    unit: 'યુનિટ',
    bag: 'કોથળો',
    // --- Others ---
    premiumPlan: 'પ્રીમિયમ પ્લાન',
    unlockFullPotential: 'સંપૂર્ણ ક્ષમતાને અનલોક કરો',
    advancedAIExperience: 'બહુભાષી માર્ગદર્શન સાથે અદ્યતન AI નો અનુભવ કરો',
    advancedAI: 'અદ્યતન AI',
    deeperReasoning: 'ઊંડી તર્ક ક્ષમતા',
    personalizedAdvisory: 'વ્યક્તિગત સલાહ',
    tailoredSuggestions: 'તમારી જરૂરિયાત મુજબ સૂચનો',
    fasterResponses: 'ઝડપી પ્રતિસાદ',
    priorityProcessing: 'પ્રાથમિકતાના આધારે પ્રોસેસિંગ',
    annualPlan: 'વાર્ષિક પ્લાન',
    monthlyPlan: 'માસિક પ્લાન',
    perYear: 'પ્રતિ વર્ષ',
    perMonth: 'પ્રતિ મહિને',
    save40: '40% બચાવો',
    secureCheckoutReady: 'સુરક્ષિત સબ્સ્ક્રિપ્શન ચેકઆઉટ તૈયાર છે',
    finishPaymentPrompt: 'બ્રાઉઝરમાં ચુકવણી પૂર્ણ કરો, પછી અહીં પાછા ફરો અને સ્થિતિ રિફ્રેશ કરો.',
    reopenSecureCheckout: 'સુરક્ષિત ચેકઆઉટ ફરીથી ખોલો',
    checkingPaymentStatus: 'ચુકવણીની સ્થિતિ તપાસી રહ્યા છીએ...',
    iCompletedPayment: 'મેં ચુકવણી પૂર્ણ કરી છે',
    openingSecureCheckout: 'સુરક્ષિત ચેકઆઉટ ખોલી રહ્યા છીએ...',
    continueToSecurePayment: 'સુરક્ષિત ચુકવણી માટે ચાલુ રાખો',
    plansActivateAfterVerification: 'પ્લાન ફક્ત ચુકવણીની ચકાસણી પછી જ સક્રિય થાય છે.',
    personalInfo: 'વ્યક્તિગત માહિતી',
    name: 'નામ',
    phone: 'ફોન નંબર',
    email: 'ઈમેલ',
    address: 'સરનામું',
    city: 'શહેર',
    state: 'રાજ્ય',
    pincode: 'પિનકોડ',
    orderSummary: 'ઓર્ડર સમરી',
    placeOrder: 'ઓર્ડર કરો',
    processing: 'પ્રોસેસિંગ...',
    orderFailed: 'ઓર્ડર નિષ્ફળ',
    fillRequiredFields: 'કૃપા કરીને જરૂરી વિગતો ભરો',
    orderSuccess: 'ઓર્ડર સફળ!',
    orderSuccessSubtitle: 'તમારો ઓર્ડર સફળતાપૂર્વક પ્લેસ થયો છે.',
    orderId: 'ઓર્ડર ID',
    deliveryInfo: 'ડિલીવરી માહિતી',
    deliveryInfoSubtitle: 'ટ્રેકિંગ વિગતો ઈમેલ પર મળશે.',
    viewOrderHistory: 'ઓર્ડર હિસ્ટરી જુઓ',
    noOrders: 'હજી સુધી કોઈ ઓર્ડર નથી',
    noOrdersSubtitle: 'તમે હજુ સુધી ઓર્ડર કર્યો નથી.',
    orderHistory: 'ઓર્ડર હિસ્ટરી',
    order: 'ઓર્ડર',
    statusPending: 'લાંબિત',
    statusConfirmed: 'પુષ્ટિ પામ્યું',
    statusShipped: 'ડિસપેચ કર્યું',
    statusDelivered: 'ડિલીવર્ડ',
    moreItems: 'વધુ આઇટમ',
    viewDetails: 'વિગતો જુઓ',
    productDetails: 'ઉત્પાદન વિગતો',
    back: 'પાછા',
    share: 'શેર',
    certified: 'પ્રમાણિત',
    reviews: 'રિવ્યૂ',
    unitsInStock: 'સ્ટોક યુનિટ',
    whatItDoes: 'આ શું કરે છે',
    whyUse: 'શા માટે વાપરવું',
    keyBenefits: 'મુખ્ય લાભો',
    farmerFriendlyFormula: 'ખેડૂત મૈત્રીપૂર્ણ ફોર્મ્યુલા',
    safeUsage: 'સૂચના સાથે સલામત ઉપયોગ',
    cropSupport: 'વિવિધ પરિસ્થિતિમાં ઉપયોગી',
    resultIn: 'પરિણામ',
    safety: 'સુરક્ષા',
    useCases: 'ઉપયોગ કિસ્સા',
    howToUse: 'કેવી રીતે વાપરવું',
    followLabel: 'માત્રા માટે લેબલ સૂચનાઓ અનુસરો.',
    bestFor: 'સૌથી સારું',
    applyRecommended: 'ભલામણ કરેલ તબક્કે લાગુ કરો.',
    expectedDelivery: 'અપેક્ષિત ડિલીવરી',
    repeatUsage: 'જરૂર મુજબ પુનરાવર્તન કરો.',
    farmerReviews: 'ખેડૂત સમીક્ષા',
    rating: 'રેટિંગ',
    addToCart: 'કાર્ટમાં ઉમેરો',
    buyNow: 'હમણાં ખરીદો',
    added: 'ઉમેરાયું',
    productAddedToCart: 'ઉત્પાદન કાર્ટમાં ઉમેરાયું',
    loginRequired: 'લોગિન જરૂરી',
    verifyOtpFirst: 'ઓર્ડર પહેલાં OTP ચકાસો.',
    orderCreated: 'ઓર્ડર બનાવ્યો',
    orderCreatedSuccess: 'બેકએન્ડએ ઓર્ડર સ્વીકાર્યો.',
    orderFailedAuth: 'ઓર્ડર માટે પ્રમાણિત સત્ર જરૂરી છે.',
    loginTitle: 'સ્વાગતું',
    loginSubtitle: 'શરૂ કરવા માટે તમારો મોબાઇલ નંબર દાખલ કરો',
    welcomeBack: 'સ્વાગતું',
    mobileNumber: 'મોબાઇલ નંબર',
    invalidPhone: 'એક માન્ય 10-15 અંક ફોન નંબર દાખલ કરો',
    getOtp: 'OTP મેળવો',
    sending: 'મોકલી રહ્યા છીએ...',
    sendOtpFailed: 'OTP મોકલવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.',
    goodMorning: 'શુભ પ્રભાત',
    todaysInsight: 'આજનો તુટકો',
    viewAll: 'બધું જુઓ',
    aiCropAssistant: 'AI ફસલ સહાયક',
    cropInsight: 'તમારુ ગણું ખેતર ભેજ સારી રીતે ધરી રહ્યું છે. સાંજે સિંચાયેટ પહેલાં હળવા પોષક તત્વોનો ઉપયોગ કરવાનું વિચારો.',
    tapToSpeak: 'બોલવા માટે ટેપ કરો',
    voiceFarmingHelp: 'વૉઇસ-પ્રથમ ખેતી મદદ',
    startListening: 'સાંભળવાનું શરૂ કરો',
    yourLanguageYourApp: 'તમારી ભાષા, તમારી ઍપ્લિકેશન',
    youCanChangeLanguageAnytime: 'તમે કોઈ પણ સમયે સેટિંગ્સમાં ભાષા બદલી શકો છો',
    getStarted: 'શરૂ કરો',
    profile: 'પ્રોફાઇલ',
    profileSettings: 'પ્રોફાઇલ સેટિંગ્સ',
    crops: 'ફસલો',
    landSize: 'જમીનનું કદ',
    landUnit: 'જમીનનો એકમ',
    location: 'સ્થાન',
    edit: 'સંપાદિત',
    save: 'સંગ્રહ',
    signOut: 'સાઇન આઉટ',
    language: 'ભાષા',
    farmDetails: 'ખેતર વિગતો',
    nameCannotBeEmpty: 'નામ ખાલી હોઈ શકતું નથી',
    selectLocation: 'સ્થાન પસંદ કરો',
    selectDistrict: 'જિલ્લો પસંદ કરો',
    failedToUpdateProfile: 'પ્રોફાઇલ અપડેટ કરવામાં નિષ્ફળ',
    wheat: 'ગણું',
    rice: 'ચોખું',
    cotton: 'કપાસ',
    mustard: 'સરસો',
    acre: 'એકર',
    hectare: 'હેક્ટર',
    chatTitle: 'ચેટ',
    greeting: 'સાલામતો! હું તમને કેવી રીતે મદદ કરી શકું?',
    enableMicrophone: 'માઇક્રોફોन ઍક્સેસ સક્ષમ કરો',
    microphoneNotAvailable: 'માઇક્રોફોન ઉપલબ્ધ છે નહીં',
    selectImage: 'તસવીર પસંદ કરો',
    takePhoto: 'ફોટો લો',
    chooseFromGallery: 'ગેલેરીમાંથી પસંદ કરો',
    sendMessage: 'મોકલો',
    recordVoice: 'અવાજ રેકોર્ડ કરો',
    sessionExpired: 'સત્ર સમાપ્ત થયો. કૃપા કરીને ફરી લૉગ ઇન કરો.',
    pleaseLoginAgain: 'કૃપા કરીને ફરી લૉગ ઇન કરો.',
    backendsConnectionError: 'બેકએન્ડ સુધી પહોંચાઈ શકાતું નથી. બેકએન્ડ સર્વર અને મોબાઇલ API નેટવર્ક તપાસો.',
    aiAssistant: 'AI સહાયક',
    online: 'ઓનલાઇન',
    today: 'આજ',
    imageAttached: 'છબી જોડાઇ',
    noAudio: 'કોઇ અવાજ નથી',
    noAudioPayload: 'આ જવાબમાં કોઇ અવાજ નથી.',
    typeHere: 'ગુજરાતી, અંગ્રેજીમાં ટાઇપ કરો...',
    audioPlayback: 'અવાજ પ્લેબેક',
    otpVerification: 'OTP ચકાસણી',
    enterTheCode: 'કોડ દાખલ કરો',
    verifySentence: 'ચકાસો',
    sentCodeTo: 'આমે કોડ મોકલ્યો છે',
    tooManyAttempts: 'ખૂબ જ નિષ્ફળ પ્રયાસો. કૃપા કરીને OTP ફરી મોકલો.',
    enterAllSixDigits: 'બધા 6 અંક દાખલ કરો',
    invalidOrExpiredOtp: 'અમાન્ય અથવા સમાપ્ત OTP',
    failedToResendOtp: 'OTP ફરી મોકલવામાં નિષ્ફળ',
    verifying: 'ચકાસણી જારી છે...',
    verify: 'ચકાસો',
    resend: 'ફરી મોકલો',
    devModeOnly: 'ફક્ત ડેવ મોડ:',
    resendOtpIn: 'OTP ફરી મોકલો',
    sendingResend: 'મોકલી રહ્યા છીએ...',
    didntReceiveCode: 'કોડ ન મળ્યો? ફરી મોકલો',
    secureConnection: 'સુરક્ષિત, એન્ક્રિપ્ટેડ જોડાણ',
    stepTwoOfThree: 'પગલું 2 (3 માંથી)',
    thinking: 'વિચારી રહ્યા છીએ...',
    listening: 'સાંભળી રહ્યા છીએ...',
    ready: 'બોલવા માટે ટેપ કરો',
    askYourCropQuestionIn: 'તમારો ફસલ પ્રશ્ન પૂછો',
    voiceResponse: 'AI જવાબ',
    stopAndSend: 'રોકો અને મોકલો',
    startRecording: 'રેકોર્ડિંગ શરૂ કરો',
    playbackFailed: 'પ્લેબેક નિષ્ફળ',
    voicePlaybackFailed: 'વૉઇસ રિસ્પોન્સ ચલાવી શકાયું નથી.',
    voiceRequestFailed: 'વૉઇસ અનુરોધ નિષ્ફળ',
    voiceRouteUnavailable: 'વૉઇસ સેવા હાલમાં ઉપલબ્ધ નથી. કૃપા કરીને પછી ફરી પ્રયાસ કરો.',
    chatTab: 'ચેટ',
    yourConversations: 'તમારી વાતચીત',
    searchChats: 'ચેટ શોધો...',
    noConversations: 'કોઈ વાતચીત મળી નથી',
    pastSessions: 'પાછલી વાતચીત',
    rename: 'નામ બદલો',
    archive: 'આર્કાઇવ',
    renameSession: 'નામ બદલો',
    enterSessionTitle: 'શીર્ષક દાખલ કરો',
    saving: 'સાચવી રહ્યા છીએ...',
    newChat: 'નવી ચેટ',
    seasonLabel: 'વર્તમાન સિઝન',
    retry: 'ફરી પ્રયાસ કરો',
    toolResult: 'ટૂલ પરિણામ',
    recommendedForYou: 'તમારા માટે ભલામણ કરેલ',
    sellerInfo: 'વિક્રેતાની માહિતી',
    callSeller: 'વિક્રેતાને કોલ કરો',
    chatWithSeller: 'ચેટ કરો',
    pickupAvailable: 'આ સ્થળે પિકઅપ ઉપલબ્ધ છે',
    verifiedSeller: 'અનાજ ચકાસાયેલ વિક્રેતા',
    mandi: 'મંડી, હિમાચલ પ્રદેશ',
    alerts: 'અલર્ટ',
    shareFailed: 'શેર કરવામાં નિષ્ફળ',
    unableToShare: 'અત્યારે ઉત્પાદનની વિગતો શેર કરવામાં અસમર્થ.',
    contactUnavailable: 'સંપર્ક અનુપલબ્ધ',
    noPublicPhone: 'આ વિક્રેતા પાસે જાહેર સંપર્ક નંબર નથી.',
    farmMap: 'ખેતરનો નકશો',
    soilMoisture: 'જમીનનો ભેજ',
    humidity: 'ભેજ',
    wind: 'પવન',
    weatherFeed: 'મફત હવામાન ફીડ',
    goodAfternoon: 'શુભ બપોર',
    goodEvening: 'શુભ સાંજ',
    goodNight: 'શુભ રાત્રિ',
    mandiSeedBank: 'મંડી સીડ બેંક',
    equipmentRental: 'ઇક્વિપમેન્ટ રેન્ટલ કંપની',
    fertilizerStore: 'ગ્રીન ફર્ટિલાઇઝર સ્ટોર',
    delivery: 'ડિલિવરી',
    selfPickup: 'સ્વયં પિકઅપ',
    paySecurely: 'સુરક્ષિત ચુકવણી કરો',
    checkoutUnavailable: 'ચેકઆઉટ અનુપલબ્ધ',
    unableToOpenCheckout: 'આ ઉપકરણ પર સુરક્ષિત ચેકઆઉટ પૃષ્ઠ ખોલવામાં અસમર્થ.',
    paymentFailed: 'ચુકવણી નિષ્ફળ',
    paymentPending: 'ચુકવણી બાકી',
    paymentCheckFailed: 'ચુકવણી તપાસ નિષ્ફળ ગઈ',
    completeYourProfile: 'તમારી પ્રોફાઇલ પૂર્ણ કરો',
    phoneNotAvailable: 'ફોન ઉપલબ્ધ નથી',
    incompleteProfile: 'અધૂરી પ્રોફાઇલ',
    premiumMember: 'પ્રીમિયમ સભ્ય',
    basicMember: 'બેઝિક સભ્ય',
    freeMember: 'મફત સભ્ય',
    editProfile: 'પ્રોફાઇલ સંપાદિત કરો',
    subscriptionStatus: 'સબ્સ્ક્રિપ્શન સ્થિતિ',
    premiumPlanActive: 'પ્રીમિયમ પ્લાન સક્રિય',
    basicPlanActive: 'બેઝિક પ્લાન સક્રિય',
    freePlan: 'મફત પ્લાન',
    manage: 'મેનેજ કરો',
    commerce: 'વાણિજ્ય',
    trackOrders: 'ઓર્ડર ટ્રેક કરો',
    checkStatusAndDeliveryUpdates: 'સ્થિતિ અને ડિલિવરી અપડેટ્સ તપાસો',
    myCart: 'મારું કાર્ટ',
    reviewItemsAndCheckout: 'વસ્તુઓની સમીક્ષા કરો અને ચેકઆઉટ કરો',
    preferences: 'પસંદગીઓ',
    appLanguage: 'એપ્લિકેશનની ભાષા',
    darkAppearance: 'ડાર્ક મોડ',
    on: 'ચાલુ',
    off: 'બંધ',
    securityAndData: 'સુરક્ષા અને ડેટા',
    privacySettings: 'ગોપનીયતા સેટિંગ્સ',
    close: 'બંધ કરો',
    enterYourName: 'તમારું નામ દાખલ કરો',
    cropsGrown: 'ઉગાડવામાં આવેલી ફસલો',
    enterLandSize: 'જમીનનું કદ દાખલ કરો',
    notSelected: 'પસંદ કરેલ નથી',
    change: 'બદલો',
    useCurrentLocationOrPickOnMap: 'વર્તમાન સ્થાનનો ઉપયોગ કરો અથવા નકશા પર પસંદ કરો',
    noApiKeyNeeded: 'કોઈ API કીની જરૂર નથી',
    saveChanges: 'ફેરફારો સાચવો',
    orContinueWith: 'અથવા આની સાથે આગળ વધો',
    google: 'Google',
    termsAndPrivacy: 'સેવાની શરતો અને ગોપનીયતા નીતિ',
    otpPreview: 'OTP પ્રૂર્વાવલોકન',
    yourOtp: 'તમારો OTP:',
    otpDisabled: 'આ વાતાવરણ માટે OTP પ્રૂર્વાવલોકન અક્ષમ છે.',
    agriAssistant: 'AI ખેતી મદદનીશ',
    optimizingFields: 'ખેતરોનું અનુકૂલન',
    poweredByAgri: 'અદ્યતન કૃષિ-ઈન્ટેલિજન્સ દ્વારા સંચਾਲિત',
    soilHealth: 'જમીનનું સ્વાસ્થ્ય',
    nutrientAnalysis: 'AI પોષક તત્વોનું વિશ્ਲੇષણ',
    pestControl: 'જીવાત નિયંત્રણ',
    smartDetection: 'સ્માર્ટ શોધ',
    yieldForecast: 'ઉપજનું પૂર્વાનੁમાન',
    marketPrediction: 'બજારની આગાહી',
    cropType: 'પાકનો પ્રકાર',
    personalizedSelection: 'વ્યક્તિગત પસંદગી',
    expertAiAdvice: 'નિષ્ણાત AI સલાહ મેળવો',
    continueToAdvisor: 'સલાહકાર પર આગળ વધો',
    krishiVani: 'કૃષિવાણી',
    talkToCrops: 'તમારા પાક સાથે વાત કરો',
    askInNative: 'તમારી માતૃભાષામાં પ્રશ્નો પૂછો અને AI સલાહ મેળવો.',
    continueButton: 'ચાલુ રાખો',
    recommendedProducts: 'ભલામણ કરેલ ઉત્પાદનો',
    listen: 'સાંભળો',
    limitReached: 'સીમા પૂર્ણ થઈ',
    cancel: 'રદ કરો',
    upgradeNow: 'હમણાં અપગ્રેડ કરો',
    stageSeedling: 'સીડલીંગ (નાના છોડ)',
    stageGrowing: 'વિકાસશીલ',
    stageFlowering: 'ફૂલ આવવાનો તબક્કો',
    stageFruiting: 'ફૂલ-ફળનો તબક્કો',
    stageHarvesting: 'લણણી (કાપણી)',
    soil: 'જમીન',
    smartAdvisory: 'સ્માર્ટ સલાહ',
    weatherOptimal: 'ખેતીકામ માટે ભલામણ કરેલ છે.',
    weatherDry: 'જમીન સૂકી છે. પિયત માટેનો આ શ્રેષ્ઠ સમય છે.',
    weatherSaturated: 'જમીન લથપથ છે. વધુ પાણી આપવાનું ટાળો.',
    weatherRainyAdvice: 'ઘરની અંદર રહો. કુદરતી પિયત માટે ઉત્તમ.',
    weatherClear: 'ચોખ્ખું આકાશ',
    weatherCloudy: 'વાદળછાયું',
    weatherPartlyCloudy: 'અંશતઃ વાદળછાયું',
    weatherRainy: 'વરસાદ પડી રહ્યો છે',
    weatherStormy: 'વાવાઝોડું',
    quickServices: 'ઝડપી સેવાઓ',
    weatherFoggy: 'ધુમ્મસ',
    later: 'નહિ, પછી',
    loading: 'લોડ થઈ રહ્યું છે...',
    unableToLoadPlan: 'યોજના લોડ કરવામાં અસમર્થ',
    checkConnection: 'તમારું કનેક્શન તપાસો',
    upgradeToPremium: 'પ્રીમિયમમાં અપગ્રેડ કરો',
    plan: 'પ્લાન',
    chats: 'ચેટ્સ',
    scans: 'સ્કેન',
    left: 'બાકી',
    expires: 'સમાપ્ત થાય છે',
    // --- Error Messages ---
    errConnection: 'નેટવર્ક સમસ્યા. કૃપા કરીને તમારું ઇન્ટરનેટ અથવા સિમ સિગ્નલ તપાસો.',
    errServerBusy: 'સર્વર અત્યારે વ્યસ્ત છે. કૃપા કરીને 2 મિનિટ પછી ફરી પ્રયાસ કરો.',
    errNoCredits: 'તમારા ક્રેડિટ સમાપ્ત થઈ ગયા છે. કૃપા કરીને ટોપ-અપ અથવા સબ્સ્ક્રાઇબ કરો.',
    errLimitReached: 'તમારી દૈનિક મર્યાદા પૂરી થઈ ગઈ છે. કૃપા કરીને અપગ્રેડ કરો.',
    errSubscriptionExpired: 'તમારો પ્લાન સમાપ્ત થઈ ગયો છે. કૃપા કરીને રિન્યૂ કરો.',
    errInvalidOtp: 'ખોટો કોડ. કૃપા કરીને મેસેજ તપાસો અને ફરી પ્રયાસ કરો.',
    errOtpExpired: 'કોડની સમય મર્યાદા સમાપ્ત થઈ ગઈ છે. કૃપા કરીને નવો કોડ મંગાવો.',
    errInvalidOtpSession: 'લોગિન સત્ર સમાપ્ત થઈ ગયું છે. કૃપા કરીને ફરી શરૂ કરો.',
    errAuth: 'લોગિન નિષ્ફળ ગયું. કૃપા કરીને ફરી પ્રયાસ કરો.',
    errForbidden: 'પરવાનગી નથી.',
    errNotFound: 'સેવા મળી નથી.',
    errUnknown: 'કંઈક ખોટું થયું. કૃપા કરીને એપ ફરીથી ખોલો.',
    // --- Subscription Screen ---
    subscriptionTitle: 'સબ્સ્ક્રિપ્શન',
    masterYourHarvest: 'તમારી ખેતીને શ્રેષ્ઠ બનાવો',
    subscriptionSubtitle: 'તમારી ઉપજમાં 30% સુધીનો વધારો કરવા માટે Anaaj.ai નો ઉપયોગ કરતા 50,000+ ખેડૂતો સાથે જોડાઓ.',
    remainingCredits: 'બાકી ક્રેડિટ',
    aiChatsLabel: 'AI ચેટ',
    cropScansLabel: 'પાક સ્કેન',
    monthlyPlansLabel: 'માસિક યોજનાઓ',
    topUpsLabel: 'ટોપ-અપ',
    whyUpgrade: 'અપગ્રેડ શા માટે કરવું?',
    aiCropDoctorTitle: 'AI પાક ડૉક્ટર',
    aiCropDoctorSub: 'ફોટા પરથી તરત જ રોગો ઓળખો',
    krishiAssistantTitle: 'કૃષિ સહાયક',
    krishiAssistantSub: 'અમર્યાદિત નિષ્ણાત ખેતી ચેટ',
    multiLingualTitle: 'બહુભાષી',
    multiLingualSub: '10+ સ્થાનિક ભારતીય ભાષાઓમાં સપોર્ટ',
    expertPriorityTitle: 'નિષ્ણાત અગ્રતા',
    expertPrioritySub: '3 ગણી ઝડપથી જવાબો મેળવો',
    basicPlanTitle: 'બેઝિક',
    proPlanTitle: 'પ્રો',
    planPerk1: '50 AI ચેટ',
    planPerk2: '3 ફોટો સ્કેન',
    planPerk3: 'ટોપ-અપ સક્ષમ',
    planPerk4: '100 AI ચેટ',
    planPerk5: '10 ફોટો સ્કેન',
    planPerk6: '7-દિવસ રોલઓવર',
    planPerk7: 'મંડી એલર્ટ',
    addExtraCredits: 'વધારાના ક્રેડિટ ઉમેરો',
    topupDisclaimer: 'ટોપ-અપ ક્રેડિટ ક્યારેય સમાપ્ત થતા નથી અને તમારા પ્લાન ક્રેડિટ પૂરા થયા પછી જ ઉપયોગમાં લેવાય છે.',
    aiChatPacks: 'AI ચેટ પેક',
    imageScanPacks: 'ફોટો સ્કેન પેક',
    scanLabel: 'સ્કેન',
    scansLabel: 'સ્કેન',
    renewPlan: 'પ્લાન રિન્યૂ કરો',
    buyCredits: 'ક્રેડિટ ખરીદો',
    paymentSuccessTitle: 'ચુકવણી સફળ',
    paymentSuccessSub: 'તમારી યોજના અને વોલેટ અપડેટ કરવામાં આવ્યા છે.',
    completingTransaction: 'વ્યવહાર પૂર્ણ કરી રહ્યા છીએ...',
    verifyingBank: 'બેંક સાથે ચકાસણી થઈ રહી છે...',
    doNotCloseApp: 'કૃપા કરીને એપ્લિકેશન બંધ કરશો નહીં',
    mostPopular: 'સૌથી લોકપ્રિય',
    currentPlan: 'હાલનો પ્લાન',
    // --- Chat History ---
    historyTitle: 'તમારો ઇતિહાસ',
    historySubtitle: 'અગાઉ વિશ્લેષણ કરેલ પાક અને ચેટ',
    messagesLabel: 'સંદેશા',
    startNewConversation: 'નવી વાતચીત શરૂ કરો...',
    cropDiagnosisLabel: 'પાક નિદાન',
    noChatsFound: 'કોઈ ચેટ મળી નથી',
    noScansFound: 'કોઈ સ્કેન મળ્યું નથી',
    // --- Location Selector ---
    confirmLocationTitle: 'સ્થાનની પુષ્ટિ કરો',
    locationPermissionError: 'કૃપા કરીને તમારી સેટિંગ્સમાં સ્થાન પરવાનગીઓ સક્ષમ કરો.',
    autoLocationError: 'આપમેળે સ્થાન મેળવવામાં અસમર્થ. કૃપા કરીને મેન્યુઅલી શોધો.',
    locationHelpText: 'અમને તમારા પ્રદેશના આધારે તમારી કૃષિ સલાહને વ્યક્તિગત કરવામાં મદદ કરો.',
    useCurrentLocation: 'વર્તમાન સ્થાનનો ઉપયોગ કરો (GPS)',
    selectManually: 'મેન્યુઅલી પસંદ કરો',
    selectState: 'તમારું રાજ્ય પસંદ કરો',
    backToStates: 'રાજ્યો પર પાછા જાઓ',
    locationUsagePrivacy: 'અમે તમારા સ્થાનનો ઉપયોગ ફક્ત સચોટ હવામાન અને પાકનો ડેટા પ્રદાન કરવા માટે કરીએ છીએ.',
    locationErrorTitle: 'સ્થાન ભૂલ',
    confirm: 'પુષ્ટિ કરો',
  },
  Punjabi: {
    marketTitle: 'ਮਾਰਕੀਟ',
    marketSubtitle: 'ਪ੍ਰੀਮੀਅਮ ਖੇਤੀ ਬਾਜ਼ਾਰ',
    searchPlaceholder: 'ਖਾਦ, ਬੀਜ, ਸਾਧਨ ਖੋਜੋ...',
    aiPick: 'AI ਚੋਣ',
    viewNow: 'ਹੁਣ ਵੇਖੋ',
    topFertilizers: 'ਸ੍ਰੇਸ਼ਠ ਖਾਦ',
    essentialSeeds: 'ਲੋੜੀਂਦੇ ਬੀਜ',
    modernTools: 'ਆਧੁਨਿਕ ਸਾਧਨ',
    cropCare: 'ਫਸਲ ਸੰਭਾਲ',
    noProductsFound: 'ਕੋਈ ਪ੍ਰੋਡਕਟ ਨਹੀਂ ਮਿਲਿਆ',
    tryDifferentFilters: 'ਵੱਖਰੇ ਫਿਲਟਰ ਜਾਂ ਖੋਜ ਸ਼ਬਦ ਅਜ਼ਮਾਓ।',
    cart: 'ਕਾਰਟ',
    cartEmptyTitle: 'ਤੁਹਾਡਾ ਕਾਰਟ ਖਾਲੀ ਹੈ',
    cartEmptySubtitle: 'ਖਰੀਦਾਰੀ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਪ੍ਰੋਡਕਟ ਜੋੜੋ।',
    startShopping: 'ਖਰੀਦਾਰੀ ਸ਼ੁਰੂ ਕਰੋ',
    checkout: 'ਚੈਕਆਉਟ ਤੇ ਜਾਓ',
    continueShopping: 'ਖਰੀਦਾਰੀ ਜਾਰੀ ਰੱਖੋ',
    subtotal: 'ਸਬਟੋਟਲ',
    tax: 'ਟੈਕਸ',
    shipping: 'ਸ਼ਿਪਿੰਗ',
    discount: 'ਛੂਟ',
    total: 'ਕੁੱਲ',
    deliveryDetails: 'ਡਿਲੀਵਰੀ ਵੇਰਵੇ',
    perKg: 'ਪ੍ਰਤੀ ਕਿਲੋ',
    perPacket: 'ਪ੍ਰਤੀ ਪੈਕੇਟ',
    perUnit: 'ਪ੍ਰਤੀ ਯੂਨਿਟ',
    perLiter: 'ਪ੍ਰਤੀ ਲੀਟਰ',
    // --- Crops ---
    Wheat: 'ਕਣਕ',
    Rice: 'ਝੋਨਾ (ਚਾਵਲ)',
    Cotton: 'ਨਰਮਾ (ਕਪਾਹ)',
    Mustard: 'ਸਰ੍ਹੋਂ',
    Sugarcane: 'ਗੰਨਾ',
    Maize: 'ਮੱਕੀ',
    Vegetables: 'ਸਬਜ਼ੀਆਂ',
    Fruits: 'ਫਲ',
    // --- Use cases ---
    'Soil Health': 'ਮਿੱਟੀ ਦੀ ਸਿਹત',
    Growth: 'ਵਾਧਾ',
    Yield: 'ਝਾੜ',
    'Pest Control': 'ਕੀੜੇਮਾਰ ਕੰਟਰੋਲ',
    'Disease Prevention': 'ਬਿਮਾਰੀ ਦੀ ਰੋਕਥਾਮ',
    // --- Units ---
    kg: 'ਕਿਲੋ',
    liter: 'ਲੀਟਰ',
    packet: 'ਪੈਕੇਟ',
    unit: 'ਯੂਨਿਟ',
    bag: 'ਬੋਰੀ',
    // --- Others ---
    premiumPlan: 'ਪ੍ਰੀਮੀਅਮ ਪਲਾਨ',
    unlockFullPotential: 'ਪੂਰੀ ਸਮਰੱਥਾ ਨੂੰ ਅਨਲੌਕ ਕਰੋ',
    advancedAIExperience: 'ਬਹੁ-ਭਾਸ਼ਾਈ ਮਾਰਗਦਰਸ਼ਨ ਦੇ ਨਾਲ ਉੱਨਤ AI ਦਾ ਅਨੁਭਵ ਕਰੋ',
    advancedAI: 'ਉੱਨਤ AI',
    deeperReasoning: 'ਡੂੰਘੀ ਤਰਕ ਸਮਰੱਥਾ',
    personalizedAdvisory: 'ਵਿਅਕਤੀਗਤ ਸਲਾਹ',
    tailoredSuggestions: 'ਤੁਹਾਡੀ ਲੋੜ ਅਨੁਸਾਰ ਸੁਝਾਅ',
    fasterResponses: 'ਤੇਜ਼ ਜਵਾਬ',
    priorityProcessing: 'ਪਹਿਲ ਦੇ ਅਧਾਰ ਤੇ ਪ੍ਰੋਸੈਸਿੰਗ',
    annualPlan: 'ਸਾਲਾਨਾ ਪਲਾਨ',
    monthlyPlan: 'ਮਾਸਿਕ ਪਲਾਨ',
    perYear: 'ਪ੍ਰਤੀ ਸਾਲ',
    perMonth: 'ਪ੍ਰਤੀ ਮਹੀਨਾ',
    save40: '40% ਬਚਾਓ',
    secureCheckoutReady: 'ਸੁਰੱਖਿਅਤ ਸਬਸਕ੍ਰਿਪਸ਼ਨ ਚੈੱਕਆਉਟ ਤਿਆਰ ਹੈ',
    finishPaymentPrompt: 'ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਭੁਗਤਾਨ ਪੂਰਾ ਕਰੋ, ਫਿਰ ਇੱਥੇ ਵਾਪਸ ਆਓ ਅਤੇ ਸਥਿਤੀ ਨੂੰ ਰਿਫ੍ਰੈਸ਼ ਕਰੋ।',
    reopenSecureCheckout: 'ਸੁਰੱਖਿਅਤ ਚੈੱਕਆਉਟ ਦੁਬਾਰਾ ਖੋਲ੍ਹੋ',
    checkingPaymentStatus: 'ਭੁਗਤਾਨ ਸਥਿਤੀ ਦੀ ਜਾਂਚ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...',
    iCompletedPayment: 'ਮੈਂ ਭੁਗਤਾਨ ਪੂਰਾ ਕਰ ਲਿਆ ਹੈ',
    openingSecureCheckout: 'ਸੁਰੱਖਿਅਤ ਚੈੱਕਆਉਟ ਖੋਲ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ...',
    continueToSecurePayment: 'ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ ਲਈ ਜਾਰੀ ਰੱਖੋ',
    plansActivateAfterVerification: 'ਪਲਾਨ ਸਿਰਫ ਭੁਗਤਾਨ ਦੀ ਪੁਸ਼ਟੀ ਤੋਂ ਬਾਅਦ ਸਰਗਰਮ ਹੁੰਦੇ ਹਨ।',
    personalInfo: 'ਨਿੱਜੀ ਜਾਣਕਾਰੀ',
    name: 'ਨਾਮ',
    phone: 'ਫੋਨ ਨੰਬਰ',
    email: 'ਈਮੇਲ',
    address: 'ਪਤਾ',
    city: 'ਸ਼ਹਿਰ',
    state: 'ਰਾਜ',
    pincode: 'ਪਿਨਕੋਡ',
    orderSummary: 'ਆਰਡਰ ਸੰਖੇਪ',
    placeOrder: 'ਆਰਡਰ ਕਰੋ',
    processing: 'ਪ੍ਰੋਸੈਸ ਹੋ ਰਿਹਾ...',
    orderFailed: 'ਆਰਡਰ ਅਸਫਲ',
    fillRequiredFields: 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੀ ਲੋੜੀਂਦੀ ਜਾਣਕਾਰੀ ਭਰੋ',
    orderSuccess: 'ਆਰਡਰ ਸਫਲ!',
    orderSuccessSubtitle: 'ਤੁਹਾਡਾ ਆਰਡਰ ਸਫਲਤਾਪੂਰਵਕ ਹੋ ਗਿਆ ਹੈ।',
    orderId: 'ਆਰਡਰ ID',
    deliveryInfo: 'ਡਿਲਿਵਰੀ ਜਾਣਕਾਰੀ',
    deliveryInfoSubtitle: 'ਟ੍ਰੈਕਿੰਗ ਵੇਰਵੇ ਤੁਹਾਡੇ ਈਮੇਲ ਤੇ ਭੇਜੇ ਜਾਣਗੇ।',
    viewOrderHistory: 'ਆਰਡਰ ਹਿਸਟਰੀ ਵੇਖੋ',
    noOrders: 'ਹਾਲੇ ਕੋਈ ਆਰਡਰ ਨਹੀਂ',
    noOrdersSubtitle: 'ਤੁਸੀਂ ਹਾਲੇ ਕੋਈ ਆਰਡਰ ਨਹੀਂ ਕੀਤਾ।',
    orderHistory: 'ਆਰਡਰ ਹਿਸਟਰੀ',
    order: 'ਆਰਡਰ',
    statusPending: 'ਬਕਾਇਆ',
    statusConfirmed: 'ਪੁਸ਼ਟੀ',
    statusShipped: 'ਭੇਜਿਆ ਗਿਆ',
    statusDelivered: 'ਡਿਲਿਵਰ',
    moreItems: 'ਹੋਰ ਆਈਟਮ',
    viewDetails: 'ਵੇਰਵਾ ਵੇਖੋ',
    productDetails: 'ਉਤਪਾਦ ਵੇਰਵਾ',
    back: 'ਵਾਪਸ',
    share: 'ਸ਼ੇਅਰ',
    certified: 'ਪ੍ਰਮਾਣਿਤ',
    reviews: 'ਸਮੀਖਿਆਵਾਂ',
    unitsInStock: 'ਸਟਾਕ ਯੂਨਿਟ',
    whatItDoes: 'ਇਹ ਕੀ ਕਰਦਾ ਹੈ',
    whyUse: 'ਕਿਉਂ ਵਰਤਣਾ',
    keyBenefits: 'ਮੁੱਖ ਫਾਇਦੇ',
    farmerFriendlyFormula: 'ਕਿਸਾਨ-ਮਿਤਰ ਫਾਰਮੂਲਾ',
    safeUsage: 'ਹਦਾਇਤਾਂ ਨਾਲ ਸੁਰੱਖਿਅਤ ਵਰਤੋਂ',
    cropSupport: 'ਵੱਖਰੀਆਂ ਸਥਿਤੀਆਂ ਲਈ ਉਚਿਤ',
    resultIn: 'ਨਤੀਜਾ',
    safety: 'ਸੁਰੱਖਿਆ',
    useCases: 'ਵਰਤੋਂ ਕੇਸ',
    howToUse: 'ਕਿਵੇਂ ਵਰਤਣਾ',
    followLabel: 'ਮਾਤਰਾ ਲਈ ਲੇਬਲ ਹਦਾਇਤਾਂ ਮਾਨੋ।',
    bestFor: 'ਸਭ ਤੋਂ ਵਧੀਆ',
    applyRecommended: 'ਸਿਫਾਰਸ਼ੀ ਪੜਾਅ ਤੇ ਲਗਾਓ।',
    expectedDelivery: 'ਅਨੁਮਾਨਿਤ ਡਿਲਿਵਰੀ',
    repeatUsage: 'ਲੋੜ ਅਨੁਸਾਰ ਦੁਹਰਾਓ।',
    farmerReviews: 'ਕਿਸਾਨ ਸਮੀਖਿਆਵਾਂ',
    rating: 'ਰੇਟਿੰਗ',
    addToCart: 'ਕਾਰਟ ਵਿੱਚ ਜੋੜੋ',
    buyNow: 'ਹੁਣ ਖਰੀਦੋ',
    added: 'ਜੋੜਿਆ ਗਿਆ',
    productAddedToCart: 'ਉਤਪਾਦ ਕਾਰਟ ਵਿੱਚ ਜੋੜਿਆ ਗਿਆ',
    loginRequired: 'ਲੋਗਇਨ ਲਾਜ਼ਮੀ',
    verifyOtpFirst: 'ਆਰਡਰ ਤੋਂ ਪਹਿਲਾਂ OTP ਤਸਦੀਕ ਕਰੋ।',
    orderCreated: 'ਆਰਡਰ ਬਣਿਆ',
    orderCreatedSuccess: 'ਬੈਕਐਂਡ ਨੇ ਆਰਡਰ ਮੰਨ ਲਿਆ।',
    orderFailedAuth: 'ਆਰਡਰ ਲਈ ਪ੍ਰਮਾਣਿਤ ਸੈਸ਼ਨ ਲੋੜੀਂਦਾ ਹੈ।',
    loginTitle: 'ਸਾਡਾ ਸਵਾਗਤ ਹੈ',
    loginSubtitle: 'ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਆਪਣਾ ਮੋਬਾਈਲ ਨਾਲੀ ਦਰਜ ਕਰੋ',
    welcomeBack: 'ਸਾਡਾ ਸਵਾਗਤ ਹੈ',
    mobileNumber: 'ਮੋਬਾਈਲ ਨਾਲੀ',
    invalidPhone: 'ਇਕ ਵੈਰ 10-15 ਅੰਕਾਂ ਦੀ ਫੋਨ ਨਾਲੀ ਦਰਜ ਕਰੋ',
    getOtp: 'OTP ਲਓ',
    sending: 'ਭੇਜ ਰਹੇ ਆਂ...',
    sendOtpFailed: 'OTP ਭੇਜਣਾ ਅਸਫਲ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    goodMorning: 'ਸ਼ੁਭ ਪ੍ਰਭਾਤ',
    todaysInsight: 'ਅੱਜ ਦੀ ਖਬਰ',
    viewAll: 'ਸਭ ਵੇਖੋ',
    aiCropAssistant: 'AI ਫਸਲ ਸਹਾਇਤਾ',
    cropInsight: 'ਤੁਹਾਡਾ ਕਣਕ ਦਾ ਖੇਤ ਨਮੀ ਨੂੰ ਚੰਗੀ ਤਰ੍ਹਾ ਸੰਭਾਲ ਰਿਹਾ ਹੈ। ਸ਼ਾਮ ਦੀ ਸਿੰਚਾਈ ਤੋਂ ਪਹਿਲਾਂ ਹਲਕੇ ਪੋਸ਼ਕ ਤੱਤਾਂ ਦਾ ਉਪਯੋਗ ਕਰਨ ਤੇ ਵਿਚਾਰ ਕਰੋ।',
    tapToSpeak: 'ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ',
    voiceFarmingHelp: 'ਵੌਇਸ-ਪਹਿਲੀ ਖੇਤੀ ਸਹਾਇਤਾ',
    startListening: 'ਸੁਣਨਾ ਸ਼ੁਰੂ ਕਰੋ',
    yourLanguageYourApp: 'ਤੁਹਾਡੀ ਭਾਸ਼ਾ, ਤੁਹਾਡੀ ਐਪ',
    youCanChangeLanguageAnytime: 'ਤੁਸੀਂ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਕਿਸੇ ਵੀ ਸਮੇਂ ਭਾਸ਼ਾ ਬਦਲ ਸਕਦੇ ਹੋ',
    getStarted: 'ਸ਼ੁਰੂ ਕਰੋ',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    profileSettings: 'ਪ੍ਰੋਫਾਈਲ ਸੈਟਿੰਗਾਂ',
    crops: 'ਫਸਲਾਂ',
    landSize: 'ਜ਼ਮੀਨ ਦਾ ਆਕਾਰ',
    landUnit: 'ਜ਼ਮੀਨ ਦਾ ਯੂਨਿਟ',
    location: 'ਲੋਕੇਸ਼ਨ',
    edit: 'ਸੰਸ਼ੋਧਿਤ ਕਰੋ',
    save: 'ਬਚਤ',
    signOut: 'ਸਾਈਨ ਆਊਟ',
    language: 'ਭਾਸ਼ਾ',
    farmDetails: 'ਖੇਤ ਦੀ ਜਾਣਕਾਰੀ',
    nameCannotBeEmpty: 'ਨਾਮ ਖਾਲੀ ਨਹੀਂ ਹੋ ਸਕਦਾ',
    selectLocation: 'ਲੋਕੇਸ਼ਨ ਚੁਣੋ',
    selectDistrict: 'ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ',
    failedToUpdateProfile: 'ਪ੍ਰੋਫਾਈਲ ਅਪਡੇਟ ਕਰਨਾ ਅਸਫਲ',
    wheat: 'ਕਣਕ',
    rice: 'ਚਾਵਲ',
    cotton: 'ਰੂਈ',
    mustard: 'ਸਾਰਸੋਂ',
    acre: 'ਏਕੜ',
    hectare: 'ਹੈਕਟਰ',
    chatTitle: 'ਚੈਟ',
    greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਨੂੰ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
    enableMicrophone: 'ਮਾਈਕਰੋਫੋਨ ਐਕਸੈਸ ਸਮਰਥ ਕਰੋ',
    microphoneNotAvailable: 'ਮਾਈਕਰੋਫੋਨ ਉਪਲਬਧ ਨਹੀਂ',
    selectImage: 'ਤਸਵੀਰ ਚੁਣੋ',
    takePhoto: 'ਤਸਵੀਰ ਲਓ',
    chooseFromGallery: 'ਗੇਲਰੀ ਤੋਂ ਚੁਣੋ',
    sendMessage: 'ਭੇਜੋ',
    recordVoice: 'ਆਵਾਜ਼ ਰਿਕਾਰਡ ਕਰੋ',
    sessionExpired: 'ਸੈਸ਼ਨ ਖ਼ਤਮ ਹੋ ਗਿਆ। ਮਿਹਰਬਾਨੀ ਨਾਲ ਦੁਬਾਰਾ ਲਾਗਇਨ ਕਰੋ।',
    pleaseLoginAgain: 'ਮਿਹਰਬਾਨੀ ਨਾਲ ਦੁਬਾਰਾ ਲਾਗਇਨ ਕਰੋ।',
    backendsConnectionError: 'ਬੈਕਐਂਡ ਤੱਕ ਪਹੂੰਚ ਨਹੀਂ ਸਕੇ। ਬੈਕਐਂਡ ਸਰਵਰ ਅਤੇ ਮੋਬਾਈਲ API ਨੈਟਵਰਕ ਦੀ ਜਾਂਚ ਕਰੋ।',
    aiAssistant: 'AI ਸਹਾਇਕ',
    online: 'ਆਨਲਾਈਨ',
    today: 'ਅੱਜ',
    imageAttached: 'ਤਸਵੀਰ ਜੁੜੀ ਹੋਈ',
    noAudio: 'ਕੋਈ ਆਡੀਓ ਨਹੀਂ',
    noAudioPayload: 'ਇਸ ਜਵਾਬ ਲਈ ਕੋਈ ਆਡੀਓ ਨਹੀਂ।',
    typeHere: 'ਪੰਜਾਬੀ, ਅੰਗ੍ਰੇਜ਼ੀ ਵਿੱਚ ਟਾਈਪ ਕਰੋ...',
    audioPlayback: 'ਆਡੀਓ ਪਲੇਬੈਕ',
    otpVerification: 'OTP ਤਸਦੀਕ',
    enterTheCode: 'ਕੋਡ ਦੀ ਪਾਲਣਾ ਕਰੋ',
    verifySentence: 'ਤਸਦੀਕ',
    sentCodeTo: 'ਅਸੀਂ ਕੋਡ ਭੇਜਿਆ ਹੈ',
    tooManyAttempts: 'ਬਹੁਤ ਸਾਰੀਆਂ ਅਸਫਲ ਕੋਸ਼ਿਸ਼ਾਂ। ਮਿਹਰਬਾਨੀ ਨਾਲ OTP ਦੁਬਾਰਾ ਭੇਜੋ।',
    enterAllSixDigits: 'ਸਭ 6 ਅੰਕ ਦੀ ਪਾਲਣਾ ਕਰੋ',
    invalidOrExpiredOtp: 'ਅਮਾਨਤ ਜਾਂ ਲਾਗੂ ਖਤਮ OTP',
    failedToResendOtp: 'OTP ਦੁਬਾਰਾ ਭੇਜਣਾ ਅਸਫਲ',
    verifying: 'ਤਸਦੀਕ ਜਾਰੀ ਹੈ...',
    verify: 'ਤਸਦੀਕ ਕਰੋ',
    resend: 'ਦੁਬਾਰਾ ਭੇਜੋ',
    devModeOnly: 'ਸਿਰਫ Dev ਮੋਡ:',
    resendOtpIn: 'OTP ਦੁਬਾਰਾ ਭੇਜੋ',
    sendingResend: 'ਭੇਜ ਰਹਾ ਹਾਂ...',
    didntReceiveCode: 'ਕੋਡ ਨਹੀਂ ਮਿਲਿਆ? ਦੁਬਾਰਾ ਭੇਜੋ',
    secureConnection: 'ਸੁਰੱਖਿਅਤ, ਐਨਕ੍ਰਿਪਟਡ ਸੰਪਰਕ',
    stepTwoOfThree: 'ਤਬਦਾ 2 (3 ਵਿੱਚੋਂ)',
    thinking: 'ਸੋਚ ਰਿਹਾ ਹੈ...',
    listening: 'ਸੁਣ ਰਿਹਾ ਹੈ...',
    ready: 'ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ',
    askYourCropQuestionIn: 'ਆਪਣਾ ਫਸਲ ਸੰਬੰਧੀ ਸਵਾਲ ਪੁੱਛੋ',
    voiceResponse: 'AI ਜਵਾਬ',
    stopAndSend: 'ਰੋਕੋ ਅਤੇ ਭੇਜੋ',
    startRecording: 'ਰਿਕਾਰਡਿੰਗ ਸ਼ੁਰੂ ਕਰੋ',
    playbackFailed: 'ਪਲੇਬੈਕ ਫੇਲ',
    voicePlaybackFailed: 'ਵੌਇਸ ਜਵਾਬ ਨਹੀਂ ਚਲਾ ਸਕਿਆ।',
    voiceRequestFailed: 'ਵੌਇਸ ਬੇਨਤੀ ਫੇਲ',
    voiceRouteUnavailable: 'ਵੌਇਸ ਸੇਵਾ ਇਸ ਵੇਲੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    chatTab: 'ਚੈਟ',
    yourConversations: 'ਤੁਹਾਡੀ ਗੱਲਬਾਤ',
    searchChats: 'ਚੈਟ ਖੋਜੋ...',
    noConversations: 'ਕੋਈ ਗੱਲਬਾਤ ਨਹੀਂ ਮਿਲੀ',
    pastSessions: 'ਪਿਛਲੀ ਗੱਲਬਾਤ',
    rename: 'ਨਾਂ ਬਦਲੋ',
    archive: 'ਆਰਕਾਈਵ',
    renameSession: 'ਨਾਂ ਬਦਲੋ',
    enterSessionTitle: 'ਸਿਰਲੇਖ ਦਰਜ ਕਰੋ',
    saving: 'ਸੇਵ ਕਰ ਰਿਹਾ ਹੈ...',
    newChat: 'ਨਵੀਂ ਚੈਟ',
    seasonLabel: 'ਮੌਜੂਦਾ ਮੌਸਮ',
    retry: 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    toolResult: 'ਟੂਲ ਨਤੀਜਾ',
    recommendedForYou: 'ਤੁਹਾਡੇ ਲਈ ਸਿਫਾਰਸ਼ੀ',
    sellerInfo: 'ਵਿਕਰੇਤਾ ਦੀ ਜਾਣਕਾਰੀ',
    callSeller: 'ਵਿਕਰੇਤਾ ਨੂੰ ਕਾਲ ਕਰੋ',
    chatWithSeller: 'ਚੈਟ ਕਰੋ',
    pickupAvailable: 'ਇਸ ਸਥਾਨ ਤੇ ਪਿਕਅਪ ਉਪਲਬਧ ਹੈ',
    verifiedSeller: 'ਅਨਾਜ ਤਸਦੀਕਸ਼ੁਦਾ ਵਿਕਰੇਤਾ',
    mandi: 'ਮੰਡੀ, ਹਿਮਾਚਲ ਪ੍ਰਦੇਸ਼',
    alerts: 'ਅਲਰਟ',
    shareFailed: 'ਸ਼ੇਅર ਕਰਨਾ ਅਸਫਲ ਰਿਹਾ',
    unableToShare: 'ਇਸ ਵੇਲੇ ਉਤਪਾਦ ਦੇ ਵੇਰਵੇ ਸ਼ੇਅਰ ਕਰਨ ਵਿੱਚ ਅਸਮਰੱਥ ਹੈ।',
    contactUnavailable: 'ਸੰਪਰਕ ਉਪਲਬਧ ਨਹੀਂ ਹੈ',
    noPublicPhone: 'ਇਸ ਵਿਕਰੇਤਾ ਕੋਲ ਜਨਤਕ ਸੰਪਰਕ ਨੰਬਰ ਨਹੀਂ ਹੈ।',
    farmMap: 'ਖੇਤ ਦਾ ਨਕਸ਼ਾ',
    soilMoisture: 'ਮਿੱਟੀ ਦੀ ਨਮੀ',
    humidity: 'ਨਮੀ',
    wind: 'ਹਵਾ',
    weatherFeed: 'ਮੁਫਤ ਮੌਸਮ ਫੀਡ',
    goodAfternoon: 'ਸ਼ੁਭ ਦੁਪਹਿਰ',
    goodEvening: 'ਸ਼ੁਭ ਸ਼ਾਮ',
    goodNight: 'ਸ਼ੁਭ ਰਾਤ',
    mandiSeedBank: 'ਮੰਡੀ ਬੀਜ ਬੈਂਕ',
    equipmentRental: 'ਉਪਕਰਣ ਕਿਰਾਇਆ ਕੰਪਨੀ',
    fertilizerStore: 'ਗ੍ਰੀਨ ਫਰਟੀਲਾਈਜ਼ਰ ਸਟੋਰ',
    delivery: 'ਡਿਲਿਵਰੀ',
    selfPickup: 'ਖੁਦ ਪਿਕਅਪ',
    paySecurely: 'ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ ਕਰੋ',
    checkoutUnavailable: 'ਚੈੱਕਆਉਟ ਉਪਲਬਧ ਨਹੀਂ ਹੈ',
    unableToOpenCheckout: 'ਇਸ ਡਿਵਾਈਸ ਤੇ ਸੁਰੱਖਿਅਤ ਚੈੱਕਆਉਟ ਪੇਜ ਖੋਲ੍ਹਣ ਵਿੱਚ ਅਸਮਰੱਥ।',
    paymentFailed: 'ਭੁਗਤਾਨ ਅਸਫਲ',
    paymentPending: 'ਭੁਗਤਾਨ ਬਕਾਇਆ',
    paymentCheckFailed: 'ਭੁਗਤਾਨ ਜਾਂਚ ਅਸਫਲ ਰਹੀ',
    completeYourProfile: 'ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਪੂਰੀ ਕਰੋ',
    phoneNotAvailable: 'ਫੋਨ ਉਪਲਬਧ ਨਹੀਂ ਹੈ',
    incompleteProfile: 'ਅਧੂਰੀ ਪ੍ਰੋਫਾਈਲ',
    premiumMember: 'ਪ੍ਰੀਮੀਅਮ ਮੈਂਬਰ',
    basicMember: 'ਬੇਸਿਕ ਮੈਂਬਰ',
    freeMember: 'ਮੁਫਤ ਮੈਂਬਰ',
    editProfile: 'ਪ੍ਰੋਫਾਈਲ ਸੋਧੋ',
    subscriptionStatus: 'ਸਬਸਕ੍ਰਿਪਸ਼ਨ ਸਥਿਤੀ',
    premiumPlanActive: 'ਪ੍ਰੀਮੀਅਮ ਪਲਾਨ ਸਰਗਰਮ',
    basicPlanActive: 'ਬੇਸਿਕ ਪਲਾਨ ਸਰਗਰਮ',
    freePlan: 'ਮੁਫਤ ਪਲਾਨ',
    manage: 'ਪ੍ਰਬੰਧਿਤ ਕਰੋ',
    commerce: 'ਵਣਜ',
    trackOrders: 'ਆਰਡਰ ਟ੍ਰੈਕ ਕਰੋ',
    checkStatusAndDeliveryUpdates: 'ਸਥਿਤੀ ਅਤੇ ਡਿਲਿਵਰੀ ਅਪਡੇਟਾਂ ਦੀ ਜਾਂਚ ਕਰੋ',
    myCart: 'ਮੇਰਾ ਕਾਰਟ',
    reviewItemsAndCheckout: 'ਆਈਟਮਾਂ ਦੀ ਸਮੀਖਿਆ ਕਰੋ ਅਤੇ ਚੈੱਕਆਉਟ ਕਰੋ',
    preferences: 'ਤਰਜੀਹਾਂ',
    appLanguage: 'ਐਪ ਦੀ ਭਾਸ਼ਾ',
    darkAppearance: 'ਡਾਰਕ ਮੋਡ',
    on: 'ਚਾਲੂ',
    off: 'ਬੰਦ',
    securityAndData: 'ਸੁਰੱਖਿਆ ਅਤੇ ਡੇਟਾ',
    privacySettings: 'ਪ੍ਰਾਈਵੇਸੀ ਸੈਟਿੰਗਾਂ',
    close: 'ਬੰਦ ਕਰੋ',
    enterYourName: 'ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ',
    cropsGrown: 'ਉਗਾਈਆਂ ਫਸਲਾਂ',
    enterLandSize: 'ਜ਼ਮੀਨ ਦਾ ਆਕਾਰ ਦਰਜ ਕਰੋ',
    notSelected: 'ਚੁਣਿਆ ਨਹੀਂ ਗਿਆ',
    change: 'ਬਦਲੋ',
    useCurrentLocationOrPickOnMap: 'ਮੌਜੂਦਾ ਟਿਕਾਣੇ ਦੀ ਵਰਤੋਂ ਕਰੋ ਜਾਂ ਨਕਸ਼ੇ ਤੇ ਚੁਣੋ',
    noApiKeyNeeded: 'ਕਿਸੇ API ਕੁੰਜੀ ਦੀ ਲੋੜ ਨਹੀਂ ਹੈ',
    saveChanges: 'ਬਦਲਾਅ ਸੇਵ ਕਰੋ',
    orContinueWith: 'ਜਾਂ ਇਸ ਨਾਲ ਜਾਰੀ ਰੱਖੋ',
    google: 'ਗੂਗਲ',
    termsAndPrivacy: 'ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ ਅਤੇ ਪ੍ਰਾਈਵੇਸੀ ਪਾਲਿਸੀ',
    otpPreview: 'OTP ਪੂਰਵ ਦਰਸ਼ਨ',
    yourOtp: 'ਤੁਹਾਡਾ OTP:',
    otpDisabled: 'ਇਸ ਵਾਤਾਵਰਣ ਲਈ OTP ਪੂਰਵ ਦਰਸ਼ਨ ਅਯੋਗ ਹੈ।',
    agriAssistant: 'AI ਖੇਤੀ ਸਹਾਇਕ',
    optimizingFields: 'ਖੇਤਾਂ ਦਾ ਅਨੁਕੂਲਨ',
    poweredByAgri: 'ਉੱਨਤ ਖੇਤੀ-ਇੰਟੈਲੀਜੈਂਸ ਦੁਆਰਾ ਸੰਚਾਲਿਤ',
    soilHealth: 'ਮਿੱਟੀ ਦੀ ਸਿਹਤ',
    nutrientAnalysis: 'AI ਪੋਸ਼ਕ ਤੱਤ ਵਿਸ਼ਲੇਸ਼ਣ',
    pestControl: 'ਕੀੜੇਮਾਰ ਕੰਟਰੋਲ',
    smartDetection: 'ਸਮਾਰਟ ਪਛਾਣ',
    yieldForecast: 'ਝਾੜ ਦਾ ਪੂਰਵ ਅਨੁਮਾਨ',
    marketPrediction: 'ਬਾਜ਼ਾਰ ਦੀ ਭਵਿੱਖਬਾਣੀ',
    cropType: 'ਫਸਲ ਦੀ ਕਿਸਮ',
    personalizedSelection: 'ਵਿਅਕਤੀਗਤ ਚੋਣ',
    expertAiAdvice: 'ਮਾਹਰ AI ਸਲਾਹ ਲਓ',
    continueToAdvisor: 'ਸਲਾਹਕਾਰ ਤੇ ਜਾਰੀ ਰੱਖੋ',
    krishiVani: 'ਕ੍ਰਿਸ਼ੀਵਾਣੀ',
    talkToCrops: 'ਆਪਣੀਆਂ ਫਸਲਾਂ ਨਾਲ ਗੱਲ ਕਰੋ',
    askInNative: 'ਆਪਣੀ ਮਾਂ ਬੋਲੀ ਵਿੱਚ ਸਵਾਲ ਪੁੱਛੋ ਅਤੇ AI ਸਲਾਹ ਲਓ।',
    continueButton: 'ਜਾਰੀ ਰੱਖੋ',
    recommendedProducts: 'ਸਿਫਾਰਸ਼ ਕੀਤੇ ਉਤਪਾਦ',
    listen: 'ਸੁਣੋ',
    limitReached: 'ਸੀਮਾ ਖ਼ਤਮ ਹੋ ਗਈ',
    cancel: 'ਰੱਦ ਕਰੋ',
    upgradeNow: 'ਹੁਣ ਅਪਗ੍ਰੇਡ ਕਰੋ',
    stageSeedling: 'ਪਨੀਰੀ (ਛੋਟੇ ਪੌਦੇ)',
    stageGrowing: 'ਵਧ ਰਿਹਾ ਹੈ',
    stageFlowering: 'ਫੁੱਲ ਆਉਣ ਦਾ ਪੜਾਅ',
    stageFruiting: 'ਫਲ ਲੱਗਣ ਦਾ ਪੜਾਅ',
    stageHarvesting: 'ਵਾਢੀ (ਕਟਾਈ)',
    soil: 'ਮਿੱਟੀ',
    smartAdvisory: 'ਸਮਾਰਟ ਸਲਾਹ',
    weatherOptimal: 'ਖੇਤੀ ਦੇ ਰੱਖ-ਰਖਾਅ ਲਈ ਹਾਲਾਤ ਅਨੁਕੂਲ ਹਨ।',
    weatherDry: 'ਮਿੱਟੀ ਸੁੱਕੀ ਹੈ। ਸਿੰਚਾਈ ਲਈ ਵਧੀਆ ਸਮਾਂ ਹੈ।',
    weatherSaturated: 'ਮਿੱਟੀ ਪੂਰੀ ਤਰ੍ਹਾਂ ਭਿੱਜੀ ਹੋਈ ਹੈ। ਹੋਰ ਪਾਣੀ ਦੇਣ ਤੋਂ ਬਚੋ।',
    weatherRainyAdvice: 'ਘਰ ਦੇ ਅੰਦਰ ਰਹੋ. ਕੁਦਰਤੀ ਸਿੰਚਾਈ ਲਈ ਬਹੁਤ ਵਧੀਆ ਹੈ।',
    weatherClear: 'ਸਾਫ਼ ਅਸਮਾਨ',
    weatherCloudy: 'ਬੱਦਲਵਾਈ',
    weatherPartlyCloudy: 'ਅੰਸ਼ਕ ਰੂਪ ਵਿੱਚ ਬੱਦਲ',
    weatherRainy: 'ਬਾਰਿਸ਼ ਹੋ ਰਹੀ ਹੈ',
    weatherStormy: 'ਤੂਫ਼ਾਨ',
    quickServices: 'ਤੁਰੰਤ ਸੇਵਾਵਾਂ',
    weatherFoggy: 'ਧੁੰਦ',
    later: 'ਨਹੀਂ, ਬਾਅਦ ਵਿੱਚ',
    loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    unableToLoadPlan: 'ਯੋਜਨਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਮਰੱਥ',
    checkConnection: 'ਆਪਣਾ ਕਨੈਕਸ਼ਨ ਚੈੱਕ ਕਰੋ',
    upgradeToPremium: 'ਪ੍ਰੀਮੀਅਮ ਵਿੱਚ ਅੱਪਗ੍ਰੇਡ ਕਰੋ',
    plan: 'ਪਲਾਨ',
    chats: 'ਚੈਟ',
    scans: 'ਸਕੈਨ',
    left: 'ਬਾਕੀ',
    expires: 'ਖਤਮ ਹੁੰਦਾ ਹੈ',
    // --- Error Messages ---
    errConnection: 'ਨੈੱਟਵਰਕ ਦੀ ਸਮੱਸਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਇੰਟਰਨੈੱਟ ਜਾਂ ਸਿਮ ਸਿਗਨਲ ਚੈੱਕ ਕਰੋ।',
    errServerBusy: 'ਸਰਵਰ ਬਹੁਤ ਰੁੱਝਿਆ ਹੋਇਆ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ 2 ਮਿੰਟਾਂ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    errNoCredits: 'ਤੁਹਾਡੇ ਕ੍ਰੈਡਿਟ ਖਤਮ ਹੋ ਗਏ ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਟੌਪ-ਅੱਪ ਜਾਂ ਸਬਸਕ੍ਰਾਈਬ ਕਰੋ।',
    errLimitReached: 'ਤੁਹਾਡੀ ਰੋਜ਼ਾਨਾ ਦੀ ਸੀਮਾ ਪੂਰੀ ਹੋ ਗਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਅੱਪਗ੍ਰੇਡ ਕਰੋ।',
    errSubscriptionExpired: 'ਤੁਹਾਡਾ ਪਲਾਨ ਖਤਮ ਹੋ ਗਿਆ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਰੀਨਿਊ ਕਰੋ।',
    errInvalidOtp: 'ਗਲਤ ਕੋਡ। ਕਿਰਪਾ ਕਰਕੇ ਐਸਐਮਐਸ ਚੈੱਕ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    errOtpExpired: 'ਕੋਡ ਦੀ ਮਿਆਦ ਖਤਮ ਹੋ ਗਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਨਵਾਂ ਕੋਡ ਮੰਗਵਾਓ।',
    errInvalidOtpSession: 'ਸੈਸ਼ਨ ਖ਼ਤਮ ਹੋ ਗਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਲੌਗਇਨ ਕਰੋ।',
    errAuth: 'ਲੌਗਇਨ ਅਸਫਲ ਰਿਹਾ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    errForbidden: 'ਪਹੁੰਚ ਦੀ ਮਨਾਹੀ ਹੈ।',
    errNotFound: 'ਸੇਵਾ ਨਹੀਂ ਮਿਲੀ।',
    errUnknown: 'ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਐਪ ਨੂੰ ਦੁਬਾਰਾ ਚਾਲੂ ਕਰੋ।',
    // --- Subscription Screen ---
    subscriptionTitle: 'ਗਾਹਕੀ',
    masterYourHarvest: 'ਆਪਣੀ ਫਸਲ ਨੂੰ ਬਿਹਤਰ ਬਣਾਓ',
    subscriptionSubtitle: 'ਆਪਣੀ ਉਪਜ ਨੂੰ 30% ਤੱਕ ਵਧਾਉਣ ਲਈ Anaaj.ai ਦੀ ਵਰਤੋਂ ਕਰਨ ਵਾਲੇ 50,000+ ਕਿਸਾਨਾਂ ਨਾਲ ਜੁੜੋ।',
    remainingCredits: 'ਬਾਕੀ ਕ੍ਰੈਡਿਟ',
    aiChatsLabel: 'AI ਚੈਟ',
    cropScansLabel: 'ਫਸਲ ਸਕੈਨ',
    monthlyPlansLabel: 'ਮਾਸਿਕ ਯੋਜਨਾਵਾਂ',
    topUpsLabel: 'ਟਾਪ-ਅਪ',
    whyUpgrade: 'ਅਪਗ੍ਰੇਡ ਕਿਉਂ ਕਰੀਏ?',
    aiCropDoctorTitle: 'AI ਫਸਲ ਡਾਕਟਰ',
    aiCropDoctorSub: 'ਫੋਟੋ ਤੋਂ ਤੁਰੰਤ ਬਿਮਾਰੀਆਂ ਦੀ ਪਛਾਣ ਕਰੋ',
    krishiAssistantTitle: 'ਖੇਤੀ ਸਹਾਇਕ',
    krishiAssistantSub: 'ਅਸੀਮਤ ਮਾਹਿਰ ਖੇਤੀ ਚੈੱਟ',
    multiLingualTitle: 'ਬਹੁ-ਭਾਸ਼ਾਈ',
    multiLingualSub: '10+ ਸਥਾਨਕ ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਸਹਾਇਤਾ',
    expertPriorityTitle: 'ਮਾਹਿਰ ਪਹਿਲ',
    expertPrioritySub: '3 ਗੁਣਾ ਤੇਜ਼ ਜਵਾਬ ਪ੍ਰਾਪਤ ਕਰੋ',
    basicPlanTitle: 'ਬੇਸਿਕ',
    proPlanTitle: 'ਪ੍ਰੋ',
    planPerk1: '50 AI ਚੈਟ',
    planPerk2: '3 ਫੋਟੋ ਸਕੈਨ',
    planPerk3: 'ਟਾਪ-ਅਪ ਉਪਲਬਧ',
    planPerk4: '100 AI ਚੈਟ',
    planPerk5: '10 ਫੋਟੋ ਸਕੈਨ',
    planPerk6: '7 ਦਿਨ ਰੋਲਓਵਰ',
    planPerk7: 'ਮੰਡੀ ਅਲਰਟ',
    addExtraCredits: 'ਵਾਧੂ ਕ੍ਰੈਡਿਟ ਜੋੜੋ',
    topupDisclaimer: 'ਟਾਪ-ਅਪ ਕ੍ਰੈਡਿਟ ਕਦੇ ਖਤਮ ਨਹੀਂ ਹੁੰਦੇ ਅਤੇ ਤੁਹਾਡੇ ਪਲਾਨ ਕ੍ਰੈਡਿਟ ਖਤਮ ਹੋਣ ਤੋਂ ਬਾਅਦ ਹੀ ਵਰਤੇ ਜਾਂਦੇ ਹਨ।',
    aiChatPacks: 'AI ਚੈਟ ਪੈਕ',
    imageScanPacks: 'ਫੋਟੋ ਸਕੈਨ ਪੈਕ',
    scanLabel: 'ਸਕੈਨ',
    scansLabel: 'ਸਕੈਨ',
    renewPlan: 'ਪਲਾਨ ਰੀਨਿਊ ਕਰੋ',
    buyCredits: 'ਕ੍ਰੈਡਿਟ ਖਰੀਦੋ',
    paymentSuccessTitle: 'ਭੁਗਤਾਨ ਸਫਲ',
    paymentSuccessSub: 'ਤੁਹਾਡਾ ਪਲਾਨ ਅਤੇ ਵਾਲਿਟ ਅਪਡੇਟ ਹੋ ਗਏ ਹਨ।',
    completingTransaction: 'ਲੈਣ-ਦੇਣ ਪੂਰਾ ਹੋ ਰਿਹਾ ਹੈ...',
    verifyingBank: 'ਬੈਂਕ ਨਾਲ ਤਸਦੀਕ ਹੋ ਰਹੀ ਹੈ...',
    doNotCloseApp: 'ਕਿਰਪਾ ਕਰਕੇ ਐਪ ਬੰਦ ਨਾ ਕਰੋ',
    mostPopular: 'ਸਭ ਤੋਂ ਮਸ਼ਹੂਰ',
    currentPlan: 'ਮੌਜੂਦਾ ਪਲਾਨ',
    // --- Chat History ---
    historyTitle: 'ਤੁਹਾਡਾ ਇਤਿਹਾਸ',
    historySubtitle: 'ਪਹਿਲਾਂ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤੀਆਂ ਫਸਲਾਂ ਅਤੇ ਚੈਟ',
    messagesLabel: 'ਸੁਨੇਹੇ',
    startNewConversation: 'ਨਵੀਂ ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ...',
    cropDiagnosisLabel: 'ਫਸਲ ਨਿਦਾਨ',
    noChatsFound: 'ਕੋਈ ਚੈਟ ਨਹੀਂ ਮਿਲੀ',
    noScansFound: 'ਕੋਈ ਸਕੈਨ ਨਹੀਂ ਮਿਲੀ',
    // --- Location Selector ---
    confirmLocationTitle: 'ਟਿਕਾਣੇ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
    locationPermissionError: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀਆਂ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਟਿਕਾਣਾ ਇਜਾਜ਼ਤਾਂ ਨੂੰ ਸਮਰੱਥ ਕਰੋ।',
    autoLocationError: 'ਟਿਕਾਣਾ ਆਪਣੇ ਆਪ ਪ੍ਰਾਪਤ ਕਰਨ ਵਿੱਚ ਅਸਮਰੱਥ। ਕਿਰਪਾ ਕਰਕੇ ਮੈਨੂਅਲ ਰੂਪ ਵਿੱਚ ਖੋਜ ਕਰੋ।',
    locationHelpText: 'ਸਾਨੂੰ ਤੁਹਾਡੇ ਖੇਤਰ ਦੇ ਅਧਾਰ \'ਤੇ ਤੁਹਾਡੀ ਖੇਤੀਬਾੜੀ ਸਲਾਹ ਨੂੰ ਵਿਅਕਤੀਗਤ ਬਣਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰੋ।',
    useCurrentLocation: 'ਮੌਜੂਦਾ ਟਿਕਾਣਾ ਵਰਤੋ (GPS)',
    selectManually: 'ਮੈਨੂਅਲ ਰੂਪ ਵਿੱਚ ਚੁਣੋ',
    selectState: 'ਆਪਣਾ ਰਾਜ ਚੁਣੋ',
    backToStates: 'ਰਾਜਾਂ \'ਤੇ ਵਾਪਸ ਜਾਓ',
    locationUsagePrivacy: 'ਅਸੀਂ ਤੁਹਾਡੇ ਟਿਕਾਣੇ ਦੀ ਵਰਤੋਂ ਸਿਰਫ਼ ਸਹੀ ਮੌਸਮ ਅਤੇ ਫਸਲ ਦਾ ਡੇਟਾ ਪ੍ਰਦਾਨ ਕਰਨ ਲਈ ਕਰਦੇ ਹਾਂ।',
    locationErrorTitle: 'ਟਿਕਾਣਾ ਗਲਤੀ',
    confirm: 'ਪੁਸ਼ਟੀ ਕਰੋ',
  },
};

export function t(language: AppLanguage, key: TranslationKey): string {
  return translations[language]?.[key] ?? translations.English[key];
}

export function localeForLanguage(language: AppLanguage): string {
  if (language === 'Hindi') return 'hi-IN';
  if (language === 'Gujarati') return 'gu-IN';
  if (language === 'Punjabi') return 'pa-IN';
  return 'en-IN';
}
