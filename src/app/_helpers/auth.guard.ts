import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccountService, AlertService } from '@app/_services';
import { Role } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const account = this.accountService.accountValue;
    if (account) {
      if (route.data['roles'] && !route.data['roles'].includes(account.role)) {
        this.alertService.error('Unauthorized', { keepAfterRouteChange: true });
        this.router.navigate(['/']);
        return false;
      }
      return true;
    }

    this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}