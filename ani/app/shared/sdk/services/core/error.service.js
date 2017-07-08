"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
var core_1 = require("@angular/core");
var Observable_1 = require("rxjs/Observable");
//import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
require("rxjs/add/observable/throw");
/**
 * Default error handler
 */
var ErrorHandler = (function () {
    function ErrorHandler() {
    }
    // ErrorObservable when rxjs version < rc.5
    // ErrorObservable<string> when rxjs version = rc.5
    // I'm leaving any for now to avoid breaking apps using both versions
    ErrorHandler.prototype.handleError = function (error) {
        return Observable_1.Observable.throw(error.json().error || 'Server error');
    };
    return ErrorHandler;
}());
ErrorHandler = __decorate([
    core_1.Injectable()
], ErrorHandler);
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3Iuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVycm9yLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvQkFBb0I7QUFDcEIsc0NBQTJDO0FBRTNDLDhDQUE2QztBQUM3QyxvRUFBb0U7QUFDcEUscUNBQW1DO0FBQ25DOztHQUVHO0FBRUgsSUFBYSxZQUFZO0lBQXpCO0lBT0EsQ0FBQztJQU5DLDJDQUEyQztJQUMzQyxtREFBbUQ7SUFDbkQscUVBQXFFO0lBQzlELGtDQUFXLEdBQWxCLFVBQW1CLEtBQWU7UUFDaEMsTUFBTSxDQUFDLHVCQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLElBQUksY0FBYyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQVBELElBT0M7QUFQWSxZQUFZO0lBRHhCLGlCQUFVLEVBQUU7R0FDQSxZQUFZLENBT3hCO0FBUFksb0NBQVkiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB0c2xpbnQ6ZGlzYWJsZSAqL1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUmVzcG9uc2UgfSBmcm9tICdAYW5ndWxhci9odHRwJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzL09ic2VydmFibGUnO1xuLy9pbXBvcnQgeyBFcnJvck9ic2VydmFibGUgfSBmcm9tICdyeGpzL29ic2VydmFibGUvRXJyb3JPYnNlcnZhYmxlJztcbmltcG9ydCAncnhqcy9hZGQvb2JzZXJ2YWJsZS90aHJvdyc7XG4vKipcbiAqIERlZmF1bHQgZXJyb3IgaGFuZGxlclxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRXJyb3JIYW5kbGVyIHtcbiAgLy8gRXJyb3JPYnNlcnZhYmxlIHdoZW4gcnhqcyB2ZXJzaW9uIDwgcmMuNVxuICAvLyBFcnJvck9ic2VydmFibGU8c3RyaW5nPiB3aGVuIHJ4anMgdmVyc2lvbiA9IHJjLjVcbiAgLy8gSSdtIGxlYXZpbmcgYW55IGZvciBub3cgdG8gYXZvaWQgYnJlYWtpbmcgYXBwcyB1c2luZyBib3RoIHZlcnNpb25zXG4gIHB1YmxpYyBoYW5kbGVFcnJvcihlcnJvcjogUmVzcG9uc2UpOiBhbnkge1xuICAgIHJldHVybiBPYnNlcnZhYmxlLnRocm93KGVycm9yLmpzb24oKS5lcnJvciB8fCAnU2VydmVyIGVycm9yJyk7XG4gIH1cbn1cbiJdfQ==