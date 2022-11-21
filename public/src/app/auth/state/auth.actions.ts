import { User } from './../../models/user.model';
import { createAction, props } from '@ngrx/store';
export const LOGIN_START = '[auth page] login start';
export const LOGIN_SUCCESS = '[auth page] login Success';
export const LOGIN_FAIL = '[auth page] login Fail';

export const SIGNUP_START = '[auth page] signup start';
export const SIGNUP_SUCCESS = '[auth page] signup success';

export const AUTO_LOGIN_ACTION = '[auth page] auto login';
export const AUTO_LOGIN_SUCCESS = '[auth page] auto login success';
export const LOGOUT_ACTION = '[auth page] logout';
export const LOGOUT_ACTION_SUCCESS = '[auth page] logout';

export const loginStart = createAction(
  LOGIN_START,
  props<{ email: string; password: string }>()
);
export const loginSuccess = createAction(
  LOGIN_SUCCESS,
  props<{ user: User | null; redirect: boolean }>()
);

export const signupStart = createAction(
  SIGNUP_START,
  props<{ email: string; password: string, repassword: string }>()
);

export const signupSuccess = createAction(
  SIGNUP_SUCCESS,
  props<{ user: User; redirect: boolean }>()
);

export const autoLogin = createAction(
  AUTO_LOGIN_ACTION,
  props<{ user: User }>
);

export const autoLoginSuccess = createAction(
  AUTO_LOGIN_SUCCESS,
  props<{ user: User; redirect: boolean }>
);

export const autoLogout = createAction(LOGOUT_ACTION);
export const autoLogoutSuccess = createAction(LOGOUT_ACTION_SUCCESS);
export const dummyAction = createAction('[dummy action]');