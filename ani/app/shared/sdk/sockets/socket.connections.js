"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
var core_1 = require("@angular/core");
var socket_driver_1 = require("./socket.driver");
var Subject_1 = require("rxjs/Subject");
var lb_config_1 = require("../lb.config");
/**
* @author Jonathan Casarrubias <twitter:@johncasarrubias> <github:@mean-expert-official>
* @module SocketConnection
* @license MIT
* @description
* This module handle socket connections and return singleton instances for each
* connection, it will use the SDK Socket Driver Available currently supporting
* Angular 2 for web, NativeScript 2 and Angular Universal.
**/
var SocketConnection = (function () {
    /**
     * @method constructor
     * @param {SocketDriver} driver Socket IO Driver
     * @param {NgZone} zone Angular 2 Zone
     * @description
     * The constructor will set references for the shared hot observables from
     * the class subjects. Then it will subscribe each of these observables
     * that will create a channel that later will be shared between subscribers.
     **/
    function SocketConnection(driver, zone) {
        this.driver = driver;
        this.zone = zone;
        this.subjects = {
            onConnect: new Subject_1.Subject(),
            onDisconnect: new Subject_1.Subject(),
            onAuthenticated: new Subject_1.Subject(),
            onUnAuthorized: new Subject_1.Subject()
        };
        this.sharedObservables = {};
        this.authenticated = false;
        this.sharedObservables = {
            sharedOnConnect: this.subjects.onConnect.asObservable().share(),
            sharedOnDisconnect: this.subjects.onDisconnect.asObservable().share(),
            sharedOnAuthenticated: this.subjects.onAuthenticated.asObservable().share(),
            sharedOnUnAuthorized: this.subjects.onUnAuthorized.asObservable().share()
        };
        // This is needed to create the first channel, subsequents will share the connection
        // We are using Hot Observables to avoid duplicating connection status events.
        this.sharedObservables.sharedOnConnect.subscribe();
        this.sharedObservables.sharedOnDisconnect.subscribe();
        this.sharedObservables.sharedOnAuthenticated.subscribe();
        this.sharedObservables.sharedOnUnAuthorized.subscribe();
    }
    /**
     * @method connect
     * @param {AccessToken} token AccesToken instance
     * @return {void}
     * @description
     * This method will create a new socket connection when not previously established.
     * If there is a broken connection it will re-connect.
     **/
    SocketConnection.prototype.connect = function (token) {
        var _this = this;
        if (token === void 0) { token = null; }
        if (!this.socket) {
            console.info('Creating a new connection with: ', lb_config_1.LoopBackConfig.getPath());
            // Create new socket connection
            this.socket = this.driver.connect(lb_config_1.LoopBackConfig.getPath(), {
                log: false,
                secure: false,
                forceNew: true,
                forceWebsockets: true,
                transports: ['websocket']
            });
            // Listen for connection
            this.on('connect', function () {
                _this.subjects.onConnect.next('connected');
                // Authenticate or start heartbeat now    
                _this.emit('authentication', token);
            });
            // Listen for authentication
            this.on('authenticated', function () {
                _this.authenticated = true;
                _this.subjects.onAuthenticated.next();
                _this.heartbeater();
            });
            // Listen for authentication
            this.on('unauthorized', function (err) {
                _this.authenticated = false;
                _this.subjects.onUnAuthorized.next(err);
            });
            // Listen for disconnections
            this.on('disconnect', function (status) { return _this.subjects.onDisconnect.next(status); });
        }
        else if (this.socket && !this.socket.connected) {
            if (typeof this.socket.off === 'function') {
                this.socket.off();
            }
            if (typeof this.socket.destroy === 'function') {
                this.socket.destroy();
            }
            delete this.socket;
            this.connect(token);
        }
    };
    /**
     * @method isConnected
     * @return {boolean}
     * @description
     * This method will return true or false depending on established connections
     **/
    SocketConnection.prototype.isConnected = function () {
        return (this.socket && this.socket.connected);
    };
    /**
     * @method on
     * @param {string} event Event name
     * @param {Function} handler Event listener handler
     * @return {void}
     * @description
     * This method listen for server events from the current WebSocket connection.
     * This method is a facade that will wrap the original "on" method and run it
     * within the Angular Zone to avoid update issues.
     **/
    SocketConnection.prototype.on = function (event, handler) {
        var _this = this;
        this.socket.on(event, function (data) { return _this.zone.run(function () { return handler(data); }); });
    };
    /**
     * @method emit
     * @param {string} event Event name
     * @param {any=} data Any type of data
     * @return {void}
     * @description
     * This method will send any type of data to the server according the event set.
     **/
    SocketConnection.prototype.emit = function (event, data) {
        if (data) {
            this.socket.emit(event, data);
        }
        else {
            this.socket.emit(event);
        }
    };
    /**
     * @method removeListener
     * @param {string} event Event name
     * @param {Function} handler Event listener handler
     * @return {void}
     * @description
     * This method will wrap the original "on" method and run it within the Angular Zone
     * Note: off is being used since the nativescript socket io client does not provide
     * removeListener method, but only provides with off which is provided in any platform.
     **/
    SocketConnection.prototype.removeListener = function (event, handler) {
        if (typeof this.socket.off === 'function') {
            this.socket.off(event, handler);
        }
    };
    /**
     * @method disconnect
     * @return {void}
     * @description
     * This will disconnect the client from the server
     **/
    SocketConnection.prototype.disconnect = function () {
        this.socket.disconnect();
    };
    /**
     * @method heartbeater
     * @return {void}
     * @description
     * This will keep the connection as active, even when users are not sending
     * data, this avoids disconnection because of a connection not being used.
     **/
    SocketConnection.prototype.heartbeater = function () {
        var _this = this;
        var heartbeater = setInterval(function () {
            if (_this.isConnected()) {
                _this.socket.emit('lb-ping');
            }
            else {
                clearInterval(heartbeater);
            }
        }, 15000);
        this.socket.on('lb-pong', function (data) { return console.info('Heartbeat: ', data); });
    };
    return SocketConnection;
}());
SocketConnection = __decorate([
    core_1.Injectable(),
    __param(0, core_1.Inject(socket_driver_1.SocketDriver)),
    __param(1, core_1.Inject(core_1.NgZone)),
    __metadata("design:paramtypes", [socket_driver_1.SocketDriver,
        core_1.NgZone])
], SocketConnection);
exports.SocketConnection = SocketConnection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmNvbm5lY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic29ja2V0LmNvbm5lY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0JBQW9CO0FBQ3BCLHNDQUEyRDtBQUMzRCxpREFBK0M7QUFFL0Msd0NBQXVDO0FBRXZDLDBDQUE4QztBQUM5Qzs7Ozs7Ozs7R0FRRztBQUVILElBQWEsZ0JBQWdCO0lBb0IzQjs7Ozs7Ozs7UUFRSTtJQUNKLDBCQUNnQyxNQUFvQixFQUMxQixJQUFZO1FBRE4sV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUMxQixTQUFJLEdBQUosSUFBSSxDQUFRO1FBN0I5QixhQUFRLEdBS1o7WUFDRixTQUFTLEVBQUUsSUFBSSxpQkFBTyxFQUFFO1lBQ3hCLFlBQVksRUFBRSxJQUFJLGlCQUFPLEVBQUU7WUFDM0IsZUFBZSxFQUFFLElBQUksaUJBQU8sRUFBRTtZQUM5QixjQUFjLEVBQUUsSUFBSSxpQkFBTyxFQUFFO1NBQzlCLENBQUM7UUFDSyxzQkFBaUIsR0FLcEIsRUFBRSxDQUFDO1FBQ0Esa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFjcEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHO1lBQ3ZCLGVBQWUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUU7WUFDL0Qsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxFQUFFO1lBQ3JFLHFCQUFxQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRTtZQUMzRSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUU7U0FDMUUsQ0FBQztRQUNGLG9GQUFvRjtRQUNwRiw4RUFBOEU7UUFDOUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNuRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3pELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMxRCxDQUFDO0lBQ0Q7Ozs7Ozs7UUFPSTtJQUNHLGtDQUFPLEdBQWQsVUFBZSxLQUF5QjtRQUF4QyxpQkF3Q0M7UUF4Q2Msc0JBQUEsRUFBQSxZQUF5QjtRQUN0QyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLEVBQUUsMEJBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQzNFLCtCQUErQjtZQUMvQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDBCQUFjLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQzFELEdBQUcsRUFBRSxLQUFLO2dCQUNWLE1BQU0sRUFBRSxLQUFLO2dCQUNiLFFBQVEsRUFBRSxJQUFJO2dCQUNkLGVBQWUsRUFBRSxJQUFJO2dCQUNyQixVQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUM7YUFDMUIsQ0FBQyxDQUFDO1lBQ0gsd0JBQXdCO1lBQ3hCLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFO2dCQUNqQixLQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzFDLDBDQUEwQztnQkFDMUMsS0FBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQztZQUNILDRCQUE0QjtZQUM1QixJQUFJLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRTtnQkFDdkIsS0FBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7Z0JBQzFCLEtBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNyQyxLQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUE7WUFDRiw0QkFBNEI7WUFDNUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsVUFBQyxHQUFRO2dCQUMvQixLQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztnQkFDM0IsS0FBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFBO1lBQ0YsNEJBQTRCO1lBQzVCLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFVBQUMsTUFBVyxJQUFLLE9BQUEsS0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUF2QyxDQUF1QyxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQSxDQUFDO1lBQ2hELEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNwQixDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3hCLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDbkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QixDQUFDO0lBQ0gsQ0FBQztJQUNEOzs7OztRQUtJO0lBQ0csc0NBQVcsR0FBbEI7UUFDRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUNEOzs7Ozs7Ozs7UUFTSTtJQUNHLDZCQUFFLEdBQVQsVUFBVSxLQUFhLEVBQUUsT0FBaUI7UUFBMUMsaUJBRUM7UUFEQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsVUFBQyxJQUFTLElBQUssT0FBQSxLQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFNLE9BQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFiLENBQWEsQ0FBQyxFQUFsQyxDQUFrQyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUNEOzs7Ozs7O1FBT0k7SUFDRywrQkFBSSxHQUFYLFVBQVksS0FBYSxFQUFFLElBQVU7UUFDbkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNULElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQixDQUFDO0lBQ0gsQ0FBQztJQUNEOzs7Ozs7Ozs7UUFTSTtJQUNHLHlDQUFjLEdBQXJCLFVBQXNCLEtBQWEsRUFBRSxPQUFpQjtRQUNwRCxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2xDLENBQUM7SUFDSCxDQUFDO0lBQ0Q7Ozs7O1FBS0k7SUFDRyxxQ0FBVSxHQUFqQjtRQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUNEOzs7Ozs7UUFNSTtJQUNJLHNDQUFXLEdBQW5CO1FBQUEsaUJBU0M7UUFSQyxJQUFJLFdBQVcsR0FBUSxXQUFXLENBQUM7WUFDakMsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdkIsS0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM3QixDQUFDO1FBQ0gsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQUMsSUFBUyxJQUFLLE9BQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLEVBQWpDLENBQWlDLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBQ0gsdUJBQUM7QUFBRCxDQUFDLEFBN0tELElBNktDO0FBN0tZLGdCQUFnQjtJQUQ1QixpQkFBVSxFQUFFO0lBK0JSLFdBQUEsYUFBTSxDQUFDLDRCQUFZLENBQUMsQ0FBQTtJQUNwQixXQUFBLGFBQU0sQ0FBQyxhQUFNLENBQUMsQ0FBQTtxQ0FEdUIsNEJBQVk7UUFDcEIsYUFBTTtHQS9CM0IsZ0JBQWdCLENBNks1QjtBQTdLWSw0Q0FBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB0c2xpbnQ6ZGlzYWJsZSAqL1xuaW1wb3J0IHsgSW5qZWN0YWJsZSwgSW5qZWN0LCBOZ1pvbmUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFNvY2tldERyaXZlciB9IGZyb20gJy4vc29ja2V0LmRyaXZlcic7XG5pbXBvcnQgeyBBY2Nlc3NUb2tlbiB9IGZyb20gJy4uL21vZGVscyc7XG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcy9TdWJqZWN0JztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzL09ic2VydmFibGUnO1xuaW1wb3J0IHsgTG9vcEJhY2tDb25maWcgfSBmcm9tICcuLi9sYi5jb25maWcnO1xuLyoqXG4qIEBhdXRob3IgSm9uYXRoYW4gQ2FzYXJydWJpYXMgPHR3aXR0ZXI6QGpvaG5jYXNhcnJ1Ymlhcz4gPGdpdGh1YjpAbWVhbi1leHBlcnQtb2ZmaWNpYWw+XG4qIEBtb2R1bGUgU29ja2V0Q29ubmVjdGlvblxuKiBAbGljZW5zZSBNSVRcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgbW9kdWxlIGhhbmRsZSBzb2NrZXQgY29ubmVjdGlvbnMgYW5kIHJldHVybiBzaW5nbGV0b24gaW5zdGFuY2VzIGZvciBlYWNoXG4qIGNvbm5lY3Rpb24sIGl0IHdpbGwgdXNlIHRoZSBTREsgU29ja2V0IERyaXZlciBBdmFpbGFibGUgY3VycmVudGx5IHN1cHBvcnRpbmdcbiogQW5ndWxhciAyIGZvciB3ZWIsIE5hdGl2ZVNjcmlwdCAyIGFuZCBBbmd1bGFyIFVuaXZlcnNhbC5cbioqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFNvY2tldENvbm5lY3Rpb24ge1xuICBwcml2YXRlIHNvY2tldDogYW55O1xuICBwcml2YXRlIHN1YmplY3RzOiB7XG4gICAgb25Db25uZWN0OiBTdWJqZWN0PGFueT4sXG4gICAgb25EaXNjb25uZWN0OiBTdWJqZWN0PGFueT4sXG4gICAgb25BdXRoZW50aWNhdGVkOiBTdWJqZWN0PGFueT4sXG4gICAgb25VbkF1dGhvcml6ZWQ6IFN1YmplY3Q8YW55PlxuICB9ID0ge1xuICAgIG9uQ29ubmVjdDogbmV3IFN1YmplY3QoKSxcbiAgICBvbkRpc2Nvbm5lY3Q6IG5ldyBTdWJqZWN0KCksXG4gICAgb25BdXRoZW50aWNhdGVkOiBuZXcgU3ViamVjdCgpLFxuICAgIG9uVW5BdXRob3JpemVkOiBuZXcgU3ViamVjdCgpXG4gIH07XG4gIHB1YmxpYyBzaGFyZWRPYnNlcnZhYmxlczoge1xuICAgIHNoYXJlZE9uQ29ubmVjdD86IE9ic2VydmFibGU8YW55PixcbiAgICBzaGFyZWRPbkRpc2Nvbm5lY3Q/OiBPYnNlcnZhYmxlPGFueT4sXG4gICAgc2hhcmVkT25BdXRoZW50aWNhdGVkPzogT2JzZXJ2YWJsZTxhbnk+LFxuICAgIHNoYXJlZE9uVW5BdXRob3JpemVkPzogT2JzZXJ2YWJsZTxhbnk+XG4gIH0gPSB7fTtcbiAgcHVibGljIGF1dGhlbnRpY2F0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgLyoqXG4gICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtTb2NrZXREcml2ZXJ9IGRyaXZlciBTb2NrZXQgSU8gRHJpdmVyXG4gICAqIEBwYXJhbSB7Tmdab25lfSB6b25lIEFuZ3VsYXIgMiBab25lXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGUgY29uc3RydWN0b3Igd2lsbCBzZXQgcmVmZXJlbmNlcyBmb3IgdGhlIHNoYXJlZCBob3Qgb2JzZXJ2YWJsZXMgZnJvbVxuICAgKiB0aGUgY2xhc3Mgc3ViamVjdHMuIFRoZW4gaXQgd2lsbCBzdWJzY3JpYmUgZWFjaCBvZiB0aGVzZSBvYnNlcnZhYmxlc1xuICAgKiB0aGF0IHdpbGwgY3JlYXRlIGEgY2hhbm5lbCB0aGF0IGxhdGVyIHdpbGwgYmUgc2hhcmVkIGJldHdlZW4gc3Vic2NyaWJlcnMuXG4gICAqKi9cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChTb2NrZXREcml2ZXIpIHByaXZhdGUgZHJpdmVyOiBTb2NrZXREcml2ZXIsXG4gICAgQEluamVjdChOZ1pvbmUpIHByaXZhdGUgem9uZTogTmdab25lXG4gICkge1xuICAgIHRoaXMuc2hhcmVkT2JzZXJ2YWJsZXMgPSB7XG4gICAgICBzaGFyZWRPbkNvbm5lY3Q6IHRoaXMuc3ViamVjdHMub25Db25uZWN0LmFzT2JzZXJ2YWJsZSgpLnNoYXJlKCksXG4gICAgICBzaGFyZWRPbkRpc2Nvbm5lY3Q6IHRoaXMuc3ViamVjdHMub25EaXNjb25uZWN0LmFzT2JzZXJ2YWJsZSgpLnNoYXJlKCksXG4gICAgICBzaGFyZWRPbkF1dGhlbnRpY2F0ZWQ6IHRoaXMuc3ViamVjdHMub25BdXRoZW50aWNhdGVkLmFzT2JzZXJ2YWJsZSgpLnNoYXJlKCksXG4gICAgICBzaGFyZWRPblVuQXV0aG9yaXplZDogdGhpcy5zdWJqZWN0cy5vblVuQXV0aG9yaXplZC5hc09ic2VydmFibGUoKS5zaGFyZSgpXG4gICAgfTtcbiAgICAvLyBUaGlzIGlzIG5lZWRlZCB0byBjcmVhdGUgdGhlIGZpcnN0IGNoYW5uZWwsIHN1YnNlcXVlbnRzIHdpbGwgc2hhcmUgdGhlIGNvbm5lY3Rpb25cbiAgICAvLyBXZSBhcmUgdXNpbmcgSG90IE9ic2VydmFibGVzIHRvIGF2b2lkIGR1cGxpY2F0aW5nIGNvbm5lY3Rpb24gc3RhdHVzIGV2ZW50cy5cbiAgICB0aGlzLnNoYXJlZE9ic2VydmFibGVzLnNoYXJlZE9uQ29ubmVjdC5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLnNoYXJlZE9ic2VydmFibGVzLnNoYXJlZE9uRGlzY29ubmVjdC5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLnNoYXJlZE9ic2VydmFibGVzLnNoYXJlZE9uQXV0aGVudGljYXRlZC5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLnNoYXJlZE9ic2VydmFibGVzLnNoYXJlZE9uVW5BdXRob3JpemVkLnN1YnNjcmliZSgpO1xuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIGNvbm5lY3RcbiAgICogQHBhcmFtIHtBY2Nlc3NUb2tlbn0gdG9rZW4gQWNjZXNUb2tlbiBpbnN0YW5jZVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGhpcyBtZXRob2Qgd2lsbCBjcmVhdGUgYSBuZXcgc29ja2V0IGNvbm5lY3Rpb24gd2hlbiBub3QgcHJldmlvdXNseSBlc3RhYmxpc2hlZC5cbiAgICogSWYgdGhlcmUgaXMgYSBicm9rZW4gY29ubmVjdGlvbiBpdCB3aWxsIHJlLWNvbm5lY3QuXG4gICAqKi9cbiAgcHVibGljIGNvbm5lY3QodG9rZW46IEFjY2Vzc1Rva2VuID0gbnVsbCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5zb2NrZXQpIHtcbiAgICAgIGNvbnNvbGUuaW5mbygnQ3JlYXRpbmcgYSBuZXcgY29ubmVjdGlvbiB3aXRoOiAnLCBMb29wQmFja0NvbmZpZy5nZXRQYXRoKCkpO1xuICAgICAgLy8gQ3JlYXRlIG5ldyBzb2NrZXQgY29ubmVjdGlvblxuICAgICAgdGhpcy5zb2NrZXQgPSB0aGlzLmRyaXZlci5jb25uZWN0KExvb3BCYWNrQ29uZmlnLmdldFBhdGgoKSwge1xuICAgICAgICBsb2c6IGZhbHNlLFxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICBmb3JjZU5ldzogdHJ1ZSxcbiAgICAgICAgZm9yY2VXZWJzb2NrZXRzOiB0cnVlLFxuICAgICAgICB0cmFuc3BvcnRzOiBbJ3dlYnNvY2tldCddXG4gICAgICB9KTtcbiAgICAgIC8vIExpc3RlbiBmb3IgY29ubmVjdGlvblxuICAgICAgdGhpcy5vbignY29ubmVjdCcsICgpID0+IHtcbiAgICAgICAgdGhpcy5zdWJqZWN0cy5vbkNvbm5lY3QubmV4dCgnY29ubmVjdGVkJyk7XG4gICAgICAgIC8vIEF1dGhlbnRpY2F0ZSBvciBzdGFydCBoZWFydGJlYXQgbm93ICAgIFxuICAgICAgICB0aGlzLmVtaXQoJ2F1dGhlbnRpY2F0aW9uJywgdG9rZW4pO1xuICAgICAgfSk7XG4gICAgICAvLyBMaXN0ZW4gZm9yIGF1dGhlbnRpY2F0aW9uXG4gICAgICB0aGlzLm9uKCdhdXRoZW50aWNhdGVkJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmF1dGhlbnRpY2F0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnN1YmplY3RzLm9uQXV0aGVudGljYXRlZC5uZXh0KCk7XG4gICAgICAgIHRoaXMuaGVhcnRiZWF0ZXIoKTtcbiAgICAgIH0pXG4gICAgICAvLyBMaXN0ZW4gZm9yIGF1dGhlbnRpY2F0aW9uXG4gICAgICB0aGlzLm9uKCd1bmF1dGhvcml6ZWQnLCAoZXJyOiBhbnkpID0+IHtcbiAgICAgICAgdGhpcy5hdXRoZW50aWNhdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc3ViamVjdHMub25VbkF1dGhvcml6ZWQubmV4dChlcnIpO1xuICAgICAgfSlcbiAgICAgIC8vIExpc3RlbiBmb3IgZGlzY29ubmVjdGlvbnNcbiAgICAgIHRoaXMub24oJ2Rpc2Nvbm5lY3QnLCAoc3RhdHVzOiBhbnkpID0+IHRoaXMuc3ViamVjdHMub25EaXNjb25uZWN0Lm5leHQoc3RhdHVzKSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNvY2tldCAmJiAhdGhpcy5zb2NrZXQuY29ubmVjdGVkKXtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5zb2NrZXQub2ZmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuc29ja2V0Lm9mZigpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnNvY2tldC5kZXN0cm95ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuc29ja2V0LmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICAgIGRlbGV0ZSB0aGlzLnNvY2tldDtcbiAgICAgIHRoaXMuY29ubmVjdCh0b2tlbik7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIGlzQ29ubmVjdGVkXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIHJldHVybiB0cnVlIG9yIGZhbHNlIGRlcGVuZGluZyBvbiBlc3RhYmxpc2hlZCBjb25uZWN0aW9uc1xuICAgKiovXG4gIHB1YmxpYyBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHRoaXMuc29ja2V0ICYmIHRoaXMuc29ja2V0LmNvbm5lY3RlZCk7XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2Qgb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IEV2ZW50IG5hbWVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlciBFdmVudCBsaXN0ZW5lciBoYW5kbGVyXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGlzIG1ldGhvZCBsaXN0ZW4gZm9yIHNlcnZlciBldmVudHMgZnJvbSB0aGUgY3VycmVudCBXZWJTb2NrZXQgY29ubmVjdGlvbi5cbiAgICogVGhpcyBtZXRob2QgaXMgYSBmYWNhZGUgdGhhdCB3aWxsIHdyYXAgdGhlIG9yaWdpbmFsIFwib25cIiBtZXRob2QgYW5kIHJ1biBpdFxuICAgKiB3aXRoaW4gdGhlIEFuZ3VsYXIgWm9uZSB0byBhdm9pZCB1cGRhdGUgaXNzdWVzLlxuICAgKiovXG4gIHB1YmxpYyBvbihldmVudDogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIHRoaXMuc29ja2V0Lm9uKGV2ZW50LCAoZGF0YTogYW55KSA9PiB0aGlzLnpvbmUucnVuKCgpID0+IGhhbmRsZXIoZGF0YSkpKTtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBlbWl0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCBFdmVudCBuYW1lXG4gICAqIEBwYXJhbSB7YW55PX0gZGF0YSBBbnkgdHlwZSBvZiBkYXRhXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIHNlbmQgYW55IHR5cGUgb2YgZGF0YSB0byB0aGUgc2VydmVyIGFjY29yZGluZyB0aGUgZXZlbnQgc2V0LlxuICAgKiovXG4gIHB1YmxpYyBlbWl0KGV2ZW50OiBzdHJpbmcsIGRhdGE/OiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoZGF0YSkge1xuICAgICAgdGhpcy5zb2NrZXQuZW1pdChldmVudCwgZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc29ja2V0LmVtaXQoZXZlbnQpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCByZW1vdmVMaXN0ZW5lclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgRXZlbnQgbmFtZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyIEV2ZW50IGxpc3RlbmVyIGhhbmRsZXJcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRoaXMgbWV0aG9kIHdpbGwgd3JhcCB0aGUgb3JpZ2luYWwgXCJvblwiIG1ldGhvZCBhbmQgcnVuIGl0IHdpdGhpbiB0aGUgQW5ndWxhciBab25lXG4gICAqIE5vdGU6IG9mZiBpcyBiZWluZyB1c2VkIHNpbmNlIHRoZSBuYXRpdmVzY3JpcHQgc29ja2V0IGlvIGNsaWVudCBkb2VzIG5vdCBwcm92aWRlXG4gICAqIHJlbW92ZUxpc3RlbmVyIG1ldGhvZCwgYnV0IG9ubHkgcHJvdmlkZXMgd2l0aCBvZmYgd2hpY2ggaXMgcHJvdmlkZWQgaW4gYW55IHBsYXRmb3JtLlxuICAgKiovXG4gIHB1YmxpYyByZW1vdmVMaXN0ZW5lcihldmVudDogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIGlmICh0eXBlb2YgdGhpcy5zb2NrZXQub2ZmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnNvY2tldC5vZmYoZXZlbnQsIGhhbmRsZXIpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBkaXNjb25uZWN0XG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGlzIHdpbGwgZGlzY29ubmVjdCB0aGUgY2xpZW50IGZyb20gdGhlIHNlcnZlclxuICAgKiovXG4gIHB1YmxpYyBkaXNjb25uZWN0KCk6IHZvaWQge1xuICAgIHRoaXMuc29ja2V0LmRpc2Nvbm5lY3QoKTtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBoZWFydGJlYXRlclxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGhpcyB3aWxsIGtlZXAgdGhlIGNvbm5lY3Rpb24gYXMgYWN0aXZlLCBldmVuIHdoZW4gdXNlcnMgYXJlIG5vdCBzZW5kaW5nXG4gICAqIGRhdGEsIHRoaXMgYXZvaWRzIGRpc2Nvbm5lY3Rpb24gYmVjYXVzZSBvZiBhIGNvbm5lY3Rpb24gbm90IGJlaW5nIHVzZWQuXG4gICAqKi9cbiAgcHJpdmF0ZSBoZWFydGJlYXRlcigpOiB2b2lkIHtcbiAgICBsZXQgaGVhcnRiZWF0ZXI6IGFueSA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnbGItcGluZycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChoZWFydGJlYXRlcik7XG4gICAgICB9XG4gICAgfSwgMTUwMDApO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdsYi1wb25nJywgKGRhdGE6IGFueSkgPT4gY29uc29sZS5pbmZvKCdIZWFydGJlYXQ6ICcsIGRhdGEpKTtcbiAgfVxufVxuIl19