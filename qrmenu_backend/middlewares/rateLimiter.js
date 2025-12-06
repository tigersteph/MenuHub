const logger = require('../utils/logger');

class RateLimiter {
  constructor(windowMs, max) {
    this.windowMs = windowMs;
    this.max = max;
    this.requests = new Map();
    
    // Nettoyage périodique pour éviter l'accumulation de données
    setInterval(() => this.cleanup(), Math.min(windowMs, 60000));
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, value] of this.requests.entries()) {
      if (now - value.resetTime > this.windowMs) {
        this.requests.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      logger.debug(`Rate limiter cleanup: ${cleaned} entries removed`);
    }
  }

  getKey(req) {
    // Prendre en compte les proxies et load balancers
    return req.ip || 
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
           req.headers['x-real-ip'] || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           'unknown';
  }

  middleware() {
    return (req, res, next) => {
      if (process.env.NODE_ENV === 'test') {
        return next();
      }

      this.cleanup();
      const key = this.getKey(req);
      const now = Date.now();
      const record = this.requests.get(key);

      if (!record || now - record.resetTime > this.windowMs) {
        this.requests.set(key, {
          count: 1,
          resetTime: now
        });
        return next();
      }

      if (record.count >= this.max) {
        logger.warn('Rate limit exceeded', { ip: key, count: record.count, max: this.max });
        return res.status(429).json({
          success: false,
          error: {
            message: `Trop de requêtes. Limite de ${this.max} requêtes par ${this.windowMs / 1000} secondes. Veuillez réessayer plus tard.`
          }
        });
      }

      record.count++;
      next();
    };
  }
}

const orderRateLimiter = new RateLimiter(
  60 * 1000,
  parseInt(process.env.ORDER_RATE_LIMIT_MAX || '100', 10)
);

const authRateLimiter = new RateLimiter(
  15 * 60 * 1000,
  parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10)
);

const generalRateLimiter = new RateLimiter(
  60 * 1000,
  parseInt(process.env.GENERAL_RATE_LIMIT_MAX || '100', 10)
);

module.exports = {
  orderRateLimiter: orderRateLimiter.middleware(),
  authRateLimiter: authRateLimiter.middleware(),
  generalRateLimiter: generalRateLimiter.middleware(),
  RateLimiter
};
