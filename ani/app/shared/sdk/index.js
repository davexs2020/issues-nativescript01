"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/**
* @module SDKModule
* @author Jonathan Casarrubias <t:@johncasarrubias> <gh:jonathan-casarrubias>
* @license MIT 2016 Jonathan Casarrubias
* @version 2.1.0
* @description
* The SDKModule is a generated Software Development Kit automatically built by
* the LoopBack SDK Builder open source module.
*
* The SDKModule provides Angular 2 >= RC.5 support, which means that NgModules
* can import this Software Development Kit as follows:
*
*
* APP Route Module Context
* ============================================================================
* import { NgModule }       from '@angular/core';
* import { BrowserModule }  from '@angular/platform-browser';
* // App Root
* import { AppComponent }   from './app.component';
* // Feature Modules
* import { SDK[Browser|Node|Native]Module } from './shared/sdk/sdk.module';
* // Import Routing
* import { routing }        from './app.routing';
* @NgModule({
*  imports: [
*    BrowserModule,
*    routing,
*    SDK[Browser|Node|Native]Module.forRoot()
*  ],
*  declarations: [ AppComponent ],
*  bootstrap:    [ AppComponent ]
* })
* export class AppModule { }
*
**/
var search_params_1 = require("./services/core/search.params");
var error_service_1 = require("./services/core/error.service");
var auth_service_1 = require("./services/core/auth.service");
var logger_service_1 = require("./services/custom/logger.service");
var SDKModels_1 = require("./services/custom/SDKModels");
var storage_swaps_1 = require("./storage/storage.swaps");
var http_1 = require("@angular/http");
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var storage_native_1 = require("./storage/storage.native");
var socket_native_1 = require("./sockets/socket.native");
var socket_driver_1 = require("./sockets/socket.driver");
var socket_connections_1 = require("./sockets/socket.connections");
var real_time_1 = require("./services/core/real.time");
var User_1 = require("./services/custom/User");
var AppAlert_1 = require("./services/custom/AppAlert");
/**
* @module SDKNativeModule
* @description
* This module should be imported when building a NativeScript Applications.
**/
var SDKNativeModule = SDKNativeModule_1 = (function () {
    function SDKNativeModule() {
    }
    SDKNativeModule.forRoot = function () {
        return {
            ngModule: SDKNativeModule_1,
            providers: [
                auth_service_1.LoopBackAuth,
                logger_service_1.LoggerService,
                search_params_1.JSONSearchParams,
                SDKModels_1.SDKModels,
                real_time_1.RealTime,
                User_1.UserApi,
                AppAlert_1.AppAlertApi,
                { provide: storage_swaps_1.InternalStorage, useClass: storage_native_1.StorageNative },
                { provide: storage_swaps_1.SDKStorage, useClass: storage_native_1.StorageNative },
                { provide: socket_driver_1.SocketDriver, useClass: socket_native_1.SocketNative }
            ]
        };
    };
    return SDKNativeModule;
}());
SDKNativeModule = SDKNativeModule_1 = __decorate([
    core_1.NgModule({
        imports: [common_1.CommonModule, http_1.HttpModule],
        declarations: [],
        exports: [],
        providers: [
            error_service_1.ErrorHandler,
            socket_connections_1.SocketConnection
        ]
    })
], SDKNativeModule);
exports.SDKNativeModule = SDKNativeModule;
/**
* Have Fun!!!
* - Jon
**/
__export(require("./models/index"));
__export(require("./services/index"));
__export(require("./lb.config"));
var SDKNativeModule_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0NHO0FBQ0gsK0RBQWlFO0FBQ2pFLCtEQUE2RDtBQUM3RCw2REFBNEQ7QUFDNUQsbUVBQWlFO0FBQ2pFLHlEQUF3RDtBQUN4RCx5REFBc0U7QUFDdEUsc0NBQTJDO0FBQzNDLDBDQUErQztBQUMvQyxzQ0FBOEQ7QUFDOUQsMkRBQXlEO0FBQ3pELHlEQUF1RDtBQUN2RCx5REFBdUQ7QUFDdkQsbUVBQWdFO0FBQ2hFLHVEQUFxRDtBQUNyRCwrQ0FBaUQ7QUFDakQsdURBQXlEO0FBQ3pEOzs7O0dBSUc7QUFVSCxJQUFhLGVBQWU7SUFBNUI7SUFrQkEsQ0FBQztJQWpCUSx1QkFBTyxHQUFkO1FBQ0UsTUFBTSxDQUFDO1lBQ0wsUUFBUSxFQUFJLGlCQUFlO1lBQzNCLFNBQVMsRUFBRztnQkFDViwyQkFBWTtnQkFDWiw4QkFBYTtnQkFDYixnQ0FBZ0I7Z0JBQ2hCLHFCQUFTO2dCQUNULG9CQUFRO2dCQUNSLGNBQU87Z0JBQ1Asc0JBQVc7Z0JBQ1gsRUFBRSxPQUFPLEVBQUUsK0JBQWUsRUFBRSxRQUFRLEVBQUUsOEJBQWEsRUFBRTtnQkFDckQsRUFBRSxPQUFPLEVBQUUsMEJBQVUsRUFBRSxRQUFRLEVBQUUsOEJBQWEsRUFBRTtnQkFDaEQsRUFBRSxPQUFPLEVBQUUsNEJBQVksRUFBRSxRQUFRLEVBQUUsNEJBQVksRUFBRTthQUNsRDtTQUNGLENBQUM7SUFDSixDQUFDO0lBQ0gsc0JBQUM7QUFBRCxDQUFDLEFBbEJELElBa0JDO0FBbEJZLGVBQWU7SUFUM0IsZUFBUSxDQUFDO1FBQ1IsT0FBTyxFQUFPLENBQUUscUJBQVksRUFBRSxpQkFBVSxDQUFFO1FBQzFDLFlBQVksRUFBRSxFQUFHO1FBQ2pCLE9BQU8sRUFBTyxFQUFHO1FBQ2pCLFNBQVMsRUFBSztZQUNaLDRCQUFZO1lBQ1oscUNBQWdCO1NBQ2pCO0tBQ0YsQ0FBQztHQUNXLGVBQWUsQ0FrQjNCO0FBbEJZLDBDQUFlO0FBbUI1Qjs7O0dBR0c7QUFDSCxvQ0FBK0I7QUFDL0Isc0NBQWlDO0FBQ2pDLGlDQUE0QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuKiBAbW9kdWxlIFNES01vZHVsZVxuKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0OkBqb2huY2FzYXJydWJpYXM+IDxnaDpqb25hdGhhbi1jYXNhcnJ1Ymlhcz5cbiogQGxpY2Vuc2UgTUlUIDIwMTYgSm9uYXRoYW4gQ2FzYXJydWJpYXNcbiogQHZlcnNpb24gMi4xLjBcbiogQGRlc2NyaXB0aW9uXG4qIFRoZSBTREtNb2R1bGUgaXMgYSBnZW5lcmF0ZWQgU29mdHdhcmUgRGV2ZWxvcG1lbnQgS2l0IGF1dG9tYXRpY2FsbHkgYnVpbHQgYnlcbiogdGhlIExvb3BCYWNrIFNESyBCdWlsZGVyIG9wZW4gc291cmNlIG1vZHVsZS5cbipcbiogVGhlIFNES01vZHVsZSBwcm92aWRlcyBBbmd1bGFyIDIgPj0gUkMuNSBzdXBwb3J0LCB3aGljaCBtZWFucyB0aGF0IE5nTW9kdWxlc1xuKiBjYW4gaW1wb3J0IHRoaXMgU29mdHdhcmUgRGV2ZWxvcG1lbnQgS2l0IGFzIGZvbGxvd3M6XG4qXG4qXG4qIEFQUCBSb3V0ZSBNb2R1bGUgQ29udGV4dFxuKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4qIGltcG9ydCB7IE5nTW9kdWxlIH0gICAgICAgZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4qIGltcG9ydCB7IEJyb3dzZXJNb2R1bGUgfSAgZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG4qIC8vIEFwcCBSb290IFxuKiBpbXBvcnQgeyBBcHBDb21wb25lbnQgfSAgIGZyb20gJy4vYXBwLmNvbXBvbmVudCc7XG4qIC8vIEZlYXR1cmUgTW9kdWxlc1xuKiBpbXBvcnQgeyBTREtbQnJvd3NlcnxOb2RlfE5hdGl2ZV1Nb2R1bGUgfSBmcm9tICcuL3NoYXJlZC9zZGsvc2RrLm1vZHVsZSc7XG4qIC8vIEltcG9ydCBSb3V0aW5nXG4qIGltcG9ydCB7IHJvdXRpbmcgfSAgICAgICAgZnJvbSAnLi9hcHAucm91dGluZyc7XG4qIEBOZ01vZHVsZSh7XG4qICBpbXBvcnRzOiBbXG4qICAgIEJyb3dzZXJNb2R1bGUsXG4qICAgIHJvdXRpbmcsXG4qICAgIFNES1tCcm93c2VyfE5vZGV8TmF0aXZlXU1vZHVsZS5mb3JSb290KClcbiogIF0sXG4qICBkZWNsYXJhdGlvbnM6IFsgQXBwQ29tcG9uZW50IF0sXG4qICBib290c3RyYXA6ICAgIFsgQXBwQ29tcG9uZW50IF1cbiogfSlcbiogZXhwb3J0IGNsYXNzIEFwcE1vZHVsZSB7IH1cbipcbioqL1xuaW1wb3J0IHsgSlNPTlNlYXJjaFBhcmFtcyB9IGZyb20gJy4vc2VydmljZXMvY29yZS9zZWFyY2gucGFyYW1zJztcbmltcG9ydCB7IEVycm9ySGFuZGxlciB9IGZyb20gJy4vc2VydmljZXMvY29yZS9lcnJvci5zZXJ2aWNlJztcbmltcG9ydCB7IExvb3BCYWNrQXV0aCB9IGZyb20gJy4vc2VydmljZXMvY29yZS9hdXRoLnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvY3VzdG9tL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IFNES01vZGVscyB9IGZyb20gJy4vc2VydmljZXMvY3VzdG9tL1NES01vZGVscyc7XG5pbXBvcnQgeyBJbnRlcm5hbFN0b3JhZ2UsIFNES1N0b3JhZ2UgfSBmcm9tICcuL3N0b3JhZ2Uvc3RvcmFnZS5zd2Fwcyc7XG5pbXBvcnQgeyBIdHRwTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgTmdNb2R1bGUsIE1vZHVsZVdpdGhQcm92aWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN0b3JhZ2VOYXRpdmUgfSBmcm9tICcuL3N0b3JhZ2Uvc3RvcmFnZS5uYXRpdmUnO1xuaW1wb3J0IHsgU29ja2V0TmF0aXZlIH0gZnJvbSAnLi9zb2NrZXRzL3NvY2tldC5uYXRpdmUnO1xuaW1wb3J0IHsgU29ja2V0RHJpdmVyIH0gZnJvbSAnLi9zb2NrZXRzL3NvY2tldC5kcml2ZXInO1xuaW1wb3J0IHsgU29ja2V0Q29ubmVjdGlvbiB9IGZyb20gJy4vc29ja2V0cy9zb2NrZXQuY29ubmVjdGlvbnMnO1xuaW1wb3J0IHsgUmVhbFRpbWUgfSBmcm9tICcuL3NlcnZpY2VzL2NvcmUvcmVhbC50aW1lJztcbmltcG9ydCB7IFVzZXJBcGkgfSBmcm9tICcuL3NlcnZpY2VzL2N1c3RvbS9Vc2VyJztcbmltcG9ydCB7IEFwcEFsZXJ0QXBpIH0gZnJvbSAnLi9zZXJ2aWNlcy9jdXN0b20vQXBwQWxlcnQnO1xuLyoqXG4qIEBtb2R1bGUgU0RLTmF0aXZlTW9kdWxlXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIG1vZHVsZSBzaG91bGQgYmUgaW1wb3J0ZWQgd2hlbiBidWlsZGluZyBhIE5hdGl2ZVNjcmlwdCBBcHBsaWNhdGlvbnMuXG4qKi9cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6ICAgICAgWyBDb21tb25Nb2R1bGUsIEh0dHBNb2R1bGUgXSxcbiAgZGVjbGFyYXRpb25zOiBbIF0sXG4gIGV4cG9ydHM6ICAgICAgWyBdLFxuICBwcm92aWRlcnM6ICAgIFtcbiAgICBFcnJvckhhbmRsZXIsXG4gICAgU29ja2V0Q29ubmVjdGlvblxuICBdXG59KVxuZXhwb3J0IGNsYXNzIFNES05hdGl2ZU1vZHVsZSB7XG4gIHN0YXRpYyBmb3JSb290KCk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZSAgOiBTREtOYXRpdmVNb2R1bGUsXG4gICAgICBwcm92aWRlcnMgOiBbXG4gICAgICAgIExvb3BCYWNrQXV0aCxcbiAgICAgICAgTG9nZ2VyU2VydmljZSxcbiAgICAgICAgSlNPTlNlYXJjaFBhcmFtcyxcbiAgICAgICAgU0RLTW9kZWxzLFxuICAgICAgICBSZWFsVGltZSxcbiAgICAgICAgVXNlckFwaSxcbiAgICAgICAgQXBwQWxlcnRBcGksXG4gICAgICAgIHsgcHJvdmlkZTogSW50ZXJuYWxTdG9yYWdlLCB1c2VDbGFzczogU3RvcmFnZU5hdGl2ZSB9LFxuICAgICAgICB7IHByb3ZpZGU6IFNES1N0b3JhZ2UsIHVzZUNsYXNzOiBTdG9yYWdlTmF0aXZlIH0sXG4gICAgICAgIHsgcHJvdmlkZTogU29ja2V0RHJpdmVyLCB1c2VDbGFzczogU29ja2V0TmF0aXZlIH1cbiAgICAgIF1cbiAgICB9O1xuICB9XG59XG4vKipcbiogSGF2ZSBGdW4hISFcbiogLSBKb25cbioqL1xuZXhwb3J0ICogZnJvbSAnLi9tb2RlbHMvaW5kZXgnO1xuZXhwb3J0ICogZnJvbSAnLi9zZXJ2aWNlcy9pbmRleCc7XG5leHBvcnQgKiBmcm9tICcuL2xiLmNvbmZpZyc7XG4iXX0=