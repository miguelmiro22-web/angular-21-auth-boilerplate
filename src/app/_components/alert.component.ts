import { ChangeDetectorRef, Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { Alert, AlertType } from '@app/_models';
import { AlertService } from '@app/_services';

@Component({
  selector: 'alert',
  templateUrl: 'alert.component.html',
  standalone: false
})
export class AlertComponent implements OnInit, OnDestroy {
  @Input() id = 'default-alert';
  @Input() fade = true;

  alerts: Alert[] = [];
  private alertSubscription!: Subscription;
  private routeSubscription!: Subscription;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // subscribe to new alert notifications
    this.alertSubscription = this.alertService.onAlert(this.id)
      .subscribe((alert: Alert) => {
        // wrap in setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          // clear alerts when an empty alert is received
          if (!alert.message) {
            this.alerts = this.alerts.filter(x => x.keepAfterRouteChange);
            this.alerts.forEach(x => delete x.keepAfterRouteChange);
            this.cdr.detectChanges();
            return;
          }

          this.alerts.push(alert);
          this.cdr.detectChanges();

          if (alert.autoClose) {
            setTimeout(() => this.removeAlert(alert), 3000);
          }
        });
      });

    // clear alerts on location change
    this.routeSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        // also wrap in setTimeout for safety
        setTimeout(() => {
          this.alertService.clear(this.id);
          this.cdr.detectChanges();
        });
      }
    });
  }

  ngOnDestroy() {
    // unsubscribe to avoid memory leaks
    this.alertSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }

  removeAlert(alert: Alert) {
    // check if already removed to prevent error on auto close
    if (!this.alerts.includes(alert)) return;

    if (this.fade) {
      alert.fade = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.alerts = this.alerts.filter(x => x !== alert);
        this.cdr.detectChanges();
      }, 250);
    } else {
      this.alerts = this.alerts.filter(x => x !== alert);
      this.cdr.detectChanges();
    }
  }

  cssClasses(alert: Alert): string {
    if (!alert) return '';

    const classes = ['alert', 'alert-dismissible', 'mt-4', 'container'];

    const alertTypeClass = {
      [AlertType.Success]: 'alert-success',
      [AlertType.Error]: 'alert-danger',
      [AlertType.Info]: 'alert-info',
      [AlertType.Warning]: 'alert-warning'
    };

    if (alert.type !== undefined) {
      classes.push(alertTypeClass[alert.type]);
    }

    if (alert.fade) {
      classes.push('fade');
    }

    return classes.join(' ');
  }
}