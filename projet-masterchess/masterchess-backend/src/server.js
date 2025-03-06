import express from "express";
import http from "http";
import mysql from "mysql2/promise";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from 'bcrypt';
import Session from 'react-session';
import session from "express-session";

import path from "path"; 
import { fileURLToPath } from "url";

import JeuService from "./jeu/JeuService.js";



const app = express(); 
const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

app.use(session({
    secret: 'pass_chessmaster_word58325', // Password for signing cookies (pls feel free modify it or crypt it_
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // (feel free to modify) max time to save (ms x min x hour x day x week)
    },
}));

const mymysql = await mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    database: "projet_chess",
    password: "",
    multipleStatements: true
});

const jeuService = new JeuService(server, await mymysql);
const partiesService = new PartiesService(await mymysql);

server.listen(4000, function() {
    console.log("serveur fonctionne sur 4000... ! "); 
});

app.use(cors());
app.use(bodyParser.json());

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
}

app.get("/", function (req, res) {
    res.send("serveur fonctionne");
});

// affichage liste de jeux

// Add isAuthenticated middleware to the route if you want to only be accessed to user that logged in
app.get("/getAllPartiesEncours", isAuthenticated, async function (req, res, err) {
    const result = await jeuService.getAllPartiesEncours();
    res.send(result);
});

// page du jeu

app.get("/getPartie", isAuthenticated, async function (req, res, err) {
    const result = await jeuService.getPartie(req.query.id);
    res.send(result);
});

app.get("/getProfiljeu", isAuthenticated, async function (req, res, err) {
    const result = await jeuService.getProfiljeu(req.query.id);
    res.send(result);
});

app.post("/createPartie", isAuthenticated, async function (req, res, err) {
    const result = await jeuService.createPartie(req.body.idprofiljeu1, req.body.idprofiljeu2);
    res.send(result);
});

app.post('/login', async function (req, res) {
    const { username, password } = req.body;
    try {
        const [results] = await mymysql.query('SELECT * FROM usager WHERE compte = ?;', [username]);
        if (results.length > 0) {
            const user = results[0];
            console.log('User:', user); // Log the user object
            console.log('Input Password:', password); // Log the input password
            console.log('Stored Password:', user.motdepasse); // Log the stored password
            if (password.trim() === user.motdepasse.trim()) {
                req.session.user = { id: user.id, username: user.compte };
                res.json({ success: true, message: 'Login successful', sesson_id: req.sessionID, cookie: req.session.cookie });
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

        // Insert the new user along with the session ID into the database
        const [results] = await mymysql.query(
            'INSERT INTO usager (compte, motdepasse, courriel, datecreation, session_id) VALUES (?, ?, ?, NOW(), ?)',
            [username, password, email, sessionId]
        );

        // Retrieve the newly created user
        const [userResults] = await mymysql.query('SELECT * FROM usager WHERE compte = ?;', [username]);
        const user = userResults[0];

        // Set session data
        req.session.user = { id: user.id, username: user.compte };

        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});

app.post('/logout', function (req, res) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed', error: err });
        }
        res.json({ success: true, message: 'Logout successful' });
    });
});
