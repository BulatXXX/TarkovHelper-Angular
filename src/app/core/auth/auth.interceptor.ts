import {inject, Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {AuthService} from './auth.service';
import {API_BASE_URL} from '../api/api.config';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private auth = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ✅ Токен только для твоего бэка
    const isOurApi = req.url.startsWith(API_BASE_URL);

    const token = isOurApi ? this.auth.accessToken : null;

    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((err: unknown) => {
        // ✅ Никаких refresh/ретраев пока не сделал refresh на бэке
        if (err instanceof HttpErrorResponse && err.status === 401 && isOurApi) {
          this.auth.logout();
        }
        return throwError(() => err);
      })
    );
  }
}
