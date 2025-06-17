const passport = require("passport");
const mongoose = require("mongoose");

const User = mongoose.model("users");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

//1096204226532-ktn75c7brhf7vt6ugs2na30ptg3rhkod.apps.googleusercontent.com
//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
passport.use(
  new GoogleStrategy(   // Tells passport to use google for authentication
    {
      clientID:
        "1001961139920-dehkdpfe4opt1d1dhn3h3tjso11t2knq.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const newUser = {
        googleID: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        image: profile.photos[0].value,
      };

      try {
        let user = await User.findOne({ googleID: profile.id });
        if (user) {
          // User Exists
          console.log("Exist", user);
          done(null, user);  //goes to serializeUser function(below).done takes error and user. 
        } else {
          // Sign up for the first time
          user = await User.create(newUser);
          console.log("New", user);
          done(null, user);
        }
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

//This creates a session in the database with id of the user and cookie corresponding
//to that particular session is stored in browser.
passport.serializeUser((user, done) => {
  done(null, user.id);  //goes to deserializeUser()
});

//It extracts the user from the cookie and get access to user in req object.i.e., req.user
passport.deserializeUser(async (id, done) => { 
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
