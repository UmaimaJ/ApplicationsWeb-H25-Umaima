import express from "express";
import http from "http";
import mysql from "mysql";
import cors from "cors";
import bodyParser from "body-parser";

import path from "path"; 
import { fileURLToPath } from "url";

import JeuService from "./jeu/JeuService.js";


const app = express(); 
const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

var con = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "dev_chess",
    database: "projet_chess",
    password: "developpement",
    multipleStatements: true
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

const jeuService = new JeuService(server, con);

server.listen(4000, function() { 
    console.log("serveur fonctionne sur 4000... ! "); 
});

app.use(cors());
app.use(bodyParser.json());

app.get("/", function (req, res) {
    res.send("serveur fonctionne");
});

app.get("/getAllPartiesEncours", async function (req, res, err) {
    await jeuService.getAllPartiesEncours((result) => {
        res.send(result);
    });
});

app.get("/getPartie", async function (req, res, err) {
    await jeuService.getPartie(req.query.id, (result) => {
        res.send(result);
    });
});

app.get("/getProfiljeu", async function (req, res, err) {   
    await jeuService.getProfiljeu(req.query.id, (result) => {
        res.send(result);
    }); 
});

app.post("/createPartie", async function (req, res, err) {   
    await jeuService.createPartie(req.body.idprofiljeu1, req.body.idprofiljeu2, (result) => {
        res.send(result);
    }); 
});