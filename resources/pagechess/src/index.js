import express from "express";
import path from "path"; 
import { fileURLToPath } from "url";

const app = express(); 
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

const server = app.listen(4000, function() { 
    console.log("serveur fonctionne sur 4000... ! "); 
    });

app.use("/css", express.static(__dirname + "/views/css"));
app.use("/style", express.static(__dirname + "/views/style"));

app.set("views", path.join(__dirname, "views")); 
app.set("view engine", "ejs");

app.get("/", function (req, res) {
    res.render("test");
});