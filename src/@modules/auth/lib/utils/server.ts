import { Cookies } from '@lib/utils';
import { jwtDecode } from 'jwt-decode';
import { AUTH_TOKEN_KEY, PERMISSION_TOKEN_KEY } from '../constant';
import { ISession, IToken } from '../interfaces';
import { unAuthorizeSession } from './client';

export const getServerAuthSession = (req: { cookies: Record<string, any> }): ISession => {
  try {
    const sanitizedName = Cookies.prefix + AUTH_TOKEN_KEY;
    const sanitizedPermissionName = Cookies.prefix + PERMISSION_TOKEN_KEY;
    const token = req.cookies[sanitizedName] || req.cookies.get(sanitizedName)?.value;
    const permissionToken = req.cookies[sanitizedPermissionName] || req.cookies.get(sanitizedPermissionName)?.value;

    if (!token) {
      return unAuthorizeSession;
    } else {
      const tokenDec: IToken = jwtDecode(token);
      const isExpire = isJwtExpire(tokenDec);

      if (isExpire) {
        return unAuthorizeSession;
      } else {
        return {
          isLoading: false,
          isAuthenticate: true,
          user: {
            ...tokenDec.user,
          },
          token,
          permissionToken,
        };
      }
    }
  } catch {
    return unAuthorizeSession;
  }
};

export const isJwtExpire = (token: string | IToken): boolean => {
  let holdToken = null;

  if (typeof token === 'string') holdToken = jwtDecode(token);
  else holdToken = token;

  if (!holdToken?.exp) return true;
  else {
    const expDate: Date = new Date(holdToken.exp * 1000);

    if (expDate > new Date()) return false;
    else return true;
  }
};
