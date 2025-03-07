class ComptesService {
    constructor(mysqlConnection)
    {
        this.mysql = mysqlConnection;
    }

    async selectUsager(compte)
    {
        const [results] = await this.mysql.query(`
            SELECT usager.id, compte, motdepasse, id_groupeprivileges, datecreation, courriel, points, elo, datedernierjeu, sessionid
            FROM usager
            LEFT JOIN profiljeu ON usager.id = profiljeu.id_usager
            WHERE compte = ?;
            `, [compte]);

        if(results.length > 0)
        {
            return results[0];
        }

        return null;
    }

    async insertUsager(username, password, email, sessionId)
    {
        // Insert the new user along with the session ID into the database
        const [results] = await mymysql.query(
            'INSERT INTO usager (compte, motdepasse, courriel, datecreation, session_id) VALUES (?, ?, ?, NOW(), ?)',
            [username, password, email, sessionId]
        );

        return results;
    }

    async updateSessionUsager(compte, sessionId)
    {
        const [results] = await this.mysql.query(`
            UPDATE usager
            SET usager.sessionid = ?
            WHERE usager.compte = ?;
            `, [sessionId, compte]);

        return true;
    }
};

export default ComptesService;