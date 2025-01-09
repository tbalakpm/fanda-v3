import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute   --- 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
  max: 600,
  message: 'Too many requests from this IP, you have exceeded the 600 requests in a minute limit! Please try again in a minute.',
  standardHeaders: true,
  legacyHeaders: false
});
