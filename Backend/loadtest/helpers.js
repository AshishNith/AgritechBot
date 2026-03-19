const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'load-test-secret-min16chars';

// Pre-generate a pool of fake user IDs for realistic distribution
const USER_POOL_SIZE = 10000;
const userPool = Array.from({ length: USER_POOL_SIZE }, () =>
  crypto.randomBytes(12).toString('hex')
);

/**
 * Generate a valid JWT token for load testing.
 * Picks from a pool of 10k simulated users.
 */
function generateAuthToken(requestParams, context, ee, next) {
  const userIndex = Math.floor(Math.random() * USER_POOL_SIZE);
  const userId = userPool[userIndex];

  const token = jwt.sign(
    { userId, role: 'user' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  context.vars.authToken = token;
  next();
}

/**
 * Log response time for custom metrics.
 */
function logResponseTime(requestParams, response, context, ee, next) {
  if (response && response.timings) {
    ee.emit('customStat', {
      stat: 'response_time_ms',
      value: response.timings.phases.total,
    });
  }
  next();
}

module.exports = {
  generateAuthToken,
  logResponseTime,
};
