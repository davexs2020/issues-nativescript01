"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var search_params_1 = require("./search.params");
var error_service_1 = require("./error.service");
var auth_service_1 = require("./auth.service");
var lb_config_1 = require("../../lb.config");
var SDKModels_1 = require("../custom/SDKModels");
var Subject_1 = require("rxjs/Subject");
require("rxjs/add/operator/catch");
require("rxjs/add/operator/map");
var socket_connections_1 = require("../../sockets/socket.connections");
/**
* @module BaseLoopBackApi
* @author Jonathan Casarrubias <@johncasarrubias> <github:jonathan-casarrubias>
* @author Nikolay Matiushenkov <https://github.com/mnvx>
* @license MIT
* @description
* Abstract class that will be implemented in every custom service automatically built
* by the sdk builder.
* It provides the core functionallity for every API call, either by HTTP Calls or by
* WebSockets.
**/
var BaseLoopBackApi = (function () {
    function BaseLoopBackApi(http, connection, models, auth, searchParams, errorHandler) {
        this.http = http;
        this.connection = connection;
        this.models = models;
        this.auth = auth;
        this.searchParams = searchParams;
        this.errorHandler = errorHandler;
        this.model = this.models.get(this.getModelName());
    }
    /**
     * @method request
     * @param {string}  method      Request method (GET, POST, PUT)
     * @param {string}  url         Request url (my-host/my-url/:id)
     * @param {any}     routeParams Values of url parameters
     * @param {any}     urlParams   Parameters for building url (filter and other)
     * @param {any}     postBody    Request postBody
     * @return {Observable<any>}
     * @description
     * This is a core method, every HTTP Call will be done from here, every API Service will
     * extend this class and use this method to get RESTful communication.
     **/
    BaseLoopBackApi.prototype.request = function (method, url, routeParams, urlParams, postBody, pubsub, customHeaders) {
        var _this = this;
        if (routeParams === void 0) { routeParams = {}; }
        if (urlParams === void 0) { urlParams = {}; }
        if (postBody === void 0) { postBody = {}; }
        if (pubsub === void 0) { pubsub = false; }
        // Transpile route variables to the actual request Values
        Object.keys(routeParams).forEach(function (key) {
            url = url.replace(new RegExp(":" + key + "(\/|$)", "g"), routeParams[key] + "$1");
        });
        if (pubsub) {
            if (url.match(/fk/)) {
                var arr = url.split('/');
                arr.pop();
                url = arr.join('/');
            }
            var event_1 = ("[" + method + "]" + url).replace(/\?/, '');
            var subject_1 = new Subject_1.Subject();
            this.connection.on(event_1, function (res) { return subject_1.next(res); });
            return subject_1.asObservable();
        }
        else {
            // Headers to be sent
            var headers = new http_1.Headers();
            headers.append('Content-Type', 'application/json');
            // Authenticate request
            this.authenticate(url, headers);
            // Body fix for built in remote methods using "data", "options" or "credentials
            // that are the actual body, Custom remote method properties are different and need
            // to be wrapped into a body object
            var body = void 0;
            var postBodyKeys = typeof postBody === 'object' ? Object.keys(postBody) : [];
            if (postBodyKeys.length === 1) {
                body = postBody[postBodyKeys.shift()];
            }
            else {
                body = postBody;
            }
            var filter = '';
            // Separate filter object from url params and add to search query
            if (urlParams.filter) {
                if (lb_config_1.LoopBackConfig.isHeadersFilteringSet()) {
                    headers.append('filter', JSON.stringify(urlParams.filter));
                }
                else {
                    filter = "?filter=" + encodeURI(JSON.stringify(urlParams.filter));
                }
                delete urlParams.filter;
            }
            // Separate where object from url params and add to search query
            /**
            CODE BELOW WILL GENERATE THE FOLLOWING ISSUES:
            - https://github.com/mean-expert-official/loopback-sdk-builder/issues/356
            - https://github.com/mean-expert-official/loopback-sdk-builder/issues/328
            if (urlParams.where) {
              headers.append('where', JSON.stringify(urlParams.where));
              delete urlParams.where;
            }
            **/
            if (typeof customHeaders === 'function') {
                headers = customHeaders(headers);
            }
            this.searchParams.setJSON(urlParams);
            var request = new http_1.Request(new http_1.RequestOptions({
                headers: headers,
                method: method,
                url: "" + url + filter,
                search: Object.keys(urlParams).length > 0
                    ? this.searchParams.getURLSearchParams() : null,
                body: body ? JSON.stringify(body) : undefined
            }));
            return this.http.request(request)
                .map(function (res) { return (res.text() != "" ? res.json() : {}); })
                .catch(function (e) { return _this.errorHandler.handleError(e); });
        }
    };
    /**
     * @method authenticate
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @param {string} url Server URL
     * @param {Headers} headers HTTP Headers
     * @return {void}
     * @description
     * This method will try to authenticate using either an access_token or basic http auth
     */
    BaseLoopBackApi.prototype.authenticate = function (url, headers) {
        if (this.auth.getAccessTokenId()) {
            headers.append('Authorization', lb_config_1.LoopBackConfig.getAuthPrefix() + this.auth.getAccessTokenId());
        }
    };
    /**
     * @method create
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @param {T} data Generic data type
     * @return {Observable<T>}
     * @description
     * Generic create method
     */
    BaseLoopBackApi.prototype.create = function (data, customHeaders) {
        var _this = this;
        return this.request('POST', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural
        ].join('/'), undefined, undefined, { data: data }, null, customHeaders).map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method onCreate
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @param {T[]} data Generic data type array
     * @return {Observable<T[]>}
     * @description
     * Generic pubsub oncreate many method
     */
    BaseLoopBackApi.prototype.onCreate = function (data) {
        var _this = this;
        return this.request('POST', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural
        ].join('/'), undefined, undefined, { data: data }, true)
            .map(function (datum) { return datum.map(function (data) { return _this.model.factory(data); }); });
    };
    /**
     * @method createMany
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @param {T[]} data Generic data type array
     * @return {Observable<T[]>}
     * @description
     * Generic create many method
     */
    BaseLoopBackApi.prototype.createMany = function (data, customHeaders) {
        var _this = this;
        return this.request('POST', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural
        ].join('/'), undefined, undefined, { data: data }, null, customHeaders)
            .map(function (datum) { return datum.map(function (data) { return _this.model.factory(data); }); });
    };
    /**
     * @method onCreateMany
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @param {T[]} data Generic data type array
     * @return {Observable<T[]>}
     * @description
     * Generic create many method
     */
    BaseLoopBackApi.prototype.onCreateMany = function (data) {
        var _this = this;
        return this.request('POST', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural
        ].join('/'), undefined, undefined, { data: data }, true)
            .map(function (datum) { return datum.map(function (data) { return _this.model.factory(data); }); });
    };
    /**
     * @method findById
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @param {any} data Generic data type
     * @return {Observable<T>}
     * @description
     * Generic findById method
     */
    BaseLoopBackApi.prototype.findById = function (id, filter, customHeaders) {
        var _this = this;
        if (filter === void 0) { filter = {}; }
        var _urlParams = {};
        if (filter)
            _urlParams.filter = filter;
        return this.request('GET', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            ':id'
        ].join('/'), { id: id }, _urlParams, undefined, null, customHeaders)
            .map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method find
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T[+>}
     * @description
     * Generic find method
     */
    BaseLoopBackApi.prototype.find = function (filter, customHeaders) {
        var _this = this;
        if (filter === void 0) { filter = {}; }
        return this.request('GET', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural
        ].join('/'), undefined, { filter: filter }, undefined, null, customHeaders)
            .map(function (datum) { return datum.map(function (data) { return _this.model.factory(data); }); });
    };
    /**
     * @method exists
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T[]>}
     * @description
     * Generic exists method
     */
    BaseLoopBackApi.prototype.exists = function (id, customHeaders) {
        return this.request('GET', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            ':id/exists'
        ].join('/'), { id: id }, undefined, undefined, null, customHeaders);
    };
    /**
     * @method findOne
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic findOne method
     */
    BaseLoopBackApi.prototype.findOne = function (filter, customHeaders) {
        var _this = this;
        if (filter === void 0) { filter = {}; }
        return this.request('GET', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            'findOne'
        ].join('/'), undefined, { filter: filter }, undefined, null, customHeaders)
            .map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method updateAll
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T[]>}
     * @description
     * Generic updateAll method
     */
    BaseLoopBackApi.prototype.updateAll = function (where, data, customHeaders) {
        if (where === void 0) { where = {}; }
        var _urlParams = {};
        if (where)
            _urlParams.where = where;
        return this.request('POST', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            'update'
        ].join('/'), undefined, _urlParams, { data: data }, null, customHeaders);
    };
    /**
     * @method onUpdateAll
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T[]>}
     * @description
     * Generic pubsub onUpdateAll method
     */
    BaseLoopBackApi.prototype.onUpdateAll = function (where, data) {
        if (where === void 0) { where = {}; }
        var _urlParams = {};
        if (where)
            _urlParams.where = where;
        return this.request('POST', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            'update'
        ].join('/'), undefined, _urlParams, { data: data }, true);
    };
    /**
     * @method deleteById
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic deleteById method
     */
    BaseLoopBackApi.prototype.deleteById = function (id, customHeaders) {
        var _this = this;
        return this.request('DELETE', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            ':id'
        ].join('/'), { id: id }, undefined, undefined, null, customHeaders)
            .map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method onDeleteById
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic pubsub onDeleteById method
     */
    BaseLoopBackApi.prototype.onDeleteById = function (id) {
        var _this = this;
        return this.request('DELETE', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            ':id'
        ].join('/'), { id: id }, undefined, undefined, true).map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method count
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<{ count: number }>}
     * @description
     * Generic count method
     */
    BaseLoopBackApi.prototype.count = function (where, customHeaders) {
        if (where === void 0) { where = {}; }
        var _urlParams = {};
        if (where)
            _urlParams.where = where;
        return this.request('GET', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            'count'
        ].join('/'), undefined, _urlParams, undefined, null, customHeaders);
    };
    /**
     * @method updateAttributes
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic updateAttributes method
     */
    BaseLoopBackApi.prototype.updateAttributes = function (id, data, customHeaders) {
        var _this = this;
        return this.request('PUT', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            ':id'
        ].join('/'), { id: id }, undefined, { data: data }, null, customHeaders)
            .map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method onUpdateAttributes
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic onUpdateAttributes method
     */
    BaseLoopBackApi.prototype.onUpdateAttributes = function (id, data) {
        var _this = this;
        return this.request('PUT', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            ':id'
        ].join('/'), { id: id }, undefined, { data: data }, true).map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method upsert
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic upsert method
     */
    BaseLoopBackApi.prototype.upsert = function (data, customHeaders) {
        var _this = this;
        if (data === void 0) { data = {}; }
        return this.request('PUT', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
        ].join('/'), undefined, undefined, { data: data }, null, customHeaders)
            .map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method onUpsert
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic pubsub onUpsert method
     */
    BaseLoopBackApi.prototype.onUpsert = function (data) {
        var _this = this;
        if (data === void 0) { data = {}; }
        return this.request('PUT', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
        ].join('/'), undefined, undefined, { data: data }, true).map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method upsertPatch
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic upsert method using patch http method
     */
    BaseLoopBackApi.prototype.upsertPatch = function (data, customHeaders) {
        var _this = this;
        if (data === void 0) { data = {}; }
        return this.request('PATCH', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
        ].join('/'), undefined, undefined, { data: data }, null, customHeaders)
            .map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method onUpsertPatch
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic pubsub onUpsertPatch method using patch http method
     */
    BaseLoopBackApi.prototype.onUpsertPatch = function (data) {
        var _this = this;
        if (data === void 0) { data = {}; }
        return this.request('PATCH', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
        ].join('/'), undefined, undefined, { data: data }, true).map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method upsertWithWhere
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic upsertWithWhere method
     */
    BaseLoopBackApi.prototype.upsertWithWhere = function (where, data, customHeaders) {
        var _this = this;
        if (where === void 0) { where = {}; }
        if (data === void 0) { data = {}; }
        var _urlParams = {};
        if (where)
            _urlParams.where = where;
        return this.request('POST', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            'upsertWithWhere'
        ].join('/'), undefined, _urlParams, { data: data }, null, customHeaders)
            .map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method onUpsertWithWhere
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic pubsub onUpsertWithWhere method
     */
    BaseLoopBackApi.prototype.onUpsertWithWhere = function (where, data) {
        var _this = this;
        if (where === void 0) { where = {}; }
        if (data === void 0) { data = {}; }
        var _urlParams = {};
        if (where)
            _urlParams.where = where;
        return this.request('POST', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            'upsertWithWhere'
        ].join('/'), undefined, _urlParams, { data: data }, true).map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method replaceOrCreate
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic replaceOrCreate method
     */
    BaseLoopBackApi.prototype.replaceOrCreate = function (data, customHeaders) {
        var _this = this;
        if (data === void 0) { data = {}; }
        return this.request('POST', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            'replaceOrCreate'
        ].join('/'), undefined, undefined, { data: data }, null, customHeaders)
            .map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method onReplaceOrCreate
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic onReplaceOrCreate method
     */
    BaseLoopBackApi.prototype.onReplaceOrCreate = function (data) {
        var _this = this;
        if (data === void 0) { data = {}; }
        return this.request('POST', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            'replaceOrCreate'
        ].join('/'), undefined, undefined, { data: data }, true).map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method replaceById
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic replaceById method
     */
    BaseLoopBackApi.prototype.replaceById = function (id, data, customHeaders) {
        var _this = this;
        if (data === void 0) { data = {}; }
        return this.request('POST', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            ':id', 'replace'
        ].join('/'), { id: id }, undefined, { data: data }, null, customHeaders)
            .map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method onReplaceById
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<T>}
     * @description
     * Generic onReplaceById method
     */
    BaseLoopBackApi.prototype.onReplaceById = function (id, data) {
        var _this = this;
        if (data === void 0) { data = {}; }
        return this.request('POST', [
            lb_config_1.LoopBackConfig.getPath(),
            lb_config_1.LoopBackConfig.getApiVersion(),
            this.model.getModelDefinition().plural,
            ':id', 'replace'
        ].join('/'), { id: id }, undefined, { data: data }, true).map(function (data) { return _this.model.factory(data); });
    };
    /**
     * @method createChangeStream
     * @author Jonathan Casarrubias <t: johncasarrubias, gh: mean-expert-official>
     * @license MIT
     * @return {Observable<any>}
     * @description
     * Generic createChangeStream method
     */
    BaseLoopBackApi.prototype.createChangeStream = function () {
        var subject = new Subject_1.Subject();
        if (typeof EventSource !== 'undefined') {
            var emit = function (msg) { return subject.next(JSON.parse(msg.data)); };
            var source = new EventSource([
                lb_config_1.LoopBackConfig.getPath(),
                lb_config_1.LoopBackConfig.getApiVersion(),
                this.model.getModelDefinition().plural,
                'change-stream'
            ].join('/'));
            source.addEventListener('data', emit);
            source.onerror = emit;
        }
        else {
            console.warn('SDK Builder: EventSource is not supported');
        }
        return subject.asObservable();
    };
    return BaseLoopBackApi;
}());
BaseLoopBackApi = __decorate([
    core_1.Injectable(),
    __param(0, core_1.Inject(http_1.Http)),
    __param(1, core_1.Inject(socket_connections_1.SocketConnection)),
    __param(2, core_1.Inject(SDKModels_1.SDKModels)),
    __param(3, core_1.Inject(auth_service_1.LoopBackAuth)),
    __param(4, core_1.Inject(search_params_1.JSONSearchParams)),
    __param(5, core_1.Optional()), __param(5, core_1.Inject(error_service_1.ErrorHandler)),
    __metadata("design:paramtypes", [http_1.Http,
        socket_connections_1.SocketConnection,
        SDKModels_1.SDKModels,
        auth_service_1.LoopBackAuth,
        search_params_1.JSONSearchParams,
        error_service_1.ErrorHandler])
], BaseLoopBackApi);
exports.BaseLoopBackApi = BaseLoopBackApi;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYmFzZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0JBQW9CO0FBQ3BCLHNDQUE2RDtBQUM3RCxzQ0FBdUU7QUFFdkUsaURBQW1EO0FBQ25ELGlEQUErQztBQUMvQywrQ0FBOEM7QUFDOUMsNkNBQWlEO0FBRWpELGlEQUFnRDtBQUVoRCx3Q0FBdUM7QUFFdkMsbUNBQWlDO0FBQ2pDLGlDQUErQjtBQUMvQix1RUFBb0U7QUFHcEU7Ozs7Ozs7Ozs7R0FVRztBQUVILElBQXNCLGVBQWU7SUFLbkMseUJBQzBCLElBQVUsRUFDRSxVQUE0QixFQUNuQyxNQUFpQixFQUNkLElBQWtCLEVBQ2QsWUFBOEIsRUFDdEIsWUFBMEI7UUFMOUMsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUNFLGVBQVUsR0FBVixVQUFVLENBQWtCO1FBQ25DLFdBQU0sR0FBTixNQUFNLENBQVc7UUFDZCxTQUFJLEdBQUosSUFBSSxDQUFjO1FBQ2QsaUJBQVksR0FBWixZQUFZLENBQWtCO1FBQ3RCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBRXRFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUNEOzs7Ozs7Ozs7OztRQVdJO0lBQ0csaUNBQU8sR0FBZCxVQUNFLE1BQXVCLEVBQ3ZCLEdBQXVCLEVBQ3ZCLFdBQXlCLEVBQ3pCLFNBQXlCLEVBQ3pCLFFBQXlCLEVBQ3pCLE1BQWdDLEVBQ2hDLGFBQXlCO1FBUDNCLGlCQTRFQztRQXpFQyw0QkFBQSxFQUFBLGdCQUF5QjtRQUN6QiwwQkFBQSxFQUFBLGNBQXlCO1FBQ3pCLHlCQUFBLEVBQUEsYUFBeUI7UUFDekIsdUJBQUEsRUFBQSxjQUFnQztRQUdoQyx5REFBeUQ7UUFDekQsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxHQUFXO1lBQzNDLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsUUFBUSxFQUFFLEdBQUcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUNuRixDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3BDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLENBQUM7WUFDRCxJQUFJLE9BQUssR0FBVyxDQUFDLE1BQUksTUFBTSxTQUFJLEdBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDNUQsSUFBSSxTQUFPLEdBQWlCLElBQUksaUJBQU8sRUFBTyxDQUFDO1lBQy9DLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLE9BQUssRUFBRSxVQUFBLEdBQUcsSUFBSSxPQUFBLFNBQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQWpCLENBQWlCLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsU0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLHFCQUFxQjtZQUNyQixJQUFJLE9BQU8sR0FBWSxJQUFJLGNBQU8sRUFBRSxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFDbkQsdUJBQXVCO1lBQ3ZCLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2hDLCtFQUErRTtZQUMvRSxtRkFBbUY7WUFDbkYsbUNBQW1DO1lBQ25DLElBQUksSUFBSSxTQUFLLENBQUM7WUFDZCxJQUFJLFlBQVksR0FBRyxPQUFPLFFBQVEsS0FBSyxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUE7WUFDNUUsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixJQUFJLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3hDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixJQUFJLEdBQUcsUUFBUSxDQUFDO1lBQ2xCLENBQUM7WUFDRCxJQUFJLE1BQU0sR0FBVyxFQUFFLENBQUM7WUFDeEIsaUVBQWlFO1lBQ2pFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixFQUFFLENBQUMsQ0FBQywwQkFBYyxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUMzQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUM3RCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLE1BQU0sR0FBRyxhQUFZLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBRyxDQUFDO2dCQUNyRSxDQUFDO2dCQUNELE9BQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQztZQUMxQixDQUFDO1lBQ0QsZ0VBQWdFO1lBQ2hFOzs7Ozs7OztlQVFHO1lBQ0gsRUFBRSxDQUFDLENBQUMsT0FBTyxhQUFhLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDeEMsT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuQyxDQUFDO1lBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckMsSUFBSSxPQUFPLEdBQVksSUFBSSxjQUFPLENBQ2hDLElBQUkscUJBQWMsQ0FBQztnQkFDakIsT0FBTyxFQUFHLE9BQU87Z0JBQ2pCLE1BQU0sRUFBSSxNQUFNO2dCQUNoQixHQUFHLEVBQU8sS0FBRyxHQUFHLEdBQUcsTUFBUTtnQkFDM0IsTUFBTSxFQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUM7c0JBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxJQUFJO2dCQUN2RCxJQUFJLEVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUzthQUNsRCxDQUFDLENBQ0gsQ0FBQztZQUNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7aUJBQzlCLEdBQUcsQ0FBQyxVQUFDLEdBQVEsSUFBSyxPQUFBLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQXBDLENBQW9DLENBQUM7aUJBQ3ZELEtBQUssQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFoQyxDQUFnQyxDQUFDLENBQUM7UUFDcEQsQ0FBQztJQUNILENBQUM7SUFDRDs7Ozs7Ozs7O09BU0c7SUFDSSxzQ0FBWSxHQUFuQixVQUF1QixHQUFXLEVBQUUsT0FBZ0I7UUFDbEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqQyxPQUFPLENBQUMsTUFBTSxDQUNaLGVBQWUsRUFDZiwwQkFBYyxDQUFDLGFBQWEsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDOUQsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFDSSxnQ0FBTSxHQUFiLFVBQWlCLElBQU8sRUFBRSxhQUF3QjtRQUFsRCxpQkFNQztRQUxDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUMxQiwwQkFBYyxDQUFDLE9BQU8sRUFBRTtZQUN4QiwwQkFBYyxDQUFDLGFBQWEsRUFBRTtZQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTTtTQUN2QyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsSUFBSSxNQUFBLEVBQUUsRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsSUFBTyxJQUFLLE9BQUEsS0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQXhCLENBQXdCLENBQUMsQ0FBQztJQUMvRyxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFDSSxrQ0FBUSxHQUFmLFVBQW1CLElBQVM7UUFBNUIsaUJBT0M7UUFOQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDMUIsMEJBQWMsQ0FBQyxPQUFPLEVBQUU7WUFDeEIsMEJBQWMsQ0FBQyxhQUFhLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLE1BQU07U0FDdkMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFLElBQUksTUFBQSxFQUFFLEVBQUUsSUFBSSxDQUFDO2FBQ2pELEdBQUcsQ0FBQyxVQUFDLEtBQVUsSUFBSyxPQUFBLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFPLElBQUssT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxFQUFoRCxDQUFnRCxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBQ0ksb0NBQVUsR0FBakIsVUFBcUIsSUFBUyxFQUFFLGFBQXdCO1FBQXhELGlCQU9DO1FBTkMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQzFCLDBCQUFjLENBQUMsT0FBTyxFQUFFO1lBQ3hCLDBCQUFjLENBQUMsYUFBYSxFQUFFO1lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNO1NBQ3ZDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFBRSxJQUFJLE1BQUEsRUFBRSxFQUFFLElBQUksRUFBRSxhQUFhLENBQUM7YUFDaEUsR0FBRyxDQUFDLFVBQUMsS0FBVSxJQUFLLE9BQUEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQU8sSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUF4QixDQUF3QixDQUFDLEVBQWhELENBQWdELENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFDSSxzQ0FBWSxHQUFuQixVQUF1QixJQUFTO1FBQWhDLGlCQU9DO1FBTkMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQzFCLDBCQUFjLENBQUMsT0FBTyxFQUFFO1lBQ3hCLDBCQUFjLENBQUMsYUFBYSxFQUFFO1lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNO1NBQ3ZDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFBRSxJQUFJLE1BQUEsRUFBRSxFQUFFLElBQUksQ0FBQzthQUNqRCxHQUFHLENBQUMsVUFBQyxLQUFVLElBQUssT0FBQSxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUMsSUFBTyxJQUFLLE9BQUEsS0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQXhCLENBQXdCLENBQUMsRUFBaEQsQ0FBZ0QsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUNJLGtDQUFRLEdBQWYsVUFBbUIsRUFBTyxFQUFFLE1BQTJCLEVBQUUsYUFBd0I7UUFBakYsaUJBVUM7UUFWMkIsdUJBQUEsRUFBQSxXQUEyQjtRQUNyRCxJQUFJLFVBQVUsR0FBUSxFQUFFLENBQUM7UUFDekIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQ3pCLDBCQUFjLENBQUMsT0FBTyxFQUFFO1lBQ3hCLDBCQUFjLENBQUMsYUFBYSxFQUFFO1lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNO1lBQ3RDLEtBQUs7U0FDTixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBQSxFQUFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDO2FBQy9ELEdBQUcsQ0FBQyxVQUFDLElBQU8sSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUF4QixDQUF3QixDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFDSSw4QkFBSSxHQUFYLFVBQWUsTUFBMkIsRUFBRSxhQUF3QjtRQUFwRSxpQkFPQztRQVBjLHVCQUFBLEVBQUEsV0FBMkI7UUFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQ3pCLDBCQUFjLENBQUMsT0FBTyxFQUFFO1lBQ3hCLDBCQUFjLENBQUMsYUFBYSxFQUFFO1lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNO1NBQ3ZDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLE1BQU0sUUFBQSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxhQUFhLENBQUM7YUFDbEUsR0FBRyxDQUFDLFVBQUMsS0FBVSxJQUFLLE9BQUEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQU8sSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUF4QixDQUF3QixDQUFDLEVBQWhELENBQWdELENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUNJLGdDQUFNLEdBQWIsVUFBaUIsRUFBTyxFQUFFLGFBQXdCO1FBQ2hELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtZQUN6QiwwQkFBYyxDQUFDLE9BQU8sRUFBRTtZQUN4QiwwQkFBYyxDQUFDLGFBQWEsRUFBRTtZQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTTtZQUN0QyxZQUFZO1NBQ2IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUEsRUFBRSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBQ0ksaUNBQU8sR0FBZCxVQUFrQixNQUEyQixFQUFFLGFBQXdCO1FBQXZFLGlCQVFDO1FBUmlCLHVCQUFBLEVBQUEsV0FBMkI7UUFDM0MsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQ3pCLDBCQUFjLENBQUMsT0FBTyxFQUFFO1lBQ3hCLDBCQUFjLENBQUMsYUFBYSxFQUFFO1lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNO1lBQ3RDLFNBQVM7U0FDVixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxNQUFNLFFBQUEsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDO2FBQ2xFLEdBQUcsQ0FBQyxVQUFDLElBQU8sSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUF4QixDQUF3QixDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFDSSxtQ0FBUyxHQUFoQixVQUFvQixLQUFlLEVBQUUsSUFBTyxFQUFFLGFBQXdCO1FBQWxELHNCQUFBLEVBQUEsVUFBZTtRQUNqQyxJQUFJLFVBQVUsR0FBUSxFQUFFLENBQUM7UUFDekIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQzFCLDBCQUFjLENBQUMsT0FBTyxFQUFFO1lBQ3hCLDBCQUFjLENBQUMsYUFBYSxFQUFFO1lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNO1lBQ3RDLFFBQVE7U0FDVCxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEVBQUUsSUFBSSxNQUFBLEVBQUUsRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFDSSxxQ0FBVyxHQUFsQixVQUFzQixLQUFlLEVBQUUsSUFBTztRQUF4QixzQkFBQSxFQUFBLFVBQWU7UUFDbkMsSUFBSSxVQUFVLEdBQVEsRUFBRSxDQUFDO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUMxQiwwQkFBYyxDQUFDLE9BQU8sRUFBRTtZQUN4QiwwQkFBYyxDQUFDLGFBQWEsRUFBRTtZQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTTtZQUN0QyxRQUFRO1NBQ1QsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxFQUFFLElBQUksTUFBQSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFDSSxvQ0FBVSxHQUFqQixVQUFxQixFQUFPLEVBQUUsYUFBd0I7UUFBdEQsaUJBUUM7UUFQQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7WUFDNUIsMEJBQWMsQ0FBQyxPQUFPLEVBQUU7WUFDeEIsMEJBQWMsQ0FBQyxhQUFhLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLE1BQU07WUFDdEMsS0FBSztTQUNOLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFBLEVBQUUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxhQUFhLENBQUM7YUFDOUQsR0FBRyxDQUFDLFVBQUMsSUFBTyxJQUFLLE9BQUEsS0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQXhCLENBQXdCLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUNJLHNDQUFZLEdBQW5CLFVBQXVCLEVBQU87UUFBOUIsaUJBT0M7UUFOQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7WUFDNUIsMEJBQWMsQ0FBQyxPQUFPLEVBQUU7WUFDeEIsMEJBQWMsQ0FBQyxhQUFhLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLE1BQU07WUFDdEMsS0FBSztTQUNOLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFBLEVBQUUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQU8sSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUF4QixDQUF3QixDQUFDLENBQUM7SUFDOUYsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFDSSwrQkFBSyxHQUFaLFVBQWEsS0FBZSxFQUFFLGFBQXdCO1FBQXpDLHNCQUFBLEVBQUEsVUFBZTtRQUMxQixJQUFJLFVBQVUsR0FBUSxFQUFFLENBQUM7UUFDekIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQ3pCLDBCQUFjLENBQUMsT0FBTyxFQUFFO1lBQ3hCLDBCQUFjLENBQUMsYUFBYSxFQUFFO1lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNO1lBQ3RDLE9BQU87U0FDUixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFDSSwwQ0FBZ0IsR0FBdkIsVUFBMkIsRUFBTyxFQUFFLElBQU8sRUFBRSxhQUF3QjtRQUFyRSxpQkFRQztRQVBDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtZQUN6QiwwQkFBYyxDQUFDLE9BQU8sRUFBRTtZQUN4QiwwQkFBYyxDQUFDLGFBQWEsRUFBRTtZQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTTtZQUN0QyxLQUFLO1NBQ04sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUEsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLElBQUksTUFBQSxFQUFFLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQzthQUM3RCxHQUFHLENBQUMsVUFBQyxJQUFPLElBQUssT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBQ0ksNENBQWtCLEdBQXpCLFVBQTZCLEVBQU8sRUFBRSxJQUFPO1FBQTdDLGlCQU9DO1FBTkMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQ3pCLDBCQUFjLENBQUMsT0FBTyxFQUFFO1lBQ3hCLDBCQUFjLENBQUMsYUFBYSxFQUFFO1lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNO1lBQ3RDLEtBQUs7U0FDTixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBQSxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsSUFBSSxNQUFBLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFPLElBQUssT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBQ0ksZ0NBQU0sR0FBYixVQUFpQixJQUFjLEVBQUUsYUFBd0I7UUFBekQsaUJBT0M7UUFQZ0IscUJBQUEsRUFBQSxTQUFjO1FBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtZQUN6QiwwQkFBYyxDQUFDLE9BQU8sRUFBRTtZQUN4QiwwQkFBYyxDQUFDLGFBQWEsRUFBRTtZQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTTtTQUN2QyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsSUFBSSxNQUFBLEVBQUUsRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDO2FBQ2hFLEdBQUcsQ0FBQyxVQUFDLElBQU8sSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUF4QixDQUF3QixDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFDSSxrQ0FBUSxHQUFmLFVBQW1CLElBQWM7UUFBakMsaUJBTUM7UUFOa0IscUJBQUEsRUFBQSxTQUFjO1FBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtZQUN6QiwwQkFBYyxDQUFDLE9BQU8sRUFBRTtZQUN4QiwwQkFBYyxDQUFDLGFBQWEsRUFBRTtZQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTTtTQUN2QyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsSUFBSSxNQUFBLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFPLElBQUssT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBQ0kscUNBQVcsR0FBbEIsVUFBc0IsSUFBYyxFQUFFLGFBQXdCO1FBQTlELGlCQU9DO1FBUHFCLHFCQUFBLEVBQUEsU0FBYztRQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDM0IsMEJBQWMsQ0FBQyxPQUFPLEVBQUU7WUFDeEIsMEJBQWMsQ0FBQyxhQUFhLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLE1BQU07U0FDdkMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFLElBQUksTUFBQSxFQUFFLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQzthQUNoRSxHQUFHLENBQUMsVUFBQyxJQUFPLElBQUssT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBQ0ksdUNBQWEsR0FBcEIsVUFBd0IsSUFBYztRQUF0QyxpQkFNQztRQU51QixxQkFBQSxFQUFBLFNBQWM7UUFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQzNCLDBCQUFjLENBQUMsT0FBTyxFQUFFO1lBQ3hCLDBCQUFjLENBQUMsYUFBYSxFQUFFO1lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNO1NBQ3ZDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFBRSxJQUFJLE1BQUEsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQU8sSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUF4QixDQUF3QixDQUFDLENBQUM7SUFDaEcsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFDSSx5Q0FBZSxHQUF0QixVQUEwQixLQUFlLEVBQUUsSUFBYyxFQUFFLGFBQXdCO1FBQW5GLGlCQVVDO1FBVnlCLHNCQUFBLEVBQUEsVUFBZTtRQUFFLHFCQUFBLEVBQUEsU0FBYztRQUN2RCxJQUFJLFVBQVUsR0FBUSxFQUFFLENBQUM7UUFDekIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQzFCLDBCQUFjLENBQUMsT0FBTyxFQUFFO1lBQ3hCLDBCQUFjLENBQUMsYUFBYSxFQUFFO1lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNO1lBQ3RDLGlCQUFpQjtTQUNsQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEVBQUUsSUFBSSxNQUFBLEVBQUUsRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDO2FBQ2pFLEdBQUcsQ0FBQyxVQUFDLElBQU8sSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUF4QixDQUF3QixDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFDSSwyQ0FBaUIsR0FBeEIsVUFBNEIsS0FBZSxFQUFFLElBQWM7UUFBM0QsaUJBU0M7UUFUMkIsc0JBQUEsRUFBQSxVQUFlO1FBQUUscUJBQUEsRUFBQSxTQUFjO1FBQ3pELElBQUksVUFBVSxHQUFRLEVBQUUsQ0FBQztRQUN6QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFBQyxVQUFVLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDMUIsMEJBQWMsQ0FBQyxPQUFPLEVBQUU7WUFDeEIsMEJBQWMsQ0FBQyxhQUFhLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLE1BQU07WUFDdEMsaUJBQWlCO1NBQ2xCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsRUFBRSxJQUFJLE1BQUEsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQU8sSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUF4QixDQUF3QixDQUFDLENBQUM7SUFDakcsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFDSSx5Q0FBZSxHQUF0QixVQUEwQixJQUFjLEVBQUUsYUFBd0I7UUFBbEUsaUJBUUM7UUFSeUIscUJBQUEsRUFBQSxTQUFjO1FBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUMxQiwwQkFBYyxDQUFDLE9BQU8sRUFBRTtZQUN4QiwwQkFBYyxDQUFDLGFBQWEsRUFBRTtZQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTTtZQUN0QyxpQkFBaUI7U0FDbEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFLElBQUksTUFBQSxFQUFFLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQzthQUNoRSxHQUFHLENBQUMsVUFBQyxJQUFPLElBQUssT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBQ0ksMkNBQWlCLEdBQXhCLFVBQTRCLElBQWM7UUFBMUMsaUJBT0M7UUFQMkIscUJBQUEsRUFBQSxTQUFjO1FBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUMxQiwwQkFBYyxDQUFDLE9BQU8sRUFBRTtZQUN4QiwwQkFBYyxDQUFDLGFBQWEsRUFBRTtZQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTTtZQUN0QyxpQkFBaUI7U0FDbEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFLElBQUksTUFBQSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsSUFBTyxJQUFLLE9BQUEsS0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQXhCLENBQXdCLENBQUMsQ0FBQztJQUNoRyxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUNJLHFDQUFXLEdBQWxCLFVBQXNCLEVBQU8sRUFBRSxJQUFjLEVBQUUsYUFBd0I7UUFBdkUsaUJBUUM7UUFSOEIscUJBQUEsRUFBQSxTQUFjO1FBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUMxQiwwQkFBYyxDQUFDLE9BQU8sRUFBRTtZQUN4QiwwQkFBYyxDQUFDLGFBQWEsRUFBRTtZQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTTtZQUN0QyxLQUFLLEVBQUUsU0FBUztTQUNqQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBQSxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsSUFBSSxNQUFBLEVBQUUsRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDO2FBQzdELEdBQUcsQ0FBQyxVQUFDLElBQU8sSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUF4QixDQUF3QixDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFDSSx1Q0FBYSxHQUFwQixVQUF3QixFQUFPLEVBQUUsSUFBYztRQUEvQyxpQkFPQztRQVBnQyxxQkFBQSxFQUFBLFNBQWM7UUFDN0MsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQzFCLDBCQUFjLENBQUMsT0FBTyxFQUFFO1lBQ3hCLDBCQUFjLENBQUMsYUFBYSxFQUFFO1lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNO1lBQ3RDLEtBQUssRUFBRSxTQUFTO1NBQ2pCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFBLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxJQUFJLE1BQUEsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQU8sSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUF4QixDQUF3QixDQUFDLENBQUM7SUFDN0YsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFDSSw0Q0FBa0IsR0FBekI7UUFDRSxJQUFJLE9BQU8sR0FBRyxJQUFJLGlCQUFPLEVBQUUsQ0FBQztRQUM1QixFQUFFLENBQUMsQ0FBQyxPQUFPLFdBQVcsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksSUFBSSxHQUFLLFVBQUMsR0FBUSxJQUFLLE9BQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFsQyxDQUFrQyxDQUFDO1lBQzlELElBQUksTUFBTSxHQUFHLElBQUksV0FBVyxDQUFDO2dCQUMzQiwwQkFBYyxDQUFDLE9BQU8sRUFBRTtnQkFDeEIsMEJBQWMsQ0FBQyxhQUFhLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNO2dCQUN0QyxlQUFlO2FBQ2hCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDYixNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE9BQU8sQ0FBQyxJQUFJLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBVUgsc0JBQUM7QUFBRCxDQUFDLEFBamtCRCxJQWlrQkM7QUFqa0JxQixlQUFlO0lBRHBDLGlCQUFVLEVBQUU7SUFPUixXQUFBLGFBQU0sQ0FBQyxXQUFJLENBQUMsQ0FBQTtJQUNaLFdBQUEsYUFBTSxDQUFDLHFDQUFnQixDQUFDLENBQUE7SUFDeEIsV0FBQSxhQUFNLENBQUMscUJBQVMsQ0FBQyxDQUFBO0lBQ2pCLFdBQUEsYUFBTSxDQUFDLDJCQUFZLENBQUMsQ0FBQTtJQUNwQixXQUFBLGFBQU0sQ0FBQyxnQ0FBZ0IsQ0FBQyxDQUFBO0lBQ3hCLFdBQUEsZUFBUSxFQUFFLENBQUEsRUFBRSxXQUFBLGFBQU0sQ0FBQyw0QkFBWSxDQUFDLENBQUE7cUNBTEgsV0FBSTtRQUNjLHFDQUFnQjtRQUMzQixxQkFBUztRQUNSLDJCQUFZO1FBQ0EsZ0NBQWdCO1FBQ1IsNEJBQVk7R0FYcEQsZUFBZSxDQWlrQnBDO0FBamtCcUIsMENBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB0c2xpbnQ6ZGlzYWJsZSAqL1xuaW1wb3J0IHsgSW5qZWN0YWJsZSwgSW5qZWN0LCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cCwgSGVhZGVycywgUmVxdWVzdCwgUmVxdWVzdE9wdGlvbnMgfSBmcm9tICdAYW5ndWxhci9odHRwJztcbmltcG9ydCB7IE5nTW9kdWxlLCBNb2R1bGVXaXRoUHJvdmlkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBKU09OU2VhcmNoUGFyYW1zIH0gZnJvbSAnLi9zZWFyY2gucGFyYW1zJztcbmltcG9ydCB7IEVycm9ySGFuZGxlciB9IGZyb20gJy4vZXJyb3Iuc2VydmljZSc7XG5pbXBvcnQgeyBMb29wQmFja0F1dGggfSBmcm9tICcuL2F1dGguc2VydmljZSc7XG5pbXBvcnQgeyBMb29wQmFja0NvbmZpZyB9IGZyb20gJy4uLy4uL2xiLmNvbmZpZyc7XG5pbXBvcnQgeyBMb29wQmFja0ZpbHRlciwgQWNjZXNzVG9rZW4gfSBmcm9tICcuLi8uLi9tb2RlbHMvQmFzZU1vZGVscyc7XG5pbXBvcnQgeyBTREtNb2RlbHMgfSBmcm9tICcuLi9jdXN0b20vU0RLTW9kZWxzJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzL09ic2VydmFibGUnO1xuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMvU3ViamVjdCc7XG5pbXBvcnQgeyBFcnJvck9ic2VydmFibGUgfSBmcm9tICdyeGpzL29ic2VydmFibGUvRXJyb3JPYnNlcnZhYmxlJztcbmltcG9ydCAncnhqcy9hZGQvb3BlcmF0b3IvY2F0Y2gnO1xuaW1wb3J0ICdyeGpzL2FkZC9vcGVyYXRvci9tYXAnO1xuaW1wb3J0IHsgU29ja2V0Q29ubmVjdGlvbiB9IGZyb20gJy4uLy4uL3NvY2tldHMvc29ja2V0LmNvbm5lY3Rpb25zJztcbi8vIE1ha2luZyBTdXJlIEV2ZW50U291cmNlIFR5cGUgaXMgYXZhaWxhYmxlIHRvIGF2b2lkIGNvbXBpbGF0aW9uIGlzc3Vlcy5cbmRlY2xhcmUgdmFyIEV2ZW50U291cmNlOiBhbnk7XG4vKipcbiogQG1vZHVsZSBCYXNlTG9vcEJhY2tBcGlcbiogQGF1dGhvciBKb25hdGhhbiBDYXNhcnJ1YmlhcyA8QGpvaG5jYXNhcnJ1Ymlhcz4gPGdpdGh1Yjpqb25hdGhhbi1jYXNhcnJ1Ymlhcz5cbiogQGF1dGhvciBOaWtvbGF5IE1hdGl1c2hlbmtvdiA8aHR0cHM6Ly9naXRodWIuY29tL21udng+XG4qIEBsaWNlbnNlIE1JVFxuKiBAZGVzY3JpcHRpb25cbiogQWJzdHJhY3QgY2xhc3MgdGhhdCB3aWxsIGJlIGltcGxlbWVudGVkIGluIGV2ZXJ5IGN1c3RvbSBzZXJ2aWNlIGF1dG9tYXRpY2FsbHkgYnVpbHRcbiogYnkgdGhlIHNkayBidWlsZGVyLlxuKiBJdCBwcm92aWRlcyB0aGUgY29yZSBmdW5jdGlvbmFsbGl0eSBmb3IgZXZlcnkgQVBJIGNhbGwsIGVpdGhlciBieSBIVFRQIENhbGxzIG9yIGJ5XG4qIFdlYlNvY2tldHMuXG4qKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlTG9vcEJhY2tBcGkge1xuXG4gIHByb3RlY3RlZCBwYXRoOiBzdHJpbmc7XG4gIHByb3RlY3RlZCBtb2RlbDogYW55O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoSHR0cCkgcHJvdGVjdGVkIGh0dHA6IEh0dHAsXG4gICAgQEluamVjdChTb2NrZXRDb25uZWN0aW9uKSBwcm90ZWN0ZWQgY29ubmVjdGlvbjogU29ja2V0Q29ubmVjdGlvbixcbiAgICBASW5qZWN0KFNES01vZGVscykgcHJvdGVjdGVkIG1vZGVsczogU0RLTW9kZWxzLFxuICAgIEBJbmplY3QoTG9vcEJhY2tBdXRoKSBwcm90ZWN0ZWQgYXV0aDogTG9vcEJhY2tBdXRoLFxuICAgIEBJbmplY3QoSlNPTlNlYXJjaFBhcmFtcykgcHJvdGVjdGVkIHNlYXJjaFBhcmFtczogSlNPTlNlYXJjaFBhcmFtcyxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEVycm9ySGFuZGxlcikgcHJvdGVjdGVkIGVycm9ySGFuZGxlcjogRXJyb3JIYW5kbGVyXG4gICkge1xuICAgIHRoaXMubW9kZWwgPSB0aGlzLm1vZGVscy5nZXQodGhpcy5nZXRNb2RlbE5hbWUoKSk7XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2QgcmVxdWVzdFxuICAgKiBAcGFyYW0ge3N0cmluZ30gIG1ldGhvZCAgICAgIFJlcXVlc3QgbWV0aG9kIChHRVQsIFBPU1QsIFBVVClcbiAgICogQHBhcmFtIHtzdHJpbmd9ICB1cmwgICAgICAgICBSZXF1ZXN0IHVybCAobXktaG9zdC9teS11cmwvOmlkKVxuICAgKiBAcGFyYW0ge2FueX0gICAgIHJvdXRlUGFyYW1zIFZhbHVlcyBvZiB1cmwgcGFyYW1ldGVyc1xuICAgKiBAcGFyYW0ge2FueX0gICAgIHVybFBhcmFtcyAgIFBhcmFtZXRlcnMgZm9yIGJ1aWxkaW5nIHVybCAoZmlsdGVyIGFuZCBvdGhlcilcbiAgICogQHBhcmFtIHthbnl9ICAgICBwb3N0Qm9keSAgICBSZXF1ZXN0IHBvc3RCb2R5XG4gICAqIEByZXR1cm4ge09ic2VydmFibGU8YW55Pn1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRoaXMgaXMgYSBjb3JlIG1ldGhvZCwgZXZlcnkgSFRUUCBDYWxsIHdpbGwgYmUgZG9uZSBmcm9tIGhlcmUsIGV2ZXJ5IEFQSSBTZXJ2aWNlIHdpbGxcbiAgICogZXh0ZW5kIHRoaXMgY2xhc3MgYW5kIHVzZSB0aGlzIG1ldGhvZCB0byBnZXQgUkVTVGZ1bCBjb21tdW5pY2F0aW9uLlxuICAgKiovXG4gIHB1YmxpYyByZXF1ZXN0KFxuICAgIG1ldGhvZCAgICAgICAgIDogc3RyaW5nLFxuICAgIHVybCAgICAgICAgICAgIDogc3RyaW5nLFxuICAgIHJvdXRlUGFyYW1zICAgIDogYW55ID0ge30sXG4gICAgdXJsUGFyYW1zICAgICAgOiBhbnkgPSB7fSxcbiAgICBwb3N0Qm9keSAgICAgICA6IGFueSA9IHt9LFxuICAgIHB1YnN1YiAgICAgICAgIDogYm9vbGVhbiA9IGZhbHNlLFxuICAgIGN1c3RvbUhlYWRlcnM/IDogRnVuY3Rpb25cbiAgKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICAvLyBUcmFuc3BpbGUgcm91dGUgdmFyaWFibGVzIHRvIHRoZSBhY3R1YWwgcmVxdWVzdCBWYWx1ZXNcbiAgICBPYmplY3Qua2V5cyhyb3V0ZVBhcmFtcykuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIHVybCA9IHVybC5yZXBsYWNlKG5ldyBSZWdFeHAoXCI6XCIgKyBrZXkgKyBcIihcXC98JClcIiwgXCJnXCIpLCByb3V0ZVBhcmFtc1trZXldICsgXCIkMVwiKVxuICAgIH0pO1xuICAgIGlmIChwdWJzdWIpIHtcbiAgICAgIGlmICh1cmwubWF0Y2goL2ZrLykpIHtcbiAgICAgICAgbGV0IGFyciA9IHVybC5zcGxpdCgnLycpOyBhcnIucG9wKCk7XG4gICAgICAgIHVybCA9IGFyci5qb2luKCcvJyk7XG4gICAgICB9XG4gICAgICBsZXQgZXZlbnQ6IHN0cmluZyA9IChgWyR7bWV0aG9kfV0ke3VybH1gKS5yZXBsYWNlKC9cXD8vLCAnJyk7XG4gICAgICBsZXQgc3ViamVjdDogU3ViamVjdDxhbnk+ID0gbmV3IFN1YmplY3Q8YW55PigpO1xuICAgICAgdGhpcy5jb25uZWN0aW9uLm9uKGV2ZW50LCByZXMgPT4gc3ViamVjdC5uZXh0KHJlcykpO1xuICAgICAgcmV0dXJuIHN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEhlYWRlcnMgdG8gYmUgc2VudFxuICAgICAgbGV0IGhlYWRlcnM6IEhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xuICAgICAgaGVhZGVycy5hcHBlbmQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAvLyBBdXRoZW50aWNhdGUgcmVxdWVzdFxuICAgICAgdGhpcy5hdXRoZW50aWNhdGUodXJsLCBoZWFkZXJzKTtcbiAgICAgIC8vIEJvZHkgZml4IGZvciBidWlsdCBpbiByZW1vdGUgbWV0aG9kcyB1c2luZyBcImRhdGFcIiwgXCJvcHRpb25zXCIgb3IgXCJjcmVkZW50aWFsc1xuICAgICAgLy8gdGhhdCBhcmUgdGhlIGFjdHVhbCBib2R5LCBDdXN0b20gcmVtb3RlIG1ldGhvZCBwcm9wZXJ0aWVzIGFyZSBkaWZmZXJlbnQgYW5kIG5lZWRcbiAgICAgIC8vIHRvIGJlIHdyYXBwZWQgaW50byBhIGJvZHkgb2JqZWN0XG4gICAgICBsZXQgYm9keTogYW55O1xuICAgICAgbGV0IHBvc3RCb2R5S2V5cyA9IHR5cGVvZiBwb3N0Qm9keSA9PT0gJ29iamVjdCcgPyBPYmplY3Qua2V5cyhwb3N0Qm9keSkgOiBbXVxuICAgICAgaWYgKHBvc3RCb2R5S2V5cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgYm9keSA9IHBvc3RCb2R5W3Bvc3RCb2R5S2V5cy5zaGlmdCgpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJvZHkgPSBwb3N0Qm9keTtcbiAgICAgIH1cbiAgICAgIGxldCBmaWx0ZXI6IHN0cmluZyA9ICcnO1xuICAgICAgLy8gU2VwYXJhdGUgZmlsdGVyIG9iamVjdCBmcm9tIHVybCBwYXJhbXMgYW5kIGFkZCB0byBzZWFyY2ggcXVlcnlcbiAgICAgIGlmICh1cmxQYXJhbXMuZmlsdGVyKSB7XG4gICAgICAgIGlmIChMb29wQmFja0NvbmZpZy5pc0hlYWRlcnNGaWx0ZXJpbmdTZXQoKSkge1xuICAgICAgICAgIGhlYWRlcnMuYXBwZW5kKCdmaWx0ZXInLCBKU09OLnN0cmluZ2lmeSh1cmxQYXJhbXMuZmlsdGVyKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZmlsdGVyID0gYD9maWx0ZXI9JHsgZW5jb2RlVVJJKEpTT04uc3RyaW5naWZ5KHVybFBhcmFtcy5maWx0ZXIpKX1gO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSB1cmxQYXJhbXMuZmlsdGVyO1xuICAgICAgfVxuICAgICAgLy8gU2VwYXJhdGUgd2hlcmUgb2JqZWN0IGZyb20gdXJsIHBhcmFtcyBhbmQgYWRkIHRvIHNlYXJjaCBxdWVyeVxuICAgICAgLyoqXG4gICAgICBDT0RFIEJFTE9XIFdJTEwgR0VORVJBVEUgVEhFIEZPTExPV0lORyBJU1NVRVM6XG4gICAgICAtIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWFuLWV4cGVydC1vZmZpY2lhbC9sb29wYmFjay1zZGstYnVpbGRlci9pc3N1ZXMvMzU2XG4gICAgICAtIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWFuLWV4cGVydC1vZmZpY2lhbC9sb29wYmFjay1zZGstYnVpbGRlci9pc3N1ZXMvMzI4IFxuICAgICAgaWYgKHVybFBhcmFtcy53aGVyZSkge1xuICAgICAgICBoZWFkZXJzLmFwcGVuZCgnd2hlcmUnLCBKU09OLnN0cmluZ2lmeSh1cmxQYXJhbXMud2hlcmUpKTtcbiAgICAgICAgZGVsZXRlIHVybFBhcmFtcy53aGVyZTtcbiAgICAgIH1cbiAgICAgICoqL1xuICAgICAgaWYgKHR5cGVvZiBjdXN0b21IZWFkZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGhlYWRlcnMgPSBjdXN0b21IZWFkZXJzKGhlYWRlcnMpO1xuICAgICAgfVxuICAgICAgdGhpcy5zZWFyY2hQYXJhbXMuc2V0SlNPTih1cmxQYXJhbXMpO1xuICAgICAgbGV0IHJlcXVlc3Q6IFJlcXVlc3QgPSBuZXcgUmVxdWVzdChcbiAgICAgICAgbmV3IFJlcXVlc3RPcHRpb25zKHtcbiAgICAgICAgICBoZWFkZXJzIDogaGVhZGVycyxcbiAgICAgICAgICBtZXRob2QgIDogbWV0aG9kLFxuICAgICAgICAgIHVybCAgICAgOiBgJHt1cmx9JHtmaWx0ZXJ9YCxcbiAgICAgICAgICBzZWFyY2ggIDogT2JqZWN0LmtleXModXJsUGFyYW1zKS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICA/IHRoaXMuc2VhcmNoUGFyYW1zLmdldFVSTFNlYXJjaFBhcmFtcygpIDogbnVsbCxcbiAgICAgICAgICBib2R5ICAgIDogYm9keSA/IEpTT04uc3RyaW5naWZ5KGJvZHkpIDogdW5kZWZpbmVkXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgcmV0dXJuIHRoaXMuaHR0cC5yZXF1ZXN0KHJlcXVlc3QpXG4gICAgICAgIC5tYXAoKHJlczogYW55KSA9PiAocmVzLnRleHQoKSAhPSBcIlwiID8gcmVzLmpzb24oKSA6IHt9KSlcbiAgICAgICAgLmNhdGNoKChlKSA9PiB0aGlzLmVycm9ySGFuZGxlci5oYW5kbGVFcnJvcihlKSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIGF1dGhlbnRpY2F0ZVxuICAgKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0OiBqb2huY2FzYXJydWJpYXMsIGdoOiBtZWFuLWV4cGVydC1vZmZpY2lhbD5cbiAgICogQGxpY2Vuc2UgTUlUXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgU2VydmVyIFVSTFxuICAgKiBAcGFyYW0ge0hlYWRlcnN9IGhlYWRlcnMgSFRUUCBIZWFkZXJzXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIHRyeSB0byBhdXRoZW50aWNhdGUgdXNpbmcgZWl0aGVyIGFuIGFjY2Vzc190b2tlbiBvciBiYXNpYyBodHRwIGF1dGhcbiAgICovXG4gIHB1YmxpYyBhdXRoZW50aWNhdGU8VD4odXJsOiBzdHJpbmcsIGhlYWRlcnM6IEhlYWRlcnMpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5hdXRoLmdldEFjY2Vzc1Rva2VuSWQoKSkge1xuICAgICAgaGVhZGVycy5hcHBlbmQoXG4gICAgICAgICdBdXRob3JpemF0aW9uJyxcbiAgICAgICAgTG9vcEJhY2tDb25maWcuZ2V0QXV0aFByZWZpeCgpICsgdGhpcy5hdXRoLmdldEFjY2Vzc1Rva2VuSWQoKVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2QgY3JlYXRlXG4gICAqIEBhdXRob3IgSm9uYXRoYW4gQ2FzYXJydWJpYXMgPHQ6IGpvaG5jYXNhcnJ1YmlhcywgZ2g6IG1lYW4tZXhwZXJ0LW9mZmljaWFsPlxuICAgKiBAbGljZW5zZSBNSVRcbiAgICogQHBhcmFtIHtUfSBkYXRhIEdlbmVyaWMgZGF0YSB0eXBlXG4gICAqIEByZXR1cm4ge09ic2VydmFibGU8VD59XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBHZW5lcmljIGNyZWF0ZSBtZXRob2RcbiAgICovXG4gIHB1YmxpYyBjcmVhdGU8VD4oZGF0YTogVCwgY3VzdG9tSGVhZGVycz86IEZ1bmN0aW9uKTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnUE9TVCcsIFtcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldFBhdGgoKSxcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldEFwaVZlcnNpb24oKSxcbiAgICAgIHRoaXMubW9kZWwuZ2V0TW9kZWxEZWZpbml0aW9uKCkucGx1cmFsXG4gICAgXS5qb2luKCcvJyksIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB7IGRhdGEgfSwgbnVsbCwgY3VzdG9tSGVhZGVycykubWFwKChkYXRhOiBUKSA9PiB0aGlzLm1vZGVsLmZhY3RvcnkoZGF0YSkpO1xuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIG9uQ3JlYXRlXG4gICAqIEBhdXRob3IgSm9uYXRoYW4gQ2FzYXJydWJpYXMgPHQ6IGpvaG5jYXNhcnJ1YmlhcywgZ2g6IG1lYW4tZXhwZXJ0LW9mZmljaWFsPlxuICAgKiBAbGljZW5zZSBNSVRcbiAgICogQHBhcmFtIHtUW119IGRhdGEgR2VuZXJpYyBkYXRhIHR5cGUgYXJyYXlcbiAgICogQHJldHVybiB7T2JzZXJ2YWJsZTxUW10+fVxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogR2VuZXJpYyBwdWJzdWIgb25jcmVhdGUgbWFueSBtZXRob2RcbiAgICovXG4gIHB1YmxpYyBvbkNyZWF0ZTxUPihkYXRhOiBUW10pOiBPYnNlcnZhYmxlPFRbXT4ge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoJ1BPU1QnLCBbXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRQYXRoKCksXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRBcGlWZXJzaW9uKCksXG4gICAgICB0aGlzLm1vZGVsLmdldE1vZGVsRGVmaW5pdGlvbigpLnBsdXJhbFxuICAgIF0uam9pbignLycpLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgeyBkYXRhIH0sIHRydWUpXG4gICAgLm1hcCgoZGF0dW06IFRbXSkgPT4gZGF0dW0ubWFwKChkYXRhOiBUKSA9PiB0aGlzLm1vZGVsLmZhY3RvcnkoZGF0YSkpKTtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBjcmVhdGVNYW55XG4gICAqIEBhdXRob3IgSm9uYXRoYW4gQ2FzYXJydWJpYXMgPHQ6IGpvaG5jYXNhcnJ1YmlhcywgZ2g6IG1lYW4tZXhwZXJ0LW9mZmljaWFsPlxuICAgKiBAbGljZW5zZSBNSVRcbiAgICogQHBhcmFtIHtUW119IGRhdGEgR2VuZXJpYyBkYXRhIHR5cGUgYXJyYXlcbiAgICogQHJldHVybiB7T2JzZXJ2YWJsZTxUW10+fVxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogR2VuZXJpYyBjcmVhdGUgbWFueSBtZXRob2RcbiAgICovXG4gIHB1YmxpYyBjcmVhdGVNYW55PFQ+KGRhdGE6IFRbXSwgY3VzdG9tSGVhZGVycz86IEZ1bmN0aW9uKTogT2JzZXJ2YWJsZTxUW10+IHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdQT1NUJywgW1xuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0UGF0aCgpLFxuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0QXBpVmVyc2lvbigpLFxuICAgICAgdGhpcy5tb2RlbC5nZXRNb2RlbERlZmluaXRpb24oKS5wbHVyYWxcbiAgICBdLmpvaW4oJy8nKSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHsgZGF0YSB9LCBudWxsLCBjdXN0b21IZWFkZXJzKVxuICAgIC5tYXAoKGRhdHVtOiBUW10pID0+IGRhdHVtLm1hcCgoZGF0YTogVCkgPT4gdGhpcy5tb2RlbC5mYWN0b3J5KGRhdGEpKSk7XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2Qgb25DcmVhdGVNYW55XG4gICAqIEBhdXRob3IgSm9uYXRoYW4gQ2FzYXJydWJpYXMgPHQ6IGpvaG5jYXNhcnJ1YmlhcywgZ2g6IG1lYW4tZXhwZXJ0LW9mZmljaWFsPlxuICAgKiBAbGljZW5zZSBNSVRcbiAgICogQHBhcmFtIHtUW119IGRhdGEgR2VuZXJpYyBkYXRhIHR5cGUgYXJyYXlcbiAgICogQHJldHVybiB7T2JzZXJ2YWJsZTxUW10+fVxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogR2VuZXJpYyBjcmVhdGUgbWFueSBtZXRob2RcbiAgICovXG4gIHB1YmxpYyBvbkNyZWF0ZU1hbnk8VD4oZGF0YTogVFtdKTogT2JzZXJ2YWJsZTxUW10+IHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdQT1NUJywgW1xuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0UGF0aCgpLFxuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0QXBpVmVyc2lvbigpLFxuICAgICAgdGhpcy5tb2RlbC5nZXRNb2RlbERlZmluaXRpb24oKS5wbHVyYWxcbiAgICBdLmpvaW4oJy8nKSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHsgZGF0YSB9LCB0cnVlKVxuICAgIC5tYXAoKGRhdHVtOiBUW10pID0+IGRhdHVtLm1hcCgoZGF0YTogVCkgPT4gdGhpcy5tb2RlbC5mYWN0b3J5KGRhdGEpKSk7XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2QgZmluZEJ5SWRcbiAgICogQGF1dGhvciBKb25hdGhhbiBDYXNhcnJ1YmlhcyA8dDogam9obmNhc2FycnViaWFzLCBnaDogbWVhbi1leHBlcnQtb2ZmaWNpYWw+XG4gICAqIEBsaWNlbnNlIE1JVFxuICAgKiBAcGFyYW0ge2FueX0gZGF0YSBHZW5lcmljIGRhdGEgdHlwZVxuICAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPFQ+fVxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogR2VuZXJpYyBmaW5kQnlJZCBtZXRob2RcbiAgICovXG4gIHB1YmxpYyBmaW5kQnlJZDxUPihpZDogYW55LCBmaWx0ZXI6IExvb3BCYWNrRmlsdGVyID0ge30sIGN1c3RvbUhlYWRlcnM/OiBGdW5jdGlvbik6IE9ic2VydmFibGU8VD4ge1xuICAgIGxldCBfdXJsUGFyYW1zOiBhbnkgPSB7fTtcbiAgICBpZiAoZmlsdGVyKSBfdXJsUGFyYW1zLmZpbHRlciA9IGZpbHRlcjtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdHRVQnLCBbXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRQYXRoKCksXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRBcGlWZXJzaW9uKCksXG4gICAgICB0aGlzLm1vZGVsLmdldE1vZGVsRGVmaW5pdGlvbigpLnBsdXJhbCxcbiAgICAgICc6aWQnXG4gICAgXS5qb2luKCcvJyksIHsgaWQgfSwgX3VybFBhcmFtcywgdW5kZWZpbmVkLCBudWxsLCBjdXN0b21IZWFkZXJzKVxuICAgIC5tYXAoKGRhdGE6IFQpID0+IHRoaXMubW9kZWwuZmFjdG9yeShkYXRhKSk7XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2QgZmluZFxuICAgKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0OiBqb2huY2FzYXJydWJpYXMsIGdoOiBtZWFuLWV4cGVydC1vZmZpY2lhbD5cbiAgICogQGxpY2Vuc2UgTUlUXG4gICAqIEByZXR1cm4ge09ic2VydmFibGU8VFsrPn1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEdlbmVyaWMgZmluZCBtZXRob2RcbiAgICovXG4gIHB1YmxpYyBmaW5kPFQ+KGZpbHRlcjogTG9vcEJhY2tGaWx0ZXIgPSB7fSwgY3VzdG9tSGVhZGVycz86IEZ1bmN0aW9uKTogT2JzZXJ2YWJsZTxUW10+IHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdHRVQnLCBbXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRQYXRoKCksXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRBcGlWZXJzaW9uKCksXG4gICAgICB0aGlzLm1vZGVsLmdldE1vZGVsRGVmaW5pdGlvbigpLnBsdXJhbFxuICAgIF0uam9pbignLycpLCB1bmRlZmluZWQsIHsgZmlsdGVyIH0sIHVuZGVmaW5lZCwgbnVsbCwgY3VzdG9tSGVhZGVycylcbiAgICAubWFwKChkYXR1bTogVFtdKSA9PiBkYXR1bS5tYXAoKGRhdGE6IFQpID0+IHRoaXMubW9kZWwuZmFjdG9yeShkYXRhKSkpO1xuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIGV4aXN0c1xuICAgKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0OiBqb2huY2FzYXJydWJpYXMsIGdoOiBtZWFuLWV4cGVydC1vZmZpY2lhbD5cbiAgICogQGxpY2Vuc2UgTUlUXG4gICAqIEByZXR1cm4ge09ic2VydmFibGU8VFtdPn1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEdlbmVyaWMgZXhpc3RzIG1ldGhvZFxuICAgKi9cbiAgcHVibGljIGV4aXN0czxUPihpZDogYW55LCBjdXN0b21IZWFkZXJzPzogRnVuY3Rpb24pOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdHRVQnLCBbXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRQYXRoKCksXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRBcGlWZXJzaW9uKCksXG4gICAgICB0aGlzLm1vZGVsLmdldE1vZGVsRGVmaW5pdGlvbigpLnBsdXJhbCxcbiAgICAgICc6aWQvZXhpc3RzJ1xuICAgIF0uam9pbignLycpLCB7IGlkIH0sIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBudWxsLCBjdXN0b21IZWFkZXJzKTtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBmaW5kT25lXG4gICAqIEBhdXRob3IgSm9uYXRoYW4gQ2FzYXJydWJpYXMgPHQ6IGpvaG5jYXNhcnJ1YmlhcywgZ2g6IG1lYW4tZXhwZXJ0LW9mZmljaWFsPlxuICAgKiBAbGljZW5zZSBNSVRcbiAgICogQHJldHVybiB7T2JzZXJ2YWJsZTxUPn1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEdlbmVyaWMgZmluZE9uZSBtZXRob2RcbiAgICovXG4gIHB1YmxpYyBmaW5kT25lPFQ+KGZpbHRlcjogTG9vcEJhY2tGaWx0ZXIgPSB7fSwgY3VzdG9tSGVhZGVycz86IEZ1bmN0aW9uKTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnR0VUJywgW1xuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0UGF0aCgpLFxuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0QXBpVmVyc2lvbigpLFxuICAgICAgdGhpcy5tb2RlbC5nZXRNb2RlbERlZmluaXRpb24oKS5wbHVyYWwsXG4gICAgICAnZmluZE9uZSdcbiAgICBdLmpvaW4oJy8nKSwgdW5kZWZpbmVkLCB7IGZpbHRlciB9LCB1bmRlZmluZWQsIG51bGwsIGN1c3RvbUhlYWRlcnMpXG4gICAgLm1hcCgoZGF0YTogVCkgPT4gdGhpcy5tb2RlbC5mYWN0b3J5KGRhdGEpKTtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCB1cGRhdGVBbGxcbiAgICogQGF1dGhvciBKb25hdGhhbiBDYXNhcnJ1YmlhcyA8dDogam9obmNhc2FycnViaWFzLCBnaDogbWVhbi1leHBlcnQtb2ZmaWNpYWw+XG4gICAqIEBsaWNlbnNlIE1JVFxuICAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPFRbXT59XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBHZW5lcmljIHVwZGF0ZUFsbCBtZXRob2RcbiAgICovXG4gIHB1YmxpYyB1cGRhdGVBbGw8VD4od2hlcmU6IGFueSA9IHt9LCBkYXRhOiBULCBjdXN0b21IZWFkZXJzPzogRnVuY3Rpb24pOiBPYnNlcnZhYmxlPHsgY291bnQ6ICdudW1iZXInIH0+IHtcbiAgICBsZXQgX3VybFBhcmFtczogYW55ID0ge307XG4gICAgaWYgKHdoZXJlKSBfdXJsUGFyYW1zLndoZXJlID0gd2hlcmU7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnUE9TVCcsIFtcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldFBhdGgoKSxcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldEFwaVZlcnNpb24oKSxcbiAgICAgIHRoaXMubW9kZWwuZ2V0TW9kZWxEZWZpbml0aW9uKCkucGx1cmFsLFxuICAgICAgJ3VwZGF0ZSdcbiAgICBdLmpvaW4oJy8nKSwgdW5kZWZpbmVkLCBfdXJsUGFyYW1zLCB7IGRhdGEgfSwgbnVsbCwgY3VzdG9tSGVhZGVycyk7XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2Qgb25VcGRhdGVBbGxcbiAgICogQGF1dGhvciBKb25hdGhhbiBDYXNhcnJ1YmlhcyA8dDogam9obmNhc2FycnViaWFzLCBnaDogbWVhbi1leHBlcnQtb2ZmaWNpYWw+XG4gICAqIEBsaWNlbnNlIE1JVFxuICAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPFRbXT59XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBHZW5lcmljIHB1YnN1YiBvblVwZGF0ZUFsbCBtZXRob2RcbiAgICovXG4gIHB1YmxpYyBvblVwZGF0ZUFsbDxUPih3aGVyZTogYW55ID0ge30sIGRhdGE6IFQpOiBPYnNlcnZhYmxlPHsgY291bnQ6ICdudW1iZXInIH0+IHtcbiAgICBsZXQgX3VybFBhcmFtczogYW55ID0ge307XG4gICAgaWYgKHdoZXJlKSBfdXJsUGFyYW1zLndoZXJlID0gd2hlcmU7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnUE9TVCcsIFtcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldFBhdGgoKSxcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldEFwaVZlcnNpb24oKSxcbiAgICAgIHRoaXMubW9kZWwuZ2V0TW9kZWxEZWZpbml0aW9uKCkucGx1cmFsLFxuICAgICAgJ3VwZGF0ZSdcbiAgICBdLmpvaW4oJy8nKSwgdW5kZWZpbmVkLCBfdXJsUGFyYW1zLCB7IGRhdGEgfSwgdHJ1ZSk7XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2QgZGVsZXRlQnlJZFxuICAgKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0OiBqb2huY2FzYXJydWJpYXMsIGdoOiBtZWFuLWV4cGVydC1vZmZpY2lhbD5cbiAgICogQGxpY2Vuc2UgTUlUXG4gICAqIEByZXR1cm4ge09ic2VydmFibGU8VD59XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBHZW5lcmljIGRlbGV0ZUJ5SWQgbWV0aG9kXG4gICAqL1xuICBwdWJsaWMgZGVsZXRlQnlJZDxUPihpZDogYW55LCBjdXN0b21IZWFkZXJzPzogRnVuY3Rpb24pOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdERUxFVEUnLCBbXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRQYXRoKCksXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRBcGlWZXJzaW9uKCksXG4gICAgICB0aGlzLm1vZGVsLmdldE1vZGVsRGVmaW5pdGlvbigpLnBsdXJhbCxcbiAgICAgICc6aWQnXG4gICAgXS5qb2luKCcvJyksIHsgaWQgfSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG51bGwsIGN1c3RvbUhlYWRlcnMpXG4gICAgLm1hcCgoZGF0YTogVCkgPT4gdGhpcy5tb2RlbC5mYWN0b3J5KGRhdGEpKTtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBvbkRlbGV0ZUJ5SWRcbiAgICogQGF1dGhvciBKb25hdGhhbiBDYXNhcnJ1YmlhcyA8dDogam9obmNhc2FycnViaWFzLCBnaDogbWVhbi1leHBlcnQtb2ZmaWNpYWw+XG4gICAqIEBsaWNlbnNlIE1JVFxuICAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPFQ+fVxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogR2VuZXJpYyBwdWJzdWIgb25EZWxldGVCeUlkIG1ldGhvZFxuICAgKi9cbiAgcHVibGljIG9uRGVsZXRlQnlJZDxUPihpZDogYW55KTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnREVMRVRFJywgW1xuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0UGF0aCgpLFxuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0QXBpVmVyc2lvbigpLFxuICAgICAgdGhpcy5tb2RlbC5nZXRNb2RlbERlZmluaXRpb24oKS5wbHVyYWwsXG4gICAgICAnOmlkJ1xuICAgIF0uam9pbignLycpLCB7IGlkIH0sIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0cnVlKS5tYXAoKGRhdGE6IFQpID0+IHRoaXMubW9kZWwuZmFjdG9yeShkYXRhKSk7XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2QgY291bnRcbiAgICogQGF1dGhvciBKb25hdGhhbiBDYXNhcnJ1YmlhcyA8dDogam9obmNhc2FycnViaWFzLCBnaDogbWVhbi1leHBlcnQtb2ZmaWNpYWw+XG4gICAqIEBsaWNlbnNlIE1JVFxuICAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPHsgY291bnQ6IG51bWJlciB9Pn1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEdlbmVyaWMgY291bnQgbWV0aG9kXG4gICAqL1xuICBwdWJsaWMgY291bnQod2hlcmU6IGFueSA9IHt9LCBjdXN0b21IZWFkZXJzPzogRnVuY3Rpb24pOiBPYnNlcnZhYmxlPHsgY291bnQ6IG51bWJlciB9PiB7XG4gICAgbGV0IF91cmxQYXJhbXM6IGFueSA9IHt9O1xuICAgIGlmICh3aGVyZSkgX3VybFBhcmFtcy53aGVyZSA9IHdoZXJlO1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoJ0dFVCcsIFtcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldFBhdGgoKSxcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldEFwaVZlcnNpb24oKSxcbiAgICAgIHRoaXMubW9kZWwuZ2V0TW9kZWxEZWZpbml0aW9uKCkucGx1cmFsLFxuICAgICAgJ2NvdW50J1xuICAgIF0uam9pbignLycpLCB1bmRlZmluZWQsIF91cmxQYXJhbXMsIHVuZGVmaW5lZCwgbnVsbCwgY3VzdG9tSGVhZGVycyk7XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2QgdXBkYXRlQXR0cmlidXRlc1xuICAgKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0OiBqb2huY2FzYXJydWJpYXMsIGdoOiBtZWFuLWV4cGVydC1vZmZpY2lhbD5cbiAgICogQGxpY2Vuc2UgTUlUXG4gICAqIEByZXR1cm4ge09ic2VydmFibGU8VD59XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBHZW5lcmljIHVwZGF0ZUF0dHJpYnV0ZXMgbWV0aG9kXG4gICAqL1xuICBwdWJsaWMgdXBkYXRlQXR0cmlidXRlczxUPihpZDogYW55LCBkYXRhOiBULCBjdXN0b21IZWFkZXJzPzogRnVuY3Rpb24pOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdQVVQnLCBbXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRQYXRoKCksXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRBcGlWZXJzaW9uKCksXG4gICAgICB0aGlzLm1vZGVsLmdldE1vZGVsRGVmaW5pdGlvbigpLnBsdXJhbCxcbiAgICAgICc6aWQnXG4gICAgXS5qb2luKCcvJyksIHsgaWQgfSwgdW5kZWZpbmVkLCB7IGRhdGEgfSwgbnVsbCwgY3VzdG9tSGVhZGVycylcbiAgICAubWFwKChkYXRhOiBUKSA9PiB0aGlzLm1vZGVsLmZhY3RvcnkoZGF0YSkpO1xuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIG9uVXBkYXRlQXR0cmlidXRlc1xuICAgKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0OiBqb2huY2FzYXJydWJpYXMsIGdoOiBtZWFuLWV4cGVydC1vZmZpY2lhbD5cbiAgICogQGxpY2Vuc2UgTUlUXG4gICAqIEByZXR1cm4ge09ic2VydmFibGU8VD59XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBHZW5lcmljIG9uVXBkYXRlQXR0cmlidXRlcyBtZXRob2RcbiAgICovXG4gIHB1YmxpYyBvblVwZGF0ZUF0dHJpYnV0ZXM8VD4oaWQ6IGFueSwgZGF0YTogVCk6IE9ic2VydmFibGU8VD4ge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoJ1BVVCcsIFtcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldFBhdGgoKSxcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldEFwaVZlcnNpb24oKSxcbiAgICAgIHRoaXMubW9kZWwuZ2V0TW9kZWxEZWZpbml0aW9uKCkucGx1cmFsLFxuICAgICAgJzppZCdcbiAgICBdLmpvaW4oJy8nKSwgeyBpZCB9LCB1bmRlZmluZWQsIHsgZGF0YSB9LCB0cnVlKS5tYXAoKGRhdGE6IFQpID0+IHRoaXMubW9kZWwuZmFjdG9yeShkYXRhKSk7XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2QgdXBzZXJ0XG4gICAqIEBhdXRob3IgSm9uYXRoYW4gQ2FzYXJydWJpYXMgPHQ6IGpvaG5jYXNhcnJ1YmlhcywgZ2g6IG1lYW4tZXhwZXJ0LW9mZmljaWFsPlxuICAgKiBAbGljZW5zZSBNSVRcbiAgICogQHJldHVybiB7T2JzZXJ2YWJsZTxUPn1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEdlbmVyaWMgdXBzZXJ0IG1ldGhvZFxuICAgKi9cbiAgcHVibGljIHVwc2VydDxUPihkYXRhOiBhbnkgPSB7fSwgY3VzdG9tSGVhZGVycz86IEZ1bmN0aW9uKTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnUFVUJywgW1xuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0UGF0aCgpLFxuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0QXBpVmVyc2lvbigpLFxuICAgICAgdGhpcy5tb2RlbC5nZXRNb2RlbERlZmluaXRpb24oKS5wbHVyYWwsXG4gICAgXS5qb2luKCcvJyksIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB7IGRhdGEgfSwgbnVsbCwgY3VzdG9tSGVhZGVycylcbiAgICAubWFwKChkYXRhOiBUKSA9PiB0aGlzLm1vZGVsLmZhY3RvcnkoZGF0YSkpO1xuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIG9uVXBzZXJ0XG4gICAqIEBhdXRob3IgSm9uYXRoYW4gQ2FzYXJydWJpYXMgPHQ6IGpvaG5jYXNhcnJ1YmlhcywgZ2g6IG1lYW4tZXhwZXJ0LW9mZmljaWFsPlxuICAgKiBAbGljZW5zZSBNSVRcbiAgICogQHJldHVybiB7T2JzZXJ2YWJsZTxUPn1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEdlbmVyaWMgcHVic3ViIG9uVXBzZXJ0IG1ldGhvZFxuICAgKi9cbiAgcHVibGljIG9uVXBzZXJ0PFQ+KGRhdGE6IGFueSA9IHt9KTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnUFVUJywgW1xuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0UGF0aCgpLFxuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0QXBpVmVyc2lvbigpLFxuICAgICAgdGhpcy5tb2RlbC5nZXRNb2RlbERlZmluaXRpb24oKS5wbHVyYWwsXG4gICAgXS5qb2luKCcvJyksIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB7IGRhdGEgfSwgdHJ1ZSkubWFwKChkYXRhOiBUKSA9PiB0aGlzLm1vZGVsLmZhY3RvcnkoZGF0YSkpO1xuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIHVwc2VydFBhdGNoXG4gICAqIEBhdXRob3IgSm9uYXRoYW4gQ2FzYXJydWJpYXMgPHQ6IGpvaG5jYXNhcnJ1YmlhcywgZ2g6IG1lYW4tZXhwZXJ0LW9mZmljaWFsPlxuICAgKiBAbGljZW5zZSBNSVRcbiAgICogQHJldHVybiB7T2JzZXJ2YWJsZTxUPn1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEdlbmVyaWMgdXBzZXJ0IG1ldGhvZCB1c2luZyBwYXRjaCBodHRwIG1ldGhvZFxuICAgKi9cbiAgcHVibGljIHVwc2VydFBhdGNoPFQ+KGRhdGE6IGFueSA9IHt9LCBjdXN0b21IZWFkZXJzPzogRnVuY3Rpb24pOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdQQVRDSCcsIFtcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldFBhdGgoKSxcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldEFwaVZlcnNpb24oKSxcbiAgICAgIHRoaXMubW9kZWwuZ2V0TW9kZWxEZWZpbml0aW9uKCkucGx1cmFsLFxuICAgIF0uam9pbignLycpLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgeyBkYXRhIH0sIG51bGwsIGN1c3RvbUhlYWRlcnMpXG4gICAgLm1hcCgoZGF0YTogVCkgPT4gdGhpcy5tb2RlbC5mYWN0b3J5KGRhdGEpKTtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBvblVwc2VydFBhdGNoXG4gICAqIEBhdXRob3IgSm9uYXRoYW4gQ2FzYXJydWJpYXMgPHQ6IGpvaG5jYXNhcnJ1YmlhcywgZ2g6IG1lYW4tZXhwZXJ0LW9mZmljaWFsPlxuICAgKiBAbGljZW5zZSBNSVRcbiAgICogQHJldHVybiB7T2JzZXJ2YWJsZTxUPn1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEdlbmVyaWMgcHVic3ViIG9uVXBzZXJ0UGF0Y2ggbWV0aG9kIHVzaW5nIHBhdGNoIGh0dHAgbWV0aG9kXG4gICAqL1xuICBwdWJsaWMgb25VcHNlcnRQYXRjaDxUPihkYXRhOiBhbnkgPSB7fSk6IE9ic2VydmFibGU8VD4ge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoJ1BBVENIJywgW1xuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0UGF0aCgpLFxuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0QXBpVmVyc2lvbigpLFxuICAgICAgdGhpcy5tb2RlbC5nZXRNb2RlbERlZmluaXRpb24oKS5wbHVyYWwsXG4gICAgXS5qb2luKCcvJyksIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB7IGRhdGEgfSwgdHJ1ZSkubWFwKChkYXRhOiBUKSA9PiB0aGlzLm1vZGVsLmZhY3RvcnkoZGF0YSkpO1xuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIHVwc2VydFdpdGhXaGVyZVxuICAgKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0OiBqb2huY2FzYXJydWJpYXMsIGdoOiBtZWFuLWV4cGVydC1vZmZpY2lhbD5cbiAgICogQGxpY2Vuc2UgTUlUXG4gICAqIEByZXR1cm4ge09ic2VydmFibGU8VD59XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBHZW5lcmljIHVwc2VydFdpdGhXaGVyZSBtZXRob2RcbiAgICovXG4gIHB1YmxpYyB1cHNlcnRXaXRoV2hlcmU8VD4od2hlcmU6IGFueSA9IHt9LCBkYXRhOiBhbnkgPSB7fSwgY3VzdG9tSGVhZGVycz86IEZ1bmN0aW9uKTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgbGV0IF91cmxQYXJhbXM6IGFueSA9IHt9O1xuICAgIGlmICh3aGVyZSkgX3VybFBhcmFtcy53aGVyZSA9IHdoZXJlO1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoJ1BPU1QnLCBbXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRQYXRoKCksXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRBcGlWZXJzaW9uKCksXG4gICAgICB0aGlzLm1vZGVsLmdldE1vZGVsRGVmaW5pdGlvbigpLnBsdXJhbCxcbiAgICAgICd1cHNlcnRXaXRoV2hlcmUnXG4gICAgXS5qb2luKCcvJyksIHVuZGVmaW5lZCwgX3VybFBhcmFtcywgeyBkYXRhIH0sIG51bGwsIGN1c3RvbUhlYWRlcnMpXG4gICAgLm1hcCgoZGF0YTogVCkgPT4gdGhpcy5tb2RlbC5mYWN0b3J5KGRhdGEpKTtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBvblVwc2VydFdpdGhXaGVyZVxuICAgKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0OiBqb2huY2FzYXJydWJpYXMsIGdoOiBtZWFuLWV4cGVydC1vZmZpY2lhbD5cbiAgICogQGxpY2Vuc2UgTUlUXG4gICAqIEByZXR1cm4ge09ic2VydmFibGU8VD59XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBHZW5lcmljIHB1YnN1YiBvblVwc2VydFdpdGhXaGVyZSBtZXRob2RcbiAgICovXG4gIHB1YmxpYyBvblVwc2VydFdpdGhXaGVyZTxUPih3aGVyZTogYW55ID0ge30sIGRhdGE6IGFueSA9IHt9KTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgbGV0IF91cmxQYXJhbXM6IGFueSA9IHt9O1xuICAgIGlmICh3aGVyZSkgX3VybFBhcmFtcy53aGVyZSA9IHdoZXJlO1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoJ1BPU1QnLCBbXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRQYXRoKCksXG4gICAgICBMb29wQmFja0NvbmZpZy5nZXRBcGlWZXJzaW9uKCksXG4gICAgICB0aGlzLm1vZGVsLmdldE1vZGVsRGVmaW5pdGlvbigpLnBsdXJhbCxcbiAgICAgICd1cHNlcnRXaXRoV2hlcmUnXG4gICAgXS5qb2luKCcvJyksIHVuZGVmaW5lZCwgX3VybFBhcmFtcywgeyBkYXRhIH0sIHRydWUpLm1hcCgoZGF0YTogVCkgPT4gdGhpcy5tb2RlbC5mYWN0b3J5KGRhdGEpKTtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCByZXBsYWNlT3JDcmVhdGVcbiAgICogQGF1dGhvciBKb25hdGhhbiBDYXNhcnJ1YmlhcyA8dDogam9obmNhc2FycnViaWFzLCBnaDogbWVhbi1leHBlcnQtb2ZmaWNpYWw+XG4gICAqIEBsaWNlbnNlIE1JVFxuICAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPFQ+fVxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogR2VuZXJpYyByZXBsYWNlT3JDcmVhdGUgbWV0aG9kXG4gICAqL1xuICBwdWJsaWMgcmVwbGFjZU9yQ3JlYXRlPFQ+KGRhdGE6IGFueSA9IHt9LCBjdXN0b21IZWFkZXJzPzogRnVuY3Rpb24pOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdQT1NUJywgW1xuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0UGF0aCgpLFxuICAgICAgTG9vcEJhY2tDb25maWcuZ2V0QXBpVmVyc2lvbigpLFxuICAgICAgdGhpcy5tb2RlbC5nZXRNb2RlbERlZmluaXRpb24oKS5wbHVyYWwsXG4gICAgICAncmVwbGFjZU9yQ3JlYXRlJ1xuICAgIF0uam9pbignLycpLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgeyBkYXRhIH0sIG51bGwsIGN1c3RvbUhlYWRlcnMpXG4gICAgLm1hcCgoZGF0YTogVCkgPT4gdGhpcy5tb2RlbC5mYWN0b3J5KGRhdGEpKTtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBvblJlcGxhY2VPckNyZWF0ZVxuICAgKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0OiBqb2huY2FzYXJydWJpYXMsIGdoOiBtZWFuLWV4cGVydC1vZmZpY2lhbD5cbiAgICogQGxpY2Vuc2UgTUlUXG4gICAqIEByZXR1cm4ge09ic2VydmFibGU8VD59XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBHZW5lcmljIG9uUmVwbGFjZU9yQ3JlYXRlIG1ldGhvZFxuICAgKi9cbiAgcHVibGljIG9uUmVwbGFjZU9yQ3JlYXRlPFQ+KGRhdGE6IGFueSA9IHt9KTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnUE9TVCcsIFtcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldFBhdGgoKSxcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldEFwaVZlcnNpb24oKSxcbiAgICAgIHRoaXMubW9kZWwuZ2V0TW9kZWxEZWZpbml0aW9uKCkucGx1cmFsLFxuICAgICAgJ3JlcGxhY2VPckNyZWF0ZSdcbiAgICBdLmpvaW4oJy8nKSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHsgZGF0YSB9LCB0cnVlKS5tYXAoKGRhdGE6IFQpID0+IHRoaXMubW9kZWwuZmFjdG9yeShkYXRhKSk7XG4gIH1cbiAgLyoqXG4gICAqIEBtZXRob2QgcmVwbGFjZUJ5SWRcbiAgICogQGF1dGhvciBKb25hdGhhbiBDYXNhcnJ1YmlhcyA8dDogam9obmNhc2FycnViaWFzLCBnaDogbWVhbi1leHBlcnQtb2ZmaWNpYWw+XG4gICAqIEBsaWNlbnNlIE1JVFxuICAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPFQ+fVxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogR2VuZXJpYyByZXBsYWNlQnlJZCBtZXRob2RcbiAgICovXG4gIHB1YmxpYyByZXBsYWNlQnlJZDxUPihpZDogYW55LCBkYXRhOiBhbnkgPSB7fSwgY3VzdG9tSGVhZGVycz86IEZ1bmN0aW9uKTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnUE9TVCcsIFtcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldFBhdGgoKSxcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldEFwaVZlcnNpb24oKSxcbiAgICAgIHRoaXMubW9kZWwuZ2V0TW9kZWxEZWZpbml0aW9uKCkucGx1cmFsLFxuICAgICAgJzppZCcsICdyZXBsYWNlJ1xuICAgIF0uam9pbignLycpLCB7IGlkIH0sIHVuZGVmaW5lZCwgeyBkYXRhIH0sIG51bGwsIGN1c3RvbUhlYWRlcnMpXG4gICAgLm1hcCgoZGF0YTogVCkgPT4gdGhpcy5tb2RlbC5mYWN0b3J5KGRhdGEpKTtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBvblJlcGxhY2VCeUlkXG4gICAqIEBhdXRob3IgSm9uYXRoYW4gQ2FzYXJydWJpYXMgPHQ6IGpvaG5jYXNhcnJ1YmlhcywgZ2g6IG1lYW4tZXhwZXJ0LW9mZmljaWFsPlxuICAgKiBAbGljZW5zZSBNSVRcbiAgICogQHJldHVybiB7T2JzZXJ2YWJsZTxUPn1cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEdlbmVyaWMgb25SZXBsYWNlQnlJZCBtZXRob2RcbiAgICovXG4gIHB1YmxpYyBvblJlcGxhY2VCeUlkPFQ+KGlkOiBhbnksIGRhdGE6IGFueSA9IHt9KTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnUE9TVCcsIFtcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldFBhdGgoKSxcbiAgICAgIExvb3BCYWNrQ29uZmlnLmdldEFwaVZlcnNpb24oKSxcbiAgICAgIHRoaXMubW9kZWwuZ2V0TW9kZWxEZWZpbml0aW9uKCkucGx1cmFsLFxuICAgICAgJzppZCcsICdyZXBsYWNlJ1xuICAgIF0uam9pbignLycpLCB7IGlkIH0sIHVuZGVmaW5lZCwgeyBkYXRhIH0sIHRydWUpLm1hcCgoZGF0YTogVCkgPT4gdGhpcy5tb2RlbC5mYWN0b3J5KGRhdGEpKTtcbiAgfVxuICAvKipcbiAgICogQG1ldGhvZCBjcmVhdGVDaGFuZ2VTdHJlYW1cbiAgICogQGF1dGhvciBKb25hdGhhbiBDYXNhcnJ1YmlhcyA8dDogam9obmNhc2FycnViaWFzLCBnaDogbWVhbi1leHBlcnQtb2ZmaWNpYWw+XG4gICAqIEBsaWNlbnNlIE1JVFxuICAgKiBAcmV0dXJuIHtPYnNlcnZhYmxlPGFueT59XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBHZW5lcmljIGNyZWF0ZUNoYW5nZVN0cmVhbSBtZXRob2RcbiAgICovXG4gIHB1YmxpYyBjcmVhdGVDaGFuZ2VTdHJlYW0oKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBsZXQgc3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgaWYgKHR5cGVvZiBFdmVudFNvdXJjZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGxldCBlbWl0ICAgPSAobXNnOiBhbnkpID0+IHN1YmplY3QubmV4dChKU09OLnBhcnNlKG1zZy5kYXRhKSk7XG4gICAgICB2YXIgc291cmNlID0gbmV3IEV2ZW50U291cmNlKFtcbiAgICAgICAgTG9vcEJhY2tDb25maWcuZ2V0UGF0aCgpLFxuICAgICAgICBMb29wQmFja0NvbmZpZy5nZXRBcGlWZXJzaW9uKCksXG4gICAgICAgIHRoaXMubW9kZWwuZ2V0TW9kZWxEZWZpbml0aW9uKCkucGx1cmFsLFxuICAgICAgICAnY2hhbmdlLXN0cmVhbSdcbiAgICAgIF0uam9pbignLycpKTtcbiAgICAgIHNvdXJjZS5hZGRFdmVudExpc3RlbmVyKCdkYXRhJywgZW1pdCk7XG4gICAgICBzb3VyY2Uub25lcnJvciA9IGVtaXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybignU0RLIEJ1aWxkZXI6IEV2ZW50U291cmNlIGlzIG5vdCBzdXBwb3J0ZWQnKTsgXG4gICAgfVxuICAgIHJldHVybiBzdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG4gIC8qKlxuICAgKiBAbWV0aG9kIGdldE1vZGVsTmFtZVxuICAgKiBAYXV0aG9yIEpvbmF0aGFuIENhc2FycnViaWFzIDx0OiBqb2huY2FzYXJydWJpYXMsIGdoOiBtZWFuLWV4cGVydC1vZmZpY2lhbD5cbiAgICogQGxpY2Vuc2UgTUlUXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEFic3RyYWN0IGdldE1vZGVsTmFtZSBtZXRob2RcbiAgICovXG4gIGFic3RyYWN0IGdldE1vZGVsTmFtZSgpOiBzdHJpbmc7XG59XG4iXX0=