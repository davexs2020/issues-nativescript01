/* tslint:disable */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AppAlert = (function () {
    function AppAlert(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `AppAlert`.
     */
    AppAlert.getModelName = function () {
        return "AppAlert";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of AppAlert for dynamic purposes.
    **/
    AppAlert.factory = function (data) {
        return new AppAlert(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    AppAlert.getModelDefinition = function () {
        return {
            name: 'AppAlert',
            plural: 'AppAlerts',
            properties: {
                "AppAlertMessage": {
                    name: 'AppAlertMessage',
                    type: 'string'
                },
                "id": {
                    name: 'id',
                    type: 'number'
                },
            },
            relations: {}
        };
    };
    return AppAlert;
}());
exports.AppAlert = AppAlert;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwQWxlcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBcHBBbGVydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxvQkFBb0I7OztBQVFwQjtJQUdFLGtCQUFZLElBQXdCO1FBQ2xDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFDRDs7O09BR0c7SUFDVyxxQkFBWSxHQUExQjtRQUNFLE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUNEOzs7OztPQUtHO0lBQ1csZ0JBQU8sR0FBckIsVUFBc0IsSUFBdUI7UUFDM0MsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFDVywyQkFBa0IsR0FBaEM7UUFDRSxNQUFNLENBQUM7WUFDTCxJQUFJLEVBQUUsVUFBVTtZQUNoQixNQUFNLEVBQUUsV0FBVztZQUNuQixVQUFVLEVBQUU7Z0JBQ1YsaUJBQWlCLEVBQUU7b0JBQ2pCLElBQUksRUFBRSxpQkFBaUI7b0JBQ3ZCLElBQUksRUFBRSxRQUFRO2lCQUNmO2dCQUNELElBQUksRUFBRTtvQkFDSixJQUFJLEVBQUUsSUFBSTtvQkFDVixJQUFJLEVBQUUsUUFBUTtpQkFDZjthQUNGO1lBQ0QsU0FBUyxFQUFFLEVBQ1Y7U0FDRixDQUFBO0lBQ0gsQ0FBQztJQUNILGVBQUM7QUFBRCxDQUFDLEFBL0NELElBK0NDO0FBL0NZLDRCQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGUgKi9cblxuZGVjbGFyZSB2YXIgT2JqZWN0OiBhbnk7XG5leHBvcnQgaW50ZXJmYWNlIEFwcEFsZXJ0SW50ZXJmYWNlIHtcbiAgXCJBcHBBbGVydE1lc3NhZ2VcIjogc3RyaW5nO1xuICBcImlkXCI/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBBcHBBbGVydCBpbXBsZW1lbnRzIEFwcEFsZXJ0SW50ZXJmYWNlIHtcbiAgXCJBcHBBbGVydE1lc3NhZ2VcIjogc3RyaW5nO1xuICBcImlkXCI6IG51bWJlcjtcbiAgY29uc3RydWN0b3IoZGF0YT86IEFwcEFsZXJ0SW50ZXJmYWNlKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCBkYXRhKTtcbiAgfVxuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIG1vZGVsIHJlcHJlc2VudGVkIGJ5IHRoaXMgJHJlc291cmNlLFxuICAgKiBpLmUuIGBBcHBBbGVydGAuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldE1vZGVsTmFtZSgpIHtcbiAgICByZXR1cm4gXCJBcHBBbGVydFwiO1xuICB9XG4gIC8qKlxuICAqIEBtZXRob2QgZmFjdG9yeVxuICAqIEBhdXRob3IgSm9uYXRoYW4gQ2FzYXJydWJpYXNcbiAgKiBAbGljZW5zZSBNSVRcbiAgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGFuIGluc3RhbmNlIG9mIEFwcEFsZXJ0IGZvciBkeW5hbWljIHB1cnBvc2VzLlxuICAqKi9cbiAgcHVibGljIHN0YXRpYyBmYWN0b3J5KGRhdGE6IEFwcEFsZXJ0SW50ZXJmYWNlKTogQXBwQWxlcnR7XG4gICAgcmV0dXJuIG5ldyBBcHBBbGVydChkYXRhKTtcbiAgfVxuICAvKipcbiAgKiBAbWV0aG9kIGdldE1vZGVsRGVmaW5pdGlvblxuICAqIEBhdXRob3IgSnVsaWVuIExlZHVuXG4gICogQGxpY2Vuc2UgTUlUXG4gICogVGhpcyBtZXRob2QgcmV0dXJucyBhbiBvYmplY3QgdGhhdCByZXByZXNlbnRzIHNvbWUgb2YgdGhlIG1vZGVsXG4gICogZGVmaW5pdGlvbnMuXG4gICoqL1xuICBwdWJsaWMgc3RhdGljIGdldE1vZGVsRGVmaW5pdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ0FwcEFsZXJ0JyxcbiAgICAgIHBsdXJhbDogJ0FwcEFsZXJ0cycsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIFwiQXBwQWxlcnRNZXNzYWdlXCI6IHtcbiAgICAgICAgICBuYW1lOiAnQXBwQWxlcnRNZXNzYWdlJyxcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICB9LFxuICAgICAgICBcImlkXCI6IHtcbiAgICAgICAgICBuYW1lOiAnaWQnLFxuICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcmVsYXRpb25zOiB7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=