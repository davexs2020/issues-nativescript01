"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var models_1 = require("./shared/sdk/models");
var services_1 = require("./shared/sdk/services");
var lb_config_1 = require("./shared/sdk/lb.config");
var AppComponent = (function () {
    function AppComponent(rt) {
        var _this = this;
        this.rt = rt;
        this.AppTitle = 'APP v1.0';
        this.alert = new models_1.AppAlert();
        this.alerts = new Array();
        //LoopBackConfig.setBaseURL('http://172.21.188.160:7000');
        lb_config_1.LoopBackConfig.setBaseURL('http://192.168.43.171:7000');
        this.rt.onReady().subscribe(function () {
            _this.AppAlertRef = _this.rt.FireLoop.ref(models_1.AppAlert);
            _this.AppAlertRef.on('change').subscribe(function (alerts) { return _this.alerts = alerts; });
        });
    }
    AppComponent.prototype.DoCreate = function () {
        var _this = this;
        this.AppAlertRef.create(this.alert).subscribe(function () { return _this.alert = new models_1.AppAlert(); });
    };
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'ns-app',
        templateUrl: 'app.component.html',
    }),
    __metadata("design:paramtypes", [services_1.RealTime])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBMEM7QUFDMUMsOENBQTREO0FBQzVELGtEQUFpRDtBQUVqRCxvREFBd0Q7QUFPeEQsSUFBYSxZQUFZO0lBU3ZCLHNCQUFvQixFQUFZO1FBQWhDLGlCQU9DO1FBUG1CLE9BQUUsR0FBRixFQUFFLENBQVU7UUFQeEIsYUFBUSxHQUFtQixVQUFVLENBQUM7UUFFdEMsVUFBSyxHQUFzQixJQUFJLGlCQUFRLEVBQUUsQ0FBQztRQUMxQyxXQUFNLEdBQXFCLElBQUksS0FBSyxFQUFZLENBQUM7UUFLdkQsMERBQTBEO1FBQzFELDBCQUFjLENBQUMsVUFBVSxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUM7WUFDMUIsS0FBSSxDQUFDLFdBQVcsR0FBRyxLQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQVcsaUJBQVEsQ0FBQyxDQUFDO1lBQzVELEtBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFDLE1BQWtCLElBQUssT0FBQSxLQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDO1FBQ3hGLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELCtCQUFRLEdBQVI7UUFBQSxpQkFFQztRQURDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxpQkFBUSxFQUFFLEVBQTNCLENBQTJCLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBRUgsbUJBQUM7QUFBRCxDQUFDLEFBdEJELElBc0JDO0FBdEJZLFlBQVk7SUFMeEIsZ0JBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFdBQVcsRUFBRSxvQkFBb0I7S0FDcEMsQ0FBQztxQ0FXd0IsbUJBQVE7R0FUckIsWUFBWSxDQXNCeEI7QUF0Qlksb0NBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFwcEFsZXJ0LCBGaXJlTG9vcFJlZiB9IGZyb20gJy4vc2hhcmVkL3Nkay9tb2RlbHMnO1xuaW1wb3J0IHsgUmVhbFRpbWUgfSBmcm9tICcuL3NoYXJlZC9zZGsvc2VydmljZXMnO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4vc2hhcmVkL3Nkay9zZXJ2aWNlcyc7XG5pbXBvcnQgeyBMb29wQmFja0NvbmZpZyB9IGZyb20gJy4vc2hhcmVkL3Nkay9sYi5jb25maWcnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25zLWFwcCcsXG4gICAgdGVtcGxhdGVVcmw6ICdhcHAuY29tcG9uZW50Lmh0bWwnLFxufSlcblxuZXhwb3J0IGNsYXNzIEFwcENvbXBvbmVudCB7XG5cbiAgcHJpdmF0ZSBBcHBUaXRsZSAgICA6IHN0cmluZyAgICAgPSAnQVBQIHYxLjAnO1xuXG4gIHByaXZhdGUgYWxlcnQgICAgICAgOiBBcHBBbGVydCAgID0gbmV3IEFwcEFsZXJ0KCk7XG4gIHByaXZhdGUgYWxlcnRzICAgICAgOiBBcHBBbGVydFtdID0gbmV3IEFycmF5PEFwcEFsZXJ0PigpO1xuICBwcml2YXRlIEFwcEFsZXJ0UmVmIDogRmlyZUxvb3BSZWY8QXBwQWxlcnQ+O1xuICBwcml2YXRlIGxvZ2dlciAgICAgIDogTG9nZ2VyU2VydmljZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJ0OiBSZWFsVGltZSkge1xuICAgIC8vTG9vcEJhY2tDb25maWcuc2V0QmFzZVVSTCgnaHR0cDovLzE3Mi4yMS4xODguMTYwOjcwMDAnKTtcbiAgICBMb29wQmFja0NvbmZpZy5zZXRCYXNlVVJMKCdodHRwOi8vMTkyLjE2OC40My4xNzE6NzAwMCcpO1xuICAgIHRoaXMucnQub25SZWFkeSgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLkFwcEFsZXJ0UmVmID0gdGhpcy5ydC5GaXJlTG9vcC5yZWY8QXBwQWxlcnQ+KEFwcEFsZXJ0KTtcbiAgICAgIHRoaXMuQXBwQWxlcnRSZWYub24oJ2NoYW5nZScpLnN1YnNjcmliZSgoYWxlcnRzOiBBcHBBbGVydFtdKSA9PiB0aGlzLmFsZXJ0cyA9IGFsZXJ0cyk7XG4gICAgfSk7XG4gIH1cblxuICBEb0NyZWF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLkFwcEFsZXJ0UmVmLmNyZWF0ZSh0aGlzLmFsZXJ0KS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5hbGVydCA9IG5ldyBBcHBBbGVydCgpKTtcbiAgfVxuXG59XG4iXX0=