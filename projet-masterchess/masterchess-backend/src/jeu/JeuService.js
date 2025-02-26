import { Server } from "socket.io";
import { Chess } from "chess.js";

class JeuService{
    constructor(httpServer, mysqlConnection)
    {
        this.io = new Server(httpServer, {
            cors: {
                origin: "http://localhost:3000"
            }
        });

        this.mysql = mysqlConnection;

        this.connections = {};

        this.onConnect = this.onConnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.onMove = this.onMove.bind(this);

        this.io.on("connection", this.onConnect);
        this.io.on("disconnect", this.onDisconnect);
    }

    async onConnect(socket)
    {
        socket.data = {
            profiljeuId: socket.handshake.query.profiljeuId,
            partieId: socket.handshake.query.partieId
        }

        if(!await this.isPartieEncours(socket.data.partieId))
            return;

        if(!await this.isJoueurDansPartie(socket.data.partieId, socket.data.profiljeuId))
            return;

        //this.connections[socket.id].lastConnection[socket.data.profiljeuId] = Date.now();
        await this.bumpConnection(socket, socket.data.profiljeuId);
        socket.on("move", this.onMove);
    }

    async onDisconnect(socket)
    {
        if(!await this.isPartieEncours(socket.data.partieId))
            return;

        if(!await this.isJoueurDansPartie(socket.data.partieId, socket.data.profiljeuId))
            return;

        //this.connections[socket.id].lastDisconnect[socket.data.profiljeuId] = Date.now();
        await this.bumpConnection(socket, socket.data.profiljeuId);
    }

    async onMove(socket)
    {
        if(!await this.isPartieEncours(socket.data.partieId))
            return;

        if(!await this.isJoueurDansPartie(socket.data.partieId, socket.data.profiljeuId))
            return;

        const moveresult = await this.doMove(socket.data.partieId, socket.data.move);
        if(moveresult) await this.bumpConnection(socket.data.partieId, socket.data.profiljeuId);

        this.io.emit("moveresult", moveresult);
    }

    async doMove(partieId, move)
    {
        const partie = await this.getPartie(partieId);

        var gameCopy = null;
        if(partie.historiquetables)
            gameCopy = new Chess(partie.historiquetables);
        else
            gameCopy = new Chess();
        
        try
        {
            const moveresult = gameCopy.move(move);
            await this.updateHistoriquePartie(partieId, gameCopy.fen());
            return moveresult;
        }
        catch(err)
        {
            // erreur dans les donnees
            return null;
        }
        return null;

    }

    async isPartieEncours(partieId)
    {
        const [results, fields] = await this.mysql.query("SELECT * FROM partie WHERE id=? AND statut<2;", [partieId]);
        return results.length > 0;
    }

    async isJoueurDansPartie(partieId, profiljeuId)
    {
        const [results, fields] = await this.mysql.query("SELECT * FROM partie WHERE id=? AND ( id_joueur1=? OR id_joueur2=? ) AND statut<2;", [partieId, profiljeuId, profiljeuId]);
        return results.length > 0;
    }

    async bumpConnection(socket, profiljeuId)
    {
        //this.connections[socket.id].lastAction[profiljeuId] = Date.now();
    }

    async getAllPartiesEncours()
    {
        const [results, fields] = await this.mysql.query("SELECT * FROM partie WHERE statut <> 2;", [0]);
        return results;
    }

    async getPartie(partieId, callback)
    {
        const [results, fields] = await this.mysql.query("SELECT * FROM partie WHERE id = ?", [partieId]);
        return results[0];
    }

    async getProfiljeu(joueurId, callback)
    {
        const [results, fields] = await this.mysql.query("SELECT * FROM profiljeu JOIN usager ON profiljeu.id_usager = usager.id WHERE profiljeu.id = ?", [joueurId]);
        return results[0];
    }

    async createPartie(joueur1Id, joueur2Id, callback)
    {
        const [results, fields] = await this.mysql.query("INSERT INTO partie (id_joueur1, id_joueur2, statut, datedebut) VALUES (?, ?, 0, NOW()); SELECT LAST_INSERT_ID() AS id;",
            [joueur1Id, joueur2Id]);
        return results[0].id;
    }

    async updateHistoriquePartie(partieId, historique, callback)
    {
        const [results, fields] = await this.mysql.query("UPDATE partie SET historiquetables = ? WHERE id = ?",
            [historique, partieId]);
        return true;
    }
}

export default JeuService;