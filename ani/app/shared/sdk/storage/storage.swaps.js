"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module Storage
 * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
 * @license MIT
 * @description
 * The InternalStorage class is used for dependency injection swapping.
 * It will be provided using factory method from different sources.
 **/
var BaseStorage = (function () {
    function BaseStorage() {
    }
    /**
     * @method get
     * @param {string} key Storage key name
     * @return {any}
     * @description
     * The getter will return any type of data persisted in storage.
     **/
    BaseStorage.prototype.get = function (key) { };
    /**
     * @method set
     * @param {string} key Storage key name
     * @param {any} value Any value
     * @return {void}
     * @description
     * The setter will return any type of data persisted in localStorage.
     **/
    BaseStorage.prototype.set = function (key, value) { };
    /**
     * @method remove
     * @param {string} key Storage key name
     * @return {void}
     * @description
     * This method will remove a localStorage item from the client.
     **/
    BaseStorage.prototype.remove = function (key) { };
    return BaseStorage;
}());
exports.BaseStorage = BaseStorage;
/**
 * @module InternalStorage
 * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
 * @license MIT
 * @description
 * The InternalStorage class is used for dependency injection swapping.
 * It will be provided using factory method from different sources.
 * This is mainly required because Angular Universal integration.
 * It does inject a CookieStorage instead of LocalStorage.
 **/
var InternalStorage = (function (_super) {
    __extends(InternalStorage, _super);
    function InternalStorage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InternalStorage;
}(BaseStorage));
exports.InternalStorage = InternalStorage;
/**
 * @module SDKStorage
 * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
 * @license MIT
 * @description
 * The SDKStorage class is used for dependency injection swapping.
 * It will be provided using factory method according the right environment.
 * This is created for public usage, to allow persisting custom data
 * Into the local storage API.
 **/
