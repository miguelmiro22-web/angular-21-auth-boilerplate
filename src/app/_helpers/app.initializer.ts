import { AccountService } from '@app/_services';
import { catchError, of } from 'rxjs';

export function appInitializer(accountService: AccountService): () => Promise<void> {
  return () => new Promise<void>(resolve => {
    accountService.refreshToken()
      .pipe(catchError(() => of(null)))
      .subscribe(() => resolve());
  });
}