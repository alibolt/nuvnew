// Mock Redis for local development without Redis
const store = new Map<string, any>();

export const redis = {
  get: async (key: string) => {
    console.log('[Redis Mock] GET:', key);
    const value = store.get(key);
    return value || null;
  },
  
  set: async (key: string, value: any, options?: { ex?: number }) => {
    console.log('[Redis Mock] SET:', key, value);
    // Handle both string and object values
    if (typeof value === 'string') {
      try {
        store.set(key, JSON.parse(value));
      } catch {
        store.set(key, value);
      }
    } else {
      store.set(key, value);
    }
    return 'OK';
  },
  
  del: async (key: string) => {
    console.log('[Redis Mock] DEL:', key);
    store.delete(key);
    return 1;
  },
  
  smembers: async (key: string) => {
    console.log('[Redis Mock] SMEMBERS:', key);
    const value = store.get(key);
    return Array.isArray(value) ? value : [];
  },
  
  sadd: async (key: string, member: string) => {
    console.log('[Redis Mock] SADD:', key, member);
    const set = store.get(key) || [];
    if (!set.includes(member)) {
      set.push(member);
      store.set(key, set);
    }
    return 1;
  },
  
  srem: async (key: string, member: string) => {
    console.log('[Redis Mock] SREM:', key, member);
    const set = store.get(key) || [];
    const index = set.indexOf(member);
    if (index > -1) {
      set.splice(index, 1);
      store.set(key, set);
    }
    return 1;
  }
};