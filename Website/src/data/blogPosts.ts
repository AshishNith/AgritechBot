export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'how-to' | 'success-story' | 'education' | 'news';
  categoryLabel: string;
  author: string;
  authorRole: string;
  publishedDate: string;
  readTime: string;
  image: string;
  imageAlt: string;
  tags: string[];
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  // FEATURED POST
  {
    id: '1',
    slug: 'how-to-detect-wheat-rust-disease-early',
    title: 'How to Detect Wheat Rust Disease Early: A Complete Guide for Indian Farmers',
    excerpt: 'Learn to identify the three types of wheat rust (yellow, brown, and black) before they destroy your crop. Early detection can save up to 40% of your yield.',
    category: 'how-to',
    categoryLabel: 'How-To Guide',
    author: 'Dr. Priya Sharma',
    authorRole: 'Plant Pathologist, Anaaj.ai',
    publishedDate: '2026-04-05',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Close-up of wheat crop showing early signs of rust disease with orange pustules on leaves',
    tags: ['wheat', 'rust disease', 'crop protection', 'Punjab', 'Haryana'],
    featured: true,
    content: `
## Understanding Wheat Rust: The Silent Crop Killer

Wheat rust is one of the most devastating diseases affecting wheat crops across India, particularly in Punjab, Haryana, and Uttar Pradesh. Every year, farmers lose crores of rupees due to late detection of this fungal disease.

### The Three Types of Wheat Rust

**1. Yellow Rust (Stripe Rust)**
- Appears as yellow-orange stripes along the leaf veins
- Most common in cooler regions (15-20°C)
- Spreads rapidly in humid conditions
- Peak season: December to February

**2. Brown Rust (Leaf Rust)**
- Circular orange-brown pustules scattered on leaves
- Thrives in moderate temperatures (20-25°C)
- Most common rust type in India
- Peak season: February to March

**3. Black Rust (Stem Rust)**
- Dark reddish-brown to black pustules on stems
- Occurs in warmer conditions (25-30°C)
- Most destructive but least common
- Peak season: March to April

### Early Warning Signs to Watch For

1. **Yellowing patches** in your field (visible from a distance)
2. **Powdery orange residue** on your hands after touching leaves
3. **Premature leaf drying** starting from the tips
4. **Stunted plant growth** compared to healthy sections

### Using Anaaj.ai for Early Detection

With Anaaj.ai's AI-powered disease detection:

1. Open the app and tap the camera icon
2. Take a clear photo of the affected leaf
3. Our AI analyzes 50+ disease markers in seconds
4. Receive instant diagnosis with treatment recommendations

### Recommended Treatment Protocol

**For Early Stage (Less than 5% infection):**
- Propiconazole 25% EC @ 0.1% spray
- Repeat after 15 days if needed

**For Moderate Stage (5-20% infection):**
- Tebuconazole 25.9% EC @ 0.1% spray
- Add Mancozeb 75% WP for better coverage

**For Severe Stage (Above 20% infection):**
- Immediate harvest consideration
- Consult local agricultural officer

### Prevention Tips for Next Season

1. Use rust-resistant varieties (HD-3086, PBW-550)
2. Avoid late sowing (optimal: November 1-20)
3. Maintain proper plant spacing
4. Monitor weather alerts on Anaaj.ai
5. Scout fields weekly during high-risk periods

### Conclusion

Early detection is the key to managing wheat rust effectively. With Anaaj.ai's AI assistant, you can identify diseases within seconds and take immediate action. Download the app today and protect your harvest.

---

*Have questions about wheat diseases? Ask our AI assistant in Hindi, Punjabi, or English!*
    `
  },

  // SUCCESS STORY 1
  {
    id: '2',
    slug: 'gurpreet-singh-doubled-yield-with-ai-farming',
    title: 'How Gurpreet Singh Doubled His Wheat Yield Using AI-Powered Farming',
    excerpt: 'A farmer from Ludhiana shares his journey from struggling with crop diseases to achieving record yields with smart farming technology.',
    category: 'success-story',
    categoryLabel: 'Farmer Success Story',
    author: 'Anaaj.ai Team',
    authorRole: 'Editorial',
    publishedDate: '2026-04-01',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Successful Indian farmer Gurpreet Singh standing proudly in his healthy wheat field in Punjab',
    tags: ['success story', 'Punjab', 'wheat', 'yield improvement'],
    content: `
## From Struggling to Thriving: Gurpreet Singh's Story

*"पहले मैं अंदाज़े से खेती करता था। अब AI मेरा साथी है।"*
*(Earlier I used to farm by guesswork. Now AI is my partner.)*

— Gurpreet Singh, 45, Ludhiana, Punjab

### The Challenge

Gurpreet Singh has been farming on his 12-acre land in Ludhiana for over 20 years. Like many farmers in Punjab, he faced recurring challenges:

- **Unpredictable crop diseases** that appeared without warning
- **Excessive spending** on pesticides and fertilizers
- **Declining soil health** due to chemical overuse
- **No access to expert advice** when problems arose

In 2024, he lost 35% of his wheat crop to a severe yellow rust outbreak. "By the time I realized something was wrong, it was too late," he recalls.

### Discovering Anaaj.ai

Gurpreet's son, a college student, introduced him to Anaaj.ai in October 2025. Initially skeptical, Gurpreet decided to give it a try.

> "मुझे फोन चलाना नहीं आता था। लेकिन जब मैंने देखा कि मैं पंजाबी में बोलकर सवाल पूछ सकता हूं, तो मेरा डर खत्म हो गया।"
> 
> *(I didn't know how to use phones. But when I saw I could ask questions by speaking in Punjabi, my fear vanished.)*

### The Transformation

**Season: Rabi 2025-26**

Here's how Gurpreet used Anaaj.ai throughout the season:

**November 2025 - Sowing**
- Asked AI about optimal sowing date based on local weather
- Received variety recommendation (PBW-550) for his soil type
- Got personalized seed rate calculation

**December 2025 - Early Growth**
- Detected nitrogen deficiency through leaf photo analysis
- Applied targeted urea dose (saved 20% fertilizer)
- Received frost alert 3 days in advance

**February 2026 - Critical Stage**
- AI detected early brown rust (just 2% infection)
- Immediate treatment prevented spread
- Saved estimated ₹45,000 in potential losses

**April 2026 - Harvest**
- Yield: 52 quintals/acre (previous best: 28 quintals/acre)
- Input costs reduced by 30%
- Net profit increased by 85%

### By the Numbers

| Metric | Before Anaaj.ai | After Anaaj.ai |
|--------|----------------|----------------|
| Yield per acre | 28 quintals | 52 quintals |
| Fertilizer cost | ₹8,500/acre | ₹6,200/acre |
| Pesticide cost | ₹4,200/acre | ₹2,100/acre |
| Crop loss | 35% | 3% |
| Net profit | ₹32,000/acre | ₹59,000/acre |

### Gurpreet's Advice to Fellow Farmers

1. **Don't be afraid of technology** - "अगर मैं 45 साल की उम्र में सीख सकता हूं, तो कोई भी सीख सकता है"
2. **Act on early warnings** - Small problems become big disasters if ignored
3. **Trust the data** - AI recommendations are based on science, not guesswork
4. **Keep learning** - Watch the educational videos in the app

### What's Next for Gurpreet?

Gurpreet is now a "Digital Farming Champion" in his village. He has helped 15 other farmers adopt Anaaj.ai and conducts weekly training sessions at the local gurudwara.

> "अब मेरे बच्चे गर्व से कहते हैं कि उनके पिताजी स्मार्ट फार्मर हैं।"
> 
> *(Now my children proudly say their father is a smart farmer.)*

---

*Want to share your success story? Email us at stories@anaajai.com*
    `
  },

  // EDUCATIONAL CONTENT 1
  {
    id: '3',
    slug: 'understanding-soil-health-complete-guide',
    title: 'Understanding Soil Health: The Foundation of Successful Farming',
    excerpt: 'Everything Indian farmers need to know about soil testing, pH levels, nutrient management, and organic matter to maximize crop yields.',
    category: 'education',
    categoryLabel: 'Educational Guide',
    author: 'Dr. Rajesh Kumar',
    authorRole: 'Soil Scientist, Anaaj.ai',
    publishedDate: '2026-03-28',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Farmer holding rich dark soil in hands showing healthy soil texture and organic matter content',
    tags: ['soil health', 'soil testing', 'organic farming', 'nutrients', 'pH'],
    content: `
## Why Soil Health Matters More Than Ever

"मिट्टी स्वस्थ तो फसल स्वस्थ" - Healthy soil means healthy crops. This ancient wisdom is backed by modern science. Studies show that improving soil health can increase yields by 20-40% while reducing input costs.

### What is Soil Health?

Soil health refers to the continued capacity of soil to function as a living ecosystem that sustains plants, animals, and humans. It includes:

- **Physical properties**: Texture, structure, water-holding capacity
- **Chemical properties**: pH, nutrients, organic matter
- **Biological properties**: Microorganisms, earthworms, root activity

### The 5 Key Indicators of Soil Health

#### 1. Soil pH (अम्लता/क्षारीयता)

**What it means:** pH measures how acidic or alkaline your soil is on a scale of 0-14.

| pH Level | Classification | Suitable Crops |
|----------|---------------|----------------|
| Below 5.5 | Strongly Acidic | Tea, Coffee, Blueberries |
| 5.5 - 6.5 | Slightly Acidic | Rice, Potato, Maize |
| 6.5 - 7.5 | Neutral (Ideal) | Wheat, Vegetables, Pulses |
| 7.5 - 8.5 | Slightly Alkaline | Barley, Cotton, Sugarcane |
| Above 8.5 | Strongly Alkaline | Needs amendment |

**How to check:** Use Anaaj.ai's soil analysis feature or get tested at your local Krishi Vigyan Kendra.

**How to correct:**
- Acidic soil → Add lime (ite calcium carbonate)
- Alkaline soil → Add gypsum or sulfur

#### 2. Organic Matter (जैविक पदार्थ)

Organic matter is the "life" of your soil. It:
- Improves water retention
- Provides slow-release nutrients
- Supports beneficial microorganisms
- Improves soil structure

**Ideal level:** 2-4% for most crops

**How to increase:**
- Add farmyard manure (FYM): 10-15 tonnes/acre
- Incorporate crop residues (don't burn!)
- Use green manure crops (dhaincha, sunhemp)
- Apply vermicompost: 2-3 tonnes/acre

#### 3. Nitrogen (नाइट्रोजन - N)

**Role:** Essential for leaf growth and green color

**Deficiency signs:**
- Yellowing of older leaves
- Stunted growth
- Poor tillering in wheat/rice

**Sources:**
- Urea (46% N)
- DAP (18% N)
- Organic: FYM, compost, green manure

#### 4. Phosphorus (फास्फोरस - P)

**Role:** Root development, flowering, and fruiting

**Deficiency signs:**
- Purple/reddish leaves
- Poor root growth
- Delayed maturity

**Sources:**
- DAP (46% P₂O₅)
- SSP (16% P₂O₅)
- Organic: Bone meal, rock phosphate

#### 5. Potassium (पोटैशियम - K)

**Role:** Disease resistance, water regulation, grain quality

**Deficiency signs:**
- Brown leaf edges (scorching)
- Weak stems
- Poor grain filling

**Sources:**
- MOP (60% K₂O)
- SOP (50% K₂O)
- Organic: Wood ash, banana stems

### How to Get Your Soil Tested

**Option 1: Government Soil Testing Labs**
- Cost: ₹30-50 per sample
- Time: 15-20 days
- Contact your local agriculture office

**Option 2: Soil Health Card Scheme**
- Free for farmers
- Provides NPK + 9 other parameters
- Apply at: soilhealth.dac.gov.in

**Option 3: Anaaj.ai Soil Analysis**
- Upload soil test report
- Get personalized fertilizer recommendations
- Track soil health over seasons

### Building Healthy Soil: A 3-Year Plan

**Year 1: Assessment & Correction**
- Get comprehensive soil test
- Correct pH if needed
- Add organic matter (15 tonnes FYM/acre)
- Reduce chemical fertilizers by 20%

**Year 2: Biological Activation**
- Introduce crop rotation
- Use biofertilizers (Rhizobium, PSB, Azotobacter)
- Practice mulching
- Avoid burning residues

**Year 3: Maintenance & Optimization**
- Soil testing every season
- Precision fertilizer application
- Green manure incorporation
- Minimal tillage where possible

### Common Mistakes to Avoid

1. **Over-fertilization** - More is not always better
2. **Ignoring micronutrients** - Zinc and Boron deficiencies are common
3. **Burning crop residue** - Destroys organic matter and soil life
4. **Skipping soil tests** - Flying blind wastes money
5. **Ignoring soil biology** - Earthworms and microbes are your allies

### Conclusion

Healthy soil is the foundation of sustainable and profitable farming. Start with a soil test, add organic matter every season, and use Anaaj.ai to get personalized recommendations based on your specific soil conditions.

---

*Ask our AI assistant about your soil health in Hindi, Punjabi, or any regional language!*
    `
  },

  // HOW-TO GUIDE 2
  {
    id: '4',
    slug: 'water-management-irrigation-tips-indian-farmers',
    title: 'Smart Water Management: Irrigation Tips to Save Water and Increase Yields',
    excerpt: 'Learn efficient irrigation techniques including drip irrigation, sprinkler systems, and traditional methods optimized for Indian farming conditions.',
    category: 'how-to',
    categoryLabel: 'How-To Guide',
    author: 'Er. Amit Verma',
    authorRole: 'Agricultural Engineer, Anaaj.ai',
    publishedDate: '2026-03-20',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Drip irrigation system watering vegetable crops efficiently in an Indian farm',
    tags: ['irrigation', 'water management', 'drip irrigation', 'sprinkler', 'water saving'],
    content: `
## The Water Crisis in Indian Agriculture

Agriculture consumes 80% of India's freshwater resources, yet water use efficiency remains below 40%. With groundwater levels dropping rapidly, smart water management is no longer optional—it's essential for survival.

### Understanding Crop Water Requirements

Different crops need different amounts of water at different stages:

| Crop | Total Water Need | Critical Stages |
|------|-----------------|-----------------|
| Wheat | 400-450 mm | Crown root, Flowering, Grain filling |
| Rice | 1200-1400 mm | Transplanting, Tillering, Flowering |
| Cotton | 700-900 mm | Flowering, Boll formation |
| Sugarcane | 1500-2000 mm | Tillering, Grand growth |
| Vegetables | 300-500 mm | Throughout growth |

### 5 Irrigation Methods Compared

#### 1. Flood Irrigation (Traditional)

**How it works:** Water flows across the entire field

**Pros:**
- Low initial cost
- Simple to operate
- Works for all crops

**Cons:**
- 50-60% water loss
- Uneven distribution
- Promotes weed growth
- Causes waterlogging

**Best for:** Rice cultivation, fields with heavy clay soil

#### 2. Furrow Irrigation

**How it works:** Water flows through channels between crop rows

**Pros:**
- 30% more efficient than flood
- Good for row crops
- Moderate cost

**Cons:**
- Labor intensive
- Needs leveled land
- End-of-furrow losses

**Best for:** Sugarcane, cotton, vegetables

#### 3. Sprinkler Irrigation

**How it works:** Water sprayed like rain through overhead pipes

**Pros:**
- 70-80% efficiency
- Works on uneven land
- Good coverage
- Reduces labor

**Cons:**
- High initial cost (₹30,000-50,000/acre)
- Wind affects distribution
- Not for all crops
- Power requirement

**Best for:** Wheat, groundnut, pulses, fodder crops

#### 4. Drip Irrigation

**How it works:** Water delivered directly to roots through tubes

**Pros:**
- 90-95% efficiency
- Reduces water use by 50-70%
- Fertigation possible
- Weed control
- Higher yields

**Cons:**
- Highest initial cost (₹50,000-80,000/acre)
- Clogging issues
- Technical knowledge needed
- Not suitable for dense crops

**Best for:** Vegetables, fruits, sugarcane, cotton

#### 5. Sensor-Based Smart Irrigation

**How it works:** Soil moisture sensors + automated systems

**Pros:**
- Optimal water use
- Remote monitoring
- Data-driven decisions
- Integrates with Anaaj.ai

**Cons:**
- Technology dependent
- Initial learning curve
- Connectivity needed

**Best for:** High-value crops, progressive farmers

### Government Subsidies Available

**Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)**

| Category | Subsidy on Drip/Sprinkler |
|----------|--------------------------|
| Small/Marginal Farmers | 55% |
| Other Farmers | 45% |
| Additional State Subsidy | 25-35% (varies) |

**How to apply:**
1. Visit your District Agriculture Office
2. Submit land documents
3. Get soil/water test
4. Choose empaneled supplier
5. Installation and verification

### 10 Water-Saving Tips for Every Farmer

1. **Irrigate at the right time** - Early morning or evening (reduces evaporation by 30%)

2. **Use Anaaj.ai weather alerts** - Skip irrigation before predicted rain

3. **Mulching** - Reduces evaporation by 25-30%

4. **Laser land leveling** - Saves 20-25% water, costs ₹1,000/acre

5. **Alternate wetting and drying (AWD)** - For rice, saves 30% water

6. **Raised bed planting** - For wheat, saves 30-40% water

7. **Pipe water conveyance** - Reduces seepage losses

8. **Rainwater harvesting** - Farm ponds can store monsoon water

9. **Monitor soil moisture** - Don't irrigate by calendar, irrigate by need

10. **Maintain equipment** - Leaky pipes waste 20% water

### Calculating Your Water Needs with Anaaj.ai

Our AI considers:
- Current soil moisture
- Weather forecast (next 7 days)
- Crop growth stage
- Evapotranspiration rate
- Your irrigation system type

Simply ask in your language: "मुझे कब पानी देना चाहिए?" (When should I irrigate?)

### Case Study: 50% Water Savings in Gujarat

*Rameshbhai Patel, Mehsana, Gujarat*

Switched from flood to drip irrigation for his 5-acre cotton field:

- Water use: 6,500 m³ → 3,200 m³ (51% reduction)
- Electricity bill: ₹18,000 → ₹8,500 (53% saving)
- Yield: 12 quintals/acre → 16 quintals/acre (33% increase)
- Payback period: 2.5 years

### Conclusion

Water is precious and getting scarcer. By adopting efficient irrigation and using Anaaj.ai's smart recommendations, you can grow more with less water while protecting this vital resource for future generations.

---

*Get personalized irrigation schedules on Anaaj.ai - just speak your question!*
    `
  },

  // SUCCESS STORY 2
  {
    id: '5',
    slug: 'lakshmi-devi-organic-farming-success-karnataka',
    title: 'From Chemical Dependency to Organic Success: Lakshmi Devi\'s Inspiring Journey',
    excerpt: 'A woman farmer from Karnataka shares how she transitioned to organic farming and now earns 3x more than conventional farmers in her village.',
    category: 'success-story',
    categoryLabel: 'Farmer Success Story',
    author: 'Anaaj.ai Team',
    authorRole: 'Editorial',
    publishedDate: '2026-03-15',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1589923188651-268a9765e432?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Woman farmer Lakshmi Devi harvesting organic vegetables in her thriving farm in Karnataka',
    tags: ['success story', 'Karnataka', 'organic farming', 'women farmers'],
    content: `
## Breaking Barriers: Lakshmi Devi's Organic Revolution

*"ಜನ ನನ್ನನ್ನು ಹುಚ್ಚಿ ಎಂದು ಕರೆದರು. ಈಗ ಅವರೇ ನನ್ನ ಬಳಿ ಕಲಿಯಲು ಬರುತ್ತಾರೆ."*
*(People called me crazy. Now they come to learn from me.)*

— Lakshmi Devi, 52, Tumkur, Karnataka

### The Beginning: A Health Crisis

In 2020, Lakshmi Devi's husband was diagnosed with kidney disease. The doctor's words changed everything: "Years of pesticide exposure has damaged his health."

That day, she made a decision that would transform not just her farm, but her entire village.

### The Challenges of Transition

**Year 1 (2021): The Difficult Start**
- Yield dropped by 40%
- Pest attacks seemed overwhelming
- Neighbors mocked her decision
- Income fell from ₹1.8 lakh to ₹1.1 lakh

**What kept her going:**
> "ನನ್ನ ಕುಟುಂಬದ ಆರೋಗ್ಯ ಹಣಕ್ಕಿಂತ ಮುಖ್ಯ"
> *(My family's health is more important than money)*

### Discovering Anaaj.ai: The Turning Point

In late 2024, a government agricultural extension worker introduced Lakshmi to Anaaj.ai. For the first time, she had access to expert advice in Kannada.

**Key learnings from the app:**
1. Natural pest control methods (neem oil, panchagavya)
2. Companion planting strategies
3. Soil health improvement techniques
4. Market linkages for organic produce

### The Transformation

**Year 2 (2022): Stabilization**
- Learned to make jeevamrutha and beejamrutha
- Introduced beneficial insects (ladybugs, lacewings)
- Started vermiculture unit
- Yield recovered to 85% of conventional

**Year 3 (2023): Growth**
- Soil organic carbon increased from 0.4% to 1.2%
- Natural predator population established
- Zero external pest control needed
- Yield matched conventional farming

**Year 4-5 (2024-2026): Prosperity**
- Organic certification obtained
- Direct sales to Bengaluru consumers
- Premium pricing (2-3x conventional)
- Training other women farmers

### The Numbers Tell the Story

| Metric | 2020 (Chemical) | 2026 (Organic) |
|--------|----------------|----------------|
| Annual income | ₹1.8 lakh | ₹5.4 lakh |
| Input costs | ₹60,000 | ₹15,000 |
| Net profit | ₹1.2 lakh | ₹5.25 lakh |
| Soil health score | 35/100 | 82/100 |
| Family health expenses | ₹40,000/year | ₹8,000/year |

### What She Grows Today

- **Vegetables:** Tomatoes, brinjal, okra, beans
- **Fruits:** Papaya, banana, guava
- **Grains:** Ragi, jowar (millets)
- **Spices:** Turmeric, ginger, chillies

All sold under her brand: **"Lakshmi Organic Farm"**

### Her Advice for Aspiring Organic Farmers

1. **Start small** - Convert 25% of your land first
2. **Focus on soil** - "ಮಣ್ಣು ಸರಿಯಾದರೆ ಎಲ್ಲವೂ ಸರಿಯಾಗುತ್ತದೆ" (If soil is right, everything will be right)
3. **Learn continuously** - Use Anaaj.ai daily for new knowledge
4. **Build community** - Form farmer groups for mutual support
5. **Be patient** - True results take 3 years
6. **Find your market** - Direct consumers pay better

### The Ripple Effect

Today, Lakshmi Devi leads the "Hasiru Krishi Mahila Sangha" (Green Farming Women's Group) with 45 members. Together, they:

- Farm over 200 acres organically
- Supply to 3 organic stores in Bengaluru
- Train 500+ farmers annually
- Have been featured on Doordarshan

### Recognition

- **2025:** Karnataka State Organic Farming Award
- **2025:** Featured in NABARD's success stories
- **2026:** Invited to address agricultural conference in Delhi

### Her Message to Women Farmers

> "ನಾವು ಮಹಿಳೆಯರು ಸ್ವಾಭಾವಿಕವಾಗಿ ಪೋಷಕರು. ಭೂಮಿಯನ್ನು ಪೋಷಿಸುವುದು ನಮ್ಮ ಸಹಜ ಕೆಲಸ. ತಂತ್ರಜ್ಞಾನವು ನಮ್ಮ ಸಹಾಯಕ, ನಮ್ಮ ಬದಲಿ ಅಲ್ಲ."
>
> *(We women are natural nurturers. Nurturing the earth is our innate work. Technology is our helper, not our replacement.)*

---

*Inspired by Lakshmi Devi? Start your organic journey with Anaaj.ai's organic farming module!*
    `
  },

  // EDUCATIONAL CONTENT 2
  {
    id: '6',
    slug: 'understanding-npk-fertilizers-complete-guide',
    title: 'NPK Fertilizers Explained: What Every Indian Farmer Must Know',
    excerpt: 'A comprehensive guide to understanding nitrogen, phosphorus, and potassium fertilizers, their ratios, application methods, and common mistakes to avoid.',
    category: 'education',
    categoryLabel: 'Educational Guide',
    author: 'Dr. Suresh Reddy',
    authorRole: 'Agronomist, Anaaj.ai',
    publishedDate: '2026-03-10',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Different types of NPK fertilizer granules displayed showing urea DAP and MOP varieties',
    tags: ['fertilizers', 'NPK', 'urea', 'DAP', 'nutrient management'],
    content: `
## Understanding NPK: The Building Blocks of Plant Nutrition

Every fertilizer bag has three numbers like 10-26-26 or 46-0-0. These represent the percentage of Nitrogen (N), Phosphorus (P), and Potassium (K). Understanding these numbers can save you money and improve your yields.

### What Do N, P, and K Do?

#### Nitrogen (N) - नाइट्रोजन
**Function:** Leaf growth, green color, protein synthesis

**Deficiency symptoms:**
- Pale yellow leaves (starting from older leaves)
- Stunted growth
- Poor tillering
- Low protein in grains

**Excess symptoms:**
- Dark green, lush growth
- Delayed maturity
- Weak stems (lodging)
- More pest/disease susceptibility

#### Phosphorus (P) - फास्फोरस
**Function:** Root development, flowering, energy transfer

**Deficiency symptoms:**
- Purple/reddish tint on leaves
- Poor root system
- Delayed flowering
- Small, misshapen fruits

**Excess symptoms:**
- Zinc and iron deficiency (lockout)
- Poor micronutrient uptake

#### Potassium (K) - पोटैशियम
**Function:** Disease resistance, water regulation, grain quality

**Deficiency symptoms:**
- Brown leaf edges (marginal scorch)
- Weak stems
- Poor grain filling
- Increased disease susceptibility

**Excess symptoms:**
- Magnesium and calcium deficiency
- Salt stress in roots

### Common Fertilizers in India

| Fertilizer | N-P-K | Primary Use | Current Price* |
|------------|-------|-------------|----------------|
| Urea | 46-0-0 | Nitrogen source | ₹266/50kg |
| DAP | 18-46-0 | Phosphorus + N | ₹1,350/50kg |
| MOP | 0-0-60 | Potassium | ₹1,700/50kg |
| SSP | 0-16-0 | Phosphorus | ₹450/50kg |
| NPK 10-26-26 | 10-26-26 | Balanced | ₹1,470/50kg |
| NPK 12-32-16 | 12-32-16 | P-heavy | ₹1,350/50kg |
| NPK 20-20-0 | 20-20-0 | N-P | ₹1,150/50kg |

*Prices as of April 2026, may vary by state

### How to Read Fertilizer Labels

**Example: DAP (18-46-0)**
- 18% Nitrogen
- 46% Phosphorus (as P₂O₅)
- 0% Potassium

**In a 50kg bag:**
- N: 50 × 0.18 = 9 kg
- P: 50 × 0.46 = 23 kg
- K: 0 kg

### Crop-Wise Fertilizer Recommendations

#### Wheat (per acre)

| Stage | Fertilizer | Quantity |
|-------|-----------|----------|
| Basal | DAP | 50 kg |
| Basal | MOP | 25 kg |
| First irrigation (21 days) | Urea | 35 kg |
| Second irrigation (45 days) | Urea | 25 kg |

#### Rice (per acre)

| Stage | Fertilizer | Quantity |
|-------|-----------|----------|
| Transplanting | DAP | 50 kg |
| Transplanting | MOP | 25 kg |
| Tillering (25 days) | Urea | 35 kg |
| Panicle initiation | Urea | 25 kg |

### 5 Common Fertilizer Mistakes

#### Mistake 1: Applying All Nitrogen at Once
**Problem:** 40-50% lost to atmosphere and leaching
**Solution:** Split into 2-3 applications

#### Mistake 2: Broadcasting DAP on Soil Surface
**Problem:** Phosphorus gets fixed, only 20% reaches roots
**Solution:** Place in furrows, 5-7 cm deep

#### Mistake 3: Mixing Urea with DAP
**Problem:** Chemical reaction reduces nitrogen availability
**Solution:** Apply separately or use NPK complexes

#### Mistake 4: Ignoring Soil Test Results
**Problem:** Either deficiency or excess of nutrients
**Solution:** Get soil tested, use Anaaj.ai recommendations

#### Mistake 5: Applying Fertilizer to Dry Soil
**Problem:** Urea volatilization, poor nutrient mobility
**Solution:** Apply before irrigation or to moist soil

### Smart Fertilizer Calculator on Anaaj.ai

Our AI considers:
- Your soil test report
- Target yield
- Previous crop residues
- Organic matter additions
- Local climatic conditions

**How to use:**
1. Upload your soil health card
2. Select your crop and target yield
3. Get customized fertilizer schedule
4. Set reminder alerts for each application

### Government Subsidies on Fertilizers

The Government of India subsidizes fertilizers through DBT:

| Fertilizer | MRP (Subsidized) | Actual Cost |
|------------|------------------|-------------|
| Urea | ₹266/50kg | ₹1,800/50kg |
| DAP | ₹1,350/50kg | ₹3,500/50kg |
| MOP | ₹1,700/50kg | ₹2,800/50kg |

**Note:** Buy only from authorized dealers with valid bills

### Future of Fertilizers: Nano and Slow-Release

**Nano Urea (IFFCO)**
- 500ml bottle = 1 bag urea
- Foliar application
- 90% absorption efficiency
- Price: ₹240/bottle

**Coated/Slow-Release Urea**
- Neem-coated urea reduces losses by 15-20%
- Sulfur-coated for prolonged release

### Conclusion

Fertilizers are the most expensive input in farming. Understanding NPK ratios, applying at the right time, and avoiding common mistakes can significantly improve your profitability. Use Anaaj.ai's fertilizer calculator for personalized recommendations.

---

*Have questions about fertilizers? Ask in Hindi, Punjabi, Telugu, or any language on Anaaj.ai!*
    `
  },

  // HOW-TO GUIDE 3
  {
    id: '7',
    slug: 'how-to-control-aphids-naturally-without-chemicals',
    title: 'Natural Aphid Control: Protect Your Crops Without Harmful Chemicals',
    excerpt: 'Discover effective organic methods to control aphids on mustard, vegetables, and other crops using neem oil, beneficial insects, and companion planting.',
    category: 'how-to',
    categoryLabel: 'How-To Guide',
    author: 'Dr. Meena Patel',
    authorRole: 'Entomologist, Anaaj.ai',
    publishedDate: '2026-03-05',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Close-up of beneficial ladybug eating aphids on crop leaf showing natural pest control',
    tags: ['pest control', 'aphids', 'organic', 'neem oil', 'IPM'],
    content: `
## The Aphid Problem in Indian Farming

Aphids (माहू/मोयला) are among the most destructive pests in Indian agriculture. These tiny, soft-bodied insects can destroy entire crops of mustard, vegetables, and pulses within weeks if not controlled.

### Identifying Aphid Infestation

**What to look for:**
- Clusters of small green, yellow, or black insects on new growth
- Sticky honeydew on leaves
- Black sooty mold growing on honeydew
- Curled, distorted, or yellowing leaves
- Stunted plant growth
- Presence of ants (they farm aphids!)

**Most affected crops in India:**
- Mustard (most severe)
- Cabbage, cauliflower, broccoli
- Chillies, tomatoes
- Wheat (occasionally)
- Pulses (gram, lentils)

### Why Chemical Control is Problematic

1. **Resistance development:** Aphids reproduce so fast (10-12 generations/season) that they quickly develop resistance
2. **Kills beneficial insects:** Sprays also kill ladybugs, lacewings, and parasitic wasps
3. **Residue in food:** Harmful to consumers
4. **Environmental pollution:** Contaminates soil and water
5. **Cost:** Chemical sprays are expensive

### 10 Natural Methods to Control Aphids

#### Method 1: Neem Oil Spray (नीम तेल)

**Most effective organic solution**

**Recipe:**
- 5 ml neem oil
- 2 ml liquid soap (as emulsifier)
- 1 liter water

**Application:**
- Spray in evening (not in direct sunlight)
- Cover both upper and lower leaf surfaces
- Repeat every 5-7 days
- Works by disrupting aphid feeding and reproduction

#### Method 2: Garlic-Chilli Spray (लहसुन-मिर्च)

**Recipe:**
- 100g garlic cloves (crushed)
- 50g green chillies (crushed)
- 1 liter water
- Soak overnight, strain

**Application:**
- Dilute: 100ml solution in 1 liter water
- Spray on affected plants
- Strong smell repels aphids

#### Method 3: Soap Water Spray

**Recipe:**
- 20ml liquid soap (not detergent)
- 1 liter water

**Application:**
- Spray directly on aphids
- Soap damages their waxy coating
- They dehydrate and die

#### Method 4: Yellow Sticky Traps

**How it works:**
- Aphids are attracted to yellow color
- Get stuck on adhesive surface
- Also helps monitor infestation levels

**Setup:**
- Place 10-15 traps per acre
- Position just above crop canopy
- Replace when full

#### Method 5: Beneficial Insects (जैविक नियंत्रण)

**Natural predators to encourage:**

| Predator | Aphids Eaten/Day |
|----------|-----------------|
| Ladybug (adult) | 50-100 |
| Ladybug (larva) | 200-300 |
| Lacewing (larva) | 100-150 |
| Hoverfly (larva) | 400+ (lifetime) |

**How to attract them:**
- Plant flowers (marigold, sunflower, dill)
- Avoid broad-spectrum pesticides
- Provide water sources
- Leave some weedy borders

#### Method 6: Companion Planting

**Plants that repel aphids:**
- Marigold (गेंदा)
- Coriander (धनिया)
- Garlic (लहसुन)
- Onion (प्याज)
- Mint (पुदीना)
- Basil (तुलसी)

**Planting strategy:**
- Border crops with marigold
- Intercrop with coriander
- Plant garlic/onion between vegetable rows

#### Method 7: Strong Water Spray

**For light infestations:**
- Use strong jet of water
- Physically dislodges aphids
- They can't climb back up
- Repeat every 2-3 days

#### Method 8: Flour Dusting

**How it works:**
- Sprinkle flour on plants
- Aphids get coated and constipated
- Simple and chemical-free

#### Method 9: Banana Peel Mulch

**How it works:**
- Cut banana peels into pieces
- Bury around base of plants
- Natural aphid repellent
- Also adds potassium to soil

#### Method 10: Crop Rotation and Timing

**Prevention strategies:**
- Don't plant same crop family consecutively
- Early sowing escapes peak aphid season
- Remove crop residues promptly
- Destroy volunteer plants

### Integrated Pest Management (IPM) Approach

**Best results come from combining methods:**

**Week 1-2:** Install yellow sticky traps, plant companions

**Week 3-4:** Release ladybugs (if available), apply neem oil

**Week 5+:** Continue neem spray as needed, encourage natural predators

### Using Anaaj.ai for Pest Alerts

Our AI monitors:
- Local weather conditions (aphids thrive in cool, humid weather)
- Regional pest outbreak reports
- Your crop stage and vulnerability

**Get alerts:** "माहू का खतरा बढ़ रहा है। नीम तेल स्प्रे की सलाह।"

### When to Consider Organic-Approved Pesticides

If infestation is severe (>50% plants affected):
- Spinosad-based products
- Pyrethrin (derived from chrysanthemum)
- Beauveria bassiana (fungal biocontrol)

Always follow organic certification guidelines if selling as organic.

### Conclusion

Aphid control without chemicals is not just possible—it's often more effective in the long run. By using natural methods, you protect the environment, your health, and actually build a more resilient farm ecosystem.

---

*Spot aphids on your crop? Take a photo and get instant advice on Anaaj.ai!*
    `
  },

  // NEWS/UPDATE
  {
    id: '8',
    slug: 'msp-update-rabi-crops-2026-government-announcement',
    title: 'MSP Update 2026: Government Announces Higher Prices for Rabi Crops',
    excerpt: 'Complete breakdown of the new Minimum Support Prices for wheat, mustard, gram, and other rabi crops. What it means for Indian farmers.',
    category: 'news',
    categoryLabel: 'News & Updates',
    author: 'Anaaj.ai Editorial',
    authorRole: 'Market Intelligence Team',
    publishedDate: '2026-02-28',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1595841696677-6589f0ed3db5?q=80&w=1200&auto=format&fit=crop',
    imageAlt: 'Government MSP announcement display with wheat grains and Indian currency showing new support prices',
    tags: ['MSP', 'government policy', 'wheat', 'rabi crops', 'market prices'],
    content: `
## New MSP Rates for Rabi Marketing Season 2026-27

The Cabinet Committee on Economic Affairs (CCEA) has approved the Minimum Support Prices (MSP) for Rabi crops for the marketing season 2026-27. Here's everything farmers need to know.

### MSP Rates at a Glance

| Crop | MSP 2025-26 | MSP 2026-27 | Increase | % Change |
|------|-------------|-------------|----------|----------|
| Wheat | ₹2,275/q | ₹2,425/q | ₹150 | 6.6% |
| Barley | ₹1,850/q | ₹1,980/q | ₹130 | 7.0% |
| Gram | ₹5,440/q | ₹5,650/q | ₹210 | 3.9% |
| Masur (Lentil) | ₹6,425/q | ₹6,700/q | ₹275 | 4.3% |
| Mustard | ₹5,650/q | ₹5,950/q | ₹300 | 5.3% |
| Safflower | ₹5,800/q | ₹6,100/q | ₹300 | 5.2% |

### What This Means for You

**Wheat Farmers (Punjab, Haryana, UP, MP)**

With MSP at ₹2,425/quintal and average yield of 45-50 quintals/acre:
- Gross income potential: ₹1,09,125 - ₹1,21,250 per acre
- Compared to 2025: Additional ₹6,750 - ₹7,500 per acre

**Mustard Farmers (Rajasthan, MP, UP)**

With MSP at ₹5,950/quintal and average yield of 8-10 quintals/acre:
- Gross income potential: ₹47,600 - ₹59,500 per acre
- Compared to 2025: Additional ₹2,400 - ₹3,000 per acre

### Procurement Details

**Wheat Procurement Season:** April 1 - June 30, 2026

**Key procurement agencies:**
- Food Corporation of India (FCI)
- State agencies (Punjab - PUNGRAIN, Haryana - HAFED, etc.)

**Documents required:**
1. Aadhaar card
2. Land records (khatauni/patta)
3. Bank account details
4. Farmer registration on state portal

### New Initiatives This Year

**1. Digital Payment Within 72 Hours**
- Direct transfer to bank accounts
- No commission to agents
- Track payment status via mobile

**2. Doorstep Quality Testing**
- Mobile labs at major mandis
- Instant quality assessment
- Transparent grading

**3. Transportation Subsidy**
- ₹50/quintal for farmers >25 km from procurement center
- Direct reimbursement to account

### Quality Parameters for Procurement

**Wheat Quality Specifications:**

| Parameter | Specification |
|-----------|---------------|
| Moisture | Max 12% |
| Foreign matter | Max 1% |
| Damaged grains | Max 3% |
| Shriveled grains | Max 3% |
| Immature grains | Max 2% |

**Tip:** Dry your wheat properly before bringing to mandi. Anaaj.ai can advise on optimal drying conditions based on weather.

### How to Maximize Your MSP Returns

1. **Register early** - Complete registration on state portals now
2. **Check quality** - Use Anaaj.ai to assess grain quality before sale
3. **Time your sale** - Early season procurement has shorter queues
4. **Proper storage** - Don't lose quality due to poor storage
5. **Keep records** - Maintain proper weighment slips

### State-Wise Procurement Dates

| State | Start Date | End Date |
|-------|-----------|----------|
| Punjab | April 1 | May 31 |
| Haryana | April 1 | May 31 |
| Madhya Pradesh | March 25 | June 15 |
| Uttar Pradesh | April 1 | June 30 |
| Rajasthan | April 1 | June 15 |

### Market Price Alerts on Anaaj.ai

Get real-time mandi prices:
- Compare MSP vs market rates
- Find best selling location
- Get price forecasts

Simply ask: "आज गेहूं का भाव क्या है?" or "ਕਣਕ ਦਾ ਭਾਅ ਦੱਸੋ"

### Expert Opinion

> "The 6.6% increase in wheat MSP is positive, but farmers should also focus on reducing input costs through precision farming. A ₹150/quintal MSP increase means little if fertilizer and diesel costs rise by similar amounts."
>
> — *Dr. Ashok Sharma, Agricultural Economist*

### Looking Ahead

The government has committed to:
- Procurement of 350 lakh tonnes of wheat
- 100% payment through DBT
- Zero tolerance for corruption at mandis

### Conclusion

While MSP increases are welcome, the real profit lies in optimizing your farming operations. Use Anaaj.ai to reduce input costs, improve yields, and get better prices—both through MSP and private markets.

---

*Get personalized market updates on Anaaj.ai in your language!*
    `
  }
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getBlogPostsByCategory = (category: BlogPost['category']): BlogPost[] => {
  return blogPosts.filter(post => post.category === category);
};

export const getFeaturedPosts = (): BlogPost[] => {
  return blogPosts.filter(post => post.featured);
};

export const getRecentPosts = (count: number = 4): BlogPost[] => {
  return [...blogPosts]
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, count);
};
