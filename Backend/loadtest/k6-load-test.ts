import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ── Custom Metrics ──
const chatLatency = new Trend('chat_response_time', true);
const cacheHitRate = new Rate('cache_hit_rate');
const errors = new Counter('errors');

// ── Load Profile: 10k Concurrent Users ──
export const options = {
  scenarios: {
    // Ramp to 10k users over stages
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },     // Warm-up
        { duration: '2m', target: 1000 },    // Ramp up
        { duration: '3m', target: 5000 },    // Heavy load
        { duration: '5m', target: 10000 },   // Peak: 10k concurrent
        { duration: '3m', target: 10000 },   // Sustain peak
        { duration: '2m', target: 500 },     // Cool down
        { duration: '1m', target: 0 },       // Drain
      ],
    },
    // Constant throughput for API endpoints
    api_throughput: {
      executor: 'constant-arrival-rate',
      rate: 500,           // 500 requests per second
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 200,
      maxVUs: 2000,
    },
    // Spike test
    spike_test: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      stages: [
        { duration: '30s', target: 50 },
        { duration: '10s', target: 2000 },  // Sudden spike
        { duration: '1m', target: 2000 },   // Hold spike
        { duration: '10s', target: 50 },    // Drop back
        { duration: '30s', target: 50 },    // Recover
      ],
      preAllocatedVUs: 500,
      maxVUs: 5000,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],  // 95th < 3s, 99th < 5s
    http_req_failed: ['rate<0.05'],                     // < 5% error rate
    chat_response_time: ['p(95)<4000'],                 // Chat specific latency
    cache_hit_rate: ['rate>0.3'],                        // At least 30% cache hit
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const headers = { 'Content-Type': 'application/json' };

// Test data
const QUESTIONS = [
  'मेरी गेहूं की फसल में पीलापन आ रहा है',
  'Cotton pest control methods',
  'धान की बुवाई कब करें',
  'What fertilizer for tomato',
  'मक्के में कीड़ा लगा है क्या करें',
  'सोयाबीन की उन्नत किस्में बताइए',
  'How to increase wheat yield',
  'गन्ने में लाल सड़न रोग का इलाज',
  'Best irrigation method for rice',
  'PM Kisan Yojana details',
];

const PHONES = Array.from({ length: 1000 }, (_, i) =>
  `+91${7000000000 + i}`
);

// ── Helper: Authenticate ──
function authenticate(): string | null {
  const phone = PHONES[Math.floor(Math.random() * PHONES.length)];

  const otpRes = http.post(`${BASE_URL}/api/auth/send-otp`,
    JSON.stringify({ phone }),
    { headers }
  );

  if (otpRes.status !== 200) {
    errors.add(1);
    return null;
  }

  const otp = JSON.parse(otpRes.body as string).otp;
  if (!otp) return null;

  const verifyRes = http.post(`${BASE_URL}/api/auth/verify-otp`,
    JSON.stringify({ phone, otp }),
    { headers }
  );

  if (verifyRes.status !== 200) {
    errors.add(1);
    return null;
  }

  return JSON.parse(verifyRes.body as string).token;
}

// ── Main Test ──
export default function () {
  // ── Health Check ──
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/health`);
    check(res, {
      'health status 200': (r) => r.status === 200,
      'health body ok': (r) => JSON.parse(r.body as string).status === 'ok',
    });
  });

  // ── Auth Flow ──
  let token: string | null = null;
  group('Authentication', () => {
    token = authenticate();
    check(token, {
      'auth successful': (t) => t !== null,
    });
  });

  if (!token) {
    sleep(1);
    return;
  }

  const authHeaders = { ...headers, Authorization: `Bearer ${token}` };

  // ── Chat: AI Question ──
  group('Chat - AI Question', () => {
    const question = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    const start = Date.now();

    const res = http.post(`${BASE_URL}/api/chat/ask`,
      JSON.stringify({ message: question, language: 'auto' }),
      { headers: authHeaders, timeout: '35s' }
    );

    chatLatency.add(Date.now() - start);

    check(res, {
      'chat status 200 or 504': (r) => r.status === 200 || r.status === 504,
      'chat has answer': (r) => {
        if (r.status !== 200) return true;
        const body = JSON.parse(r.body as string);
        return body.answer !== undefined;
      },
    });

    if (res.status === 200) {
      const body = JSON.parse(res.body as string);
      cacheHitRate.add(body.cached === true ? 1 : 0);
    }
  });

  sleep(1);

  // ── Chat: Repeated question (cache hit test) ──
  group('Chat - Cache Hit', () => {
    const start = Date.now();
    const res = http.post(`${BASE_URL}/api/chat/ask`,
      JSON.stringify({
        message: 'मेरी गेहूं की फसल में पीलापन आ रहा है',
        language: 'Hindi',
      }),
      { headers: authHeaders, timeout: '35s' }
    );

    chatLatency.add(Date.now() - start);

    if (res.status === 200) {
      const body = JSON.parse(res.body as string);
      cacheHitRate.add(body.cached === true ? 1 : 0);
      check(res, {
        'cache hit returned fast': () => (Date.now() - start) < 500,
      });
    }
  });

  // ── Chat History ──
  group('Chat - History', () => {
    const res = http.get(`${BASE_URL}/api/chat/history`, { headers: authHeaders });
    check(res, {
      'history status 200': (r) => r.status === 200,
    });
  });

  // ── Marketplace ──
  group('Marketplace - Browse', () => {
    const res = http.get(`${BASE_URL}/api/products?page=1&limit=10`);
    check(res, {
      'products status 200': (r) => r.status === 200,
    });
  });

  // ── User Profile ──
  group('User - Profile', () => {
    const res = http.get(`${BASE_URL}/api/user/profile`, { headers: authHeaders });
    check(res, {
      'profile status 200': (r) => r.status === 200,
    });
  });

  sleep(Math.random() * 2);
}

// ── Summary ──
export function handleSummary(data: Record<string, unknown>) {
  return {
    'loadtest/results/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
  };
}

function textSummary(data: Record<string, unknown>, _opts: Record<string, unknown>): string {
  return JSON.stringify(data, null, 2);
}
