const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../util/validators");
const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");

// Create Temp Token For User
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
};

module.exports = {
  Mutation: {
    // Mutation to Login User
    async login(_, { username, password }) {
      //('../../util/validators')
      const { errors, valid } = validateLoginInput(username, password);

      // Check to see if user input follows our validation rules in ('../../util/validators')
      if (!valid) {
        throw new UserInputError("Errors", { errors }); // import from apollo-server node module
      }

      // Query to find an argument, username
      const user = await User.findOne({ username });

      // Check if the user exist in the DB
      if (!user) {
        errors.general = "User not found"; // if user not found then errors should output
        throw new UserInputError("User not found", { errors });
      }

      // compare user input password with password associated with the user
      const match = await bcrypt.compare(password, user.password);

      // Check if password in DB matched user inputted password
      if (!match) {
        errors.general = "Password Incorrect"; // if input password does not match DB password
        throw new UserInputError("Password Incorrect", { errors });
      }

      // create temp user token if everything passes
      const token = generateToken(user);
      // If everything passes, return the user and token.
      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },

    // Mutation to Register User
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      // Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      ); //
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      // Make sure user does not already exist
      const user = await User.findOne({ username });

      // Check if the registered username is already in the DB
      if (user) {
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }
      // Hash pass before enter in DB and create an auth token
      password = await bcrypt.hash(password, 12);

      // Create a new user
      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });

      //Save new user to the variable 'res' short for result
      const res = await newUser.save();

      // Generate a temp token using the 'res' or new user data. id, email, username, secret_key
      const token = generateToken(res);

      // If everything passes, return the user and token.
      return {
        ...res._doc, // Spread out everything in the 'res'/newUser object.
        id: res._id,
        token,
      };
    },
  },

  Query: {
    // Query to retrieve a list of all users
    async getUsers() {
      try {
        const users = await User.find(); // Gets a list of all Users
        return users;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
