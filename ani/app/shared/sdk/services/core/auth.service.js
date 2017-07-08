"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var storage_swaps_1 = require("../../storage/storage.swaps");
var BaseModels_1 = require("../../models/BaseModels");
/**
* @author Jonathan Casarrubias <twitter:@johncasarrubias> <github:@mean-expert-official>
* @module SocketConnection
* @license MIT
* @description
* This module handle socket connections and return singleton instances for each
* connection, it will use the SDK Socket Driver Available currently supporting
* Angular 2 for web, NativeScript 2 and Angular Universal.
**/
var LoopBackAuth = (function () {
    /**
     * @method constructor
     * @param {InternalStorage} storage Internal Storage Driver
     * @description
     * The constructor will initialize the token loading data from storage
     **/
    function LoopBackAuth(storage) {
        this.storage = storage;
        /**
         * @type {SDKToken}
         **/
        this.token = new BaseModels_1.SDKToken();
        /**
         * @type {string}
         **/
        this.prefix = '$LoopBackSDK$';
        this.token.id = this.load('id');
        this.token.user = this.load('user');
        this.token.userId = this.load('userId');
        this.token.created = this.load('created');
        this.token.ttl = this.load('ttl');
        this.token.rememberMe = this.load('rememberMe');
    }
    /**
     * @method setRememberMe
     * @param {boolean} value Flag to remember credentials
     * @return {void}
     * @description
     * This method will set a flag in order to remember the current credentials
     **/
    LoopBackAuth.prototype.setRememberMe = function (value) {
        this.token.rememberMe = value;
    };
    /**
     * @method setUser
     * @param {any} user Any type of user model
     * @return {void}
     * @description
     * This method will update the user information and persist it if the
     * rememberMe flag is set.
     **/
    LoopBackAuth.prototype.setUser = function (user) {
        this.token.user = user;
        this.save();
    };
    /**
     * @method setToken
     * @param {SDKToken} token SDKToken or casted AccessToken instance
     * @return {void}
     * @description
     * This method will set a flag in order to remember the current credentials
     **/
    LoopBackAuth.prototype.setToken = function (token) {
        this.token = Object.assign(this.token, token);
        this.save();
    };
    /**
     * @method getToken
     * @return {void}
     * @description
     * This method will set a flag in order to remember the current credentials.
     **/
    LoopBackAuth.prototype.getToken = function () {
        return this.token;
    };
    /**
     * @method getAccessTokenId
     * @return {string}
     * @description
     * This method will return the actual token string, not the object instance.
     **/
    LoopBackAuth.prototype.getAccessTokenId = function () {
        return this.token.id;
    };
    /**
     * @method getCurrentUserId
     * @return {any}
     * @description
     * This method will return the current user id, it can be number or string.
     **/
    LoopBackAuth.prototype.getCurrentUserId = function () {
        return this.token.userId;
    };
    /**
     * @method getCurrentUserData
     * @return {any}
     * @description
     * This method will return the current user instance.
     **/
    LoopBackAuth.prototype.getCurrentUserData = function () {
        return (typeof this.token.user === 'string') ? JSON.parse(this.token.user) : this.token.user;
    };
    /**
     * @method save
     * @return {boolean} Wether or not the information was saved
     * @description
     * This method will save in either local storage or cookies the current credentials.
     * But only if rememberMe is enabled.
     **/
    LoopBackAuth.prototype.save = function () {
        if (this.token.rememberMe) {
            this.persist('id', this.token.id);
            this.persist('user', this.token.user);
            this.persist('userId', this.token.userId);
            this.persist('created', this.token.created);
            this.persist('ttl', this.token.ttl);
            this.persist('rememberMe', this.token.rememberMe);
            return true;
        }
        else {
            return false;
        }
    };
    ;
    /**
     * @method load
     * @param {string} prop Property name
     * @return {any} Any information persisted in storage
     * @description
     * This method will load either from local storage or cookies the provided property.
     **/
    LoopBackAuth.prototype.load = function (prop) {
        return this.storage.get("" + this.prefix + prop);
    };
    /**
     * @method clear
     * @return {void}
     * @description
     * This method will clear cookies or the local storage.
     **/
    LoopBackAuth.prototype.clear = function () {
        var _this = this;
        Object.keys(this.token).forEach(function (prop) { return _this.storage.remove("" + _this.prefix + prop); });
        this.token = new BaseModels_1.SDKToken();
    };
    /**
     * @method clear
     * @return {void}
     * @description
     * This method will clear cookies or the local storage.
     **/
    LoopBackAuth.prototype.persist = function (prop, value) {
        try {
            this.storage.set("" + this.prefix + prop, (typeof value === 'object') ? JSON.stringify(value) : value);
        }
        catch (err) {
            console.error('Cannot access local/session storage:', err);
        }
    };
    return LoopBackAuth;
}());
LoopBackAuth = __decorate([
    core_1.Injectable(),
    __param(0, core_1.Inject(storage_swaps_1.InternalStorage)),
    __metadata("design:paramtypes", [storage_swaps_1.InternalStorage])
], LoopBackAuth);
exports.LoopBackAuth = LoopBackAuth;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXV0aC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsc0NBQW1EO0FBQ25ELDZEQUE4RDtBQUM5RCxzREFBbUQ7QUFDbkQ7Ozs7Ozs7O0dBUUc7QUFFSCxJQUFhLFlBQVk7SUFTdkI7Ozs7O1FBS0k7SUFDSixzQkFBK0MsT0FBd0I7UUFBeEIsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7UUFkdkU7O1lBRUk7UUFDSSxVQUFLLEdBQWEsSUFBSSxxQkFBUSxFQUFFLENBQUM7UUFDekM7O1lBRUk7UUFDTSxXQUFNLEdBQVcsZUFBZSxDQUFDO1FBUXpDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFDRDs7Ozs7O1FBTUk7SUFDRyxvQ0FBYSxHQUFwQixVQUFxQixLQUFjO1FBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztJQUNoQyxDQUFDO0lBQ0Q7Ozs7Ozs7UUFPSTtJQUNHLDhCQUFPLEdBQWQsVUFBZSxJ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Q0FBQztZQUNILElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUNkLEtBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFNLEVBQ3ZCLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQzVELENBQUM7UUFDSixDQUFDO1FBQ0QsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0NBQXNDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0QsQ0FBQztJQUNILENBQUM7SUFDSCxtQkFBQztBQUFELENBQUMsQUFySkQsSUFxSkM7QUFySlksWUFBWTtJQUR4QixpQkFBVSxFQUFFO0lBZ0JFLFdBQUEsYUFBTSxDQUFDLCtCQUFlLENBQUMsQ0FBQTtxQ0FBb0IsK0JBQWU7R0FmNUQsWUFBWSxDQXFKeEI7QUFySlksb0NBQVkiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB0c2xpbnQ6ZGlzYWJsZSAqL1xuZGVjbGFyZSB2YXIgT2JqZWN0OiBhbnk7XG5pbXBvcnQgeyBJbmplY3RhYmxlLCBJbmplY3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEludGVybmFsU3RvcmFnZSB9IGZyb20gJy4uLy4uL3N0b3JhZ2Uvc3RvcmFnZS5zd2Fwcyc7XG5pbXBvcnQgeyBTREtUb2tlbiB9IGZyb20gJy4uLy4uL21vZGVscy9CYXNlTW9kZWxzJztcbi8qKlxuKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0d2l0dGVyOkBqb2huY2FzYXJydWJpYXM+IDxnaXRodWI6QG1lYW4tZXhwZXJ0LW9mZmljaWFsPlxuKiBAbW9kdWxlIFNvY2tldENvbm5lY3Rpb25cbiogQGxpY2Vuc2UgTUlUXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIG1vZHVsZSBoYW5kbGUgc29ja2V0IGNvbm5lY3Rpb25zIGFuZCByZXR1cm4gc2luZ2xldG9uIGluc3RhbmNlcyBmb3IgZWFjaFxuKiBjb25uZWN0aW9uLCBpdCB3aWxsIHVzZSB0aGUgU0RLIFNvY2tldCBEcml2ZXIgQXZhaWxhYmxlIGN1cnJlbnRseSBzdXBwb3J0aW5nXG4qIEFuZ3VsYXIgMiBmb3Igd2ViLCBOYXRpdmVTY3JpcHQgMiBhbmQgQW5ndWxhciBVbml2ZXJzYWwuXG4qKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBMb29wQmFja0F1dGgge1xuICAvKipcbiAgICogQHR5cGUge1NES1Rva2VufVxuICAgKiovXG4gIHByaXZhdGUgdG9rZW46IFNES1Rva2VuID0gbmV3IFNES1Rva2VuKCk7XG4gIC8qKlxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiovXG4gIHByb3RlY3RlZCBwcmVmaXg6IHN0cmluZyA9ICckTG9vcEJhY2tTREskJztcbiAgLyoqXG4gICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtJbnRlcm5hbFN0b3JhZ2V9IHN0b3JhZ2UgSW50ZXJuYWwgU3RvcmFnZSBEcml2ZXJcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRoZSBjb25zdHJ1Y3RvciB3aWxsIGluaXRpYWxpemUgdGhlIHRva2VuIGxvYWRpbmcgZGF0YSBmcm9tIHN0b3JhZ2VcbiAgICoqL1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KEludGVybmFsU3RvcmFnZSkgcHJvdGVjdGVkIHN0b3JhZ2U6IEludGVybmFsU3RvcmFnZSkge1xuICAgIHRoaXMudG9rZW4uaWQgPSB0aGlzLmxvYWQoJ2lkJyk7XG4gICAgdGhpcy50b2tlbi51c2VyID0gdGhpcy5sb2FkKCd1c2VyJyk7XG4gICAgdGhpcy50b2tlbi51c2VySWQgPSB0aGlzLmxvYWQoJ3VzZXJJZCcpO1xuICAgIHRoaXMudG9rZW4uY3JlYXRlZCA9IHRoaXMubG9hZCgnY3JlYXRlZCcpO1xuICAgIHRoaXMudG9rZW4udHRsID0gdGhpcy5sb2FkKCd0dGwnKTtcbiAgICB0aGlzLnRva2VuLnJlbWVtYmVyTWUgPSB0aGlzLmxvYWQoJ3JlbWVtYmVyTWUnKTtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBzZXRSZW1lbWJlck1lXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWUgRmxhZyB0byByZW1lbWJlciBjcmVkZW50aWFsc1xuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGhpcyBtZXRob2Qgd2lsbCBzZXQgYSBmbGFnIGluIG9yZGVyIHRvIHJlbWVtYmVyIHRoZSBjdXJyZW50IGNyZWRlbnRpYWxzXG4gICAqKi9cbiAgcHVibGljIHNldFJlbWVtYmVyTWUodmFsdWU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnRva2VuLnJlbWVtYmVyTWUgPSB2YWx1ZTtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBzZXRVc2VyXG4gICAqIEBwYXJhbSB7YW55fSB1c2VyIEFueSB0eXBlIG9mIHVzZXIgbW9kZWxcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRoaXMgbWV0aG9kIHdpbGwgdXBkYXRlIHRoZSB1c2VyIGluZm9ybWF0aW9uIGFuZCBwZXJzaXN0IGl0IGlmIHRoZVxuICAgKiByZW1lbWJlck1lIGZsYWcgaXMgc2V0LlxuICAgKiovXG4gIHB1YmxpYyBzZXRVc2VyKHVzZXI6IGFueSkge1xuICAgIHRoaXMudG9rZW4udXNlciA9IHVzZXI7XG4gICAgdGhpcy5zYXZlKCk7XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2Qgc2V0VG9rZW5cbiAgICogQHBhcmFtIHtTREtUb2tlbn0gdG9rZW4gU0RLVG9rZW4gb3IgY2FzdGVkIEFjY2Vzc1Rva2VuIGluc3RhbmNlXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIHNldCBhIGZsYWcgaW4gb3JkZXIgdG8gcmVtZW1iZXIgdGhlIGN1cnJlbnQgY3JlZGVudGlhbHNcbiAgICoqL1xuICBwdWJsaWMgc2V0VG9rZW4odG9rZW46IFNES1Rva2VuKTogdm9pZCB7XG4gICAgdGhpcy50b2tlbiA9IE9iamVjdC5hc3NpZ24odGhpcy50b2tlbiwgdG9rZW4pO1xuICAgIHRoaXMuc2F2ZSgpO1xuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIGdldFRva2VuXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIHNldCBhIGZsYWcgaW4gb3JkZXIgdG8gcmVtZW1iZXIgdGhlIGN1cnJlbnQgY3JlZGVudGlhbHMuXG4gICAqKi9cbiAgcHVibGljIGdldFRva2VuKCk6IFNES1Rva2VuIHtcbiAgICByZXR1cm4gPFNES1Rva2VuPnRoaXMudG9rZW47XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2QgZ2V0QWNjZXNzVG9rZW5JZFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIHJldHVybiB0aGUgYWN0dWFsIHRva2VuIHN0cmluZywgbm90IHRoZSBvYmplY3QgaW5zdGFuY2UuXG4gICAqKi9cbiAgcHVibGljIGdldEFjY2Vzc1Rva2VuSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy50b2tlbi5pZDtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBnZXRDdXJyZW50VXNlcklkXG4gICAqIEByZXR1cm4ge2FueX1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRoaXMgbWV0aG9kIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHVzZXIgaWQsIGl0IGNhbiBiZSBudW1iZXIgb3Igc3RyaW5nLlxuICAgKiovXG4gIHB1YmxpYyBnZXRDdXJyZW50VXNlcklkKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMudG9rZW4udXNlcklkO1xuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIGdldEN1cnJlbnRVc2VyRGF0YVxuICAgKiBAcmV0dXJuIHthbnl9XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIHJldHVybiB0aGUgY3VycmVudCB1c2VyIGluc3RhbmNlLlxuICAgKiovXG4gIHB1YmxpYyBnZXRDdXJyZW50VXNlckRhdGEoKTogYW55IHtcbiAgICByZXR1cm4gKHR5cGVvZiB0aGlzLnRva2VuLnVzZXIgPT09ICdzdHJpbmcnKSA/IEpTT04ucGFyc2UodGhpcy50b2tlbi51c2VyKSA6IHRoaXMudG9rZW4udXNlcjtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBzYXZlXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFdldGhlciBvciBub3QgdGhlIGluZm9ybWF0aW9uIHdhcyBzYXZlZFxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGhpcyBtZXRob2Qgd2lsbCBzYXZlIGluIGVpdGhlciBsb2NhbCBzdG9yYWdlIG9yIGNvb2tpZXMgdGhlIGN1cnJlbnQgY3JlZGVudGlhbHMuXG4gICAqIEJ1dCBvbmx5IGlmIHJlbWVtYmVyTWUgaXMgZW5hYmxlZC5cbiAgICoqL1xuICBwdWJsaWMgc2F2ZSgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy50b2tlbi5yZW1lbWJlck1lKSB7XG4gICAgICB0aGlzLnBlcnNpc3QoJ2lkJywgdGhpcy50b2tlbi5pZCk7XG4gICAgICB0aGlzLnBlcnNpc3QoJ3VzZXInLCB0aGlzLnRva2VuLnVzZXIpO1xuICAgICAgdGhpcy5wZXJzaXN0KCd1c2VySWQnLCB0aGlzLnRva2VuLnVzZXJJZCk7XG4gICAgICB0aGlzLnBlcnNpc3QoJ2NyZWF0ZWQnLCB0aGlzLnRva2VuLmNyZWF0ZWQpO1xuICAgICAgdGhpcy5wZXJzaXN0KCd0dGwnLCB0aGlzLnRva2VuLnR0bCk7XG4gICAgICB0aGlzLnBlcnNpc3QoJ3JlbWVtYmVyTWUnLCB0aGlzLnRva2VuLnJlbWVtYmVyTWUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBAbWV0aG9kIGxvYWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHByb3AgUHJvcGVydHkgbmFtZVxuICAgKiBAcmV0dXJuIHthbnl9IEFueSBpbmZvcm1hdGlvbiBwZXJzaXN0ZWQgaW4gc3RvcmFnZVxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGhpcyBtZXRob2Qgd2lsbCBsb2FkIGVpdGhlciBmcm9tIGxvY2FsIHN0b3JhZ2Ugb3IgY29va2llcyB0aGUgcHJvdmlkZWQgcHJvcGVydHkuXG4gICAqKi9cbiAgcHJvdGVjdGVkIGxvYWQocHJvcDogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5zdG9yYWdlLmdldChgJHt0aGlzLnByZWZpeH0ke3Byb3B9YCk7XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2QgY2xlYXJcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRoaXMgbWV0aG9kIHdpbGwgY2xlYXIgY29va2llcyBvciB0aGUgbG9jYWwgc3RvcmFnZS5cbiAgICoqL1xuICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgT2JqZWN0LmtleXModGhpcy50b2tlbikuZm9yRWFjaCgocHJvcDogc3RyaW5nKSA9PiB0aGlzLnN0b3JhZ2UucmVtb3ZlKGAke3RoaXMucHJlZml4fSR7cHJvcH1gKSk7XG4gICAgdGhpcy50b2tlbiA9IG5ldyBTREtUb2tlbigpO1xuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIGNsZWFyXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIGNsZWFyIGNvb2tpZXMgb3IgdGhlIGxvY2FsIHN0b3JhZ2UuXG4gICAqKi9cbiAgcHJvdGVjdGVkIHBlcnNpc3QocHJvcDogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuc3RvcmFnZS5zZXQoXG4gICAgICAgIGAke3RoaXMucHJlZml4fSR7cHJvcH1gLFxuICAgICAgICAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JykgPyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkgOiB2YWx1ZVxuICAgICAgKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignQ2Fubm90IGFjY2VzcyBsb2NhbC9zZXNzaW9uIHN0b3JhZ2U6JywgZXJyKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==