import { Component } from '@angular/core';
import { AccountService } from './_services';
import { Account } from './_models';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: false
})
export class AppComponent {
  constructor(private accountService: AccountService) { }

  get account(): Account | null {
    return this.accountService.accountValue;
  }

  logout() {
    this.accountService.logout();
  }
}