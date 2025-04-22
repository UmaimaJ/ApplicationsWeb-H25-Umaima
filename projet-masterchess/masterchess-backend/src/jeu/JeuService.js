import { Chess } from "chess.js";

class JeuService{
    constructor(io, mysqlConnection)
    {
        this.io = io;

        this.mysql = mysqlConnection;

        this.partiesCache = {};
        this.maxtimer = 60000;

        this.onConnect = this.onConnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.onMove = this.onMove.bind(this);

        const namespace = this.io.of("/jeuservice");
        namespace.on("connect", this.onConnect);
        namespace.on("disconnect", this.onDisconnect);
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
        var boundMove = async function(event, socket = socketarg)
        {
            return await this.onMove(event, socket);
        };
        boundMove = boundMove.bind(this);
        socket.on("move", boundMove);

        if((this.partiesCache[data.partieId].socketJoueur1 || this.partiesCache[data.partieId].id_joueur1 == -1)
            && (this.partiesCache[data.partieId].socketJoueur2 || this.partiesCache[data.partieId].id_joueur2 == -1))
        {
            if(this.partiesCache[data.partieId].statut == 0)
                await this.onStart(data);
        }

        var sockets = [];
        if(this.partiesCache[data.partieId].socketJoueur1)
            sockets.push(this.partiesCache[data.partieId].socketJoueur1);
        if(this.partiesCache[data.partieId].socketJoueur2)
            sockets.push(this.partiesCache[data.partieId].socketJoueur2);

        const endroundresult = await this.doUpdateTimers(data.partieId);
        for(var i=0; i< sockets.length; i++)
        {
            const socket = sockets.at(i);
            if(endroundresult)
            {
                if(!await socket.timeout(10000).emit("endroundresult", { endround: endroundresult, partieId: data.partieId}))
                    throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du endroundresult d'etat du jeu.");
            }
        }
        await this.savePartie(this.partiesCache[data.partieId]);
    }

    async doUpdateTimers(partieId)
    {
        var partie = this.partiesCache[partieId];

        if(!partie)
            return null;

        if(partie.statut == 2)
            return null;

        const endroundresult = await this.doEndround(partieId, false);

        return endroundresult;
    }

    async onStart(data)
    {
        var sockets = [];
        if(this.partiesCache[data.partieId].socketJoueur1)
            sockets.push(this.partiesCache[data.partieId].socketJoueur1);
        if(this.partiesCache[data.partieId].socketJoueur2)
            sockets.push(this.partiesCache[data.partieId].socketJoueur2);

        const checkresult = await this.doCheck(data.partieId);
        for(var i=0; i< sockets.length; i++)
        {
            const socket = sockets.at(i);
            if(checkresult)
            {
                if(!await socket.timeout(10000).emit("checkresult", { check: checkresult, partieId: data.partieId}))
                    throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du check d'etat du jeu.");
            }
        }
        await this.savePartie(this.partiesCache[data.partieId]);

        //premier check et move est fait pour le bot sur onConnect
        if(this.partiesCache[data.partieId].id_joueurcourant == -1)
        {
            await this.sleep(2000);
        
            const moveresult = await this.doBotMove(data.partieId);
            if(moveresult)
            {
                for(var i=0; i< sockets.length; i++)
                {
                    const socket = sockets.at(i);
                    if(!await socket.timeout(10000).emit("moveresult", { move: moveresult, partieId: data.partieId}))
                        throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du mouvement de piece.");
                }
                const endroundresult = await this.doEndround(data.partieId);
                if(endroundresult)
                {
                    for(var i=0; i< sockets.length; i++)
                    {
                        const socket = sockets.at(i);
                        if(!await socket.timeout(10000).emit("endroundresult", { endround: endroundresult, partieId: data.partieId}))
                            throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du endround event.");
                    }
                    const checkresult = await this.doCheck(data.partieId);
                    if(checkresult)
                    {
                        for(var i=0; i< sockets.length; i++)
                        {
                            const socket = sockets.at(i);
                            if(!await socket.timeout(10000).emit("checkresult", { check: checkresult, partieId: data.partieId}))
                                throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du check d'etat du jeu.");
                        }
                    }
                }
            }
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

            var sockets = [];
            if(this.partiesCache[data.partieId].socketJoueur1)
                sockets.push(this.partiesCache[data.partieId].socketJoueur1);
            if(this.partiesCache[data.partieId].socketJoueur2)
                sockets.push(this.partiesCache[data.partieId].socketJoueur2);

            const moveresult = await this.doMove(data.partieId, move);
            if(moveresult)
            {
                for(var i=0; i< sockets.length; i++)
                {
                    const socket = sockets.at(i);
                    if(!await socket.timeout(10000).emit("moveresult", { move: moveresult, partieId: data.partieId}))
                        throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du mouvement de piece.");
                }
                const endroundresult = await this.doEndround(data.partieId);
                if(endroundresult)
                {
                    for(var i=0; i< sockets.length; i++)
                    {
                        const socket = sockets.at(i);
                        if(!await socket.timeout(10000).emit("endroundresult", { endround: endroundresult, partieId: data.partieId}))
                            throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du endround event.");
                    }
                    const checkresult = await this.doCheck(data.partieId);
                    if(checkresult)
                    {
                        for(var i=0; i< sockets.length; i++)
                        {
                            const socket = sockets.at(i);
                            if(!await socket.timeout(10000).emit("checkresult", { check: checkresult, partieId: data.partieId}))
                                throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du check d'etat du jeu.");
                        }
                    }
                }
            }
            await this.savePartie(this.partiesCache[data.partieId]);

            if(this.partiesCache[data.partieId].id_joueurcourant == -1)
            {
                await this.sleep(2000);
                const moveresult = await this.doBotMove(data.partieId);
                if(moveresult)
                {
                    for(var i=0; i< sockets.length; i++)
                    {
                        const socket = sockets.at(i);
                        if(!await socket.timeout(10000).emit("moveresult", { move: moveresult, partieId: data.partieId}))
                            throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du mouvement de piece.");
                    }
                    const endroundresult = await this.doEndround(data.partieId);
                    if(endroundresult)
                    {
                        for(var i=0; i< sockets.length; i++)
                        {
                            const socket = sockets.at(i);
                            if(!await socket.timeout(10000).emit("endroundresult", { endround: endroundresult, partieId: data.partieId}))
                                throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du endround event.");
                        }
                        const checkresult = await this.doCheck(data.partieId);
                        if(checkresult)
                        {
                            for(var i=0; i< sockets.length; i++)
                            {
                                const socket = sockets.at(i);
                                if(!await socket.timeout(10000).emit("checkresult", { check: checkresult, partieId: data.partieId}))
                                    throw new Error("On a renconre une erreur lors de la diffusion du resultat server-side du check d'etat du jeu.");
                            }
                        }
                    }
                }
                await this.savePartie(this.partiesCache[data.partieId]);
            }
        }
    }

