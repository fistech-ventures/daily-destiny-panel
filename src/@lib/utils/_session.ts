import { Env } from '.environments';

export const Session = {
  prefix: `${Env.webIdentifier}_`,

  getData: function (name: string) {
    if (typeof window === 'undefined') return null;

    const key = this.prefix + name;
    const data = sessionStorage.getItem(key);

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
    sessionStorage.setItem(key, JSON.stringify(data));
  },

  removeData: function (name: string) {
    if (typeof window === 'undefined') return;

    const key = this.prefix + name;
    sessionStorage.removeItem(key);
  },

  clear: function () {
    if (typeof window === 'undefined') return;

    const keysToRemove: string[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);

      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  },
};
