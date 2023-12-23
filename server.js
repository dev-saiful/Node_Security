const fs = require("fs");
const https = require("https");
const path = require("path")
const express = require("express");
const helmet = require("helmet");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const cookieSession = require("cookie-session");

require("dotenv").config();
const PORT = 3000;
const config = {
    CLIENT_ID:process.env.CLIENT_ID,
    CLIENT_SECRET:process.env.CLIENT_SECRET,
    COOKIE_SESSION_KEY_1:process.env.COOKIE_SESSION_KEY_1,
    COOKIE_SESSION_KEY_2:process.env.COOKIE_SESSION_KEY_2,
}

const AUTH_OPTIONS = {
    callbackURL:"/auth/google/callback",
    clientID:config.CLIENT_ID,
    clientSecret:config.CLIENT_SECRET,
};

function verfiyCallback(accessToken,refreshToken,profile,done)
{
    console.log("Google Profile",profile);
    done(null,profile);
}

passport.use(new Strategy(AUTH_OPTIONS,verfiyCallback));
// save session in cookie
passport.serializeUser((user,done)=>{
    console.log("user",user.id);
    done(null,user.id);
});

// Read session from cookie
passport.deserializeUser((id,done)=>{
    done(null,id);
});
const app = express();


app.use(helmet());
app.use(cookieSession({
    keys: [config.COOKIE_SESSION_KEY_1,config.COOKIE_SESSION_KEY_2],
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use((req, res, next) => {
    // Stub out missing regenerate and save functions.
    // These don't make sense for client side sessions.
    if (req.session && !req.session.regenerate) {
      req.session.regenerate = (cb) => {
        cb();
      };
    }
    if (req.session && !req.session.save) {
      req.session.save = (cb) => {
        cb();
      };
    }
    next();
  });
app.use(passport.initialize());
app.use(passport.session());

function checkLoggedIn(req,res,next)
{
    const isLoggedIn = req.isAuthenticated() && req.user;
    if(!isLoggedIn)
    {
        return res.status(401).json({
            error:"Must be Log in",
        });
    }
    next();
}

app.get("/secret",checkLoggedIn,(req,res)=>{
    res.send("This is secret");
});

app.get("/auth/google",passport.authenticate("google",{
    scope:["email"],
}));

app.get("/auth/google/callback",
    passport.authenticate("google",{
        failureRedirect:"/failure",
        successRedirect:"/",
        session:true,
}),
(req,res)=>{
    console.log("Goolgle call us back");
});

app.get("/failure",(req,res)=>{
    return res.send("Failed to log in!!!");
})

app.get("/auth/logout",(req,res)=>{
    req.logout(()=>{});
    return res.redirect("/");
});


app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"public","index.html"));
});

https.createServer({
    key:fs.readFileSync("key.pem"),
    cert:fs.readFileSync("cert.pem"),
},app).listen(PORT,()=>{
    console.log("Server running on PORT:3000");
});