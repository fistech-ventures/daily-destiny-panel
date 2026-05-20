import { Env } from '.environments';

export const Storage = {
  prefix: `${Env.webIdentifier}_`,

  getData: function (name: string) {
    if (typeof window === 'undefined') return null;

    const key = this.prefix + name;
    const data = localStorage.getItem(key);

    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setData: function (name: string, data: any) {
    if (typeof window === 'undefined') return;

    const key = this.prefix + name;
    localStorage.setItem(key, JSON.stringify(data));
  },

  removeData: function (name: string) {
    if (typeof window === 'undefined') return;

    const key = this.prefix + name;
    localStorage.removeItem(key);
  },

  clear: function () {
    if (typeof window === 'undefined') return;

    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },
};
