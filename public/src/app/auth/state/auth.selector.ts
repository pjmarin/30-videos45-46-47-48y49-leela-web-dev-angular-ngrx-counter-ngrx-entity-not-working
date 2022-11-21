import { createFeatureSelector, createSelector } from '@ngrx/store';
import { User } from 'src/app/models/user.model';
import { AuthState } from './auth.state';
export const AUTH_STATE_NAME = 'auth';

const getAuthState = createFeatureSelector<AuthState>(AUTH_STATE_NAME);

export const isAuthenticated = createSelector(getAuthState, (state) => {
  return state.user ? true : false;
});

export const getToken = createSelector(getAuthState, (state) => {
  return state.user ? state.user.userToken : null;
});


// export const getUser = createSelector(getAuthState, (state) => {
//   return state.user ? state.user : new User("", "", "", new Date(Date.now()));
// });

export const getUser = createSelector(getAuthState, (state) => {
  return state.user ? state.user : null;
});