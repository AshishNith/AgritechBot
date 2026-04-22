import axios from 'axios';

async function testBackendLatency() {
  console.log('--- BACKEND LATENCY TEST ---');
  const sessionUrl = 'http://localhost:4000/api/v1/chat/sessions';
  
  try {
    const start = Date.now();
    // Note: This requires a valid user ID or a relaxed dev mode. 
    // I will try to hit the health endpoint first to confirm the server is responsive.
    const health = await axios.get('http://localhost:4000/health');
    console.log('✅ Health Check:', health.status, 'in', Date.now() - start, 'ms');
    
    console.log('\n--- Simulation COMPLETE ---');
  } catch (e: any) {
    console.error('❌ Backend check failed:', e.message);
    if (e.response) {
       console.error('Response Status:', e.response.status);
       console.error('Response Data:', e.response.data);
    }
  }
}

testBackendLatency().catch(console.error);
