import { AuthPaths, Paths, UnAuthPaths } from '@lib/constant';
import { Toolbox } from '@lib/utils';
import { REDIRECT_PREFIX } from '@modules/auth/lib/constant';
import { ISession } from '@modules/auth/lib/interfaces';
import { getServerAuthSession } from '@modules/auth/lib/utils/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PUBLIC_FILE_PATTERN = /\.(.*)$/;

const redirectFn = (url: string) =>
  NextResponse.redirect(new URL(url), {
    status: 302,
    headers: { 'Cache-Control': 'no-store' },
  });

export default async function middleware(req: NextRequest) {
  const response = NextResponse.next();
  const { host: hostname, protocol, pathname, search } = req.nextUrl;
  const host = req.headers.get('x-forwarded-host') || hostname;
  const hostProtocol = req.headers.get('x-forwarded-proto') || protocol;
  const origin = `${hostProtocol}://${host}`;

  // Skip paths
  if (pathname.startsWith('/_next') || pathname.includes('/api/') || PUBLIC_FILE_PATTERN.test(pathname)) {
    return response;
  }

  // Get session once
  let sessionCache: ISession = null;

  try {
    sessionCache = getServerAuthSession(req);
  } catch {}

  // Handle unauthenticated paths
  if (UnAuthPaths.includes(pathname)) {
    if (sessionCache?.isAuthenticate) {
      return redirectFn(`${origin}${Paths.admin.root}`);
    }

    return response;
  }

  // Handle authenticated paths
  if (Toolbox.isDynamicPath(AuthPaths, pathname)) {
    if (!sessionCache?.isAuthenticate) {
      const encodedUrl = encodeURIComponent(`${origin}${pathname}${search}`);
      return redirectFn(`${origin}${Paths.auth.signIn}?${REDIRECT_PREFIX}=${encodedUrl}`);
    }

    return response;
  }

  return response;
}
