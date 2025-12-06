/**
 * Service de cache Redis pour améliorer les performances
 * Cache les menus publics qui changent rarement
 */

const redis = require('redis');
const logger = require('./logger');

class CacheService {
  constructor() {
    this.client = null;
    this.enabled = process.env.REDIS_ENABLED === 'true';
  }

  async connect() {
    if (!this.enabled) {
      logger.info('Redis cache disabled');
      return;
    }

    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error', { error: err.message });
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
      });

      await this.client.connect();
      logger.info('Redis cache service initialized');
    } catch (error) {
      logger.error('Failed to connect to Redis', { error: error.message });
      this.enabled = false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis disconnected');
    }
  }

  /**
   * Obtenir une valeur du cache
   */
  async get(key) {
    if (!this.enabled || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  /**
   * Stocker une valeur dans le cache
   */
  async set(key, value, ttl = 3600) {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Supprimer une clé du cache
   */
  async delete(key) {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Supprimer toutes les clés correspondant à un pattern
   */
  async deletePattern(pattern) {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Cache delete pattern error', { pattern, error: error.message });
      return false;
    }
  }

  /**
   * Clé de cache pour un menu public
   */
  static menuPublicKey(placeId) {
    return `menu:public:${placeId}`;
  }

  /**
   * Clé de cache pour les statistiques d'un établissement
   */
  static placeStatsKey(placeId) {
    return `place:stats:${placeId}`;
  }
}

// Singleton
const cacheService = new CacheService();

// Exporter à la fois l'instance et la classe pour les méthodes statiques
cacheService.constructor = CacheService;

module.exports = cacheService;

