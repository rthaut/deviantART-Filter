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
        console.group(this._objectName + '.isComplete()');

        var ret = true;

        for (var i = 0; i < this._objectProperties.length; i++) {
            console.log(this._objectProperties[i], this[this._objectProperties[i]]);
            ret = ret && (typeof this[this._objectProperties[i]] !== 'undefined' && this[this._objectProperties[i]] !== null);
        }

        console.log('Return', ret);
        console.log('Complete');
        console.groupEnd();

        return ret;
    }

    /**
     * Determines if the FilterObject has at least one stored property populated
     * @returns {Boolean}
     */
    isValid() {
        console.group(this._objectName + '.isValid()');

        var ret = false;

        for (var i = 0; i < this._objectProperties.length; i++) {
            console.log(this._objectProperties[i], this[this._objectProperties[i]]);
            ret = ret || (typeof this[this._objectProperties[i]] !== 'undefined' && this[this._objectProperties[i]] !== null);
        }

        console.log('Return', ret);
        console.log('Complete');
        console.groupEnd();

        return ret;
    }
}
