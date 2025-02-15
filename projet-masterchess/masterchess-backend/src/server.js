import express from "express";
import path from "path"; 
import { fileURLToPath } from "url";

const app = express(); 
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

const server = app.listen(4000, function() { 
    console.log("serveur fonctionne sur 4000... ! "); 
});

app.get("/", function (req, res) {
    res.send("serveur fonctionne");
});