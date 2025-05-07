import express from "express";
import https from "https";
import { Server } from "socket.io";
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
import TrouverPartiesService from "./jeu/TrouverPartiesService.js";
import ServiceCours from "./cours/ServiceCours.js";
import connectDB from "./mongodb.js";



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



const mongoDB = await connectDB();



const corsOptions = {
    origin: ['https://10.186.5.123:4000', 'https://10.0.0.228:4000', 'https://localhost:4000'],//< Change domain to suit your needs
    methods: ["GET", "POST"],
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



var myio = new Server(server, {
    transports: ["websocket"],
    cors: corsOptions
});
myio.engine.use(sessionMiddleware);



const jeuService = new JeuService(myio, mymysql);
const partiesService = new PartiesService(mymysql);
const trouverPartiesService = new TrouverPartiesService(myio, mymysql, partiesService);
const comptesService = new ComptesService(mymysql);
const serviceCours = new ServiceCours(mongoDB);



server.listen(4000, function () {
    console.log("masterchess-backend en service sur https://localhost:4000");
});



// reactjs serve static
app.use(express.static(path.join(__dirname, '/../../masterchess-frontend/build'))); // this is where your built react js files are



app.use(cors(corsOptions));
app.use(function (req, res, next) {
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



const router = express.Router();



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/../../masterchess-frontend/build/index.html'), function (err) {
        if (err) {
            res.status(500).send(err)
        }
    });
});



// gestion de session



router.post('/login', async function (req, res) {
    const { username, password } = req.body;
    try {
        const user = await comptesService.selectUsager(username);
        if (user) {
            if (password.trim() === user.motdepasse.trim()) {
                req.session.user = { id: user.id, username: user.compte, usager: user };
                delete req.session.user.usager.motdepasse;
                comptesService.updateSessionUsager(username, req.session.id);
                req.session.save();
                res.json({ success: true, message: 'Login successful', session_id: req.sessionID, cookie: req.session.cookie });
                console.log('Logged in:', req.session.user.usager.compte);
            } else {
                console.log('Invalid password:', user.compte);
                res.json({ success: false, message: 'Invalid password' });
            }
        } else {
            res.json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});



router.post("/signup", async function (req, res) {
    const { username, password, email } = req.body;
    try {
        const sessionId = req.sessionID;
        var country_code = await comptesService.getCountryCode(req.ip.split("::ffff:")[1]);
        const results = await comptesService.insertUsager(username, password, email, country_code, sessionId);
        const user = await comptesService.selectUsager(username);
        req.session.user = { id: user.id, username: user.compte, usager: user };
        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});



router.post('/logout', async function (req, res) {
    await comptesService.updateSessionUsager(req.session?.user?.usager?.compte, null);
    req.session.destroy(async (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed', error: err });
        }
    });
    res.json({ success: true, message: 'Logout successful' });
});



router.get("/getSession", async function (req, res) {
    res.json({ success: true, message: 'Data requested', usager: req.session?.user?.usager });
});



router.get("/getAllPartiesEncours", isAuthenticated, async function (req, res, err) {
    const resultat = await partiesService.selectAllPartiesEncours();
    res.send({ success: true, message: 'Data requested', result: resultat });
});



router.get("/getPartie", isAuthenticated, async function (req, res, err) {
    const resultat = await jeuService.selectPartie(req.query.id);
    res.send({ success: true, message: 'Data requested', result: resultat });
});



router.get("/getProfiljeu", isAuthenticated, async function (req, res, err) {
    const resultat = await jeuService.selectProfiljeu(req.query.id);
    res.send({ success: true, message: 'Data requested', result: resultat });
});



router.post("/createPartie", isAuthenticated, async function (req, res, err) {
    const resultat = await partiesService.createPartie(req.body.nomprofiljeu1, req.body.nomprofiljeu2);
    res.send({ success: true, message: 'Data requested', result: resultat });
});



router.get("/getLessons", async (req, res) => {
    try {
        const lessons = await serviceCours.getAllLessons();
        res.json(lessons);
    } catch (error) {
        console.error("Erreur dans /getLessons:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des cours." });
    }
});



app.use('/data', router);



app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/../../masterchess-frontend/build/index.html'), function (err) {
        if (err) {
            res.status(500).send(err)
        }
    });
});
