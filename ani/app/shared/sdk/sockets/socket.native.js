"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
var SocketIO = require("nativescript-socket.io");
/**
* @author Jonathan Casarrubias <twitter:@johncasarrubias> <github:@mean-expert-official>
* @module SocketNative
* @license MIT
* @description
* This module handle socket connections for nativescript apps, it will be DI Swapped
* depending on the platform environment.
* This module will be generated when the -d ng2native flag is set.
**/
var SocketNative = (function () {
    function SocketNative() {
    }
    /**
     * @method connect
     * @param {string} url URL path to connect with the server.
     * @param {any} options Any socket.io v1 =< valid options
     * @return {SocketIO.Socket}
     * @description
     * This method will return a valid socket connection.
     **/
    SocketNative.prototype.connect = function (url, options) {
        return SocketIO.connect(url, options);
    };
    return SocketNative;
}());
exports.SocketNative = SocketNative;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0Lm5hdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNvY2tldC5uYXRpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvQkFBb0I7QUFDcEIsaURBQW1EO0FBQ25EOzs7Ozs7OztHQVFHO0FBQ0g7SUFBQTtJQVlBLENBQUM7SUFYQzs7Ozs7OztRQU9JO0lBQ0osOEJBQU8sR0FBUCxVQUFRLEdBQVcsRUFBRSxPQUFZO1FBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLEFBWkQsSUFZQztBQVpZLG9DQUFZIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGUgKi9cbmltcG9ydCAqIGFzIFNvY2tldElPIGZyb20gJ25hdGl2ZXNjcmlwdC1zb2NrZXQuaW8nO1xuLyoqXG4qIEBhdXRob3IgSm9uYXRoYW4gQ2FzYXJydWJpYXMgPHR3aXR0ZXI6QGpvaG5jYXNhcnJ1Ymlhcz4gPGdpdGh1YjpAbWVhbi1leHBlcnQtb2ZmaWNpYWw+XG4qIEBtb2R1bGUgU29ja2V0TmF0aXZlXG4qIEBsaWNlbnNlIE1JVFxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBtb2R1bGUgaGFuZGxlIHNvY2tldCBjb25uZWN0aW9ucyBmb3IgbmF0aXZlc2NyaXB0IGFwcHMsIGl0IHdpbGwgYmUgREkgU3dhcHBlZFxuKiBkZXBlbmRpbmcgb24gdGhlIHBsYXRmb3JtIGVudmlyb25tZW50LlxuKiBUaGlzIG1vZHVsZSB3aWxsIGJlIGdlbmVyYXRlZCB3aGVuIHRoZSAtZCBuZzJuYXRpdmUgZmxhZyBpcyBzZXQuXG4qKi9cbmV4cG9ydCBjbGFzcyBTb2NrZXROYXRpdmUge1xuICAvKipcbiAgICogQG1ldGhvZCBjb25uZWN0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVVJMIHBhdGggdG8gY29ubmVjdCB3aXRoIHRoZSBzZXJ2ZXIuXG4gICAqIEBwYXJhbSB7YW55fSBvcHRpb25zIEFueSBzb2NrZXQuaW8gdjEgPTwgdmFsaWQgb3B0aW9uc1xuICAgKiBAcmV0dXJuIHtTb2NrZXRJTy5Tb2NrZXR9XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIHJldHVybiBhIHZhbGlkIHNvY2tldCBjb25uZWN0aW9uLiAgICAgICAgICAgICAgICAgICAgXG4gICAqKi9cbiAgY29ubmVjdCh1cmw6IHN0cmluZywgb3B0aW9uczogYW55KTogU29ja2V0SU8uU29ja2V0IHtcbiAgICByZXR1cm4gU29ja2V0SU8uY29ubmVjdCh1cmwsIG9wdGlvbnMpO1xuICB9XG59XG4iXX0=