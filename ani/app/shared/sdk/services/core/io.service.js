"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Subject_1 = require("rxjs/Subject");
var IO = (function () {
    function IO(socket) {
        this.observables = {};
        this.socket = socket;
    }
    IO.prototype.emit = function (event, data) {
        this.socket.emit('ME:RT:1://event', {
            event: event,
            data: data
        });
    };
    IO.prototype.on = function (event) {
        if (this.observables[event]) {
            return this.observables[event];
        }
        var subject = new Subject_1.Subject();
        this.socket.on(event, function (res) { return subject.next(res); });
        this.observables[event] = subject.asObservable();
        return this.observables[event];
    };
    return IO;
}());
exports.IO = IO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW8uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImlvLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3Q0FBdUM7QUFHdkM7SUFLRSxZQUFZLE1BQVc7UUFGZixnQkFBVyxHQUFRLEVBQUUsQ0FBQztRQUVILElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQUMsQ0FBQztJQUVsRCxpQkFBSSxHQUFKLFVBQUssS0FBYSxFQUFFLElBQVM7UUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDaEMsS0FBSyxFQUFHLEtBQUs7WUFDYixJQUFJLEVBQUksSUFBSTtTQUNmLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxlQUFFLEdBQUYsVUFBRyxLQUFhO1FBQ2QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDaEUsSUFBSSxPQUFPLEdBQWlCLElBQUksaUJBQU8sRUFBTyxDQUFDO1FBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxVQUFDLEdBQVEsSUFBSyxPQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQWpCLENBQWlCLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNqRCxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBQ0gsU0FBQztBQUFELENBQUMsQUFyQkQsSUFxQkM7QUFyQlksZ0JBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcy9TdWJqZWN0JztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzL09ic2VydmFibGUnO1xuXG5leHBvcnQgY2xhc3MgSU8ge1xuXG4gIHByaXZhdGUgc29ja2V0OiBhbnk7XG4gIHByaXZhdGUgb2JzZXJ2YWJsZXM6IGFueSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKHNvY2tldDogYW55KSB7IHRoaXMuc29ja2V0ID0gc29ja2V0OyB9XG5cbiAgZW1pdChldmVudDogc3RyaW5nLCBkYXRhOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnNvY2tldC5lbWl0KCdNRTpSVDoxOi8vZXZlbnQnLCB7XG4gICAgICAgIGV2ZW50IDogZXZlbnQsXG4gICAgICAgIGRhdGEgIDogZGF0YVxuICAgIH0pO1xuICB9XG5cbiAgb24oZXZlbnQ6IHN0cmluZyk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgaWYgKHRoaXMub2JzZXJ2YWJsZXNbZXZlbnRdKSB7IHJldHVybiB0aGlzLm9ic2VydmFibGVzW2V2ZW50XTsgfVxuICAgIGxldCBzdWJqZWN0OiBTdWJqZWN0PGFueT4gPSBuZXcgU3ViamVjdDxhbnk+KCk7XG4gICAgdGhpcy5zb2NrZXQub24oZXZlbnQsIChyZXM6IGFueSkgPT4gc3ViamVjdC5uZXh0KHJlcykpO1xuICAgIHRoaXMub2JzZXJ2YWJsZXNbZXZlbnRdID0gc3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgICByZXR1cm4gdGhpcy5vYnNlcnZhYmxlc1tldmVudF07XG4gIH1cbn1cbiJdfQ==