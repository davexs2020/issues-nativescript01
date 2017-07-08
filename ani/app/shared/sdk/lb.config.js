"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
/**
* @module LoopBackConfig
* @description
*
* The LoopBackConfig module help developers to externally
* configure the base url and api version for loopback.io
*
* Example
*
* import { LoopBackConfig } from './sdk';
*
* @Component() // No metadata needed for this module
*
* export class MyApp {
*   constructor() {
*     LoopBackConfig.setBaseURL('http://localhost:3000');
*     LoopBackConfig.setApiVersion('api');
*   }
* }
**/
var LoopBackConfig = (function () {
    function LoopBackConfig() {
    }
    LoopBackConfig.setApiVersion = function (version) {
        if (version === void 0) { version = 'api'; }
        LoopBackConfig.version = version;
    };
    LoopBackConfig.getApiVersion = function () {
        return LoopBackConfig.version;
    };
    LoopBackConfig.setBaseURL = function (url) {
        if (url === void 0) { url = '/'; }
        LoopBackConfig.path = url;
    };
    LoopBackConfig.getPath = function () {
        return LoopBackConfig.path;
    };
    LoopBackConfig.setAuthPrefix = function (authPrefix) {
        if (authPrefix === void 0) { authPrefix = ''; }
        LoopBackConfig.authPrefix = authPrefix;
    };
    LoopBackConfig.getAuthPrefix = function () {
        return LoopBackConfig.authPrefix;
    };
    LoopBackConfig.setDebugMode = function (isEnabled) {
        LoopBackConfig.debug = isEnabled;
    };
    LoopBackConfig.debuggable = function () {
        return LoopBackConfig.debug;
    };
    LoopBackConfig.filterOnUrl = function () {
        LoopBackConfig.filterOn = 'url';
    };
    LoopBackConfig.filterOnHeaders = function () {
        LoopBackConfig.filterOn = 'headers';
    };
    LoopBackConfig.isHeadersFilteringSet = function () {
        return (LoopBackConfig.filterOn === 'headers');
    };
    return LoopBackConfig;
}());
LoopBackConfig.path = '//0.0.0.0:7000';
LoopBackConfig.version = 'api';
LoopBackConfig.authPrefix = '';
LoopBackConfig.debug = true;
LoopBackConfig.filterOn = 'headers';
exports.LoopBackConfig = LoopBackConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGIuY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGIuY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0JBQW9CO0FBQ3BCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ0g7SUFBQTtJQWtEQSxDQUFDO0lBM0NlLDRCQUFhLEdBQTNCLFVBQTRCLE9BQXVCO1FBQXZCLHdCQUFBLEVBQUEsZUFBdUI7UUFDakQsY0FBYyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDbkMsQ0FBQztJQUVhLDRCQUFhLEdBQTNCO1FBQ0UsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUM7SUFDaEMsQ0FBQztJQUVhLHlCQUFVLEdBQXhCLFVBQXlCLEdBQWlCO1FBQWpCLG9CQUFBLEVBQUEsU0FBaUI7UUFDeEMsY0FBYyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7SUFDNUIsQ0FBQztJQUVhLHNCQUFPLEdBQXJCO1FBQ0UsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQUVhLDRCQUFhLEdBQTNCLFVBQTRCLFVBQXVCO1FBQXZCLDJCQUFBLEVBQUEsZUFBdUI7UUFDakQsY0FBYyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDekMsQ0FBQztJQUVhLDRCQUFhLEdBQTNCO1FBQ0UsTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUM7SUFDbkMsQ0FBQztJQUVhLDJCQUFZLEdBQTFCLFVBQTJCLFNBQWtCO1FBQzNDLGNBQWMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0lBQ25DLENBQUM7SUFFYSx5QkFBVSxHQUF4QjtRQUNFLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO0lBQzlCLENBQUM7SUFFYSwwQkFBVyxHQUF6QjtRQUNFLGNBQWMsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQ2xDLENBQUM7SUFFYSw4QkFBZSxHQUE3QjtRQUNFLGNBQWMsQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO0lBQ3RDLENBQUM7SUFFYSxvQ0FBcUIsR0FBbkM7UUFDRSxNQUFNLENBQUMsQ0FBQyxjQUFjLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFDSCxxQkFBQztBQUFELENBQUMsQUFsREQ7QUFDaUIsbUJBQUksR0FBVyxnQkFBZ0IsQ0FBQztBQUNoQyxzQkFBTyxHQUFvQixLQUFLLENBQUM7QUFDakMseUJBQVUsR0FBVyxFQUFFLENBQUM7QUFDeEIsb0JBQUssR0FBWSxJQUFJLENBQUM7QUFDdEIsdUJBQVEsR0FBVyxTQUFTLENBQUM7QUFMakMsd0NBQWMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB0c2xpbnQ6ZGlzYWJsZSAqL1xuLyoqXG4qIEBtb2R1bGUgTG9vcEJhY2tDb25maWdcbiogQGRlc2NyaXB0aW9uXG4qXG4qIFRoZSBMb29wQmFja0NvbmZpZyBtb2R1bGUgaGVscCBkZXZlbG9wZXJzIHRvIGV4dGVybmFsbHkgXG4qIGNvbmZpZ3VyZSB0aGUgYmFzZSB1cmwgYW5kIGFwaSB2ZXJzaW9uIGZvciBsb29wYmFjay5pb1xuKlxuKiBFeGFtcGxlXG4qXG4qIGltcG9ydCB7IExvb3BCYWNrQ29uZmlnIH0gZnJvbSAnLi9zZGsnO1xuKiBcbiogQENvbXBvbmVudCgpIC8vIE5vIG1ldGFkYXRhIG5lZWRlZCBmb3IgdGhpcyBtb2R1bGVcbipcbiogZXhwb3J0IGNsYXNzIE15QXBwIHtcbiogICBjb25zdHJ1Y3RvcigpIHtcbiogICAgIExvb3BCYWNrQ29uZmlnLnNldEJhc2VVUkwoJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcpO1xuKiAgICAgTG9vcEJhY2tDb25maWcuc2V0QXBpVmVyc2lvbignYXBpJyk7XG4qICAgfVxuKiB9XG4qKi9cbmV4cG9ydCBjbGFzcyBMb29wQmFja0NvbmZpZyB7XG4gIHByaXZhdGUgc3RhdGljIHBhdGg6IHN0cmluZyA9ICcvLzAuMC4wLjA6NzAwMCc7XG4gIHByaXZhdGUgc3RhdGljIHZlcnNpb246IHN0cmluZyB8wqBudW1iZXIgPSAnYXBpJztcbiAgcHJpdmF0ZSBzdGF0aWMgYXV0aFByZWZpeDogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgc3RhdGljIGRlYnVnOiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBzdGF0aWMgZmlsdGVyT246IHN0cmluZyA9ICdoZWFkZXJzJztcblxuICBwdWJsaWMgc3RhdGljIHNldEFwaVZlcnNpb24odmVyc2lvbjogc3RyaW5nID0gJ2FwaScpOiB2b2lkIHtcbiAgICBMb29wQmFja0NvbmZpZy52ZXJzaW9uID0gdmVyc2lvbjtcbiAgfVxuICBcbiAgcHVibGljIHN0YXRpYyBnZXRBcGlWZXJzaW9uKCk6IHN0cmluZyB8IG51bWJlciB7XG4gICAgcmV0dXJuIExvb3BCYWNrQ29uZmlnLnZlcnNpb247XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHNldEJhc2VVUkwodXJsOiBzdHJpbmcgPSAnLycpOiB2b2lkIHtcbiAgICBMb29wQmFja0NvbmZpZy5wYXRoID0gdXJsO1xuICB9XG4gIFxuICBwdWJsaWMgc3RhdGljIGdldFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gTG9vcEJhY2tDb25maWcucGF0aDtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgc2V0QXV0aFByZWZpeChhdXRoUHJlZml4OiBzdHJpbmcgPSAnJyk6IHZvaWQge1xuICAgIExvb3BCYWNrQ29uZmlnLmF1dGhQcmVmaXggPSBhdXRoUHJlZml4O1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXRBdXRoUHJlZml4KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIExvb3BCYWNrQ29uZmlnLmF1dGhQcmVmaXg7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHNldERlYnVnTW9kZShpc0VuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBMb29wQmFja0NvbmZpZy5kZWJ1ZyA9IGlzRW5hYmxlZDtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZGVidWdnYWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gTG9vcEJhY2tDb25maWcuZGVidWc7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGZpbHRlck9uVXJsKCk6IHZvaWQge1xuICAgIExvb3BCYWNrQ29uZmlnLmZpbHRlck9uID0gJ3VybCc7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGZpbHRlck9uSGVhZGVycygpOiB2b2lkIHtcbiAgICBMb29wQmFja0NvbmZpZy5maWx0ZXJPbiA9ICdoZWFkZXJzJztcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNIZWFkZXJzRmlsdGVyaW5nU2V0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoTG9vcEJhY2tDb25maWcuZmlsdGVyT24gPT09ICdoZWFkZXJzJyk7XG4gIH1cbn1cbiJdfQ==