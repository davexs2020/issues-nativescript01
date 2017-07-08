"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var io_service_1 = require("./io.service");
var auth_service_1 = require("./auth.service");
var FireLoop_1 = require("../../models/FireLoop");
var socket_connections_1 = require("../../sockets/socket.connections");
var SDKModels_1 = require("../custom/SDKModels");
var Subject_1 = require("rxjs/Subject");
/**
* @author Jonathan Casarrubias <twitter:@johncasarrubias> <github:@johncasarrubias>
* @module RealTime
* @license MIT
* @description
* This module is a real-time interface for using socket connections, its main purpose
* is to make sure that when there is a valid connection, it will create instances
* of the different real-time functionalities like FireLoop, PubSub and IO.
**/
var RealTime = (function () {
    /**
    * @method constructor
    * @param {SocketConnection} connection WebSocket connection service
    * @param {SDKModels} models Model provider service
    * @param {LoopBackAuth} auth LoopBack authentication service
    * @description
    * It will intialize the shared on ready communication channel.
    **/
    function RealTime(connection, models, auth) {
        this.connection = connection;
        this.models = models;
        this.auth = auth;
        this.connecting = false;
        this.onReadySubject = new Subject_1.Subject();
        this.sharedOnReady = this.onReadySubject.asObservable().share();
        this.sharedOnReady.subscribe();
    }
    /**
    * @method onDisconnect
    * @return {Observable<any>}
    * @description
    * Will trigger when Real-Time Service is disconnected from server.
    **/
    RealTime.prototype.onDisconnect = function () {
        return this.connection.sharedObservables.sharedOnDisconnect;
    };
    /**
    * @method onAuthenticated
    * @return {Observable<any>}
    * @description
    * Will trigger when Real-Time Service is authenticated with the server.
    **/
    RealTime.prototype.onAuthenticated = function () {
        return this.connection.sharedObservables.sharedOnAuthenticated;
    };
    /**
    * @method onUnAuthorized
    * @return {Observable<any>}
    * @description
    * Will trigger when Real-Time Service is not authorized to connect with the server.
    **/
    RealTime.prototype.onUnAuthorized = function () {
        return this.connection.sharedObservables.sharedOnUnAuthorized;
    };
    /**
    * @method onReady
    * @return {Observable<any>}
    * @description
    * Will trigger when Real-Time Service is Ready for broadcasting.
    * and will register connection flow events to notify subscribers.
    **/
    RealTime.prototype.onReady = function () {
        var _this = this;
        // If there is a valid connection, then we just send back to the EventLoop
        // Or next will be executed before the actual subscription.
        if (this.connection.isConnected()) {
            var to_1 = setTimeout(function () {
                _this.onReadySubject.next('shared-connection');
                clearTimeout(to_1);
            });
            // Else if there is a current attempt of connection we wait for the prior
            // process that started the connection flow.
        }
        else if (this.connecting) {
            var ti_1 = setInterval(function () {
                if (_this.connection.isConnected()) {
                    _this.onReadySubject.next('shared-connection');
                    clearInterval(ti_1);
                }
            }, 500);
            // If there is not valid connection or attempt, then we start the connection flow
            // and make sure we notify all the onReady subscribers when done.
            // Also it will listen for desconnections so we unsubscribe and avoid both:
            // Memory leaks and duplicated triggered events.
        }
        else {
            this.connecting = true;
            this.connection.connect(this.auth.getToken());
            this.IO = new io_service_1.IO(this.connection);
            this.FireLoop = new FireLoop_1.FireLoop(this.connection, this.models);
            // Fire event for those subscribed 
            var s1_1 = this.connection.sharedObservables.sharedOnConnect.subscribe(function () {
                console.log('Real-Time connection has been established');
                _this.connecting = false;
                _this.onReadySubject.next('connected');
                var s2 = _this.connection.sharedObservables.sharedOnDisconnect.subscribe(function () {
                    s1_1.unsubscribe();
                    s2.unsubscribe();
                });
            });
        }
        return this.sharedOnReady;
    };
    return RealTime;
}());
RealTime = __decorate([
    core_1.Injectable(),
    __param(0, core_1.Inject(socket_connections_1.SocketConnection)),
    __param(1, core_1.Inject(SDKModels_1.SDKModels)),
    __param(2, core_1.Inject(auth_service_1.LoopBackAuth)),
    __metadata("design:paramtypes", [socket_connections_1.SocketConnection,
        SDKModels_1.SDKModels,
        auth_service_1.LoopBackAuth])
], RealTime);
exports.RealTime = RealTime;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhbC50aW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVhbC50aW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQW1EO0FBQ25ELDJDQUFrQztBQUNsQywrQ0FBOEM7QUFFOUMsa0RBQWlEO0FBQ2pELHVFQUFvRTtBQUNwRSxpREFBZ0Q7QUFFaEQsd0NBQXVDO0FBRXZDOzs7Ozs7OztHQVFHO0FBRUgsSUFBYSxRQUFRO0lBTW5COzs7Ozs7O09BT0c7SUFDSCxrQkFDbUMsVUFBNEIsRUFDaEMsTUFBaUIsRUFDZCxJQUFrQjtRQUZqQixlQUFVLEdBQVYsVUFBVSxDQUFrQjtRQUNoQyxXQUFNLEdBQU4sTUFBTSxDQUFXO1FBQ2QsU0FBSSxHQUFKLElBQUksQ0FBYztRQWQ1QyxlQUFVLEdBQVksS0FBSyxDQUFDO1FBQzVCLG1CQUFjLEdBQW9CLElBQUksaUJBQU8sRUFBVSxDQUFDO1FBQ3hELGtCQUFhLEdBQXVCLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFjckYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFDSCwrQkFBWSxHQUFaO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUM7SUFDOUQsQ0FBQztJQUNEOzs7OztPQUtHO0lBQ0gsa0NBQWUsR0FBZjtRQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDO0lBQ2pFLENBQUM7SUFDRDs7Ozs7T0FLRztJQUNILGlDQUFjLEdBQWQ7UUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQztJQUNoRSxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBQ0ksMEJBQU8sR0FBZDtRQUFBLGlCQXNDQztRQXJDQywwRUFBMEU7UUFDMUUsMkRBQTJEO1FBQzNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksSUFBRSxHQUFHLFVBQVUsQ0FBQztnQkFDbEIsS0FBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDOUMsWUFBWSxDQUFDLElBQUUsQ0FBQyxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDO1lBQ0wseUVBQXlFO1lBQ3pFLDRDQUE0QztRQUM1QyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksSUFBRSxHQUFHLFdBQVcsQ0FBQztnQkFDbkIsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ2xDLEtBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7b0JBQzlDLGFBQWEsQ0FBQyxJQUFFLENBQUMsQ0FBQztnQkFDcEIsQ0FBQztZQUNILENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNWLGlGQUFpRjtZQUNqRixpRUFBaUU7WUFDakUsMkVBQTJFO1lBQzNFLGdEQUFnRDtRQUNoRCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLEVBQUUsR0FBUyxJQUFJLGVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG1CQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0QsbUNBQW1DO1lBQ25DLElBQUksSUFBRSxHQUFpQixJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUM7Z0JBQ2pGLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkNBQTJDLENBQUMsQ0FBQztnQkFDekQsS0FBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7Z0JBQ3hCLEtBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLEVBQUUsR0FBaUIsS0FBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUM7b0JBQ3BGLElBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDakIsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNuQixDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzVCLENBQUM7SUFDSCxlQUFDO0FBQUQsQ0FBQyxBQTlGRCxJQThGQztBQTlGWSxRQUFRO0lBRHBCLGlCQUFVLEVBQUU7SUFnQlIsV0FBQSxhQUFNLENBQUMscUNBQWdCLENBQUMsQ0FBQTtJQUN4QixXQUFBLGFBQU0sQ0FBQyxxQkFBUyxDQUFDLENBQUE7SUFDakIsV0FBQSxhQUFNLENBQUMsMkJBQVksQ0FBQyxDQUFBO3FDQUZ3QixxQ0FBZ0I7UUFDeEIscUJBQVM7UUFDUiwyQkFBWTtHQWpCekMsUUFBUSxDQThGcEI7QUE5RlksNEJBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBJbmplY3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IElPIH0gZnJvbSAnLi9pby5zZXJ2aWNlJztcbmltcG9ydCB7IExvb3BCYWNrQXV0aCB9IGZyb20gJy4vYXV0aC5zZXJ2aWNlJztcbmltcG9ydCB7IExvb3BCYWNrQ29uZmlnIH0gZnJvbSAnLi4vLi4vbGIuY29uZmlnJztcbmltcG9ydCB7IEZpcmVMb29wIH0gZnJvbSAnLi4vLi4vbW9kZWxzL0ZpcmVMb29wJztcbmltcG9ydCB7IFNvY2tldENvbm5lY3Rpb24gfSBmcm9tICcuLi8uLi9zb2NrZXRzL3NvY2tldC5jb25uZWN0aW9ucyc7XG5pbXBvcnQgeyBTREtNb2RlbHMgfSBmcm9tICcuLi9jdXN0b20vU0RLTW9kZWxzJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzL1J4JztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzL1N1YmplY3QnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcy9TdWJzY3JpcHRpb24nO1xuLyoqXG4qIEBhdXRob3IgSm9uYXRoYW4gQ2FzYXJydWJpYXMgPHR3aXR0ZXI6QGpvaG5jYXNhcnJ1Ymlhcz4gPGdpdGh1YjpAam9obmNhc2FycnViaWFzPlxuKiBAbW9kdWxlIFJlYWxUaW1lXG4qIEBsaWNlbnNlIE1JVFxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBtb2R1bGUgaXMgYSByZWFsLXRpbWUgaW50ZXJmYWNlIGZvciB1c2luZyBzb2NrZXQgY29ubmVjdGlvbnMsIGl0cyBtYWluIHB1cnBvc2VcbiogaXMgdG8gbWFrZSBzdXJlIHRoYXQgd2hlbiB0aGVyZSBpcyBhIHZhbGlkIGNvbm5lY3Rpb24sIGl0IHdpbGwgY3JlYXRlIGluc3RhbmNlc1xuKiBvZiB0aGUgZGlmZmVyZW50IHJlYWwtdGltZSBmdW5jdGlvbmFsaXRpZXMgbGlrZSBGaXJlTG9vcCwgUHViU3ViIGFuZCBJTy5cbioqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJlYWxUaW1lIHtcbiAgcHVibGljIElPOiBJTztcbiAgcHVibGljIEZpcmVMb29wOiBGaXJlTG9vcDtcbiAgcHJpdmF0ZSBjb25uZWN0aW5nOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgb25SZWFkeVN1YmplY3Q6IFN1YmplY3Q8c3RyaW5nPiA9IG5ldyBTdWJqZWN0PHN0cmluZz4oKTtcbiAgcHJpdmF0ZSBzaGFyZWRPblJlYWR5OiBPYnNlcnZhYmxlPHN0cmluZz4gPSB0aGlzLm9uUmVhZHlTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpLnNoYXJlKCk7XG4gIC8qKlxuICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgKiBAcGFyYW0ge1NvY2tldENvbm5lY3Rpb259IGNvbm5lY3Rpb24gV2ViU29ja2V0IGNvbm5lY3Rpb24gc2VydmljZVxuICAqIEBwYXJhbSB7U0RLTW9kZWxzfSBtb2RlbHMgTW9kZWwgcHJvdmlkZXIgc2VydmljZVxuICAqIEBwYXJhbSB7TG9vcEJhY2tBdXRofSBhdXRoIExvb3BCYWNrIGF1dGhlbnRpY2F0aW9uIHNlcnZpY2VcbiAgKiBAZGVzY3JpcHRpb25cbiAgKiBJdCB3aWxsIGludGlhbGl6ZSB0aGUgc2hhcmVkIG9uIHJlYWR5IGNvbW11bmljYXRpb24gY2hhbm5lbC5cbiAgKiovXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoU29ja2V0Q29ubmVjdGlvbikgcHVibGljIGNvbm5lY3Rpb246IFNvY2tldENvbm5lY3Rpb24sXG4gICAgQEluamVjdChTREtNb2RlbHMpIHByb3RlY3RlZCBtb2RlbHM6IFNES01vZGVscyxcbiAgICBASW5qZWN0KExvb3BCYWNrQXV0aCkgcHJvdGVjdGVkIGF1dGg6IExvb3BCYWNrQXV0aFxuICApIHtcbiAgICB0aGlzLnNoYXJlZE9uUmVhZHkuc3Vic2NyaWJlKCk7XG4gIH1cbiAgLyoqXG4gICogQG1ldGhvZCBvbkRpc2Nvbm5lY3RcbiAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPGFueT59IFxuICAqIEBkZXNjcmlwdGlvblxuICAqIFdpbGwgdHJpZ2dlciB3aGVuIFJlYWwtVGltZSBTZXJ2aWNlIGlzIGRpc2Nvbm5lY3RlZCBmcm9tIHNlcnZlci5cbiAgKiovXG4gIG9uRGlzY29ubmVjdCgpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb24uc2hhcmVkT2JzZXJ2YWJsZXMuc2hhcmVkT25EaXNjb25uZWN0O1xuICB9XG4gIC8qKlxuICAqIEBtZXRob2Qgb25BdXRoZW50aWNhdGVkXG4gICogQHJldHVybiB7T2JzZXJ2YWJsZTxhbnk+fSBcbiAgKiBAZGVzY3JpcHRpb25cbiAgKiBXaWxsIHRyaWdnZXIgd2hlbiBSZWFsLVRpbWUgU2VydmljZSBpcyBhdXRoZW50aWNhdGVkIHdpdGggdGhlIHNlcnZlci5cbiAgKiovXG4gIG9uQXV0aGVudGljYXRlZCgpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb24uc2hhcmVkT2JzZXJ2YWJsZXMuc2hhcmVkT25BdXRoZW50aWNhdGVkO1xuICB9XG4gIC8qKlxuICAqIEBtZXRob2Qgb25VbkF1dGhvcml6ZWRcbiAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPGFueT59IFxuICAqIEBkZXNjcmlwdGlvblxuICAqIFdpbGwgdHJpZ2dlciB3aGVuIFJlYWwtVGltZSBTZXJ2aWNlIGlzIG5vdCBhdXRob3JpemVkIHRvIGNvbm5lY3Qgd2l0aCB0aGUgc2VydmVyLlxuICAqKi9cbiAgb25VbkF1dGhvcml6ZWQoKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uLnNoYXJlZE9ic2VydmFibGVzLnNoYXJlZE9uVW5BdXRob3JpemVkO1xuICB9XG4gIC8qKlxuICAqIEBtZXRob2Qgb25SZWFkeVxuICAqIEByZXR1cm4ge09ic2VydmFibGU8YW55Pn0gXG4gICogQGRlc2NyaXB0aW9uXG4gICogV2lsbCB0cmlnZ2VyIHdoZW4gUmVhbC1UaW1lIFNlcnZpY2UgaXMgUmVhZHkgZm9yIGJyb2FkY2FzdGluZy5cbiAgKiBhbmQgd2lsbCByZWdpc3RlciBjb25uZWN0aW9uIGZsb3cgZXZlbnRzIHRvIG5vdGlmeSBzdWJzY3JpYmVycy5cbiAgKiovXG4gIHB1YmxpYyBvblJlYWR5KCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgLy8gSWYgdGhlcmUgaXMgYSB2YWxpZCBjb25uZWN0aW9uLCB0aGVuIHdlIGp1c3Qgc2VuZCBiYWNrIHRvIHRoZSBFdmVudExvb3BcbiAgICAvLyBPciBuZXh0IHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIHRoZSBhY3R1YWwgc3Vic2NyaXB0aW9uLlxuICAgIGlmICh0aGlzLmNvbm5lY3Rpb24uaXNDb25uZWN0ZWQoKSkge1xuICAgICAgbGV0IHRvID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMub25SZWFkeVN1YmplY3QubmV4dCgnc2hhcmVkLWNvbm5lY3Rpb24nKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRvKTtcbiAgICAgIH0pO1xuICAgIC8vIEVsc2UgaWYgdGhlcmUgaXMgYSBjdXJyZW50IGF0dGVtcHQgb2YgY29ubmVjdGlvbiB3ZSB3YWl0IGZvciB0aGUgcHJpb3JcbiAgICAvLyBwcm9jZXNzIHRoYXQgc3RhcnRlZCB0aGUgY29ubmVjdGlvbiBmbG93LlxuICAgIH0gZWxzZSBpZiAodGhpcy5jb25uZWN0aW5nKSB7XG4gICAgICBsZXQgdGkgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmNvbm5lY3Rpb24uaXNDb25uZWN0ZWQoKSkge1xuICAgICAgICAgIHRoaXMub25SZWFkeVN1YmplY3QubmV4dCgnc2hhcmVkLWNvbm5lY3Rpb24nKTtcbiAgICAgICAgICBjbGVhckludGVydmFsKHRpKTtcbiAgICAgICAgfVxuICAgICAgfSwgNTAwKTtcbiAgICAvLyBJZiB0aGVyZSBpcyBub3QgdmFsaWQgY29ubmVjdGlvbiBvciBhdHRlbXB0LCB0aGVuIHdlIHN0YXJ0IHRoZSBjb25uZWN0aW9uIGZsb3dcbiAgICAvLyBhbmQgbWFrZSBzdXJlIHdlIG5vdGlmeSBhbGwgdGhlIG9uUmVhZHkgc3Vic2NyaWJlcnMgd2hlbiBkb25lLlxuICAgIC8vIEFsc28gaXQgd2lsbCBsaXN0ZW4gZm9yIGRlc2Nvbm5lY3Rpb25zIHNvIHdlIHVuc3Vic2NyaWJlIGFuZCBhdm9pZCBib3RoOlxuICAgIC8vIE1lbW9yeSBsZWFrcyBhbmQgZHVwbGljYXRlZCB0cmlnZ2VyZWQgZXZlbnRzLlxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbm5lY3RpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5jb25uZWN0aW9uLmNvbm5lY3QodGhpcy5hdXRoLmdldFRva2VuKCkpO1xuICAgICAgdGhpcy5JTyAgICAgICA9IG5ldyBJTyh0aGlzLmNvbm5lY3Rpb24pO1xuICAgICAgdGhpcy5GaXJlTG9vcCA9IG5ldyBGaXJlTG9vcCh0aGlzLmNvbm5lY3Rpb24sIHRoaXMubW9kZWxzKTtcbiAgICAgIC8vIEZpcmUgZXZlbnQgZm9yIHRob3NlIHN1YnNjcmliZWQgXG4gICAgICBsZXQgczE6IFN1YnNjcmlwdGlvbiA9IHRoaXMuY29ubmVjdGlvbi5zaGFyZWRPYnNlcnZhYmxlcy5zaGFyZWRPbkNvbm5lY3Quc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1JlYWwtVGltZSBjb25uZWN0aW9uIGhhcyBiZWVuIGVzdGFibGlzaGVkJyk7XG4gICAgICAgIHRoaXMuY29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLm9uUmVhZHlTdWJqZWN0Lm5leHQoJ2Nvbm5lY3RlZCcpO1xuICAgICAgICBsZXQgczI6IFN1YnNjcmlwdGlvbiA9IHRoaXMuY29ubmVjdGlvbi5zaGFyZWRPYnNlcnZhYmxlcy5zaGFyZWRPbkRpc2Nvbm5lY3Quc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICBzMS51bnN1YnNjcmliZSgpO1xuICAgICAgICAgIHMyLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNoYXJlZE9uUmVhZHk7XG4gIH1cbn1cbiJdfQ==