class PartiesService
{
    constructor(mysqlConnection)
    {
        this.mysql = mysqlConnection;
    }

    async createPartie(profiljeu1Id, profiljeu2Id)
    {
        const [results, fields] = await this.mysql.query(`
                INSERT INTO partie(id_joueur1, id_joueur2, statut, id_joueurcourant)
                VALUES(?, ?, 0, ?);
                SELECT * from partie WHERE id = LAST_INSERT_ID();
            `
        , [profiljeu1Id, profiljeu2Id, profiljeu1Id]);

        if(results.length > 0)
            return results[0];

        if(results.length === 0)
            throw new Error("createPartie: insert failed");

        return null;
    }

    async createPartieWithIds(profiljeu1Id, profiljeu2Id)
    {
        const [result, fields] = await this.mysql.query(`
                INSERT INTO partie(id_joueur1, id_joueur2, statut, id_joueurcourant)
                VALUES(?, ?, 0, ?);
            `
        , [profiljeu1Id, profiljeu2Id, profiljeu1Id]);

        if(result.affectedRows > 0)
        {
            const id = result.insertId;
            const [ result2, fields2 ] = await this.mysql.query(`
                SELECT * from partie WHERE id = ?;
            `, [id]);
    
            return result2[0];
        }

        return null;

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

    async selectAllPartiesEncours()
    {
        const [results, fields] = await this.mysql.query(`
            SELECT partie.id AS id, partie.id_joueur1 AS id_joueur1, partie.id_joueur2 AS id_joueur2, partie.historiquetables AS historiquetables, partie.statut AS statut, partie.id_gagnant AS id_gagnant, partie.datedebut AS datedebut, partie.datefin AS datefin, partie.id_joueurcourant AS id_joueurcourant,
            u1.compte AS compte_joueur1, u2.compte AS compte_joueur2,
            ug.compte AS compte_gagnant,
            uc.compte AS compte_courant
            FROM partie
            LEFT JOIN profiljeu AS pj1 ON partie.id_joueur1 = pj1.id
            LEFT JOIN usager AS u1 ON pj1.id_usager = u1.id
            LEFT JOIN profiljeu AS pj2 ON partie.id_joueur2 = pj2.id
            LEFT JOIN usager AS u2 ON pj2.id_usager = u2.id
            LEFT JOIN profiljeu AS pjg ON partie.id_gagnant = pjg.id
            LEFT JOIN usager AS ug ON pjg.id_usager = ug.id
            LEFT JOIN profiljeu AS pjc ON partie.id_joueurcourant = pjc.id
            LEFT JOIN usager AS uc ON pjc.id_usager = uc.id
            WHERE partie.statut <> 2;
            `, [0]);
        return results;
    }
}

export default PartiesService;