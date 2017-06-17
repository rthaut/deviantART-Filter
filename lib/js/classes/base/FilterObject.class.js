/**
 * Base object for filterable deviantART objects
 */
class FilterObject {

    /**
     * Constructor
     * @param {String} [objectName]
     * @param {Array} [objectProperties=[]]
     * @param {Array} [uniqueProperties=[]]
     */
    constructor(objectName = 'FilterObject', objectProperties = [], uniqueProperties = []) {
        this._objectName = objectName;
        this._objectProperties = objectProperties;
        this._uniqueProperties = uniqueProperties;
    }

    /**
     * Determines if the FilterObject has all stored properties populated
     * @returns {Boolean}
     */
    isComplete() {
        console.log(this._objectName + '.isComplete()');

        var ret = true;

        for (var i = 0; i < this._objectProperties.length; i++) {
            console.log(this._objectName + '.isComplete() :: ' + this._objectProperties[i], this[this._objectProperties[i]]);
            ret = ret && (typeof this[this._objectProperties[i]] !== 'undefined' && this[this._objectProperties[i]] !== null);
        }

        console.log(this._objectName + '.isComplete() :: Return', ret);
        return ret;
    }

    /**
     * Determines if the FilterObject has at least one stored property populated
     * @returns {Boolean}
     */
    isValid() {
        console.log(this._objectName + '.isValid()');

        var ret = false;

        for (var i = 0; i < this._objectProperties.length; i++) {
            console.log(this._objectName + '.isComplete() :: ' + this._objectProperties[i], this[this._objectProperties[i]]);
            ret = ret || (typeof this[this._objectProperties[i]] !== 'undefined' && this[this._objectProperties[i]] !== null);
        }

        console.log(this._objectName + '.isValid() :: Return', ret);
        return ret;
    }

    /**
     * Used by JSON.stringify to return a custom representation of the FilterObject
     * Needed to only store the "public" properties
     * @returns {Object}
     */
    toJSON() {
        console.log(this._objectName + '.toJSON()');

        var data = {};

        for (var i = 0; i < this._objectProperties.length; i++) {
            data[this._objectProperties[i]] = this[this._objectProperties[i]];
        }

        console.log(this._objectName + '.toJSON() :: Return', data);
        return data;
    }
}
