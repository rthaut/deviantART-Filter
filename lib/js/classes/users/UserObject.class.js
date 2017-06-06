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

    /**
     * Used by JSON.stringify to return a custom representation
     * Needed to only store the "public" properties
     */
    //@TODO this can probably be done dynamically on the FilterObject base class using the 'objectProperties' array
    toJSON() {
        return { username: this.username };
    }
}
