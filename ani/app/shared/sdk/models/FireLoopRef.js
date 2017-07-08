"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Subject_1 = require("rxjs/Subject");
var Rx_1 = require("rxjs/Rx");
/**
 * @class FireLoopRef<T>
 * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
 * @license MIT
 * @description
 * This class allows to create FireLoop References which will be in sync with
 * Server. It also allows to create FireLoop Reference Childs, that allows to
 * persist data according the generic model relationships.
 **/
var FireLoopRef = (function () {
    /**
    * @method constructor
    * @param {any} model The model we want to create a reference
    * @param {SocketConnection} socket Socket connection to handle events
    * @param {FireLoopRef<any>} parent Parent FireLoop model reference
    * @param {string} relationship The defined model relationship
    * @description
    * The constructor will receive the required parameters and then will register this reference
    * into the server, needed to allow multiple references for the same model.
    * This ids are referenced into this specific client connection and won't have issues
    * with other client ids.
    **/
    function FireLoopRef(model, socket, parent, relationship) {
        if (parent === void 0) { parent = null; }
        if (relationship === void 0) { relationship = null; }
        this.model = model;
        this.socket = socket;
        this.parent = parent;
        this.relationship = relationship;
        // Reference ID
        this.id = this.buildId();
        // Model Childs
        this.childs = {};
        this.socket.emit("Subscribe." + (!parent ? model.getModelName() : parent.model.getModelName()), { id: this.id, scope: model.getModelName(), relationship: relationship });
        return this;
    }
    /**
    * @method dispose
    * @return {void}
    * @description
    * This method is super important to avoid memory leaks in the server.
    * This method requires to be called on components destroy
    *
    * ngOnDestroy() {
    *  this.someRef.dispose()
    * }
    **/
    FireLoopRef.prototype.dispose = function () {
        this.operation('dispose', {})
            .subscribe()
            .unsubscribe();
    };
    /**
    * @method upsert
    * @param {T} data Persisted model instance
    * @return {Observable<T>}
    * @description
    * Operation wrapper for upsert function.
    **/
    FireLoopRef.prototype.upsert = function (data) {
        return this.operation('upsert', data);
    };
    /**
    * @method create
    * @param {T} data Persisted model instance
    * @return {Observable<T>}
    * @description
    * Operation wrapper for create function.
    **/
    FireLoopRef.prototype.create = function (data) {
        return this.operation('create', data);
    };
    /**
    * @method remove
    * @param {T} data Persisted model instance
    * @return {Observable<T>}
    * @description
    * Operation wrapper for remove function.
    **/
    FireLoopRef.prototype.remove = function (data) {
        return this.operation('remove', data);
    };
    /**
    * @method remote
    * @param {string} method Remote method name
    * @param {any[]=} params Parameters to be applied into the remote method
    * @param {boolean} broadcast Flag to define if the method results should be broadcasted
    * @return {Observable<any>}
    * @description
    * This method calls for any remote method. It is flexible enough to
    * allow you call either built-in or custom remote methods.
    *
    * FireLoop provides this interface to enable calling remote methods
    * but also to optionally send any defined accept params that will be
    * applied within the server.
    **/
    FireLoopRef.prototype.remote = function (method, params, broadcast) {
        if (broadcast === void 0) { broadcast = false; }
        return this.operation('remote', { method: method, params: params, broadcast: broadcast });
    };
    /**
    * @method onRemote
    * @param {string} method Remote method name
    * @return {Observable<any>}
    * @description
    * This method listen for public broadcasted remote method results. If the remote method
    * execution is not public only the owner will receive the result data.
    **/
    FireLoopRef.prototype.onRemote = function (method) {
        var event = 'remote';
        if (!this.relationship) {
            event = this.model.getModelName() + "." + event;
        }
        else {
            event = this.parent.model.getModelName() + "." + this.relationship + "." + event;
        }
        return this.broadcasts(event, {});
    };
    /**
    * @method on
    * @param {string} event Event name
    * @param {LoopBackFilter} filter LoopBack query filter
    * @return {Observable<T>}
    * @description
    * Listener for different type of events. Valid events are:
    *   - change (Triggers on any model change -create, update, remove-)
    *   - value (Triggers on new entries)
    *   - child_added (Triggers when a child is added)
    *   - child_updated (Triggers when a child is updated)
    *   - child_removed (Triggers when a child is removed)
    **/
    FireLoopRef.prototype.on = function (event, filter) {
        if (filter === void 0) { filter = { limit: 100, order: 'id DESC' }; }
        if (event === 'remote') {
            throw new Error('The "remote" event is not allowed using "on()" method, use "onRemote()" instead');
        }
        var request;
        if (!this.relationship) {
            event = this.model.getModelName() + "." + event;
            request = { filter: filter };
        }
        else {
            event = this.parent.model.getModelName() + "." + this.relationship + "." + event;
            request = { filter: filter, parent: this.parent.instance };
        }
        if (event.match(/(value|change|stats)/)) {
            return Rx_1.Observable.merge(this.pull(event, request), this.broadcasts(event, request));
        }
        else {
            return this.broadcasts(event, request);
        }
    };
    /**
    * @method stats
    * @param {LoopBackFilter=} filter LoopBack query filter
    * @return {Observable<T>}
    * @description
    * Listener for real-time statistics, will trigger on every
    * statistic modification.
    * TIP: You can improve performance by adding memcached to LoopBack models.
    **/
    FireLoopRef.prototype.stats = function (filter) {
        return this.on('stats', filter);
    };
    /**
    * @method make
    * @param {any} instance Persisted model instance reference
    * @return {Observable<T>}
    * @description
    * This method will set a model instance into this a new FireLoop Reference.
    * This allows to persiste parentship when creating related instances.
    *
    * It also allows to have multiple different persisted instance references to same model.
    * otherwise if using singleton will replace a previous instance for a new instance, when
    * we actually want to have more than 1 instance of same model.
    **/
    FireLoopRef.prototype.make = function (instance) {
        var reference = new FireLoopRef(this.model, this.socket);
        reference.instance = instance;
        return reference;
    };
    /**
    * @method child
    * @param {string} relationship A defined model relationship
    * @return {FireLoopRef<T>}
    * @description
    * This method creates child references, which will persist related model
    * instances. e.g. Room.messages, where messages belongs to a specific Room.
    **/
    FireLoopRef.prototype.child = function (relationship) {
        // Return singleton instance
        if (this.childs[relationship]) {
            return this.childs[relationship];
        }
        // Try to get relation settings from current model
        var settings = this.model.getModelDefinition().relations[relationship];
        // Verify the relationship actually exists
        if (!settings) {
            throw new Error("Invalid model relationship " + this.model.getModelName() + " <-> " + relationship + ", verify your model settings.");
        }
        // Verify if the relationship model is public
        if (settings.model === '') {
            throw new Error("Relationship model is private, cam't use " + relationship + " unless you set your model as public.");
        }
        // Lets get a model reference and add a reference for all of the models
        var model = this.model.models.get(settings.model);
        model.models = this.model.models;
        // If everything goes well, we will store a child reference and return it.
        this.childs[relationship] = new FireLoopRef(model, this.socket, this, relationship);
        return this.childs[relationship];
    };
    /**
    * @method pull
    * @param {string} event Event name
    * @param {any} request Type of request, can be LB-only filter or FL+LB filter
    * @return {Observable<T>}
    * @description
    * This method will pull initial data from server
    **/
    FireLoopRef.prototype.pull = function (event, request) {
        var sbj = new Subject_1.Subject();
        var that = this;
        var nowEvent = event + ".pull.requested." + this.id;
        this.socket.emit(event + ".pull.request." + this.id, request);
        function pullNow(data) {
            if (that.socket.removeListener) {
                that.socket.removeListener(nowEvent, pullNow);
            }
            sbj.next(data);
        }
        ;
        this.socket.on(nowEvent, pullNow);
        return sbj.asObservable();
    };
    /**
    * @method broadcasts
    * @param {string} event Event name
    * @param {any} request Type of request, can be LB-only filter or FL+LB filter
    * @return {Observable<T>}
    * @description
    * This will listen for public broadcasts announces and then request
    * for data according a specific client request, not shared with other clients.
    **/
    FireLoopRef.prototype.broadcasts = function (event, request) {
        var _this = this;
        var sbj = new Subject_1.Subject();
        this.socket.on(event + ".broadcast.announce." + this.id, function (res) {
            return _this.socket.emit(event + ".broadcast.request." + _this.id, request);
        });
        this.socket.on(event + ".broadcast." + this.id, function (data) { return sbj.next(data); });
        return sbj.asObservable();
    };
    /**
    * @method operation
    * @param {string} event Event name
    * @param {any} data Any type of data sent to the server
    * @return {Observable<T>}
    * @description
    * This internal method will run operations depending on current context
    **/
    FireLoopRef.prototype.operation = function (event, data) {
        if (!this.relationship) {
            event = this.model.getModelName() + "." + event + "." + this.id;
        }
        else {
            event = this.parent.model.getModelName() + "." + this.relationship + "." + event + "." + this.id;
        }
        var subject = new Subject_1.Subject();
        var config = {
            data: data,
            parent: this.parent && this.parent.instance ? this.parent.instance : null
        };
        this.socket.emit(event, config);
        var resultEvent = '';
        if (!this.relationship) {
            resultEvent = this.model.getModelName() + ".value.result." + this.id;
        }
        else {
            resultEvent = this.parent.model.getModelName() + "." + this.relationship + ".value.result." + this.id;
        }
        this.socket.on(resultEvent, function (res) {
            if (res.error) {
                subject.error(res);
            }
            else {
                subject.next(res);
            }
        });
        // This event listener will be wiped within socket.connections
        this.socket.sharedObservables.sharedOnDisconnect.subscribe(function () { return subject.complete(); });
        return subject.asObservable().catch(function (error) { return Rx_1.Observable.throw(error); });
    };
    /**
    * @method buildId
    * @return {number}
    * @description
    * This internal method build an ID for this reference, this allows to have
    * multiple references for the same model or relationships.
    **/
    FireLoopRef.prototype.buildId = function () {
        return Date.now() + Math.floor(Math.random() * 100800) *
            Math.floor(Math.random() * 100700) *
            Math.floor(Math.random() * 198500);
    };
    return FireLoopRef;
}());
exports.FireLoopRef = FireLoopRef;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlyZUxvb3BSZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJGaXJlTG9vcFJlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF1QztBQUN2Qyw4QkFBcUM7QUFHckM7Ozs7Ozs7O0lBUUk7QUFDSjtJQU9FOzs7Ozs7Ozs7OztPQVdHO0lBQ0gscUJBQ1UsS0FBVSxFQUNWLE1BQXdCLEVBQ3hCLE1BQStCLEVBQy9CLFlBQTJCO1FBRDNCLHVCQUFBLEVBQUEsYUFBK0I7UUFDL0IsNkJBQUEsRUFBQSxtQkFBMkI7UUFIM0IsVUFBSyxHQUFMLEtBQUssQ0FBSztRQUNWLFdBQU0sR0FBTixNQUFNLENBQWtCO1FBQ3hCLFdBQU0sR0FBTixNQUFNLENBQXlCO1FBQy9CLGlCQUFZLEdBQVosWUFBWSxDQUFlO1FBdEJyQyxlQUFlO1FBQ1AsT0FBRSxHQUFXLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUdwQyxlQUFlO1FBQ1AsV0FBTSxHQUFRLEVBQUUsQ0FBQztRQW1CdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2QsZ0JBQWMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFlBQVksRUFBRSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUcsRUFDN0UsRUFBRSxFQUFFLEVBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUcsS0FBSyxDQUFDLFlBQVksRUFBRSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsQ0FDM0UsQ0FBQztRQUNGLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUNJLDZCQUFPLEdBQWQ7UUFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7YUFDeEIsU0FBUyxFQUFFO2FBQ1gsV0FBVyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUNJLDRCQUFNLEdBQWIsVUFBYyxJQUFPO1FBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBQ0ksNEJBQU0sR0FBYixVQUFjLElBQU87UUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFDSSw0QkFBTSxHQUFiLFVBQWMsSUFBTztRQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUNEOzs7Ozs7Ozs7Ozs7O09BYUc7SUFDSSw0QkFBTSxHQUFiLFVBQWMsTUFBYyxFQUFFLE1BQWMsRUFBRSxTQUEwQjtRQUExQiwwQkFBQSxFQUFBLGlCQUEwQjtRQUN0RSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLFFBQUEsRUFBRSxNQUFNLFFBQUEsRUFBRSxTQUFTLFdBQUEsRUFBRSxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFDSSw4QkFBUSxHQUFmLFVBQWdCLE1BQWM7UUFDNUIsSUFBSSxLQUFLLEdBQVcsUUFBUSxDQUFDO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDdkIsS0FBSyxHQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLFNBQUssS0FBTyxDQUFDO1FBQ3BELENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLEtBQUssR0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsU0FBTSxJQUFJLENBQUMsWUFBWSxTQUFLLEtBQU8sQ0FBQztRQUNsRixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7O09BWUc7SUFDSSx3QkFBRSxHQUFULFVBQVUsS0FBYSxFQUFFLE1BQXlEO1FBQXpELHVCQUFBLEVBQUEsV0FBMkIsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFO1FBQ2hGLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUZBQWlGLENBQUMsQ0FBQztRQUNyRyxDQUFDO1FBQ0QsSUFBSSxPQUFZLENBQUM7UUFDakIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUN2QixLQUFLLEdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsU0FBSyxLQUFPLENBQUM7WUFDbEQsT0FBTyxHQUFHLEVBQUUsTUFBTSxRQUFBLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixLQUFLLEdBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLFNBQU0sSUFBSSxDQUFDLFlBQVksU0FBSyxLQUFPLENBQUM7WUFDaEYsT0FBTyxHQUFHLEVBQUUsTUFBTSxRQUFBLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDckQsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsTUFBTSxDQUFDLGVBQVUsQ0FBQyxLQUFLLENBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUN6QixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FDaEMsQ0FBQztRQUNKLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6QyxDQUFDO0lBQ0gsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBQ0ksMkJBQUssR0FBWixVQUFhLE1BQW1CO1FBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7O09BV0c7SUFDSSwwQkFBSSxHQUFYLFVBQVksUUFBYTtRQUN2QixJQUFJLFNBQVMsR0FBbUIsSUFBSSxXQUFXLENBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEUsU0FBUyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDbEMsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUNJLDJCQUFLLEdBQVosVUFBZ0IsWUFBb0I7UUFDbEMsNEJBQTRCO1FBQzVCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7UUFBQyxDQUFDO1FBQ3BFLGtEQUFrRDtRQUNsRCxJQUFJLFFBQVEsR0FBUSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVFLDBDQUEwQztRQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDZCxNQUFNLElBQUksS0FBSyxDQUFDLGdDQUErQixJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxhQUFVLFlBQVksa0NBQWdDLENBQUMsQ0FBQztRQUNsSSxDQUFDO1FBQ0QsNkNBQTZDO1FBQzdDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLDhDQUE2QyxZQUFZLDBDQUF3QyxDQUFDLENBQUM7UUFDckgsQ0FBQztRQUNELHVFQUF1RTtRQUN2RSxJQUFJLEtBQUssR0FBVSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JELEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDckMsMEVBQTBFO1FBQzFFLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQUksS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3ZGLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBQ0ssMEJBQUksR0FBWixVQUFhLEtBQWEsRUFBRSxPQUFZO1FBQ3RDLElBQUksR0FBRyxHQUFlLElBQUksaUJBQU8sRUFBSyxDQUFDO1FBQ3ZDLElBQUksSUFBSSxHQUFtQixJQUFJLENBQUM7UUFDaEMsSUFBSSxRQUFRLEdBQVcsS0FBSyx3QkFBb0IsSUFBSSxDQUFDLEVBQUssQ0FBQztRQUMzRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBSSxLQUFLLHNCQUFrQixJQUFJLENBQUMsRUFBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hFLGlCQUFpQixJQUFTO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2hELENBQUM7WUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pCLENBQUM7UUFBQSxDQUFDO1FBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBQ0ssZ0NBQVUsR0FBbEIsVUFBbUIsS0FBYSxFQUFFLE9BQVk7UUFBOUMsaUJBU0M7UUFSQyxJQUFJLEdBQUcsR0FBZSxJQUFJLGlCQUFPLEVBQUssQ0FBQztRQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FDVCxLQUFLLDRCQUF3QixJQUFJLENBQUMsRUFBSyxFQUMxQyxVQUFDLEdBQU07WUFDTCxPQUFBLEtBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFJLEtBQUssMkJBQXVCLEtBQUksQ0FBQyxFQUFLLEVBQUUsT0FBTyxDQUFDO1FBQXBFLENBQW9FLENBQ3ZFLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBSyxLQUFLLG1CQUFnQixJQUFJLENBQUMsRUFBSyxFQUFFLFVBQUMsSUFBUyxJQUFLLE9BQUEsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBZCxDQUFjLENBQUMsQ0FBQztRQUNuRixNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBQ0ssK0JBQVMsR0FBakIsVUFBa0IsS0FBYSxFQUFFLElBQVM7UUFDeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUN2QixLQUFLLEdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsU0FBSyxLQUFLLFNBQUssSUFBSSxDQUFDLEVBQUssQ0FBQztRQUNqRSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixLQUFLLEdBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLFNBQU0sSUFBSSxDQUFDLFlBQVksU0FBTSxLQUFLLFNBQU0sSUFBSSxDQUFDLEVBQUssQ0FBQztRQUNqRyxDQUFDO1FBQ0QsSUFBSSxPQUFPLEdBQWUsSUFBSSxpQkFBTyxFQUFLLENBQUM7UUFDM0MsSUFBSSxNQUFNLEdBQStCO1lBQ3ZDLElBQUksTUFBQTtZQUNKLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLElBQUk7U0FDMUUsQ0FBQztRQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNoQyxJQUFJLFdBQVcsR0FBVyxFQUFFLENBQUM7UUFDN0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUN2QixXQUFXLEdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsc0JBQWtCLElBQUksQ0FBQyxFQUFLLENBQUM7UUFDMUUsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sV0FBVyxHQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxTQUFNLElBQUksQ0FBQyxZQUFZLHNCQUFtQixJQUFJLENBQUMsRUFBSyxDQUFDO1FBQ3pHLENBQUM7UUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBQyxHQUFRO1lBQ25DLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsOERBQThEO1FBQzlELElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQWxCLENBQWtCLENBQUMsQ0FBQztRQUNyRixNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxVQUFDLEtBQVUsSUFBSyxPQUFBLGVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQXZCLENBQXVCLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBQ0ssNkJBQU8sR0FBZjtRQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDO1lBQ3BELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQztZQUNsQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ0gsa0JBQUM7QUFBRCxDQUFDLEFBcFNELElBb1NDO0FBcFNZLGtDQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMvU3ViamVjdCc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcy9SeCc7XG5pbXBvcnQgeyBMb29wQmFja0ZpbHRlciwgU3RhdEZpbHRlciB9IGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0IHsgU29ja2V0Q29ubmVjdGlvbiB9IGZyb20gJy4uL3NvY2tldHMvc29ja2V0LmNvbm5lY3Rpb25zJztcbi8qKlxuICogQGNsYXNzIEZpcmVMb29wUmVmPFQ+XG4gKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0OiBqb2huY2FzYXJydWJpYXMsIGdoOiBtZWFuLWV4cGVydC1vZmZpY2lhbD5cbiAqIEBsaWNlbnNlIE1JVFxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGlzIGNsYXNzIGFsbG93cyB0byBjcmVhdGUgRmlyZUxvb3AgUmVmZXJlbmNlcyB3aGljaCB3aWxsIGJlIGluIHN5bmMgd2l0aFxuICogU2VydmVyLiBJdCBhbHNvIGFsbG93cyB0byBjcmVhdGUgRmlyZUxvb3AgUmVmZXJlbmNlIENoaWxkcywgdGhhdCBhbGxvd3MgdG9cbiAqIHBlcnNpc3QgZGF0YSBhY2NvcmRpbmcgdGhlIGdlbmVyaWMgbW9kZWwgcmVsYXRpb25zaGlwcy5cbiAqKi9cbmV4cG9ydCBjbGFzcyBGaXJlTG9vcFJlZjxUPiB7XG4gIC8vIFJlZmVyZW5jZSBJRFxuICBwcml2YXRlIGlkOiBudW1iZXIgPSB0aGlzLmJ1aWxkSWQoKTtcbiAgLy8gTW9kZWwgSW5zdGFuY2UgKEZvciBjaGlsZCByZWZlcmVuY2VzLCBlbXB0eSBvbiByb290IHJlZmVyZW5jZXMpXG4gIHByaXZhdGUgaW5zdGFuY2U6IGFueTtcbiAgLy8gTW9kZWwgQ2hpbGRzXG4gIHByaXZhdGUgY2hpbGRzOiBhbnkgPSB7fTtcbiAgLyoqXG4gICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAqIEBwYXJhbSB7YW55fSBtb2RlbCBUaGUgbW9kZWwgd2Ugd2FudCB0byBjcmVhdGUgYSByZWZlcmVuY2VcbiAgKiBAcGFyYW0ge1NvY2tldENvbm5lY3Rpb259IHNvY2tldCBTb2NrZXQgY29ubmVjdGlvbiB0byBoYW5kbGUgZXZlbnRzXG4gICogQHBhcmFtIHtGaXJlTG9vcFJlZjxhbnk+fSBwYXJlbnQgUGFyZW50IEZpcmVMb29wIG1vZGVsIHJlZmVyZW5jZVxuICAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGlvbnNoaXAgVGhlIGRlZmluZWQgbW9kZWwgcmVsYXRpb25zaGlwXG4gICogQGRlc2NyaXB0aW9uXG4gICogVGhlIGNvbnN0cnVjdG9yIHdpbGwgcmVjZWl2ZSB0aGUgcmVxdWlyZWQgcGFyYW1ldGVycyBhbmQgdGhlbiB3aWxsIHJlZ2lzdGVyIHRoaXMgcmVmZXJlbmNlXG4gICogaW50byB0aGUgc2VydmVyLCBuZWVkZWQgdG8gYWxsb3cgbXVsdGlwbGUgcmVmZXJlbmNlcyBmb3IgdGhlIHNhbWUgbW9kZWwuXG4gICogVGhpcyBpZHMgYXJlIHJlZmVyZW5jZWQgaW50byB0aGlzIHNwZWNpZmljIGNsaWVudCBjb25uZWN0aW9uIGFuZCB3b24ndCBoYXZlIGlzc3Vlc1xuICAqIHdpdGggb3RoZXIgY2xpZW50IGlkcy5cbiAgKiovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgbW9kZWw6IGFueSxcbiAgICBwcml2YXRlIHNvY2tldDogU29ja2V0Q29ubmVjdGlvbixcbiAgICBwcml2YXRlIHBhcmVudDogRmlyZUxvb3BSZWY8YW55PiA9IG51bGwsXG4gICAgcHJpdmF0ZSByZWxhdGlvbnNoaXA6IHN0cmluZyA9IG51bGxcbiAgKSB7XG4gICAgdGhpcy5zb2NrZXQuZW1pdChcbiAgICAgIGBTdWJzY3JpYmUuJHsgIXBhcmVudCA/IG1vZGVsLmdldE1vZGVsTmFtZSgpIDogcGFyZW50Lm1vZGVsLmdldE1vZGVsTmFtZSgpIH1gLFxuICAgICAgeyBpZCA6IHRoaXMuaWQsIHNjb3BlOiAgbW9kZWwuZ2V0TW9kZWxOYW1lKCksIHJlbGF0aW9uc2hpcDogcmVsYXRpb25zaGlwIH1cbiAgICApO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKlxuICAqIEBtZXRob2QgZGlzcG9zZVxuICAqIEByZXR1cm4ge3ZvaWR9XG4gICogQGRlc2NyaXB0aW9uXG4gICogVGhpcyBtZXRob2QgaXMgc3VwZXIgaW1wb3J0YW50IHRvIGF2b2lkIG1lbW9yeSBsZWFrcyBpbiB0aGUgc2VydmVyLlxuICAqIFRoaXMgbWV0aG9kIHJlcXVpcmVzIHRvIGJlIGNhbGxlZCBvbiBjb21wb25lbnRzIGRlc3Ryb3lcbiAgKlxuICAqIG5nT25EZXN0cm95KCkge1xuICAqICB0aGlzLnNvbWVSZWYuZGlzcG9zZSgpIFxuICAqIH1cbiAgKiovXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMub3BlcmF0aW9uKCdkaXNwb3NlJywge30pXG4gICAgICAgIC5zdWJzY3JpYmUoKVxuICAgICAgICAudW5zdWJzY3JpYmUoKTtcbiAgfVxuICAvKipcbiAgKiBAbWV0aG9kIHVwc2VydFxuICAqIEBwYXJhbSB7VH0gZGF0YSBQZXJzaXN0ZWQgbW9kZWwgaW5zdGFuY2VcbiAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPFQ+fVxuICAqIEBkZXNjcmlwdGlvblxuICAqIE9wZXJhdGlvbiB3cmFwcGVyIGZvciB1cHNlcnQgZnVuY3Rpb24uXG4gICoqL1xuICBwdWJsaWMgdXBzZXJ0KGRhdGE6IFQpOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRpb24oJ3Vwc2VydCcsIGRhdGEpO1xuICB9XG4gIC8qKlxuICAqIEBtZXRob2QgY3JlYXRlXG4gICogQHBhcmFtIHtUfSBkYXRhIFBlcnNpc3RlZCBtb2RlbCBpbnN0YW5jZVxuICAqIEByZXR1cm4ge09ic2VydmFibGU8VD59XG4gICogQGRlc2NyaXB0aW9uXG4gICogT3BlcmF0aW9uIHdyYXBwZXIgZm9yIGNyZWF0ZSBmdW5jdGlvbi5cbiAgKiovXG4gIHB1YmxpYyBjcmVhdGUoZGF0YTogVCk6IE9ic2VydmFibGU8VD4ge1xuICAgIHJldHVybiB0aGlzLm9wZXJhdGlvbignY3JlYXRlJywgZGF0YSk7XG4gIH1cbiAgLyoqXG4gICogQG1ldGhvZCByZW1vdmVcbiAgKiBAcGFyYW0ge1R9IGRhdGEgUGVyc2lzdGVkIG1vZGVsIGluc3RhbmNlXG4gICogQHJldHVybiB7T2JzZXJ2YWJsZTxUPn1cbiAgKiBAZGVzY3JpcHRpb25cbiAgKiBPcGVyYXRpb24gd3JhcHBlciBmb3IgcmVtb3ZlIGZ1bmN0aW9uLlxuICAqKi9cbiAgcHVibGljIHJlbW92ZShkYXRhOiBUKTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0aW9uKCdyZW1vdmUnLCBkYXRhKTtcbiAgfVxuICAvKipcbiAgKiBAbWV0aG9kIHJlbW90ZVxuICAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2QgUmVtb3RlIG1ldGhvZCBuYW1lXG4gICogQHBhcmFtIHthbnlbXT19IHBhcmFtcyBQYXJhbWV0ZXJzIHRvIGJlIGFwcGxpZWQgaW50byB0aGUgcmVtb3RlIG1ldGhvZFxuICAqIEBwYXJhbSB7Ym9vbGVhbn0gYnJvYWRjYXN0IEZsYWcgdG8gZGVmaW5lIGlmIHRoZSBtZXRob2QgcmVzdWx0cyBzaG91bGQgYmUgYnJvYWRjYXN0ZWRcbiAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPGFueT59XG4gICogQGRlc2NyaXB0aW9uXG4gICogVGhpcyBtZXRob2QgY2FsbHMgZm9yIGFueSByZW1vdGUgbWV0aG9kLiBJdCBpcyBmbGV4aWJsZSBlbm91Z2ggdG9cbiAgKiBhbGxvdyB5b3UgY2FsbCBlaXRoZXIgYnVpbHQtaW4gb3IgY3VzdG9tIHJlbW90ZSBtZXRob2RzLlxuICAqXG4gICogRmlyZUxvb3AgcHJvdmlkZXMgdGhpcyBpbnRlcmZhY2UgdG8gZW5hYmxlIGNhbGxpbmcgcmVtb3RlIG1ldGhvZHNcbiAgKiBidXQgYWxzbyB0byBvcHRpb25hbGx5IHNlbmQgYW55IGRlZmluZWQgYWNjZXB0IHBhcmFtcyB0aGF0IHdpbGwgYmVcbiAgKiBhcHBsaWVkIHdpdGhpbiB0aGUgc2VydmVyLlxuICAqKi9cbiAgcHVibGljIHJlbW90ZShtZXRob2Q6IHN0cmluZywgcGFyYW1zPzogYW55W10sIGJyb2FkY2FzdDogYm9vbGVhbiA9IGZhbHNlKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRpb24oJ3JlbW90ZScsIHsgbWV0aG9kLCBwYXJhbXMsIGJyb2FkY2FzdCB9KTtcbiAgfVxuICAvKipcbiAgKiBAbWV0aG9kIG9uUmVtb3RlXG4gICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZCBSZW1vdGUgbWV0aG9kIG5hbWVcbiAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPGFueT59XG4gICogQGRlc2NyaXB0aW9uXG4gICogVGhpcyBtZXRob2QgbGlzdGVuIGZvciBwdWJsaWMgYnJvYWRjYXN0ZWQgcmVtb3RlIG1ldGhvZCByZXN1bHRzLiBJZiB0aGUgcmVtb3RlIG1ldGhvZFxuICAqIGV4ZWN1dGlvbiBpcyBub3QgcHVibGljIG9ubHkgdGhlIG93bmVyIHdpbGwgcmVjZWl2ZSB0aGUgcmVzdWx0IGRhdGEuXG4gICoqL1xuICBwdWJsaWMgb25SZW1vdGUobWV0aG9kOiBzdHJpbmcpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGxldCBldmVudDogc3RyaW5nID0gJ3JlbW90ZSc7XG4gICAgaWYgKCF0aGlzLnJlbGF0aW9uc2hpcCkge1xuICAgICAgZXZlbnQgPSBgJHsgdGhpcy5tb2RlbC5nZXRNb2RlbE5hbWUoKSB9LiR7ZXZlbnR9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnQgPSBgJHsgdGhpcy5wYXJlbnQubW9kZWwuZ2V0TW9kZWxOYW1lKCkgfS4keyB0aGlzLnJlbGF0aW9uc2hpcCB9LiR7ZXZlbnR9YDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYnJvYWRjYXN0cyhldmVudCwge30pO1xuICB9XG4gIC8qKlxuICAqIEBtZXRob2Qgb25cbiAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgRXZlbnQgbmFtZVxuICAqIEBwYXJhbSB7TG9vcEJhY2tGaWx0ZXJ9IGZpbHRlciBMb29wQmFjayBxdWVyeSBmaWx0ZXJcbiAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPFQ+fVxuICAqIEBkZXNjcmlwdGlvblxuICAqIExpc3RlbmVyIGZvciBkaWZmZXJlbnQgdHlwZSBvZiBldmVudHMuIFZhbGlkIGV2ZW50cyBhcmU6XG4gICogICAtIGNoYW5nZSAoVHJpZ2dlcnMgb24gYW55IG1vZGVsIGNoYW5nZSAtY3JlYXRlLCB1cGRhdGUsIHJlbW92ZS0pXG4gICogICAtIHZhbHVlIChUcmlnZ2VycyBvbiBuZXcgZW50cmllcylcbiAgKiAgIC0gY2hpbGRfYWRkZWQgKFRyaWdnZXJzIHdoZW4gYSBjaGlsZCBpcyBhZGRlZClcbiAgKiAgIC0gY2hpbGRfdXBkYXRlZCAoVHJpZ2dlcnMgd2hlbiBhIGNoaWxkIGlzIHVwZGF0ZWQpXG4gICogICAtIGNoaWxkX3JlbW92ZWQgKFRyaWdnZXJzIHdoZW4gYSBjaGlsZCBpcyByZW1vdmVkKVxuICAqKi9cbiAgcHVibGljIG9uKGV2ZW50OiBzdHJpbmcsIGZpbHRlcjogTG9vcEJhY2tGaWx0ZXIgPSB7IGxpbWl0OiAxMDAsIG9yZGVyOiAnaWQgREVTQycgfSk6IE9ic2VydmFibGU8VCB8IFRbXT4ge1xuICAgIGlmIChldmVudCA9PT0gJ3JlbW90ZScpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIFwicmVtb3RlXCIgZXZlbnQgaXMgbm90IGFsbG93ZWQgdXNpbmcgXCJvbigpXCIgbWV0aG9kLCB1c2UgXCJvblJlbW90ZSgpXCIgaW5zdGVhZCcpO1xuICAgIH1cbiAgICBsZXQgcmVxdWVzdDogYW55O1xuICAgIGlmICghdGhpcy5yZWxhdGlvbnNoaXApIHtcbiAgICAgIGV2ZW50ID0gYCR7IHRoaXMubW9kZWwuZ2V0TW9kZWxOYW1lKCkgfS4ke2V2ZW50fWA7XG4gICAgICByZXF1ZXN0ID0geyBmaWx0ZXIgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnQgPSBgJHsgdGhpcy5wYXJlbnQubW9kZWwuZ2V0TW9kZWxOYW1lKCkgfS4keyB0aGlzLnJlbGF0aW9uc2hpcCB9LiR7ZXZlbnR9YDtcbiAgICAgIHJlcXVlc3QgPSB7IGZpbHRlciwgcGFyZW50OiB0aGlzLnBhcmVudC5pbnN0YW5jZSB9O1xuICAgIH1cbiAgICBpZiAoZXZlbnQubWF0Y2goLyh2YWx1ZXxjaGFuZ2V8c3RhdHMpLykpIHtcbiAgICAgIHJldHVybiBPYnNlcnZhYmxlLm1lcmdlKFxuICAgICAgICB0aGlzLnB1bGwoZXZlbnQsIHJlcXVlc3QpLFxuICAgICAgICB0aGlzLmJyb2FkY2FzdHMoZXZlbnQsIHJlcXVlc3QpXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5icm9hZGNhc3RzKGV2ZW50LCByZXF1ZXN0KTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICogQG1ldGhvZCBzdGF0c1xuICAqIEBwYXJhbSB7TG9vcEJhY2tGaWx0ZXI9fSBmaWx0ZXIgTG9vcEJhY2sgcXVlcnkgZmlsdGVyXG4gICogQHJldHVybiB7T2JzZXJ2YWJsZTxUPn1cbiAgKiBAZGVzY3JpcHRpb25cbiAgKiBMaXN0ZW5lciBmb3IgcmVhbC10aW1lIHN0YXRpc3RpY3MsIHdpbGwgdHJpZ2dlciBvbiBldmVyeVxuICAqIHN0YXRpc3RpYyBtb2RpZmljYXRpb24uXG4gICogVElQOiBZb3UgY2FuIGltcHJvdmUgcGVyZm9ybWFuY2UgYnkgYWRkaW5nIG1lbWNhY2hlZCB0byBMb29wQmFjayBtb2RlbHMuXG4gICoqL1xuICBwdWJsaWMgc3RhdHMoZmlsdGVyPzogU3RhdEZpbHRlcik6IE9ic2VydmFibGU8VCB8IFRbXT4ge1xuICAgIHJldHVybiB0aGlzLm9uKCdzdGF0cycsIGZpbHRlcik7XG4gIH1cbiAgLyoqXG4gICogQG1ldGhvZCBtYWtlXG4gICogQHBhcmFtIHthbnl9IGluc3RhbmNlIFBlcnNpc3RlZCBtb2RlbCBpbnN0YW5jZSByZWZlcmVuY2VcbiAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPFQ+fVxuICAqIEBkZXNjcmlwdGlvblxuICAqIFRoaXMgbWV0aG9kIHdpbGwgc2V0IGEgbW9kZWwgaW5zdGFuY2UgaW50byB0aGlzIGEgbmV3IEZpcmVMb29wIFJlZmVyZW5jZS5cbiAgKiBUaGlzIGFsbG93cyB0byBwZXJzaXN0ZSBwYXJlbnRzaGlwIHdoZW4gY3JlYXRpbmcgcmVsYXRlZCBpbnN0YW5jZXMuXG4gICpcbiAgKiBJdCBhbHNvIGFsbG93cyB0byBoYXZlIG11bHRpcGxlIGRpZmZlcmVudCBwZXJzaXN0ZWQgaW5zdGFuY2UgcmVmZXJlbmNlcyB0byBzYW1lIG1vZGVsLlxuICAqIG90aGVyd2lzZSBpZiB1c2luZyBzaW5nbGV0b24gd2lsbCByZXBsYWNlIGEgcHJldmlvdXMgaW5zdGFuY2UgZm9yIGEgbmV3IGluc3RhbmNlLCB3aGVuXG4gICogd2UgYWN0dWFsbHkgd2FudCB0byBoYXZlIG1vcmUgdGhhbiAxIGluc3RhbmNlIG9mIHNhbWUgbW9kZWwuXG4gICoqL1xuICBwdWJsaWMgbWFrZShpbnN0YW5jZTogYW55KTogRmlyZUxvb3BSZWY8VD4ge1xuICAgIGxldCByZWZlcmVuY2U6IEZpcmVMb29wUmVmPFQ+ID0gbmV3IEZpcmVMb29wUmVmPFQ+KHRoaXMubW9kZWwsIHRoaXMuc29ja2V0KTtcbiAgICAgICAgcmVmZXJlbmNlLmluc3RhbmNlID0gaW5zdGFuY2U7XG4gICAgcmV0dXJuIHJlZmVyZW5jZTtcbiAgfVxuICAvKipcbiAgKiBAbWV0aG9kIGNoaWxkXG4gICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aW9uc2hpcCBBIGRlZmluZWQgbW9kZWwgcmVsYXRpb25zaGlwXG4gICogQHJldHVybiB7RmlyZUxvb3BSZWY8VD59XG4gICogQGRlc2NyaXB0aW9uXG4gICogVGhpcyBtZXRob2QgY3JlYXRlcyBjaGlsZCByZWZlcmVuY2VzLCB3aGljaCB3aWxsIHBlcnNpc3QgcmVsYXRlZCBtb2RlbFxuICAqIGluc3RhbmNlcy4gZS5nLiBSb29tLm1lc3NhZ2VzLCB3aGVyZSBtZXNzYWdlcyBiZWxvbmdzIHRvIGEgc3BlY2lmaWMgUm9vbS5cbiAgKiovXG4gIHB1YmxpYyBjaGlsZDxUPihyZWxhdGlvbnNoaXA6IHN0cmluZyk6IEZpcmVMb29wUmVmPFQ+IHtcbiAgICAvLyBSZXR1cm4gc2luZ2xldG9uIGluc3RhbmNlXG4gICAgaWYgKHRoaXMuY2hpbGRzW3JlbGF0aW9uc2hpcF0pIHsgcmV0dXJuIHRoaXMuY2hpbGRzW3JlbGF0aW9uc2hpcF07IH1cbiAgICAvLyBUcnkgdG8gZ2V0IHJlbGF0aW9uIHNldHRpbmdzIGZyb20gY3VycmVudCBtb2RlbFxuICAgIGxldCBzZXR0aW5nczogYW55ID0gdGhpcy5tb2RlbC5nZXRNb2RlbERlZmluaXRpb24oKS5yZWxhdGlvbnNbcmVsYXRpb25zaGlwXTtcbiAgICAvLyBWZXJpZnkgdGhlIHJlbGF0aW9uc2hpcCBhY3R1YWxseSBleGlzdHNcbiAgICBpZiAoIXNldHRpbmdzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgbW9kZWwgcmVsYXRpb25zaGlwICR7IHRoaXMubW9kZWwuZ2V0TW9kZWxOYW1lKCkgfSA8LT4gJHsgcmVsYXRpb25zaGlwIH0sIHZlcmlmeSB5b3VyIG1vZGVsIHNldHRpbmdzLmApO1xuICAgIH1cbiAgICAvLyBWZXJpZnkgaWYgdGhlIHJlbGF0aW9uc2hpcCBtb2RlbCBpcyBwdWJsaWNcbiAgICBpZiAoc2V0dGluZ3MubW9kZWwgPT09ICcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlbGF0aW9uc2hpcCBtb2RlbCBpcyBwcml2YXRlLCBjYW0ndCB1c2UgJHsgcmVsYXRpb25zaGlwIH0gdW5sZXNzIHlvdSBzZXQgeW91ciBtb2RlbCBhcyBwdWJsaWMuYCk7XG4gICAgfVxuICAgIC8vIExldHMgZ2V0IGEgbW9kZWwgcmVmZXJlbmNlIGFuZCBhZGQgYSByZWZlcmVuY2UgZm9yIGFsbCBvZiB0aGUgbW9kZWxzXG4gICAgbGV0IG1vZGVsOiBhbnkgICA9IHRoaXMubW9kZWwubW9kZWxzLmdldChzZXR0aW5ncy5tb2RlbCk7XG4gICAgICAgIG1vZGVsLm1vZGVscyA9IHRoaXMubW9kZWwubW9kZWxzO1xuICAgIC8vIElmIGV2ZXJ5dGhpbmcgZ29lcyB3ZWxsLCB3ZSB3aWxsIHN0b3JlIGEgY2hpbGQgcmVmZXJlbmNlIGFuZCByZXR1cm4gaXQuXG4gICAgdGhpcy5jaGlsZHNbcmVsYXRpb25zaGlwXSA9IG5ldyBGaXJlTG9vcFJlZjxUPihtb2RlbCwgdGhpcy5zb2NrZXQsIHRoaXMsIHJlbGF0aW9uc2hpcCk7XG4gICAgcmV0dXJuIHRoaXMuY2hpbGRzW3JlbGF0aW9uc2hpcF07XG4gIH1cbiAgLyoqXG4gICogQG1ldGhvZCBwdWxsXG4gICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IEV2ZW50IG5hbWVcbiAgKiBAcGFyYW0ge2FueX0gcmVxdWVzdCBUeXBlIG9mIHJlcXVlc3QsIGNhbiBiZSBMQi1vbmx5IGZpbHRlciBvciBGTCtMQiBmaWx0ZXJcbiAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPFQ+fVxuICAqIEBkZXNjcmlwdGlvblxuICAqIFRoaXMgbWV0aG9kIHdpbGwgcHVsbCBpbml0aWFsIGRhdGEgZnJvbSBzZXJ2ZXJcbiAgKiovXG4gIHByaXZhdGUgcHVsbChldmVudDogc3RyaW5nLCByZXF1ZXN0OiBhbnkpOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICBsZXQgc2JqOiBTdWJqZWN0PFQ+ID0gbmV3IFN1YmplY3Q8VD4oKTtcbiAgICBsZXQgdGhhdDogRmlyZUxvb3BSZWY8VD4gPSB0aGlzO1xuICAgIGxldCBub3dFdmVudDogYW55ID0gYCR7ZXZlbnR9LnB1bGwucmVxdWVzdGVkLiR7IHRoaXMuaWQgfWA7XG4gICAgdGhpcy5zb2NrZXQuZW1pdChgJHtldmVudH0ucHVsbC5yZXF1ZXN0LiR7IHRoaXMuaWQgfWAsIHJlcXVlc3QpO1xuICAgIGZ1bmN0aW9uIHB1bGxOb3coZGF0YTogYW55KSB7XG4gICAgICBpZiAodGhhdC5zb2NrZXQucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgdGhhdC5zb2NrZXQucmVtb3ZlTGlzdGVuZXIobm93RXZlbnQsIHB1bGxOb3cpO1xuICAgICAgfVxuICAgICAgc2JqLm5leHQoZGF0YSk7XG4gICAgfTtcbiAgICB0aGlzLnNvY2tldC5vbihub3dFdmVudCwgcHVsbE5vdyk7XG4gICAgcmV0dXJuIHNiai5hc09ic2VydmFibGUoKTtcbiAgfVxuICAvKipcbiAgKiBAbWV0aG9kIGJyb2FkY2FzdHNcbiAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgRXZlbnQgbmFtZVxuICAqIEBwYXJhbSB7YW55fSByZXF1ZXN0IFR5cGUgb2YgcmVxdWVzdCwgY2FuIGJlIExCLW9ubHkgZmlsdGVyIG9yIEZMK0xCIGZpbHRlclxuICAqIEByZXR1cm4ge09ic2VydmFibGU8VD59XG4gICogQGRlc2NyaXB0aW9uXG4gICogVGhpcyB3aWxsIGxpc3RlbiBmb3IgcHVibGljIGJyb2FkY2FzdHMgYW5ub3VuY2VzIGFuZCB0aGVuIHJlcXVlc3RcbiAgKiBmb3IgZGF0YSBhY2NvcmRpbmcgYSBzcGVjaWZpYyBjbGllbnQgcmVxdWVzdCwgbm90IHNoYXJlZCB3aXRoIG90aGVyIGNsaWVudHMuXG4gICoqL1xuICBwcml2YXRlIGJyb2FkY2FzdHMoZXZlbnQ6IHN0cmluZywgcmVxdWVzdDogYW55KTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgbGV0IHNiajogU3ViamVjdDxUPiA9IG5ldyBTdWJqZWN0PFQ+KCk7XG4gICAgdGhpcy5zb2NrZXQub24oXG4gICAgICBgJHtldmVudH0uYnJvYWRjYXN0LmFubm91bmNlLiR7IHRoaXMuaWQgfWAsXG4gICAgICAocmVzOiBUKSA9PlxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KGAke2V2ZW50fS5icm9hZGNhc3QucmVxdWVzdC4keyB0aGlzLmlkIH1gLCByZXF1ZXN0KVxuICAgICk7XG4gICAgdGhpcy5zb2NrZXQub24oYCR7IGV2ZW50IH0uYnJvYWRjYXN0LiR7IHRoaXMuaWQgfWAsIChkYXRhOiBhbnkpID0+IHNiai5uZXh0KGRhdGEpKTtcbiAgICByZXR1cm4gc2JqLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG4gIC8qKlxuICAqIEBtZXRob2Qgb3BlcmF0aW9uXG4gICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IEV2ZW50IG5hbWVcbiAgKiBAcGFyYW0ge2FueX0gZGF0YSBBbnkgdHlwZSBvZiBkYXRhIHNlbnQgdG8gdGhlIHNlcnZlclxuICAqIEByZXR1cm4ge09ic2VydmFibGU8VD59XG4gICogQGRlc2NyaXB0aW9uXG4gICogVGhpcyBpbnRlcm5hbCBtZXRob2Qgd2lsbCBydW4gb3BlcmF0aW9ucyBkZXBlbmRpbmcgb24gY3VycmVudCBjb250ZXh0IFxuICAqKi9cbiAgcHJpdmF0ZSBvcGVyYXRpb24oZXZlbnQ6IHN0cmluZywgZGF0YTogYW55KTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgaWYgKCF0aGlzLnJlbGF0aW9uc2hpcCkge1xuICAgICAgZXZlbnQgPSBgJHsgdGhpcy5tb2RlbC5nZXRNb2RlbE5hbWUoKSB9LiR7ZXZlbnR9LiR7IHRoaXMuaWQgfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2ZW50ID0gYCR7IHRoaXMucGFyZW50Lm1vZGVsLmdldE1vZGVsTmFtZSgpIH0uJHsgdGhpcy5yZWxhdGlvbnNoaXAgfS4keyBldmVudCB9LiR7IHRoaXMuaWQgfWA7XG4gICAgfVxuICAgIGxldCBzdWJqZWN0OiBTdWJqZWN0PFQ+ID0gbmV3IFN1YmplY3Q8VD4oKTtcbiAgICBsZXQgY29uZmlnOiB7IGRhdGE6IGFueSwgcGFyZW50OiBhbnkgfSA9IHtcbiAgICAgIGRhdGEsXG4gICAgICBwYXJlbnQ6IHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50Lmluc3RhbmNlID8gdGhpcy5wYXJlbnQuaW5zdGFuY2UgOiBudWxsXG4gICAgfTtcbiAgICB0aGlzLnNvY2tldC5lbWl0KGV2ZW50LCBjb25maWcpO1xuICAgIGxldCByZXN1bHRFdmVudDogc3RyaW5nID0gJyc7XG4gICAgaWYgKCF0aGlzLnJlbGF0aW9uc2hpcCkge1xuICAgICAgcmVzdWx0RXZlbnQgPSBgJHsgdGhpcy5tb2RlbC5nZXRNb2RlbE5hbWUoKX0udmFsdWUucmVzdWx0LiR7IHRoaXMuaWQgfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdEV2ZW50ID0gYCR7IHRoaXMucGFyZW50Lm1vZGVsLmdldE1vZGVsTmFtZSgpIH0uJHsgdGhpcy5yZWxhdGlvbnNoaXAgfS52YWx1ZS5yZXN1bHQuJHsgdGhpcy5pZCB9YDtcbiAgICB9XG4gICAgdGhpcy5zb2NrZXQub24ocmVzdWx0RXZlbnQsIChyZXM6IGFueSkgPT4ge1xuICAgICAgaWYgKHJlcy5lcnJvcikge1xuICAgICAgICBzdWJqZWN0LmVycm9yKHJlcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdWJqZWN0Lm5leHQocmVzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBUaGlzIGV2ZW50IGxpc3RlbmVyIHdpbGwgYmUgd2lwZWQgd2l0aGluIHNvY2tldC5jb25uZWN0aW9uc1xuICAgIHRoaXMuc29ja2V0LnNoYXJlZE9ic2VydmFibGVzLnNoYXJlZE9uRGlzY29ubmVjdC5zdWJzY3JpYmUoKCkgPT4gc3ViamVjdC5jb21wbGV0ZSgpKTtcbiAgICByZXR1cm4gc3ViamVjdC5hc09ic2VydmFibGUoKS5jYXRjaCgoZXJyb3I6IGFueSkgPT4gT2JzZXJ2YWJsZS50aHJvdyhlcnJvcikpO1xuICB9XG4gIC8qKlxuICAqIEBtZXRob2QgYnVpbGRJZFxuICAqIEByZXR1cm4ge251bWJlcn1cbiAgKiBAZGVzY3JpcHRpb25cbiAgKiBUaGlzIGludGVybmFsIG1ldGhvZCBidWlsZCBhbiBJRCBmb3IgdGhpcyByZWZlcmVuY2UsIHRoaXMgYWxsb3dzIHRvIGhhdmVcbiAgKiBtdWx0aXBsZSByZWZlcmVuY2VzIGZvciB0aGUgc2FtZSBtb2RlbCBvciByZWxhdGlvbnNoaXBzLlxuICAqKi9cbiAgcHJpdmF0ZSBidWlsZElkKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIERhdGUubm93KCkgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDA4MDApICpcbiAgICAgIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDcwMCkgKlxuICAgICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTk4NTAwKTtcbiAgfVxufVxuIl19