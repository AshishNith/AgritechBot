// Mock Crop Database API
export async function getCropAdvisory(query: string): Promise<string> {
    const lowercaseQuery = query.toLowerCase();

    // Simulated Database responses
    if (lowercaseQuery.includes('punjab') && lowercaseQuery.includes('soil')) {
        return "Crop Advisory: Based on alluvial soil in Punjab, Wheat and Paddy are highly recommended.";
    }
    if (lowercaseQuery.includes('safed keede') || lowercaseQuery.includes('whitefly')) {
        return "Pesticide Recommendation: For whitefly (safed keede) on crops in current season, spray Imidacloprid 17.8 SL at 0.5ml/litre water.";
    }
    if (lowercaseQuery.includes('season')) {
        return "Season Advisory: Currently entering Rabi season. Sow mustard, wheat, or chickpeas.";
    }

    return "";
}
