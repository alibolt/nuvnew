// Client-safe Prisma stub for browser environments
// This prevents Prisma from being bundled in client-side code

export const prisma = new Proxy({} as any, {
  get() {
    throw new Error('Prisma client cannot be used in the browser. Use API routes instead.');
  }
});