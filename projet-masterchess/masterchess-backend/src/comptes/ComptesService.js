import axios from 'axios';

class ComptesService {
    constructor(mysqlConnection)
    {
        this.mysql = mysqlConnection;
    }

    async selectUsager(compte)
    {
        const [results] = await this.mysql.query(`
            SELECT usager.id, compte, motdepasse, id_groupeprivileges, datecreation, courriel, pays, sessionid, pj.points, pj.elo, pj.datedernierjeu, pj.id AS id_profiljeu
            FROM usager
            LEFT JOIN profiljeu AS pj ON usager.id = pj.id_usager
            WHERE usager.compte = ?;
            `, [compte]);

        if(results.length > 0)
        {
            return results[0];
        }

        return null;
    }

    async insertUsager(username, password, email, country_code, sessionId)
    {
        // Insert the new user along with the session ID into the database
        await this.mysql.beginTransaction();
        await this.mysql.query(
            `INSERT INTO usager
                (compte,
                motdepasse,
                courriel,
                pays,
                datecreation,
                sessionid)
                VALUES
                (?,
                ?,
                ?,
                ?,
                NOW(),
                ?);`,
            [username, password, email, country_code, sessionId]
        );

        await this.mysql.query(
            `INSERT INTO profiljeu
                (id_usager,
                points,
                elo,
                datedernierjeu)
                VALUES
                (LAST_INSERT_ID(),
                0,
                1200,
                NOW());`
        );
        this.mysql.commit();

        return this.selectUsager(username);
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

    async getCountryCode(ip)
    {
        var country_code = null;
        try{
            const response = await axios.get("http://ip-api.com/json/" + ip + "?fields=49154",
                {
                    proxy: false
                }
            );
            country_code = response.data.countryCode;
        }
        catch(err)
        {
            console.error(err);
        };

        if(!country_code)
        {
            country_code = "CA";
        }

        return country_code;
    }
};

export default ComptesService;