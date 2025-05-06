class ProfiljeuService {
    constructor(mysqlConnection)
    {
        this.mysql = mysqlConnection;
    }

    async selectProfiljeuProfil(profiljeuId)
    {
        //get profiljeu
        var profiljeuProfil = null;

        const [ resultsProfiljeu ] = await this.mysql.query(`
            SELECT usager.id, compte, motdepasse, id_groupeprivileges, datecreation, courriel, pays, sessionid, pj.points, pj.elo, pj.datedernierjeu, pj.rechercheencours, pj.id AS id_profiljeu
            FROM usager
            LEFT JOIN profiljeu AS pj ON usager.id = pj.id_usager
            WHERE pj.id = ?;
            `, [ profiljeuId ]);

        if(resultsProfiljeu.length > 0)
        {
            profiljeuProfil = resultsProfiljeu[0];
        }

        if(profiljeuProfil)
        {
            //get parties
            profiljeuProfil.parties = [];

            const [ resultsParties ] = await this.mysql.query(`
                SELECT partie.id AS id, partie.id_joueur1 AS id_joueur1, partie.id_joueur2 AS id_joueur2, partie.historiquetables AS historiquetables, partie.statut AS statut, partie.id_gagnant AS id_gagnant, partie.datedebut AS datedebut, partie.datefin AS datefin, partie.elo AS elo, partie.id_joueurcourant AS id_joueurcourant,
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
                WHERE (partie.id_joueur1 = ? OR partie.id_joueur2 = ?) AND partie.statut = 2
                ORDER BY partie.datedebut;
                `, [ profiljeuId, profiljeuId ]);
    
            if(resultsParties.length > 0)
            {
                profiljeuProfil.parties = resultsParties;
            }

            return profiljeuProfil;
        }

        return null;

    }

}

export default ProfiljeuService;