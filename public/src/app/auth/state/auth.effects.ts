import { AuthService } from './../../services/auth.service';
import { catchError, exhaustMap, map, tap, mergeMap } from 'rxjs/operators';
import { loginStart, loginSuccess, signupStart, signupSuccess, autoLogin, autoLogout, autoLoginSuccess, autoLogoutSuccess } from './auth.actions';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { setLoadingSpinner, setErrorMessage } from '../../store/Shared/shared.actions';
import { Observable, of, take } from 'rxjs';
import { Router } from '@angular/router';
import { getUser } from './auth.selector';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions, 
    private authService: AuthService, 
    private store: Store,
    private router: Router
  ) {}

  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loginStart),
      exhaustMap((action) => {
        return this.authService.login(action.email, action.password).pipe(
          map((data) => {
            this.store.dispatch(setLoadingSpinner({ status: false }));
            this.store.dispatch(setErrorMessage({ message: '' }));
            const user = this.authService.formatUser(data);
            this.authService.setUserInLocalStorage(user); // antes guardabamos el user en localstorage, ahora lo guardamos directamente en la store (ngrx)
            this.authService.runTimeoutInterval(user);
            this.authService.setRefreshToken(data);
            return loginSuccess({ user, redirect: true });
          }),
          catchError(errResp => {
            this.store.dispatch(setLoadingSpinner({ status: false }));
            const errorMessage = this.authService.getErrorMessage(errResp.error?.error);
            return of(setErrorMessage({ message: errorMessage }));
          })
        );
      })// , take(1) // Fix for logout, avoids to re-login again automatically when click logout button
    );
  });

  loginRedirect$ = createEffect(
    () => {
      return this.actions$.pipe(
        // ofType(loginSuccess), // opcion 2
        // Opcion 1 no definir un nuevo efect, unicamente incluir en el del login la action de signupSuccess
        ofType(...[ loginSuccess, signupSuccess ]),
        tap((action) => {
          this.store.dispatch(setErrorMessage({ message: '' }));
          if(action.redirect) {
            this.router.navigate(['/']);
          }
        })
      );
    },
    { dispatch: false }
  );

  // Opcion 2 definir un nuevo effect para redireccionar en signup
  // signUpRedirect$ = createEffect(
  //   () => {
  //     return this.actions$.pipe(
  //       ofType(signupSuccess),
  //       tap((action) => {
  //         this.store.dispatch(setErrorMessage({ message: '' }));
  //         this.router.navigate(['/']);
  //       })
  //     );
  //   },
  //   { dispatch: false }
  // );

  signUp$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(signupStart),
      exhaustMap((action) => {
        return this.authService.signUp(action.email, action.password, action.repassword).pipe(
          map((data) => {
            this.store.dispatch(setLoadingSpinner({ status: false }));
            const user = this.authService.formatUser(data);
            this.authService.setUserInLocalStorage(user); // antes guardabamos el user en localstorage, ahora lo guardamos directamente en la store (ngrx)
            return signupSuccess({ user, redirect: true });
          }),
          catchError((errResp) => {
            this.store.dispatch(setLoadingSpinner({ status: false }));
            // sometimes data will be in errResp.error?.error and sometimes in errResp.error?.errors[0]?.msg, depends on what server returns, in this case its handled by express.js
            const errorMessage = this.authService.getErrorMessage(
              errResp.error?.error ? errResp.error?.error : errResp.error?.errors[0]?.msg
            );
            return of(setErrorMessage({ message: errorMessage }));
          })
        );
      })
    );
  });

  autoLogin$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(autoLogin),
        mergeMap((action) => {
          const user = this.authService.getUserFromLocalStorage();
          return of(loginSuccess({ user, redirect: false }));
        })
      );
    }
  );

  // autoLogin$ = createEffect(
  //   () => {
  //     return this.actions$.pipe(
  //       ofType(autoLogin),
  //       mergeMap((): Observable<ReturnType<typeof autoLoginSuccess>> => {
  //         // const user = this.authService.getUserFromLocalStorage();  // antes cogiamos el user de localstorage, ahora lo cogemos directamente de la store (ngrx)
  //         return this.store.select(getUser).pipe(map((data) => {
  //           // return of(autoLoginSuccess({ user: data, redirect: false }));
  //           return autoLoginSuccess();
  //         }));
  //       })
  //     );
  //   }
  // );


  // No funciona, aunque con este codigo al menos si funciona el login
  logout$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(autoLogout),
        exhaustMap(() => {
          return this.authService.logout().pipe(
            map(() => {
              // this.router.navigate(['']);
              // this.router.navigate(['auth']);
              return autoLogoutSuccess();
            })
          )
        })
      );
    },
    { dispatch: false }
  );
}