import express from "express";
import https from "https";
import fs from "fs";
import mysql from "mysql2/promise";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from 'bcrypt';
import session from "express-session";

import path from "path"; 
import { fileURLToPath } from "url";

import ComptesService from "./comptes/ComptesService.js";
import PartiesService from "./jeu/PartiesService.js"
import JeuService from "./jeu/JeuService.js";
import ServiceCours from "./cours/ServiceCours.js";

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

const app = express(); 

const privateKey = fs.readFileSync(path.join(__dirname, 'localhost-key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'localhost.pem'), 'utf8');
var options = { key: privateKey, cert: certificate };

const server = https.createServer(options, app);

const mymysql = await mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    database: "projet_chess",
    password: "",
    multipleStatements: true
});

const corsOptions = { 
    origin: ['https://10.186.5.123:4000', 'https://10.0.0.228:4000', 'https://localhost:4000'],//https://10.186.5.123:3000', 'https://10.0.0.228:3000', 'https://localhost:3000'], //< Change domain to suit your needs
    credentials: true
};

const sessionMiddleware = session({
    secret: 'pass_chessmaster_word58325', // Password for signing cookies (pls feel free modify it or crypt it_
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: false,
        secure: true,
        sameSite: "strict",
        partitioned: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // (feel free to modify) max time to save (ms x min x hour x day x week)
    }
})

const jeuService = new JeuService(server, await mymysql, sessionMiddleware, corsOptions);
const partiesService = new PartiesService(await mymysql);
const comptesService = new ComptesService(await mymysql);
const serviceCours = new ServiceCours(mymysql);
server.listen(4000, function() {
    console.log("serveur fonctionne sur 4000... ! "); 
});

// reactjs serve static
app.use(express.static(path.join(__dirname, '/../../masterchess-frontend/build'))); // this is where your built react js files are

app.use(cors(corsOptions));
app.use(function(req, res, next) {
    //res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.set("trust proxy", true);

app.use(bodyParser.json());
app.use(sessionMiddleware);

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/../../masterchess-frontend/build/index.html'));
});

// gestion de session

app.post('/login', async function (req, res) {
    const { username, password } = req.body;
    try {
        const user = await comptesService.selectUsager(username);
        if (user) {
            //console.log('User:', user); // Log the user object
            //console.log('Input Password:', password); // Log the input password
            //console.log('Stored Password:', user.motdepasse); // Log the stored password
            if (password.trim() === user.motdepasse.trim()) {
                req.session.user = { id: user.id, username: user.compte, usager: user };
                delete req.session.user.usager.motdepasse;
                comptesService.updateSessionUsager(username, req.session.id);
                req.session.save();
                res.json({ success: true, message: 'Login successful', session_id: req.sessionID, cookie: req.session.cookie });
                console.log('Logged in session data:', req.session.user.usager.compte); // Log the stored password
            } else {
                console.log('Invalid password:', user.motdepasse); // Log the password
                res.json({ success: false, message: 'Invalid password'});
            }
        } else {
            res.json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Server error:', error); // Log the error
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});

app.post("/signup", async function (req, res) {
    const { username, password, email } = req.body;
    try {
        // Generate a session ID
        const sessionId = req.sessionID;
    
        // Get country code by api
        var country_code = await comptesService.getCountryCode(req.ip.split("::ffff:")[1]);

        // Insert into the database the user
        const results = await comptesService.insertUsager(username, password, email, country_code, sessionId);

        // Retrieve the newly created user
        const user = await comptesService.selectUsager(username);

        // Set session data
        req.session.user = { id: user.id, username: user.compte, usager: user };

        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});

app.post('/logout', async function (req, res) {
    await comptesService.updateSessionUsager(req.session?.user?.usager?.compte, null);
    req.session.destroy(async (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed', error: err });
        }
    });
    res.json({ success: true, message: 'Logout successful' });
});

app.get("/getSession", async function (req, res) {
    res.json({ success: true, message: 'Data requested', usager: req.session?.user?.usager});
});

// affichage liste de jeux

// Add isAuthenticated middleware to the route if you want to only be accessed to user that logged in
app.get("/getAllPartiesEncours", isAuthenticated, async function (req, res, err) {
    const resultat = await partiesService.selectAllPartiesEncours();
    res.send({ success: true, message: 'Data requested', result: resultat});
});

// page du jeu

app.get("/getPartie", isAuthenticated, async function (req, res, err) {
    const resultat = await jeuService.selectPartie(req.query.id);
    res.send({ success: true, message: 'Data requested', result: resultat});
});

app.get("/getProfiljeu", isAuthenticated, async function (req, res, err) {
    const resultat = await jeuService.selectProfiljeu(req.query.id);
    res.send({ success: true, message: 'Data requested', result: resultat});
});

app.post("/createPartie", isAuthenticated, async function (req, res, err) {
    const resultat = await jeuService.createPartie(req.body.nomprofiljeu1, req.body.nomprofiljeu2);
    res.send({ success: true, message: 'Data requested', result: resultat});
});


// Cours
app.get("/getLessons", async (req, res) => {
    try {
      const lessons = await serviceCours.getAllLessons();
      res.json(lessons);
    } catch (error) {
      console.error("Erreur dans /getLessons:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des cours." });
    }
  });