    async prochainProfiljeu(partieId)
    {
        const partie = this.partiesCache[partieId];
        const prochainProfiljeu = partie.id_joueurcourant != partie.id_joueur1 ? partie.id_joueur1 : partie.id_joueur2;

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

        if(partie.statut == 2)
            return null;

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
            moveresult = null;
        }

        return moveresult;

    }

    async doEndround(partieId, endTheRound = true)
    {
        var partie = this.partiesCache[partieId];

        if(partie.statut == 2)
            return null;

        const oldjoueurcourant = endTheRound ? partie.id_joueurcourant : await this.prochainProfiljeu(partieId);
        const newjoueurcourant = endTheRound ? await this.prochainProfiljeu(partieId) : partie.id_joueurcourant;
        const oldnumjoueur = oldjoueurcourant == partie.id_joueur2 ? 2 : 1;
        const newnumjoueur = newjoueurcourant == partie.id_joueur2 ? 2 : 1;

        const timer1roundsum = oldjoueurcourant == partie.id_joueur1 ? ( endTheRound ? partie.timer1roundsum + (Date.now() - (partie.timer1roundstart ?? Date.now())) : partie.timer1roundsum ) : partie.timer1roundsum;
        const timer2roundsum = oldjoueurcourant == partie.id_joueur2 ? ( endTheRound ? partie.timer2roundsum + (Date.now() - (partie.timer2roundstart ?? Date.now())) : partie.timer2roundsum ) : partie.timer1roundsum;

        const timer1roundstart = endTheRound ? (newjoueurcourant == partie.id_joueur1 ? Date.now() : null) : partie.timer1roundstart;
        const timer2roundstart = endTheRound ? (newjoueurcourant == partie.id_joueur2 ? Date.now() : null) : partie.timer2roundstart;

        var endroundresult = {
            id_joueurcourant: newjoueurcourant,
            timer1roundsum: timer1roundsum,
            timer2roundsum: timer2roundsum,
            timer1roundstart: timer1roundstart,
            timer2roundstart: timer2roundstart
        };

        var sockets = [];
        if(this.partiesCache[partieId].socketJoueur1)
            sockets.push(this.partiesCache[partieId].socketJoueur1);
        if(this.partiesCache[partieId].socketJoueur2)
            sockets.push(this.partiesCache[partieId].socketJoueur2);

        //consume old timer if its still going
        clearTimeout(oldnumjoueur == 1 ? partie.timer1functionId : partie.timer2functionId);
        const partieEndroundresultDelta = {
            id_joueurcourant: newjoueurcourant,
            timer1roundsum: timer1roundsum,
            timer2roundsum: timer2roundsum,
            timer1roundstart: timer1roundstart,
            timer2roundstart: timer2roundstart,
            timer1functionId: newnumjoueur == 1 ? setTimeout(async () => {
                var sockets = [];
                if(this.partiesCache[partieId].socketJoueur1)
                    sockets.push(this.partiesCache[partieId].socketJoueur1);
                if(this.partiesCache[partieId].socketJoueur2)
                    sockets.push(this.partiesCache[partieId].socketJoueur2);

                const checkresult = await this.doTimeoutCheck(partieId, newjoueurcourant);
                if(checkresult)
                {
                    for(var i=0; i< sockets.length; i++)
                    {
                        const socket = sockets.at(i);
                        if(!await socket.timeout(10000).emit("checkresult", { check: checkresult, partieId: partieId}))
                            console.log("On a renconre une erreur lors de la diffusion du resultat server-side du check d'etat du jeu.");
                    }
                }
                this.savePartie(this.partiesCache[partieId]);
            }, (this.maxtimer - timer1roundsum) + 100) : null,
            timer2functionId: newnumjoueur == 2 ? setTimeout(async () => {
                var sockets = [];
                if(this.partiesCache[partieId].socketJoueur1)
                    sockets.push(this.partiesCache[partieId].socketJoueur1);
                if(this.partiesCache[partieId].socketJoueur2)
                    sockets.push(this.partiesCache[partieId].socketJoueur2);
                const checkresult = await this.doTimeoutCheck(partieId, newjoueurcourant);
                if(checkresult)
                {
                    for(var i=0; i< sockets.length; i++)
                    {
                        const socket = sockets.at(i);
                        if(!await socket.timeout(10000).emit("checkresult", { check: checkresult, partieId: partieId}))
                            console.log("On a renconre une erreur lors de la diffusion du resultat server-side du check d'etat du jeu.");
                    }
                }
                this.savePartie(this.partiesCache[partieId]);
            }, (this.maxtimer - timer2roundsum) + 100) : null
        };
        
        partie = {
            ...partie,
            ...partieEndroundresultDelta
        }
        this.partiesCache[partie.id] = { ...this.partiesCache[partie.id], ...partie };

        return endroundresult;
    }

    async doTimeoutCheck(partieId, joueurcourant)
    {
        var partie = this.partiesCache[partieId];
        
        if(partie.statut == 2)
            return null;

        const autrejoueur = joueurcourant == partie.id_joueur2 ? partie.id_joueur1 : partie.id_joueur2;
        const numjoueur = joueurcourant == partie.id_joueur2 ? 2 : 1;

        //consume this timeoutcheck
        const partieTimeoutCheckDelta = {
            timer1functionId: numjoueur == 1 ? null : partie.timer1functionId,
            timer2functionId: numjoueur == 2 ? null : partie.timer2functionId
        };

        partie = {
            ...partie,
            ...partieTimeoutCheckDelta
        }
        this.partiesCache[partie.id] = { ...this.partiesCache[partie.id], ...partie };

        return await this.doCheck(partieId);
    }

    async doCheck(partieId)
    {
        var partie = this.partiesCache[partieId];
        
        if(partie.statut == 2)
            return null;

        var gameCopy = null;
        if(partie.historiquetables)
            gameCopy = new Chess(partie.historiquetables);
        else
            gameCopy = new Chess();

        const joueurcourant = partie.id_joueurcourant;
        const autrejoueur = joueurcourant == partie.id_joueur2 ? partie.id_joueur1 : partie.id_joueur2;
        const numjoueur = joueurcourant == partie.id_joueur2 ? 2 : 1;

        const timer1 = joueurcourant == partie.id_joueur1 ? partie.timer1roundsum + (Date.now() - (partie.timer1roundstart ?? Date.now())) : partie.timer1roundsum;
        const timer2 = joueurcourant == partie.id_joueur2 ? partie.timer2roundsum + (Date.now() - (partie.timer2roundstart ?? Date.now())) : partie.timer2roundsum;
        const partiefiniemats = gameCopy.isGameOver();
        const partiefinietimer =  numjoueur == 1 ? timer1 > this.maxtimer : timer2 > this.maxtimer;

        //si t'as fait mats mais pas de timer restant, c'est le timer qui a le dernier mot
        var gagnant = null;
        if(partiefiniemats)
            gagnant = autrejoueur;
        if(partiefinietimer)
            gagnant = autrejoueur;

        var checkresult = {
            statut: partiefiniemats || partiefinietimer ? 2 : 1,
            id_gagnant: gagnant
        };

        const partieCheckDelta = {
            statut: partiefiniemats || partiefinietimer ? 2 : 1,
            id_gagnant: gagnant
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
                id_joueurcourant = ?,
                timer1roundsum = ?,
                timer2roundsum = ?
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
                    partie.timer1,
                    partie.timer2,
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