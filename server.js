const fs = require("fs");
const https = require("https");
const path = require("path")
const express = require("express");
const helmet = require("helmet");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");

require("dotenv").config();

const app = express();
const PORT = 3000;
const config = {
    CLIENT_ID:process.env.CLIENT_ID,
    CLIENT_SECRET:process.env.CLIENT_SECRET,
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

passport.use(new Strategy(AUTH_OPTIONS,verfiyCallback))
app.use(helmet());
app.use(passport.initialize());

function checkLoggedIn(req,res,next)
{
    const isLoggedIn = true;
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
        session:false,
}),
(req,res)=>{
    console.log("Goolgle call us back");
});

app.get("/failure",(req,res)=>{
    return res.send("Failed to log in!!!");
})

app.get("/auth/logout",(req,res)=>{

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