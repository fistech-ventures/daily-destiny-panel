import { IBaseResponse } from '@base/interfaces';
import { AxiosInstance, AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import { IUserCreate } from '@modules/users/lib/interfaces';
import { ISignIn, ISignInResponse } from './interfaces';

const END_POINT: string = '/auth';

export const AuthServices = {
  NAME: END_POINT,

  signIn: async (payload: ISignIn): Promise<ISignInResponse> => {
    try {
      const res = await AxiosInstance.post(`${END_POINT}/login`, payload);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  passwordResetRequest: async (payload: {
    identifier: string;
  }): Promise<
    IBaseResponse<{
      identifier: string;
      hash: string;
      otp: number;
    }>
  > => {
    try {
      const res = await AxiosInstance.post(`${END_POINT}/reset-password-request`, payload);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  passwordReset: async (payload: {
    identifier: string;
    hash: string;
    otp: number;
    newPassword: string;
  }): Promise<IBaseResponse> => {
    try {
      const res = await AxiosInstance.post(`${END_POINT}/reset-password-verify`, payload);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  passwordUpdate: async (payload: { currentPassword: string; newPassword: string }): Promise<IBaseResponse> => {
    try {
      const res = await AxiosSecureInstance.patch(`${END_POINT}/change-password`, payload);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  sendRegistrationLink: async (payload: { email: string; registrationLink: string }): Promise<IBaseResponse> => {
    try {
      const res = await AxiosSecureInstance.post(`${END_POINT}/register-with-link/send`, payload);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  signUpWithLink: async (payload: IUserCreate & { hash: string }): Promise<IBaseResponse> => {
    try {
      const res = await AxiosInstance.post(`${END_POINT}/register-with-link`, payload);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
  signUpLinkExist: async (options: { hash: string }): Promise<IBaseResponse<{ isExist: boolean }>> => {
    try {
      const res = await AxiosInstance.get(`${END_POINT}/registration-link-exist?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
