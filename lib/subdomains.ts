import { redis } from '@/lib/redis';

export function isValidIcon(str: string) {
  if (str.length > 10) {
    return false;
  }

  try {
    // Primary validation: Check if the string contains at least one emoji character
    // This regex pattern matches most emoji Unicode ranges
    const emojiPattern = /[\p{Emoji}]/u;
    if (emojiPattern.test(str)) {
      return true;
    }
  } catch (error) {
    // If the regex fails (e.g., in environments that don't support Unicode property escapes),
    // fall back to a simpler validation
    console.warn(
      'Emoji regex validation failed, using fallback validation',
      error
    );
  }

  // Fallback validation: Check if the string is within a reasonable length
  // This is less secure but better than no validation
  return str.length >= 1 && str.length <= 10;
}

type SubdomainData = {
  emoji: string;
  createdAt: number;
};

export async function getSubdomainData(subdomain: string) {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const data = await redis.get(
    `subdomain:${sanitizedSubdomain}`
  );
  return data as SubdomainData | null;
}

export async function getAllSubdomains() {
  try {
    // For local development, we'll use the database instead of Redis
    // This function is only used by the admin panel which we're not using
    return [];
  } catch (error) {
    console.error('Error getting all subdomains:', error);
    return [];
  }
}

export async function createSubdomain(data: {
  subdomain: string;
  emoji: string;
  createdAt: number;
}) {
  const sanitizedSubdomain = data.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  await redis.set(`subdomain:${sanitizedSubdomain}`, {
    emoji: data.emoji,
    createdAt: data.createdAt
  });
}

export async function deleteSubdomain(subdomain: string) {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  await redis.del(`subdomain:${sanitizedSubdomain}`);
}