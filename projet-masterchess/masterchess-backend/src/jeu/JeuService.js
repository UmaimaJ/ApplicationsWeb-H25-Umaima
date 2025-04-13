import { Server } from "socket.io";
import { Chess } from "chess.js";

class JeuService{
    constructor(httpServer, mysqlConnection, sessionMiddleware, corsOptions)
    {
        this.io = new Server(httpServer, {
            cors: corsOptions
        });

        this.mysql = mysqlConnection;

        this.partiesCache = {};

        this.onConnect = this.onConnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.onMove = this.onMove.bind(this);

        this.io.engine.use(sessionMiddleware);
        this.io.on("connection", this.onConnect);
        this.io.on("disconnect", this.onDisconnect);
    }

    async onConnect(socket)
    {
        const data = {
            profiljeuId: socket?.request?.session?.user?.usager?.id_profiljeu,
            partieId: socket?.handshake?.query?.partieId
        }

        if(!this.partiesCache[data.partieId])
            this.partiesCache[data.partieId] = await this.selectPartie(data.partieId);

        //partie existe
        if(!this.partiesCache[data.partieId])
            return;

        //est joueur dans partie
        if(!(this.partiesCache[data.partieId].id_joueur1 == data.profiljeuId || this.partiesCache[data.partieId].id_joueur2 == data.profiljeuId))
            return;

        //on sauve cette connection(ce socket) dans la partie
        const numJoueurConnection = this.partiesCache[data.partieId].id_joueur1 == data.profiljeuId ? 1 : 2;
        if(numJoueurConnection == 1)
            this.partiesCache[data.partieId].socketJoueur1 = socket;
        if(numJoueurConnection == 2)
            this.partiesCache[data.partieId].socketJoueur2 = socket;

        //event pour chaque connection sur boundMove
        const socketarg = socket;
        var boundMove = async function(event)
        {
            return await this.onMove(event, socketarg);
        };
        boundMove = boundMove.bind(this);
        this.partiesCache[data.partieId].boundMove = boundMove;
        socket.on("move", this.partiesCache[data.partieId].boundMove);

        //premier check peu importe qui est le joueur courant
        const checkresult = await this.doCheck(data.partieId);
        if(!await socket.timeout(10000).emit("checkresult", { check: checkresult, partieId: data.partieId}))
            throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du check.");

        //premier check et move est fait pour le bot sur onConnect
        if(this.partiesCache[data.partieId].id_joueurcourant == -1)
        {
            await this.sleep(2000);

            const moveresult = await this.doBotMove(data.partieId);
            const checkresult = await this.doCheck(data.partieId);
            if(!await socket.timeout(10000).emit("moveresult", { move: moveresult, partieId: data.partieId}))
                throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du mouvement de piece.");
            if(!await socket.timeout(10000).emit("checkresult", { check: checkresult, partieId: data.partieId}))
                throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du check.");
            
            const nouveauJoueurcourant = await this.prochainProfiljeu(data.partieId);
            this.partiesCache[data.partieId].id_joueurcourant = nouveauJoueurcourant;
            await this.savePartie(this.partiesCache[data.partieId]);
        }
    }

    async onDisconnect(socket)
    {
        const data = {
            profiljeuId: socket?.request?.session?.user?.usager?.id_profiljeu,
            partieId: socket?.handshake?.query?.partieId
        }

        if(!data.profiljeuId)
            return;

        if(!data.partieId)
            return;

        if(this.partiesCache[data.partieId])
        {
            const numJoueurConnection = this.partiesCache[data.partieId].id_joueur1 == data.profiljeuId ? 1 : 2;
            if(numJoueurConnection == 1)
                if(this.partiesCache[data.partieId].socketJoueur1.id == socket.id)
                    delete this.partiesCache[data.partieId].socketJoueur1;
            if(numJoueurConnection == 2)
                if(this.partiesCache[data.partieId].socketJoueur2.id == socket.id)
                    delete this.partiesCache[data.partieId].socketJoueur2;

            await this.savePartie(this.partiesCache[data.partieId]);
            
        }
    }

    async onMove(event, socket)
    {
        const data = {
            profiljeuId: socket?.request?.session?.user?.usager?.id_profiljeu,
            partieId: socket?.handshake?.query?.partieId
        }

        const move = event?.data?.move;

        if(!data.partieId)
            return;

        if(!data.profiljeuId)
            return;

        if(this.partiesCache[data.partieId])
        {
            //est partie en cours
            if(this.partiesCache[data.partieId].statut == 2)
                return;

            //est joueur dans partie
            if(!(this.partiesCache[data.partieId].id_joueur1 == data.profiljeuId || this.partiesCache[data.partieId].id_joueur2 == data.profiljeuId))
                return;

            //est joueur courant
            if(this.partiesCache[data.partieId].id_joueurcourant != data.profiljeuId)
                return;

            const moveresult = await this.doMove(data.partieId, move);
            const checkresult = await this.doCheck(data.partieId);
            if(!await socket.timeout(10000).emit("moveresult", { move: moveresult, partieId: data.partieId}))
                throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du mouvement de piece.");
            if(!await socket.timeout(10000).emit("checkresult", { check: checkresult, partieId: data.partieId}))
                throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du check.");
            const nouveauJoueurcourant = await this.prochainProfiljeu(data.partieId);
            this.partiesCache[data.partieId].id_joueurcourant = nouveauJoueurcourant;
            await this.savePartie(this.partiesCache[data.partieId]);

            if(this.partiesCache[data.partieId].id_joueurcourant == -1)
            {
                await this.sleep(2000);
                const moveresult = await this.doBotMove(data.partieId);
                const checkresult = await this.doCheck(data.partieId);
                if(!await socket.timeout(10000).emit("moveresult", { move: moveresult, partieId: data.partieId}))
                    throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du mouvement de piece.");
                if(!await socket.timeout(10000).emit("checkresult", { check: checkresult, partieId: data.partieId}))
                    throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du check.");
                const nouveauJoueurcourant = await this.prochainProfiljeu(data.partieId);
                this.partiesCache[data.partieId].id_joueurcourant = nouveauJoueurcourant;
                await this.savePartie(this.partiesCache[data.partieId]);
            }
        }
    }

