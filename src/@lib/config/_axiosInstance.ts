import { Env } from '.environments';
import { IBaseResponse } from '@base/interfaces';
import { ENUM_API_SCOPE_TYPES } from '@lib/interfaces/apiScope.interface';
import { getNotificationInstance } from '@lib/utils';
import { AuthHooks } from '@modules/auth/lib/hooks';
import { getAuthToken } from '@modules/auth/lib/utils/client';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const requestInterceptorFn = (config: InternalAxiosRequestConfig) => {
  config.baseURL = config.baseURL.replace('{{scope}}', config?.scope || ENUM_API_SCOPE_TYPES.INTERNAL);
  if (config?.scope) delete config.scope;

  return config;
};

// Axios Instance
export const AxiosInstance = axios.create({
  baseURL: Env.apiUrl,
  headers: {
    'Time-Zone-Offset': -new Date().getTimezoneOffset(),
  },
});

AxiosInstance.interceptors.request.use(requestInterceptorFn, (error: AxiosError) => Promise.reject(error));

AxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<IBaseResponse>) => {
    const notification = getNotificationInstance();

    if (error.config.method === 'get') {
      notification.error({ message: error.response?.data?.message || error.response?.statusText });
    }

    return error.response;
  },
);

// Axios Instance (Secure)
export const AxiosSecureInstance = axios.create({
  ...AxiosInstance.defaults,
  headers: {
    ...AxiosInstance.defaults.headers,
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

AxiosSecureInstance.interceptors.request.use(requestInterceptorFn, (error: AxiosError) => Promise.reject(error));

AxiosSecureInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<IBaseResponse>) => {
    const notification = getNotificationInstance();

    if ([401, 403].includes(error.response?.status)) {
      notification.error({ message: error.response?.data?.message || error.response?.statusText });
      AuthHooks.useSignOut();
    } else if (error.config.method === 'get') {
      notification.error({ message: error.response?.data?.message || error.response?.statusText });
    }

    return error.response;
  },
);
