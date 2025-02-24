import { Server } from "socket.io";

class JeuService{
    parties = {};
    connections = {};

    constructor(httpServer, mysqlConnection)
    {
        this.io = new Server(httpServer);
        this.mysql = mysqlConnection;

        this.io.on("connection", this.onConnect);
        this.io.on("disconnect", this.onDisconnect);
    }

    async onConnect(socket)
    {
        this.connections[socket.id] = socket;

        if(!await this.isPartieEnCours(socket.data.partieId))
            return;

        if(!this.isJoueurDansPartie(socket.data.profilId))
            return;

        if(this.parties[socket.data.partieId])
        {
            this.parties[socket.data.partieId].lastConnection[socket.data.profilId] = Date.now();
        }
    }

    async onDisconnect(socket)
    {
        this.connections[socket.id] = undefined;

        if(!await this.isPartieEnCours(socket.data.partieId))
            return;

        if(!this.isJoueurDansPartie(socket.data.profilId))
            return;

        if(this.parties[socket.data.partieId])
        {
            this.parties[socket.data.partieId].lastDisconnect[socket.data.profilId] = Date.now();
        }
    }

    async isPartieEncours(partieId, callback)
    {
        this.mysql.query("SELECT * FROM partie WHERE id = ? && statut = 1;", [partieId], function (err, result, fields) {
            if (err) throw err;
            callback(result.length > 0);
        });
    }

    async isJoueurDansPartie(partieId, profilId, callback)
    {
        this.mysql.query("SELECT * FROM partie WHERE id = ? && ( id_joueur1 = ? || id_joueur2 = ? ) && statut > 0;", [partieId, profilId, profilId], function (err, result, fields) {
            if (err) throw err;
            callback(result.length > 0);
        });
    }

    async bumpPartie(partieId, profilId, callback)
    {
        this.parties[partieId].lastAction[profilId] = Date.now();
        callback();
    }

    async getAllPartiesEncours(callback)
    {
        this.mysql.query("SELECT * FROM partie WHERE statut <> 2;", [0], function (err, result, fields) {
            if (err) throw err;
            callback(result);
        });
    }

    async getPartie(partieId, callback)
    {
        this.mysql.query("SELECT * FROM partie WHERE id = ?", [partieId], function (err, result, fields) {
            if (err) throw err;
            callback(result[0])
        });
    }

    async getProfiljeu(joueurId, callback)
    {
        this.mysql.query("SELECT * FROM profiljeu JOIN usager ON profiljeu.id_usager = usager.id WHERE profiljeu.id = ?", [joueurId], function (err, result, fields) {
            if (err) throw err;
            callback(result[0]);
        });
    }

    async createPartie(joueur1Id, joueur2Id, callback)
    {
        this.mysql.query("INSERT INTO partie (id_joueur1, id_joueur2, statut, datedebut) VALUES (?, ?, 0, NOW()); SELECT LAST_INSERT_ID() AS id;",
            [joueur1Id, joueur2Id], function (err, result, fields) {
                if (err) throw err;
                callback(result[0].id);
        });
    }
}

export default JeuService;