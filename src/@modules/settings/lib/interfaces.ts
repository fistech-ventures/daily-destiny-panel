import { IBaseEntity, IBaseResponse } from '@base/interfaces';

export interface ISettingsIdentitySocialUrls {
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
}

export interface ISettingsIdentity {
  name: string;
  themePrimaryColor: string;
  themeSecondayColor: string;
  description: string;
  logo: string;
  icon: string;
  email: string;
  phone: string;
  address: string;
  socialUrls: ISettingsIdentitySocialUrls;
  phoneCode: string;
  currency: string;
  initialName: string;
  needWebView: boolean;
  allowUserRegistration: boolean;
  userRegistrationVerificationRequired: boolean;
  otpExpiresInMin: number;
}

export interface ISettingsTrackingCodes {
  gtagId: string;
  gtmId: string;
  fbPixelId: string;
}

export interface ISettings extends IBaseEntity {
  identity: ISettingsIdentity;
  trackingCodes: ISettingsTrackingCodes;
  trackingScripts: string[];
}

export interface ISettingsResponse extends IBaseResponse {
  data: ISettings;
}

export interface ISettingsCreate {
  identity: Partial<ISettingsIdentity>;
  trackingCodes: Partial<ISettingsTrackingCodes>;
  trackingScripts: string[];
}
