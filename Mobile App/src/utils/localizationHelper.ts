import { t } from '../constants/localization';
import { Product } from '../types/api';

/**
 * Valid language keys used in the app
 */
export type AppLanguage = 'English' | 'Hindi' | 'Gujarati' | 'Punjabi';

/**
 * Returns localized content for a product based on the selected language.
 * Falls back to English if the localized version is missing.
 */
export function getLocalizedProductContent(product: Product, language: AppLanguage) {
  const isHi = language === 'Hindi';
  const isGu = language === 'Gujarati';
  const isPa = language === 'Punjabi';

  // Helper to translate known tags/crops/units
  const translateTags = (tags: string[] = []) => {
    return tags.map(tag => {
      // Check if tag is a key in our localization
      // If t() returns the key itself, it means it's not translated (or translated to itself)
      const translated = t(language, tag as any);
      return translated || tag;
    });
  };

  return {
    name: (isHi ? product.nameHi : isGu ? product.nameGu : isPa ? product.namePa : product.name) || product.name,
    description: (isHi ? product.descriptionHi : isGu ? product.descriptionGu : isPa ? product.descriptionPa : product.description) || product.description,
    category: (isHi ? product.categoryHi : isGu ? product.categoryGu : isPa ? product.categoryPa : product.category) || product.category,
    
    subCategory: (isHi ? product.subCategoryHi : isGu ? product.subCategoryGu : isPa ? product.subCategoryPa : product.subCategory) || product.subCategory,
    unit: (isHi ? product.unitHi : isGu ? product.unitGu : isPa ? product.unitPa : product.unit) || product.unit,
    deliveryTime: (isHi ? product.inventory?.deliveryTimeHi : isGu ? product.inventory?.deliveryTimeGu : isPa ? product.inventory?.deliveryTimePa : product.inventory?.deliveryTime) || product.inventory?.deliveryTime,

    // Farmer Friendly Info sub-fields
    whyUse: (isHi ? product.farmerFriendlyInfo?.whyUseHi : 
             isGu ? product.farmerFriendlyInfo?.whyUseGu : 
             isPa ? product.farmerFriendlyInfo?.whyUsePa : 
             product.farmerFriendlyInfo?.whyUse) || product.farmerFriendlyInfo?.whyUse,
             
    howToUse: (isHi ? product.farmerFriendlyInfo?.howToUseHi : 
               isGu ? product.farmerFriendlyInfo?.howToUseGu : 
               isPa ? product.farmerFriendlyInfo?.howToUsePa : 
               product.farmerFriendlyInfo?.howToUse) || product.farmerFriendlyInfo?.howToUse,
               
    resultTime: (isHi ? product.farmerFriendlyInfo?.resultTimeHi : 
                 isGu ? product.farmerFriendlyInfo?.resultTimeGu : 
                 isPa ? product.farmerFriendlyInfo?.resultTimePa : 
                 product.farmerFriendlyInfo?.resultTime) || product.farmerFriendlyInfo?.resultTime,
                 
    safety: (isHi ? product.farmerFriendlyInfo?.safetyHi : 
             isGu ? product.farmerFriendlyInfo?.safetyGu : 
             isPa ? product.farmerFriendlyInfo?.safetyPa : 
             product.farmerFriendlyInfo?.safety) || product.farmerFriendlyInfo?.safety,
    
    bestForCrops: translateTags(product.farmerFriendlyInfo?.bestForCrops),
    useCases: translateTags(product.aiMetadata?.useCases || []),
  };
}
