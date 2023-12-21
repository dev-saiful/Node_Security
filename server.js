const fs = require("fs");
const https = require("https");
const path = require("path")
const express = require("express");
const helmet = require("helmet");

const app = express();
const PORT = 3000;

app.use(helmet());

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

app.get("/auth/google",(req,res)=>{

});

app.get("/auth/google/callback",(req,res)=>{

});

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