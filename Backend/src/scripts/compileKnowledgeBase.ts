import * as fs from 'node:fs/promises';
import * as path from 'node:path';

async function compileKnowledgeBase() {
  console.log('--- Starting Knowledge Base Compilation ---');

  try {
    const kbPath = path.join(__dirname, '..', 'chat', 'data', 'knowledgeBase.json');
    
    // Load existing knowledgeBase.json
    let kb: Record<string, any> = {};
    try {
      const existing = await fs.readFile(kbPath, 'utf8');
      kb = JSON.parse(existing);
      console.log('Loaded existing knowledgeBase.json keys:', Object.keys(kb));
    } catch (e) {
      console.log('Creating new knowledgeBase.json structure.');
    }

    const knowledgeDir = path.resolve(process.cwd(), 'knowledge');
    const newDataDir = path.join(knowledgeDir, 'New Data');

    // 1. Read markdown guides and compile as strings
    const mdGuides = [
      { file: 'biostimulant_fertilizer_guide.md', key: 'biostimulantFertilizerGuide' },
      { file: 'disease_management.md', key: 'diseaseManagement' },
      { file: 'herbicide_guide.md', key: 'herbicideGuide' },
      { file: 'pest_management.md', key: 'pestManagement' },
      { file: 'wheat_pest_management.md', key: 'wheatPestManagement' },
    ];

    for (const guide of mdGuides) {
      const filePath = path.join(knowledgeDir, guide.file);
      try {
        const text = await fs.readFile(filePath, 'utf8');
        kb[guide.key] = text.trim();
        console.log(`Added markdown guide: ${guide.file} (${text.length} chars)`);
      } catch (err) {
        console.warn(`Could not read ${guide.file}, skipping.`);
      }
    }

    // 2. Read JSON files and compile as objects
    const jsonFiles = [
      { file: 'biostadt_products.json', key: 'biostadtProducts' },
      { file: 'crop_recommendations.json', key: 'cropRecommendations' },
    ];

    for (const json of jsonFiles) {
      const filePath = path.join(knowledgeDir, json.file);
      try {
        const raw = await fs.readFile(filePath, 'utf8');
        kb[json.key] = JSON.parse(raw);
        console.log(`Added JSON data: ${json.file} (${Object.keys(kb[json.key]).length} main items)`);
      } catch (err) {
        console.warn(`Could not read/parse ${json.file}, skipping.`);
      }
    }

    // 3. Read New Data markdown files
    const newDataFiles = [
      { file: 'Product_Overview.md', key: 'productOverviewTable' },
      { file: 'Application_Calendar.md', key: 'applicationCalendarTable' },
      { file: 'Dos_and_Donts.md', key: 'dosAndDontsTable' },
      { file: 'Quick_Reference_Card.md', key: 'quickReferenceCardTable' },
      { file: 'Inputs_Based_Company_Product.md', key: 'inputsBasedCompanyProductTable' },
      { file: 'products.md', key: 'productsInventoryTable' },
    ];

    for (const file of newDataFiles) {
      const filePath = path.join(newDataDir, file.file);
      try {
        const text = await fs.readFile(filePath, 'utf8');
        kb[file.key] = text.trim();
        console.log(`Added New Data file: ${file.file} (${text.length} chars)`);
      } catch (err) {
        console.warn(`Could not read New Data file ${file.file}, skipping.`);
      }
    }

    // Write the compiled database back to knowledgeBase.json
    await fs.writeFile(kbPath, JSON.stringify(kb, null, 2), 'utf8');
    
    const finalSize = (await fs.stat(kbPath)).size;
    console.log(`\nCompilation complete! Final knowledgeBase.json size: ${(finalSize / 1024).toFixed(2)} KB`);

  } catch (err: any) {
    console.error('Compilation failed:', err.message);
  }
}

compileKnowledgeBase();
