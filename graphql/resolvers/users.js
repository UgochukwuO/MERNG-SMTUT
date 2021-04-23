const User = require('../../models/User')

module.exports = {
    Mutation: {
        register(_, args, context, info) {
            // TODO: Validate user data
            // TODO: Make sure user does not already exist
            // TODO: Hash pass before enter in DB and create an auth token
        }
    }
}