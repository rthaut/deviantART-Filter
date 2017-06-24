/* global FilterObject */

/**
 * User object represents a deviantART user (a.k.a. deviant)
 * @extends FilterObject
 */
class UserObject extends FilterObject {

    /**
     * Constructor
     * @param {Object} properties
     */
    constructor(properties) {
        super('User', ['username'], ['username']);

        this.username = properties.username.toLowerCase();
    }
}
