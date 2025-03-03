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
        await socket.on("move", this.onMove);

        //if c'est un bot au debut, aussi on ne part pas le timer
        if(await this.isJoueurcourantBot(socket.data.partieId))
        {
            const moveresult = await this.doBotMove(socket.data.partieId);
            if(moveresult)
            {
                const nouveauJoueurcourant = await this.prochainProfiljeu(socket.data.partieId);
                await this.updateJoueurcourantPartie({id: socket.data.partieId, id_joueurcourant: nouveauJoueurcourant});

                if(this.io.emit("moveresult", moveresult))
                {

                }
                else
                    throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du mouvement de piece.");
            }
        }
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

        //TODO isjoueurcourant

        const moveresult = await this.doMove(socket.data.partieId, socket.data.move);
        if(moveresult)
        {
            const nouveauJoueurcourant = await this.prochainProfiljeu(socket.data.partieId);
            await this.updateJoueurcourantPartie({id: socket.data.partieId, id_joueurcourant: nouveauJoueurcourant});

            await this.bumpConnection(socket.data.partieId, socket.data.profiljeuId);
            if(this.io.emit("moveresult", moveresult))
            {
                await this.sleep(2000);
                if(nouveauJoueurcourant == -1)
                {
                    const moveresult = await this.doBotMove(socket.data.partieId);
                    if(moveresult)
                    {
                        const nouveauJoueurcourant = await this.prochainProfiljeu(socket.data.partieId);
                        await this.updateJoueurcourantPartie({id: socket.data.partieId, id_joueurcourant: nouveauJoueurcourant});
            
                        //await this.bumpConnection(socket.data.partieId, socket.data.profiljeuId);
                        if(this.io.emit("moveresult", moveresult))
                        {
                        }
                        else
                            throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du mouvement de piece.");
                    }
                }
            }
            else
                throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du mouvement de piece.");
        }
    }

    async prochainProfiljeu(partieId)
    {
        const partie = await this.selectPartie(partieId);
        const prochainProfiljeu = partie.id_joueurcourant != partie.id_joueur1 ? partie.id_joueur2 : partie.id_joueur1;
        const numJoueur = partie.id_joueurcourant != partie.id_joueur2 ? 1 : 2;

        return prochainProfiljeu;
    }

    async doBotMove(partieId)
    {
        const partie = await this.selectPartie(partieId);

        var game = null;
        if(partie.historiquetables)
            game = new Chess(partie.historiquetables);
        else
            game = new Chess();

        const moves = game.moves();
        const move = moves[Math.floor(Math.random() * moves.length)];

        return this.doMove(partieId, move);
    }

    async doMove(partieId, move)
    {
        const partie = await this.selectPartie(partieId);

        var gameCopy = null;
        if(partie.historiquetables)
            gameCopy = new Chess(partie.historiquetables);
        else
            gameCopy = new Chess();
        
        try
        {
            const moveresult = gameCopy.move(move);
            const partieMoveDelta = {
                id: partie.id,
                historiquetables: gameCopy.fen(),
                statut: gameCopy.isGameOver() ? 2 : 1,
                id_gagnant: gameCopy.turn() == 'w' ? partie.id_joueur1 : partie.id_joueur2,
                id_joueurcourant: gameCopy.turn() == 'w' ? partie.id_joueur1 : partie.id_joueur2
            };
            await this.updateMovePartie(partieMoveDelta);
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
        const [results, fields] = await this.mysql.query("SELECT id FROM partie WHERE id=? AND statut<2;", [partieId]);
        return results.length > 0;
    }

    async isJoueurDansPartie(partieId, profiljeuId)
    {
        const [results, fields] = await this.mysql.query("SELECT id FROM partie WHERE id=? AND ( id_joueur1=? OR id_joueur2=? ) AND statut<2;", [partieId, profiljeuId, profiljeuId]);
        return results.length > 0;
    }

    async isJoueurcourantBot(partieId)
    {
        const [results, fields] = await this.mysql.query("SELECT id FROM partie WHERE id=? AND ( id_joueurcourant = -1 );", [partieId]);
        return results.length > 0;
    }

    async bumpConnection(socket, profiljeuId)
    {
        //this.connections[socket.id].lastAction[profiljeuId] = Date.now();
    }

    async selectAllPartiesEncours()
    {
        const [results, fields] = await this.mysql.query("SELECT * FROM partie WHERE statut <> 2;", [0]);
        return results;
    }

    async selectPartie(partieId)
    {
        const [results, fields] = await this.mysql.query("SELECT * FROM partie WHERE id = ?", [partieId]);
        return results[0];
    }

    async selectProfiljeu(joueurId)
    {
        const [results, fields] = await this.mysql.query("SELECT * FROM profiljeu JOIN usager ON profiljeu.id_usager = usager.id WHERE profiljeu.id = ?", [joueurId]);
        return results[0];
    }

    async insertPartie(joueur1Id, joueur2Id)
    {
        const [results, fields] = await this.mysql.query("INSERT INTO partie (id_joueur1, id_joueur2, id_joueurcourant, statut, datedebut) VALUES (?, ?, ?, 0, NOW()); SELECT LAST_INSERT_ID() AS id;",
            [joueur1Id, joueur2Id, joueur1Id]);
        return results[0].id;
    }

    async updateMovePartie(partieMoveDelta)
    {
        const [results, fields] = await this.mysql.query("UPDATE partie SET historiquetables = ?, statut = ?, id_gagnant = ?, id_joueurcourant = ? WHERE id = ?;",
            [partieMoveDelta.historiquetables, partieMoveDelta.statut, partieMoveDelta.id_gagnant, partieMoveDelta.id_joueurcourant, partieMoveDelta.id]);
        return true;
    }

    async updateJoueurcourantPartie(partieJoueurcourantDelta)
    {
        const [results, fields] = await this.mysql.query("UPDATE partie SET id_joueurcourant = ? WHERE id = ?;",
            [partieJoueurcourantDelta.id_joueurcourant, partieJoueurcourantDelta.id]);
        return true;
    }

    async updateHistoriquePartie(partieId, historique)
    {
        const [results, fields] = await this.mysql.query("UPDATE partie SET historiquetables = ? WHERE id = ?",
            [historique, partieId]);
        return true;
    }

    async sleep(ms)
    {
        return await new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default JeuService;