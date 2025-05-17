import express from "express";
import https from "https";
import { Server } from "socket.io";
import fs from "fs";
import mysql from "mysql2/promise";
import { MongoClient } from "mongodb";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from 'bcrypt';
import session from "express-session";
//import Stripe from 'stripe';

import path from "path";
import { fileURLToPath } from "url";

import ComptesService from "./comptes/ComptesService.js";
import PartiesService from "./jeu/PartiesService.js"
import JeuService from "./jeu/JeuService.js";
import TrouverPartiesService from "./jeu/TrouverPartiesService.js";
import ServiceCours from "./cours/ServiceCours.js";
import ProfiljeuService from "./jeu/ProfiljeuService.js";

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

const mymongo = new MongoClient("mongodb://localhost:27017/");
await mymongo.connect();

const mymongodb = mymongo.db("projet_chess");

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

/*const stripe = new Stripe("", {
    apiVersion: '2025-03-31.basil',
});*/

const jeuService = new JeuService(myio, mymysql);
const partiesService = new PartiesService(mymysql);
const trouverPartiesService = new TrouverPartiesService(myio, mymysql, partiesService);
const comptesService = new ComptesService(mymysql);
const serviceCours = new ServiceCours(mymongodb);
const profiljeuService = new ProfiljeuService(mymysql);
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
                req.session.user.usager.rechercheencours = 0;
                req.session.save();
                res.json({ success: true, message: 'Login successful', session_id: req.sessionID, cookie: req.session.cookie });
                console.log('Logged in:', req.session.user.usager.compte); // Log the stored password
            } else {
                console.log('Invalid password:', user.compte); // Log the invalid attempt
                res.json({ success: false, message: 'Invalid password' });
            }
        } else {
            res.json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Server error:', error); // Log the error
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});

router.post("/signup", async function (req, res) {
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

// affichage liste de jeux

router.get("/getAllPartiesEncours", isAuthenticated, async function (req, res, err) {
    const resultat = await partiesService.selectAllPartiesEncours();
    res.send({ success: true, message: 'Data requested', result: resultat });
});

// affichage profil

router.get("/getProfiljeuProfil", isAuthenticated, async function (req, res, err) {
    const resultat = await profiljeuService.selectProfiljeuProfil(req.query.id);
    res.send({ success: true, message: 'Data requested', result: resultat });
});

// page du jeu

router.get("/getPartie", isAuthenticated, async function (req, res, err) {
    const resultat = await jeuService.selectPartie(req.query.id);
    res.send({ success: true, message: 'Data requested', result: resultat });
});

router.get("/getProfiljeu", isAuthenticated, async function (req, res, err) {
    if (!req.query.id)
        throw new Error("route: query.id not received");
    const resultat = await jeuService.selectProfiljeu(req.query.id);
    res.send({ success: true, message: 'Data requested', result: resultat });
});

router.post("/createPartie", isAuthenticated, async function (req, res, err) {
    try {
        if (!req.body.nomprofiljeu1)
            throw new Error("route: body.nomprofiljeu1 not received");

        if (!req.body.nomprofiljeu2)
            throw new Error("route: body.nomprofiljeu2 not received");

        const profiljeu1 = await partiesService.selectProfiljeuByCompte(req.body.nomprofiljeu1);

        if (!profiljeu1)
            throw new Error("createPartie: profiljeu 1 invalid");

        const profiljeu2 = await partiesService.selectProfiljeuByCompte(req.body.nomprofiljeu2);

        if (!profiljeu2)
            throw new Error("createPartie: profiljeu 2 invalid");

        const resultat = await partiesService.createPartie(profiljeu1.id, profiljeu2.id);
        res.send({ success: true, message: 'Data requested', result: resultat });
    }
    catch (err) {
        res.status(400).send({ success: false, message: err.message, result: null });
    }
});

// Checkout achat gems

/*router.post('/CreateCheckoutSession', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'cad',
                    product_data: {
                        name: '1000 gems',
                    },
                    unit_amount: 500,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        ui_mode: 'custom',
        return_url: 'https://localhost:4000/data/RetourCharger?session_id={CHECKOUT_SESSION_ID}'
    });

    res.json({ checkoutSessionClientSecret: session.client_secret });
});



router.get('/RetourCharger', async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req?.query?.session_id);
    if(!session)
        res.status(400).send({ success: false, message: "Le serveur n'a pas reussi à obtenir la session Stripe avec cet id.", result: null });

    const pointsAjout = 1000;
    const nouveauxPoints = req?.session?.user?.usager?.points + pointsAjout;
    await comptesService.updatePoints(req?.session?.user?.usager.id, nouveauxPoints);
    req.session.user.usager.points = nouveauxPoints;
    await new Promise( (resolve) => {
        req.session.save(() => { resolve(); });
    });

    res.redirect("/");
});
*/

// Cours

router.get("/getLessons", async (req, res) => {
    try {
        const lessons = await serviceCours.getAllLessons();
        res.json(lessons);
    } catch (error) {
        console.error("Erreur dans /getLessons:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération des cours.", result: null } );
    }
});

router.get("/getCoursAchetes", async (req, res) => {
    try {
        const lessons = await serviceCours.getAllCoursAchetesByUserId(req.session?.user?.usager?.id);
        res.json(lessons);
    } catch (error) {
        console.error("Erreur dans /getCoursAchetes:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération des cours achetés.", result: null } );
    }
});

router.post("/addTransactionCours", async (req, res) => {
    try {
        const prix = 100;
        const nouveauxPoints = req.session?.user?.usager?.points - prix;
        if(nouveauxPoints < 0)
            return;

        if(await serviceCours.insertTransaction(req.session?.user?.usager?.id, req.body?.coursId))
            if(await comptesService.updatePoints(req.session?.user?.usager?.id, nouveauxPoints))
            {
                req.session.user.usager.points = nouveauxPoints;
                res.sendStatus(100);
            }
            else
            {
                await serviceCours.deleteTransaction(req.session?.user?.usager?.id, req.body?.coursId)
                res.sendStatus(400);
            }

    } catch (error) {
        console.error("Transaction erronnée lors de l'achat d'un cours:", error);
        res.status(500).json({ success: false, message: "Erreur lors de l'enregistrement d'une transaction de cours.", result: null } );
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