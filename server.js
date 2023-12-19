const path = require("path")
const express = require("express");
const app = express();

const PORT = 3000;

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"public","index.html"));
})

app.listen(PORT,()=>{
    console.log("Server running on PORT:3000");
})