import { exhaustMap, take } from 'rxjs/operators';
import { getToken } from './../auth/state/auth.selector';
import { AppState } from './../store/app.state';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpHeaders,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(private store: Store<AppState>) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.store.select(getToken).pipe(
      take(1),
      exhaustMap((token) => {
        if (!token) {
          return next.handle(req);
        }

        const headers = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        });

        // let modifiedReq = req.clone({params: req.params.append('auth', token)});
        let modifiedReq = req.clone({headers});
        return next.handle(modifiedReq);
      })
    );
  }
}