import { Component } from '@angular/core';
import { AppAlert, FireLoopRef } from './shared/sdk/models';
import { RealTime } from './shared/sdk/services';
import { LoggerService } from './shared/sdk/services';
import { LoopBackConfig } from './shared/sdk/lb.config';

@Component({
    selector: 'ns-app',
    templateUrl: 'app.component.html',
})

export class AppComponent {

  private AppTitle    : string     = 'APP v1.0';

  private alert       : AppAlert   = new AppAlert();
  private alerts      : AppAlert[] = new Array<AppAlert>();
  private AppAlertRef : FireLoopRef<AppAlert>;
  private logger      : LoggerService;

  constructor(private rt: RealTime) {
    //LoopBackConfig.setBaseURL('http://172.21.188.160:7000');
    LoopBackConfig.setBaseURL('http://192.168.43.171:7000');
    this.rt.onReady().subscribe(() => {
      this.AppAlertRef = this.rt.FireLoop.ref<AppAlert>(AppAlert);
      this.AppAlertRef.on('change').subscribe((alerts: AppAlert[]) => this.alerts = alerts);
    });
  }

  DoCreate(): void {
    this.AppAlertRef.create(this.alert).subscribe(() => this.alert = new AppAlert());
  }

}
