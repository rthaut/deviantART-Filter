/* global FilterObject */

/**
 * User object represents a deviantART user (a.k.a. deviant)
 * @extends FilterObject
 */
class UserObject extends FilterObject {

    /**
     * Constructor
     * @param {String} username
     */
    constructor(username) {
        super('User', ['username'], ['username']);

        this.username = username.toLowerCase();
    }
}
