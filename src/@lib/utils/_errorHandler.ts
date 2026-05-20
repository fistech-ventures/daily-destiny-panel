import { Env } from '.environments';
import { ImagePaths } from '@lib/constant';
import { AxiosError } from 'axios';

export enum ResponseCode {
  SUCCESS = 200,
  NO_CONTENT = 201,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  DEFAULT = -1,
}

export enum ResponseMessage {
  SUCCESS = 'Success',
  NO_CONTENT = 'Success with no content.',
  BAD_REQUEST = 'Bad request, try again later.',
  FORBIDDEN = 'Forbidden request, try again later.',
  UNAUTHORIZED = 'User is unauthorized, try again later.',
  NOT_FOUND = 'Url is not found, try again later.',
  INTERNAL_SERVER_ERROR = 'Internal server error, try again later.',
  DEFAULT = 'Something went wrong, try again later.',
}

export const imageNotFoundFn = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const imgElement = event.currentTarget;
  imgElement.src = ImagePaths.notFound;
  imgElement.alt = 'Image not found';
};

export const failureResponseFn = (code: ResponseCode, message: ResponseMessage) => ({
  code: code || ResponseCode.DEFAULT,
  message: message || ResponseMessage.DEFAULT,
});

export const responseHandlerFn = (error: AxiosError) => {
  if (!Env.isProduction) return failureResponseFn(error.code as any, error.message as any);

  const { response } = error;
  if (!response?.status) return failureResponseFn(ResponseCode.DEFAULT, ResponseMessage.DEFAULT);

  switch (response?.status) {
    case ResponseCode.SUCCESS:
      return failureResponseFn(ResponseCode.SUCCESS, ResponseMessage.SUCCESS);
    case ResponseCode.NO_CONTENT:
      return failureResponseFn(ResponseCode.NO_CONTENT, ResponseMessage.NO_CONTENT);
    case ResponseCode.BAD_REQUEST:
      return failureResponseFn(ResponseCode.BAD_REQUEST, ResponseMessage.BAD_REQUEST);
    case ResponseCode.FORBIDDEN:
      return failureResponseFn(ResponseCode.FORBIDDEN, ResponseMessage.FORBIDDEN);
    case ResponseCode.UNAUTHORIZED:
      return failureResponseFn(ResponseCode.UNAUTHORIZED, ResponseMessage.UNAUTHORIZED);
    case ResponseCode.NOT_FOUND:
      return failureResponseFn(ResponseCode.NOT_FOUND, ResponseMessage.NOT_FOUND);
    case ResponseCode.INTERNAL_SERVER_ERROR:
      return failureResponseFn(ResponseCode.INTERNAL_SERVER_ERROR, ResponseMessage.INTERNAL_SERVER_ERROR);
    default:
      return failureResponseFn(ResponseCode.DEFAULT, ResponseMessage.DEFAULT);
  }
};