var SDKStorage = (function (_super) {
    __extends(SDKStorage, _super);
    function SDKStorage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SDKStorage;
}(BaseStorage));
exports.SDKStorage = SDKStorage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5zd2Fwcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0b3JhZ2Uuc3dhcHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztJQU9JO0FBQ0o7SUFBQTtJQTBCQSxDQUFDO0lBekJDOzs7Ozs7UUFNSTtJQUNKLHlCQUFHLEdBQUgsVUFBSSxHQUFXLElBQVEsQ0FBQztJQUN4Qjs7Ozs7OztRQU9JO0lBQ0oseUJBQUcsR0FBSCxVQUFJLEdBQVcsRUFBRSxLQUFVLElBQVMsQ0FBQztJQUNyQzs7Ozs7O1FBTUk7SUFDSiw0QkFBTSxHQUFOLFVBQU8sR0FBVyxJQUFTLENBQUM7SUFDOUIsa0JBQUM7QUFBRCxDQUFDLEFBMUJELElBMEJDO0FBMUJZLGtDQUFXO0FBMkJ4Qjs7Ozs7Ozs7O0lBU0k7QUFDSjtJQUFxQyxtQ0FBVztJQUFoRDs7SUFBa0QsQ0FBQztJQUFELHNCQUFDO0FBQUQsQ0FBQyxBQUFuRCxDQUFxQyxXQUFXLEdBQUc7QUFBdEMsMENBQWU7QUFDNUI7Ozs7Ozs7OztJQVNJO0FBQ0o7SUFBZ0MsOEJBQVc7SUFBM0M7O0lBQTZDLENBQUM7SUFBRCxpQkFBQztBQUFELENBQUMsQUFBOUMsQ0FBZ0MsV0FBVyxHQUFHO0FBQWpDLGdDQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKsKgQG1vZHVsZSBTdG9yYWdlXG4gKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0OiBqb2huY2FzYXJydWJpYXMsIGdoOiBtZWFuLWV4cGVydC1vZmZpY2lhbD5cbiAqIEBsaWNlbnNlIE1JVFxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGUgSW50ZXJuYWxTdG9yYWdlIGNsYXNzIGlzIHVzZWQgZm9yIGRlcGVuZGVuY3kgaW5qZWN0aW9uIHN3YXBwaW5nLlxuICogSXQgd2lsbCBiZSBwcm92aWRlZCB1c2luZyBmYWN0b3J5IG1ldGhvZCBmcm9tIGRpZmZlcmVudCBzb3VyY2VzLlxuICoqL1xuZXhwb3J0IGNsYXNzIEJhc2VTdG9yYWdlIHtcbiAgLyoqXG4gICAqIEBtZXRob2QgZ2V0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgU3RvcmFnZSBrZXkgbmFtZVxuICAgKiBAcmV0dXJuIHthbnl9XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGUgZ2V0dGVyIHdpbGwgcmV0dXJuIGFueSB0eXBlIG9mIGRhdGEgcGVyc2lzdGVkIGluIHN0b3JhZ2UuXG4gICAqKi9cbiAgZ2V0KGtleTogc3RyaW5nKTogYW55IHt9XG4gIC8qKlxuICAgKiBAbWV0aG9kIHNldFxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFN0b3JhZ2Uga2V5IG5hbWVcbiAgICogQHBhcmFtIHthbnl9IHZhbHVlIEFueSB2YWx1ZVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGhlIHNldHRlciB3aWxsIHJldHVybiBhbnkgdHlwZSBvZiBkYXRhIHBlcnNpc3RlZCBpbiBsb2NhbFN0b3JhZ2UuXG4gICAqKi9cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7fVxuICAvKipcbiAgICogQG1ldGhvZCByZW1vdmVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBTdG9yYWdlIGtleSBuYW1lXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIHJlbW92ZSBhIGxvY2FsU3RvcmFnZSBpdGVtIGZyb20gdGhlIGNsaWVudC5cbiAgICoqL1xuICByZW1vdmUoa2V5OiBzdHJpbmcpOiB2b2lkIHt9XG59XG4vKipcbiAqwqBAbW9kdWxlIEludGVybmFsU3RvcmFnZVxuICogQGF1dGhvciBKb25hdGhhbiBDYXNhcnJ1YmlhcyA8dDogam9obmNhc2FycnViaWFzLCBnaDogbWVhbi1leHBlcnQtb2ZmaWNpYWw+XG4gKiBAbGljZW5zZSBNSVRcbiAqIEBkZXNjcmlwdGlvblxuICogVGhlIEludGVybmFsU3RvcmFnZSBjbGFzcyBpcyB1c2VkIGZvciBkZXBlbmRlbmN5IGluamVjdGlvbiBzd2FwcGluZy5cbiAqIEl0IHdpbGwgYmUgcHJvdmlkZWQgdXNpbmcgZmFjdG9yeSBtZXRob2QgZnJvbSBkaWZmZXJlbnQgc291cmNlcy5cbiAqIFRoaXMgaXMgbWFpbmx5IHJlcXVpcmVkIGJlY2F1c2UgQW5ndWxhciBVbml2ZXJzYWwgaW50ZWdyYXRpb24uXG4gKiBJdCBkb2VzIGluamVjdCBhIENvb2tpZVN0b3JhZ2UgaW5zdGVhZCBvZiBMb2NhbFN0b3JhZ2UuXG4gKiovXG5leHBvcnQgY2xhc3MgSW50ZXJuYWxTdG9yYWdlIGV4dGVuZHMgQmFzZVN0b3JhZ2Uge31cbi8qKlxuICrCoEBtb2R1bGUgU0RLU3RvcmFnZVxuICogQGF1dGhvciBKb25hdGhhbiBDYXNhcnJ1YmlhcyA8dDogam9obmNhc2FycnViaWFzLCBnaDogbWVhbi1leHBlcnQtb2ZmaWNpYWw+XG4gKiBAbGljZW5zZSBNSVRcbiAqIEBkZXNjcmlwdGlvblxuICogVGhlIFNES1N0b3JhZ2UgY2xhc3MgaXMgdXNlZCBmb3IgZGVwZW5kZW5jeSBpbmplY3Rpb24gc3dhcHBpbmcuXG4gKiBJdCB3aWxsIGJlIHByb3ZpZGVkIHVzaW5nIGZhY3RvcnkgbWV0aG9kIGFjY29yZGluZyB0aGUgcmlnaHQgZW52aXJvbm1lbnQuXG4gKiBUaGlzIGlzIGNyZWF0ZWQgZm9yIHB1YmxpYyB1c2FnZSwgdG8gYWxsb3cgcGVyc2lzdGluZyBjdXN0b20gZGF0YVxuICogSW50byB0aGUgbG9jYWwgc3RvcmFnZSBBUEkuXG4gKiovXG5leHBvcnQgY2xhc3MgU0RLU3RvcmFnZSBleHRlbmRzIEJhc2VTdG9yYWdlIHt9XG4iXX0=