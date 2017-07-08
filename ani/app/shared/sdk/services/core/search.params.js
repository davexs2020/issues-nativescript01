"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
/**
* @author Jonathan Casarrubias <twitter:@johncasarrubias> <github:@mean-expert-official>
* @module JSONSearchParams
* @license MIT
* @description
* JSON Parser and Wrapper for the Angular2 URLSearchParams
* This module correctly encodes a json object into a query string and then creates
* an instance of the URLSearchParams component for later use in HTTP Calls
**/
var JSONSearchParams = (function () {
    function JSONSearchParams() {
    }
    JSONSearchParams.prototype.setJSON = function (obj) {
        this._usp = new http_1.URLSearchParams(this._JSON2URL(obj, false));
    };
    JSONSearchParams.prototype.getURLSearchParams = function () {
        return this._usp;
    };
    JSONSearchParams.prototype._JSON2URL = function (obj, parent) {
        var parts = [];
        for (var key in obj)
            parts.push(this._parseParam(key, obj[key], parent));
        return parts.join('&');
    };
    JSONSearchParams.prototype._parseParam = function (key, value, parent) {
        var processedKey = parent ? parent + '[' + key + ']' : key;
        if (value && ((typeof value) === 'object' || Array.isArray(value))) {
            return this._JSON2URL(value, processedKey);
        }
        return processedKey + '=' + value;
    };
    return JSONSearchParams;
}());
JSONSearchParams = __decorate([
    core_1.Injectable()
], JSONSearchParams);
exports.JSONSearchParams = JSONSearchParams;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLnBhcmFtcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlYXJjaC5wYXJhbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvQkFBb0I7QUFDcEIsc0NBQTJDO0FBQzNDLHNDQUFnRDtBQUNoRDs7Ozs7Ozs7R0FRRztBQUVILElBQWEsZ0JBQWdCO0lBQTdCO0lBMEJBLENBQUM7SUF0QlUsa0NBQU8sR0FBZCxVQUFlLEdBQVE7UUFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLHNCQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRU0sNkNBQWtCLEdBQXpCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVPLG9DQUFTLEdBQWpCLFVBQWtCLEdBQVEsRUFBRSxNQUFXO1FBQ25DLElBQUksS0FBSyxHQUFRLEVBQUUsQ0FBQztRQUNwQixHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUM7WUFDcEIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNwRCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRU8sc0NBQVcsR0FBbkIsVUFBb0IsR0FBVyxFQUFFLEtBQVUsRUFBRSxNQUFjO1FBQ3ZELElBQUksWUFBWSxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQzNELEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFTLENBQUMsT0FBTyxLQUFLLENBQUMsS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUNELE1BQU0sQ0FBQyxZQUFZLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQztJQUN0QyxDQUFDO0lBQ0wsdUJBQUM7QUFBRCxDQUFDLEFBMUJELElBMEJDO0FBMUJZLGdCQUFnQjtJQUQ1QixpQkFBVSxFQUFFO0dBQ0EsZ0JBQWdCLENBMEI1QjtBQTFCWSw0Q0FBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB0c2xpbnQ6ZGlzYWJsZSAqL1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgVVJMU2VhcmNoUGFyYW1zIH0gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG4vKipcbiogQGF1dGhvciBKb25hdGhhbiBDYXNhcnJ1YmlhcyA8dHdpdHRlcjpAam9obmNhc2FycnViaWFzPiA8Z2l0aHViOkBtZWFuLWV4cGVydC1vZmZpY2lhbD5cbiogQG1vZHVsZSBKU09OU2VhcmNoUGFyYW1zXG4qIEBsaWNlbnNlIE1JVFxuKiBAZGVzY3JpcHRpb25cbiogSlNPTiBQYXJzZXIgYW5kIFdyYXBwZXIgZm9yIHRoZSBBbmd1bGFyMiBVUkxTZWFyY2hQYXJhbXNcbiogVGhpcyBtb2R1bGUgY29ycmVjdGx5IGVuY29kZXMgYSBqc29uIG9iamVjdCBpbnRvIGEgcXVlcnkgc3RyaW5nIGFuZCB0aGVuIGNyZWF0ZXNcbiogYW4gaW5zdGFuY2Ugb2YgdGhlIFVSTFNlYXJjaFBhcmFtcyBjb21wb25lbnQgZm9yIGxhdGVyIHVzZSBpbiBIVFRQIENhbGxzXG4qKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBKU09OU2VhcmNoUGFyYW1zIHtcblxuICAgIHByaXZhdGUgX3VzcDogVVJMU2VhcmNoUGFyYW1zO1xuXG4gICAgcHVibGljIHNldEpTT04ob2JqOiBhbnkpIHtcbiAgICAgICAgdGhpcy5fdXNwID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh0aGlzLl9KU09OMlVSTChvYmosIGZhbHNlKSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFVSTFNlYXJjaFBhcmFtcygpOiBVUkxTZWFyY2hQYXJhbXMge1xuICAgICAgICByZXR1cm4gdGhpcy5fdXNwO1xuICAgIH1cblxuICAgIHByaXZhdGUgX0pTT04yVVJMKG9iajogYW55LCBwYXJlbnQ6IGFueSkge1xuICAgICAgICB2YXIgcGFydHM6IGFueSA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKVxuICAgICAgICBwYXJ0cy5wdXNoKHRoaXMuX3BhcnNlUGFyYW0oa2V5LCBvYmpba2V5XSwgcGFyZW50KSk7XG4gICAgICAgIHJldHVybiBwYXJ0cy5qb2luKCcmJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcGFyc2VQYXJhbShrZXk6IHN0cmluZywgdmFsdWU6IGFueSwgcGFyZW50OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IHByb2Nlc3NlZEtleSA9IHBhcmVudCA/IHBhcmVudCArICdbJyArIGtleSArICddJyA6IGtleTtcbiAgICAgICAgaWYgKHZhbHVlICYmICg8c3RyaW5nPih0eXBlb2YgdmFsdWUpID09PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9KU09OMlVSTCh2YWx1ZSwgcHJvY2Vzc2VkS2V5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvY2Vzc2VkS2V5ICsgJz0nICsgdmFsdWU7XG4gICAgfVxufVxuIl19