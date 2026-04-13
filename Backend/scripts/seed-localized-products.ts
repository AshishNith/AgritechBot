import 'dotenv/config';
import mongoose from 'mongoose';
import { Product } from '../src/models/Product';
import { connectDB, disconnectDB } from '../src/config/db';
import { logger } from '../src/utils/logger';

async function seed() {
  try {
    await connectDB();
    logger.info('Connected to DB for seeding...');

    const products = await Product.find({});
    logger.info(`Found ${products.length} products to localize.`);

    for (const product of products) {
      const name = product.name.toLowerCase();
      
      // Basic translation mapping for demonstration
      if (name.includes('urea') || name.includes('fertilizer')) {
        product.nameHi = 'यूरिया उर्वरक';
        product.nameGu = 'યુરિયા ખાતર';
        product.namePa = 'ਯੂਰੀਆ ਖਾਦ';
        product.descriptionHi = 'फसलों के लिए उच्च गुणवत्ता वाला नाइट्रोजन स्रोत।';
        product.descriptionGu = 'પાક માટે ઉચ્ચ ગુણવત્તાયુક્ત નાઇટ્રોજન સ્ત્રોત.';
        product.descriptionPa = 'ਫਸਲਾਂ ਲਈ ਉੱਚ ਗੁਣਵੱਤਾ ਵਾਲਾ ਨਾਈਟ੍ਰੋਜਨ ਸਰੋਤ।';
        product.unitHi = 'किलो';
        product.unitGu = 'કિલો';
        product.unitPa = 'ਕਿਲੋ';
        product.subCategoryHi = 'खनिज खाद';
        product.subCategoryGu = 'ખનીજ ખાતર';
        product.subCategoryPa = 'ਖਣਿਜ ਖਾਦ';
        
        if (product.inventory) {
          product.inventory.deliveryTimeHi = '२-३ दिन';
          product.inventory.deliveryTimeGu = '૨-૩ દિવસ';
          product.inventory.deliveryTimePa = '2-3 ਦਿਨ';
        }
          product.farmerFriendlyInfo.whyUseHi = 'पौधों की तेज वृद्धि के लिए।';
          product.farmerFriendlyInfo.whyUseGu = 'છોડના ઝડપી વિકાસ માટે.';
          product.farmerFriendlyInfo.whyUsePa = 'ਪੌਦਿਆਂ ਦੇ ਤੇਜ਼ ਵਾਧੇ ਲਈ।';
          product.farmerFriendlyInfo.howToUseHi = 'बुआई के समय या खड़ी फसल में छिड़कें।';
          product.farmerFriendlyInfo.howToUseGu = 'વાવણી વખતે અથવા ઉભા પાકમાં છંટકાવ કરો.';
          product.farmerFriendlyInfo.howToUsePa = 'ਬਿਜਾਈ ਵੇਲੇ ਜਾਂ ਖੜ੍ਹੀ ਫ਼ਸਲ ਵਿੱਚ ਛਿੜਕਾਅ ਕਰੋ।';
          product.farmerFriendlyInfo.resultTimeHi = '५-७ दिन';
          product.farmerFriendlyInfo.resultTimeGu = '૫-૭ દિવસ';
          product.farmerFriendlyInfo.resultTimePa = '5-7 ਦਿਨ';
          product.farmerFriendlyInfo.safetyHi = 'बच्चों से दूर रखें।';
          product.farmerFriendlyInfo.safetyGu = 'બાળકોથી દૂર રાખો.';
          product.farmerFriendlyInfo.safetyPa = 'ਬੱਚਿਆਂ ਤੋਂ ਦੂਰ ਰੱਖੋ।';
        }
      } else if (name.includes('seed') || name.includes('hybrid')) {
        product.nameHi = 'हाइब्रिड बीज';
        product.nameGu = 'હાઇબ્રિડ બીજ';
        product.namePa = 'ਹਾਈਬ੍ਰਿਡ ਬੀਜ';
        product.descriptionHi = 'अधिक उपज देने वाले उन्नत संकर बीज।';
        product.descriptionGu = 'વધુ ઉપજ આપતા અદ્યતન સંકર બીજ.';
        product.descriptionPa = 'ਵਧੇਰੇ ਝਾੜ ਦੇਣ ਵਾਲੇ ਉੱਨਤ ਹਾਈਬ੍ਰਿਡ ਬੀਜ।';
        product.unitHi = 'पैकेट';
        product.unitGu = 'પેકેટ';
        product.unitPa = 'ਪੈਕੇਟ';
        product.subCategoryHi = 'उन्नत बीज';
        product.subCategoryGu = 'અદ્યતન બીજ';
        product.subCategoryPa = 'ਉੱਨਤ ਬੀਜ';
        
        if (product.inventory) {
          product.inventory.deliveryTimeHi = '३-५ दिन';
          product.inventory.deliveryTimeGu = '૩-૫ દિવસ';
          product.inventory.deliveryTimePa = '3-5 ਦਿਨ';
        }
          product.farmerFriendlyInfo.whyUseHi = 'अधिक पैदावार के लिए।';
          product.farmerFriendlyInfo.whyUseGu = 'વધુ ઉપજ માટે.';
          product.farmerFriendlyInfo.whyUsePa = 'ਵਧੇਰੇ ਪੈਦਾਵਾਰ ਲਈ।';
          product.farmerFriendlyInfo.howToUseHi = 'नम मिट्टी में २-३ सेमी गहराई पर बोएं।';
          product.farmerFriendlyInfo.howToUseGu = 'ભેજવાળી જમીનમાં ૨-૩ સેમી ઊંડાઈએ વાવો.';
          product.farmerFriendlyInfo.howToUsePa = 'ਸਿੱਲ੍ਹੀ ਮਿੱਟੀ ਵਿੱਚ 2-3 ਸੈਂਟੀਮੀਟਰ ਡੂੰਘਾਈ ਤੇ ਬੀਜੋ।';
          product.farmerFriendlyInfo.resultTimeHi = '१०-१२ दिन अंकुरण';
          product.farmerFriendlyInfo.resultTimeGu = '૧૦-૧૨ દિવસ અંકુરણ';
          product.farmerFriendlyInfo.resultTimePa = '10-12 ਦਿਨ ਪੁੰਗਰਨਾ';
        }
      } else {
        // Generic fallback for others
        product.nameHi = product.name;
        product.nameGu = `${product.name} (Gujarati)`;
        product.namePa = `${product.name} (Punjabi)`;
        product.descriptionHi = product.description;
        product.descriptionGu = `${product.description} (Gujarati Translation)`;
        product.descriptionPa = `${product.description} (Punjabi Translation)`;
      }

      await product.save();
    }

    logger.info('Successfully updated products with localized data.');
  } catch (error) {
    logger.error({ error }, 'Seeding failed');
  } finally {
    await disconnectDB();
  }
}

seed();
