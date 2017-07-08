"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
var core_1 = require("@angular/core");
var User_1 = require("../../models/User");
var AppAlert_1 = require("../../models/AppAlert");
var SDKModels = (function () {
    function SDKModels() {
        this.models = {
            User: User_1.User,
            AppAlert: AppAlert_1.AppAlert,
        };
    }
    SDKModels.prototype.get = function (modelName) {
        return this.models[modelName];
    };
    SDKModels.prototype.getAll = function () {
        return this.models;
    };
    SDKModels.prototype.getModelNames = function () {
        return Object.keys(this.models);
    };
    return SDKModels;
}());
SDKModels = __decorate([
    core_1.Injectable()
], SDKModels);
exports.SDKModels = SDKModels;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU0RLTW9kZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU0RLTW9kZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0JBQW9CO0FBQ3BCLHNDQUEyQztBQUMzQywwQ0FBeUM7QUFDekMsa0RBQWlEO0FBS2pELElBQWEsU0FBUztJQUR0QjtRQUdVLFdBQU0sR0FBVztZQUN2QixJQUFJLEVBQUUsV0FBSTtZQUNWLFFBQVEsRUFBRSxtQkFBUTtTQUVuQixDQUFDO0lBYUosQ0FBQztJQVhRLHVCQUFHLEdBQVYsVUFBVyxTQUFpQjtRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRU0sMEJBQU0sR0FBYjtRQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3JCLENBQUM7SUFFTSxpQ0FBYSxHQUFwQjtRQUNFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBQ0gsZ0JBQUM7QUFBRCxDQUFDLEFBbkJELElBbUJDO0FBbkJZLFNBQVM7SUFEckIsaUJBQVUsRUFBRTtHQUNBLFNBQVMsQ0FtQnJCO0FBbkJZLDhCQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGUgKi9cbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvVXNlcic7XG5pbXBvcnQgeyBBcHBBbGVydCB9IGZyb20gJy4uLy4uL21vZGVscy9BcHBBbGVydCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTW9kZWxzIHsgW25hbWU6IHN0cmluZ106IGFueSB9XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTREtNb2RlbHMge1xuXG4gIHByaXZhdGUgbW9kZWxzOiBNb2RlbHMgPSB7XG4gICAgVXNlcjogVXNlcixcbiAgICBBcHBBbGVydDogQXBwQWxlcnQsXG4gICAgXG4gIH07XG5cbiAgcHVibGljIGdldChtb2RlbE5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZWxzW21vZGVsTmFtZV07XG4gIH1cblxuICBwdWJsaWMgZ2V0QWxsKCk6IE1vZGVscyB7XG4gICAgcmV0dXJuIHRoaXMubW9kZWxzO1xuICB9XG5cbiAgcHVibGljIGdldE1vZGVsTmFtZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLm1vZGVscyk7XG4gIH1cbn1cbiJdfQ==