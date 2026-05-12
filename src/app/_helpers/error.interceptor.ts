import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AccountService } from '@app/_services';
import { environment } from '@environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private accountService: AccountService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        // ignore 401/403 on refresh token request to prevent auto-logout loop
        const isRefreshTokenRequest = request.url.endsWith('/refresh-token');

        if ([401, 403].includes(err.status) && !isRefreshTokenRequest) {
          this.accountService.logout();
        }

        const error = err.error?.message || err.statusText;
        return throwError(() => error);
      })
    );
  }
}