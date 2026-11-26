/**
 * Smoke test for the Claude-powered AI features. Calls Claude directly; does not
 * write to MongoDB or Redis.
 *
 * Run from the Backend folder (on the server too, after setting ANTHROPIC_API_KEY):
 *   REDIS_ENABLED=false npx tsx src/scripts/smokeClaude.ts [path/to/crop-photo.jpg]
 */
import fs from 'node:fs';
import path from 'node:path';
import { claude, CLAUDE_MODEL, getResponseText, toClaudeImageMediaType } from '../services/ai/claudeClient';
import { generateChatReply } from '../chat/services/aiChat.service';
import { runCropDiagnosis } from '../controllers/imageAnalysisController';
import { CropPlanningService } from '../services/CropPlanningService';
import { AISchedulingService } from '../services/AISchedulingService';
import { generateQuerySuggestions } from '../chat/services/querySuggestions.service';

const results: Array<{ name: string; ok: boolean; detail: string }> = [];

async function check(name: string, fn: () => Promise<string>) {
  const started = Date.now();
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail: `${detail} (${Date.now() - started} ms)` });
  } catch (err) {
    results.push({ name, ok: false, detail: err instanceof Error ? err.message : String(err) });
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log(`Model: ${CLAUDE_MODEL}`);

  await check('API key + model', async () => {
    const res = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      output_config: { effort: 'low' },
      messages: [{ role: 'user', content: 'Reply with the single word: pong' }],
    });
    return `reply="${getResponseText(res)}"`;
  });

  const farmerContext = 'Name: Suraj. Location: Khodadpur, Bihar. Crops: Wheat. Land: 2 acres.';

  await check('Chat (Hindi, weather tool)', async () => {
    const reply = await generateChatReply({
      history: [],
      farmerContext,
      language: 'hi',
      text: 'मेरे जिले में अगले 5 दिन बारिश होगी क्या? गेहूं में सिंचाई कब करूं?',
    });
    assert(reply.text.length > 20, 'empty chat reply');
    assert(/[ऀ-ॿ]/.test(reply.text), 'reply is not in Hindi');
    const u = reply.response.usage;
    console.log('\n--- Chat reply ---\n' + reply.text + '\n------------------\n');
    return `toolRounds=${reply.toolRounds} cacheWrite=${u.cache_creation_input_tokens} cacheRead=${u.cache_read_input_tokens}`;
  });

  await check('Chat follow-up (prompt cache read)', async () => {
    const reply = await generateChatReply({
      history: [
        { role: 'user', text: 'How to treat yellow rust in wheat?' },
        { role: 'assistant', text: 'Yellow rust: remove infected leaves and spray Propiconazole as advised by your KVK.' },
      ],
      farmerContext,
      language: 'en',
      text: 'Any organic option?',
    });
    assert(reply.text.length > 20, 'empty chat reply');
    const u = reply.response.usage;
    assert((u.cache_read_input_tokens ?? 0) > 0, 'knowledge base was not read from the prompt cache');
    return `cacheRead=${u.cache_read_input_tokens} input=${u.input_tokens}`;
  });

  await check('Crop scan (JSON for the app)', async () => {
    const imagePath = process.argv[2] || path.resolve(__dirname, '../../../Mobile App/assets/icon.png');
    const ext = path.extname(imagePath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    const mediaType = toClaudeImageMediaType(mime);
    assert(mediaType, 'unsupported test image type');
    const base64 = fs.readFileSync(imagePath).toString('base64');
    const json = await runCropDiagnosis(base64, mediaType, 'Hindi');
    const d = JSON.parse(json);
    for (const key of ['crop', 'problem', 'confidence', 'severity', 'severityScore', 'summary', 'recommendations', 'products', 'expertHelp']) {
      assert(key in d, `missing key ${key}`);
    }
    assert(['Low', 'Moderate', 'High'].includes(d.severity), `severity not Low/Moderate/High: ${d.severity}`);
    assert(typeof d.confidence === 'number' && typeof d.severityScore === 'number', 'scores are not numbers');
    for (const k of ['immediate', 'organic', 'chemical']) {
      assert(Array.isArray(d.recommendations[k]), `recommendations.${k} is not a list`);
    }
    console.log('\n--- Scan diagnosis ---\n' + JSON.stringify(d, null, 2) + '\n----------------------\n');
    return `crop="${d.crop}" problem="${d.problem}" severity=${d.severity}`;
  });

  await check('Crop planner (JSON plan)', async () => {
    const plan = await CropPlanningService.generatePlan({
      crop: 'Wheat',
      location: { state: 'Bihar', district: 'Patna' },
      landSize: '2 acres',
      waterAvailability: 'medium',
      farmingType: 'traditional',
    });
    assert(plan && typeof plan === 'object', 'plan is not an object');
    assert(Array.isArray(plan.stages) && plan.stages.length > 0, 'plan has no stages');
    return `stages=${plan.stages.length} duration="${plan.total_duration}"`;
  });

  await check('Weather recommendations (JSON list)', async () => {
    const recs = await AISchedulingService.generateWeatherRecommendations({
      cropType: 'Wheat',
      stage: 'tillering',
      weatherSummary: 'Light rain expected in 2 days, 24°C',
    });
    assert(Array.isArray(recs) && recs.length > 0, 'no recommendations');
    return recs.join(' | ');
  });

  await check('Follow-up suggestions (JSON list)', async () => {
    const s = await generateQuerySuggestions({
      userQuery: 'How to treat yellow rust in wheat?',
      aiResponse: 'Spray Propiconazole 25 EC and remove infected leaves.',
      farmerCrops: ['Wheat'],
      language: 'hi',
    });
    assert(s.length > 0, 'no suggestions');
    return s.map((x) => x.text).join(' | ');
  });

  console.log('\n=== Claude smoke test ===');
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}: ${r.detail}`);
  const failed = results.filter((r) => !r.ok).length;
  console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
  process.exit(failed ? 1 : 0);
}

main();
