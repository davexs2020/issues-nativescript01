"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var FireLoop = (function () {
    function FireLoop(socket, models) {
        this.socket = socket;
        this.models = models;
        this.references = {};
    }
    FireLoop.prototype.ref = function (model) {
        var name = model.getModelName();
        model.models = this.models;
        this.references[name] = new index_1.FireLoopRef(model, this.socket);
        return this.references[name];
    };
    return FireLoop;
}());
exports.FireLoop = FireLoop;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlyZUxvb3AuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJGaXJlTG9vcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUFzQztBQUV0QztJQUlFLGtCQUFvQixNQUFXLEVBQVUsTUFBeUI7UUFBOUMsV0FBTSxHQUFOLE1BQU0sQ0FBSztRQUFVLFdBQU0sR0FBTixNQUFNLENBQW1CO1FBRjFELGVBQVUsR0FBUSxFQUFFLENBQUM7SUFFd0MsQ0FBQztJQUUvRCxzQkFBRyxHQUFWLFVBQWMsS0FBVTtRQUN0QixJQUFJLElBQUksR0FBVyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDeEMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzNCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxtQkFBVyxDQUFJLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0QsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUNILGVBQUM7QUFBRCxDQUFDLEFBWkQsSUFZQztBQVpZLDRCQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmlyZUxvb3BSZWYgfSBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGNsYXNzIEZpcmVMb29wIHtcblxuICBwcml2YXRlIHJlZmVyZW5jZXM6IGFueSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc29ja2V0OiBhbnksIHByaXZhdGUgbW9kZWxzOiB7IGdldDogRnVuY3Rpb24gfSkge31cblxuICBwdWJsaWMgcmVmPFQ+KG1vZGVsOiBhbnkpOiBGaXJlTG9vcFJlZjxUPiB7XG4gICAgbGV0IG5hbWU6IHN0cmluZyA9IG1vZGVsLmdldE1vZGVsTmFtZSgpO1xuICAgIG1vZGVsLm1vZGVscyA9IHRoaXMubW9kZWxzO1xuICAgIHRoaXMucmVmZXJlbmNlc1tuYW1lXSA9IG5ldyBGaXJlTG9vcFJlZjxUPihtb2RlbCwgdGhpcy5zb2NrZXQpO1xuICAgIHJldHVybiB0aGlzLnJlZmVyZW5jZXNbbmFtZV07XG4gIH1cbn1cbiJdfQ==