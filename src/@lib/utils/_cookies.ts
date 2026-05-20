import { Env } from '.environments';

export const Cookies = {
  prefix: `${Env.webIdentifier}_`,

  getData: function (name: string) {
    if (typeof window === 'undefined') return null;

    const sanitizedName = this.prefix + name;
    const cookies = document.cookie;
    const match = cookies.split('; ').find((cookie) => cookie.startsWith(sanitizedName + '='));

    if (!match) return null;

    try {
      return JSON.parse(match.split('=')[1]);
    } catch {
      return null;
    }
  },

  setData: function (
    name: string,
    data: any,
    expDate: Date = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
  ) {
    if (typeof window === 'undefined') return;

    const sanitizedName = this.prefix + name;
    const expires = 'expires=' + expDate.toUTCString();
    const value = JSON.stringify(data);

    document.cookie = `${sanitizedName}=${value}; ${expires}; path=/`;
  },

  removeData: function (name: string) {
    if (typeof window === 'undefined') return;

    const sanitizedName = this.prefix + name;
    document.cookie = `${sanitizedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  },

  clear: function () {
    if (typeof window === 'undefined') return;

    const cookies = document.cookie?.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      const equalIdx = cookie.indexOf('=');
      const name = equalIdx > -1 ? cookie.substring(0, equalIdx) : cookie;

      if (name.startsWith(this.prefix)) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      }
    }
  },
};
