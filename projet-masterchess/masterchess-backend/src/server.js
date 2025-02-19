import express from "express";
import mysql from "mysql";
import cors from "cors";
import path from "path"; 
import { fileURLToPath } from "url";

const app = express(); 
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

const server = app.listen(4000, function() { 
    console.log("serveur fonctionne sur 4000... ! "); 
});

var con = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "dev_chess",
    database: "projet_chess",
    password: "developpement"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

app.use(cors());

app.get("/", function (req, res) {
    res.send("serveur fonctionne");
});

app.get("/partie", function (req, res, err) {    
    con.query("SELECT * FROM partie WHERE id = ?", [req.query.id], function (err, result, fields) {
        if (err) throw err;
        res.send(result[0]);
    });
});

app.get("/profilJoueur", function (req, res, err) {    
    con.query("SELECT * FROM profiljeu JOIN usager ON profiljeu.id_usager = usager.id WHERE profiljeu.id = ?", [req.query.id], function (err, result, fields) {
        if (err) throw err;
        res.send(result[0]);
    });
});