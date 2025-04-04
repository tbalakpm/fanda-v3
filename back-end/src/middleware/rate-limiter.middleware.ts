import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute   --- 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
  limit: 50,
  message: 'Too many requests from this IP, you have exceeded the 50 requests in a miute limit! Please try again in a minute.',
  standardHeaders: true,
  legacyHeaders: false
});
