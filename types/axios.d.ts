import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    scope?: string;
  }
}
