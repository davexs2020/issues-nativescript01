"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
var AppSettings = require("application-settings");
var core_1 = require("@angular/core");
/**
* @author Jonathan Casarrubias <twitter:@johncasarrubias> <github:@mean-expert-official>
* @module StorageNative
* @license MIT
* @description
* This module handle localStorage, it will be provided using DI Swapping according the
* SDK Socket Driver Available currently supporting Angular 2 for web and NativeScript 2.
**/
var StorageNative = (function () {
    function StorageNative() {
    }
    /**
     * @method get
     * @param {string} key Storage key name
     * @return {any}
     * @description
     * The getter will return any type of data persisted in localStorage.
     **/
    StorageNative.prototype.get = function (key) {
        var data = AppSettings.getString(key);
        return this.parse(data);
    };
    /**
     * @method set
     * @param {string} key Storage key name
     * @param {any} value Any value
     * @return {void}
     * @description
     * The setter will return any type of data persisted in localStorage.
     **/
    StorageNative.prototype.set = function (key, value) {
        AppSettings.setString(key, String(typeof value === 'object' ? JSON.stringify(value) : value));
    };
    /**
     * @method remove
     * @param {string} key Storage key name
     * @return {void}
     * @description
     * This method will remove a localStorage item from the client.
     **/
    StorageNative.prototype.remove = function (key) {
        if (AppSettings.hasKey(key)) {
            AppSettings.remove(key);
        }
        else {
            console.log('Trying to remove unexisting key: ', key);
        }
    };
    /**
     * @method parse
     * @param {any} value Input data expected to be JSON
     * @return {void}
     * @description
     * This method will parse the string as JSON if possible, otherwise will
     * return the value itself.
     **/
    StorageNative.prototype.parse = function (value) {
        try {
            return JSON.parse(value);
        }
        catch (e) {
            return value;
        }
    };
    return StorageNative;
}());
StorageNative = __decorate([
    core_1.Injectable()
], StorageNative);
exports.StorageNative = StorageNative;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5uYXRpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdG9yYWdlLm5hdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9CQUFvQjtBQUNwQixrREFBb0Q7QUFDcEQsc0NBQTJDO0FBQzNDOzs7Ozs7O0dBT0c7QUFFSCxJQUFhLGFBQWE7SUFBMUI7SUF1REEsQ0FBQztJQXREQzs7Ozs7O1FBTUk7SUFDSiwyQkFBRyxHQUFILFVBQUksR0FBVztRQUNiLElBQUksSUFBSSxHQUFXLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUNEOzs7Ozs7O1FBT0k7SUFDSiwyQkFBRyxHQUFILFVBQUksR0FBVyxFQUFFLEtBQVU7UUFDekIsV0FBVyxDQUFDLFNBQVMsQ0FDbkIsR0FBRyxFQUNILE1BQU0sQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FDbEUsQ0FBQztJQUNKLENBQUM7SUFDRDs7Ozs7O1FBTUk7SUFDSiw4QkFBTSxHQUFOLFVBQU8sR0FBVztRQUNoQixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDeEQsQ0FBQztJQUNILENBQUM7SUFDRDs7Ozs7OztRQU9JO0lBQ0ksNkJBQUssR0FBYixVQUFjLEtBQVU7UUFDdEIsSUFBSSxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDVCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7SUFDSCxDQUFDO0lBQ0gsb0JBQUM7QUFBRCxDQUFDLEFBdkRELElBdURDO0FBdkRZLGFBQWE7SUFEekIsaUJBQVUsRUFBRTtHQUNBLGFBQWEsQ0F1RHpCO0FBdkRZLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGUgKi9cbmltcG9ydCAqIGFzIEFwcFNldHRpbmdzIGZyb20gJ2FwcGxpY2F0aW9uLXNldHRpbmdzJztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbi8qKlxuKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0d2l0dGVyOkBqb2huY2FzYXJydWJpYXM+IDxnaXRodWI6QG1lYW4tZXhwZXJ0LW9mZmljaWFsPlxuKiBAbW9kdWxlIFN0b3JhZ2VOYXRpdmVcbiogQGxpY2Vuc2UgTUlUXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIG1vZHVsZSBoYW5kbGUgbG9jYWxTdG9yYWdlLCBpdCB3aWxsIGJlIHByb3ZpZGVkIHVzaW5nIERJIFN3YXBwaW5nIGFjY29yZGluZyB0aGVcbiogU0RLIFNvY2tldCBEcml2ZXIgQXZhaWxhYmxlIGN1cnJlbnRseSBzdXBwb3J0aW5nIEFuZ3VsYXIgMiBmb3Igd2ViIGFuZCBOYXRpdmVTY3JpcHQgMi5cbioqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFN0b3JhZ2VOYXRpdmUge1xuICAvKipcbiAgICogQG1ldGhvZCBnZXRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBTdG9yYWdlIGtleSBuYW1lXG4gICAqIEByZXR1cm4ge2FueX1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRoZSBnZXR0ZXIgd2lsbCByZXR1cm4gYW55IHR5cGUgb2YgZGF0YSBwZXJzaXN0ZWQgaW4gbG9jYWxTdG9yYWdlLlxuICAgKiovXG4gIGdldChrZXk6IHN0cmluZyk6IGFueSB7XG4gICAgbGV0IGRhdGE6IHN0cmluZyA9IEFwcFNldHRpbmdzLmdldFN0cmluZyhrZXkpO1xuICAgIHJldHVybiB0aGlzLnBhcnNlKGRhdGEpO1xuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIHNldFxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFN0b3JhZ2Uga2V5IG5hbWVcbiAgICogQHBhcmFtIHthbnl9IHZhbHVlIEFueSB2YWx1ZVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGhlIHNldHRlciB3aWxsIHJldHVybiBhbnkgdHlwZSBvZiBkYXRhIHBlcnNpc3RlZCBpbiBsb2NhbFN0b3JhZ2UuXG4gICAqKi9cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgQXBwU2V0dGluZ3Muc2V0U3RyaW5nKFxuICAgICAga2V5LFxuICAgICAgU3RyaW5nKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgPyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkgOiB2YWx1ZSlcbiAgICApO1xuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFN0b3JhZ2Uga2V5IG5hbWVcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRoaXMgbWV0aG9kIHdpbGwgcmVtb3ZlIGEgbG9jYWxTdG9yYWdlIGl0ZW0gZnJvbSB0aGUgY2xpZW50LlxuICAgKiovXG4gIHJlbW92ZShrZXk6IHN0cmluZyk6IGFueSB7XG4gICAgaWYgKEFwcFNldHRpbmdzLmhhc0tleShrZXkpKSB7XG4gICAgICBBcHBTZXR0aW5ncy5yZW1vdmUoa2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ1RyeWluZyB0byByZW1vdmUgdW5leGlzdGluZyBrZXk6ICcsIGtleSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIHBhcnNlXG4gICAqIEBwYXJhbSB7YW55fSB2YWx1ZSBJbnB1dCBkYXRhIGV4cGVjdGVkIHRvIGJlIEpTT05cbiAgICogQHJldHVybiB7dm9pZH1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRoaXMgbWV0aG9kIHdpbGwgcGFyc2UgdGhlIHN0cmluZyBhcyBKU09OIGlmIHBvc3NpYmxlLCBvdGhlcndpc2Ugd2lsbFxuICAgKiByZXR1cm4gdGhlIHZhbHVlIGl0c2VsZi5cbiAgICoqL1xuICBwcml2YXRlIHBhcnNlKHZhbHVlOiBhbnkpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICB9XG59XG4iXX0=