    async prochainProfiljeu(partieId)
    {
        const partie = this.partiesCache[partieId];
        const prochainProfiljeu = partie.id_joueurcourant != partie.id_joueur1 ? partie.id_joueur2 : partie.id_joueur1;

        return prochainProfiljeu;
    }

    async doBotMove(partieId)
    {
        const partie = this.partiesCache[partieId];
        const game = partie?.historiquetables ? new Chess(partie.historiquetables) : new Chess();

        const moves = game.moves();

        var move = null;
        if(moves.length > 0)
            move = moves[Math.floor(Math.random() * moves.length)];

        return await this.doMove(partieId, move);
    }

    async doMove(partieId, move)
    {
        var partie = this.partiesCache[partieId];
        var gameCopy = null;
        if(partie.historiquetables)
            gameCopy = new Chess(partie.historiquetables);
        else
            gameCopy = new Chess();
        
        var moveresult = null;
        try
        {
            if(move)
                moveresult = gameCopy.move(move);

            const partieMoveDelta = {
                historiquetables: gameCopy.fen()
            };
            partie = {
                ...partie,
                ...partieMoveDelta
            }
            this.partiesCache[partieId] = { ...this.partiesCache[partie.id], ...partie };
        }
        catch(err)
        {
            console.log(err);
        }

        return moveresult;

    }

    async doCheck(partieId)
    {
        var partie = this.partiesCache[partieId];
        var gameCopy = null;
        if(partie.historiquetables)
            gameCopy = new Chess(partie.historiquetables);
        else
            gameCopy = new Chess();

        var checkresult = {
            statut: gameCopy.isGameOver() ? 2 : 1,
            id_gagnant: gameCopy.isGameOver() ? (gameCopy.turn() == 'w' ? partie.id_joueur2 : partie.id_joueur1) : null,
            id_joueurcourant: gameCopy.turn() == 'w' ? partie.id_joueur1 : partie.id_joueur2
        };

        const partieCheckDelta = {
            statut: gameCopy.isGameOver() ? 2 : 1,
            id_gagnant: gameCopy.isGameOver() ? (gameCopy.turn() == 'w' ? partie.id_joueur2 : partie.id_joueur1) : null,
            id_joueurcourant: gameCopy.turn() == 'w' ? partie.id_joueur1 : partie.id_joueur2
        };
        
        partie = {
            ...partie,
            ...partieCheckDelta
        }
        this.partiesCache[partie.id] = { ...this.partiesCache[partie.id], ...partie };

        return checkresult;
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

    async isJoueurCourant(partieId, profiljeuId)
    {
        if(partieId)
        {
            const [results, fields] = await this.mysql.query(`
                SELECT id
                FROM partie
                WHERE partie.id = ? AND partie.id_joueurcourant = ?;
                `, [partieId, profiljeuId]);

            return results.length > 0;
        }
        else
        {
            return false;
        }
        return true;
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

    async selectPartie(partieId)
    {
        const [results, fields] = await this.mysql.query("SELECT * FROM partie WHERE id = ?", [partieId]);
        return results[0];
    }

    async selectProfiljeu(usagerId)
    {
        const [results, fields] = await this.mysql.query(`
            SELECT profiljeu.id AS id, usager.id AS id_usager,
            compte, motdepasse, id_groupeprivileges, datecreation, courriel, pays, sessionid, points, elo, datedernierjeu
            FROM usager LEFT JOIN profiljeu ON usager.id = profiljeu.id_usager WHERE usager.id = ?;
        `, [usagerId]);
        return results[0];
    }

    async selectProfiljeuByCompte(compte)
    {
        const [results, fields] = await this.mysql.query(`
                SELECT profiljeu.id AS id, usager.id AS id_usager,
                compte, motdepasse, id_groupeprivileges, datecreation, courriel, pays, sessionid, points, elo, datedernierjeu
                FROM usager LEFT JOIN profiljeu ON usager.id = profiljeu.id_usager WHERE usager.compte = ?;
            `, [compte]);
        
        if(results.length > 0)
            return results[0];

        return null;
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

    async savePartie(partie)
    {
        try {
            const [results, fields] = await this.mysql.query(`
                UPDATE partie
                SET
                id_joueur1 = ?,
                id_joueur2 = ?,
                historiquetables = ?,
                statut = ?,
                id_gagnant = ?,
                datedebut = ?,
                datefin = ?,
                id_joueurcourant = ?
                WHERE id = ?
                `,
                [
                    partie.id_joueur1,
                    partie.id_joueur2,
                    partie.historiquetables,
                    partie.statut,
                    partie.id_gagnant,
                    partie.datedebut,
                    partie.datefin,
                    partie.id_joueurcourant,
                    partie.id
                ]);
        }
        catch(error)
        {
            console.log(error);
        }

        return true;
    }

    async sleep(ms)
    {
        return await new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default JeuService;