import mysql from 'mysql2/promise';

export default class AdminService {
    constructor(db) {
        this.db = db;
    }

    // GET - Pour avoir les values
    async getAll(table) {
        const [rows] = await this.db.query('SELECT * FROM ??', [table]);
        return rows;
    }

    // GET - afficher les colonnes
    async getColumns(table) {
        const [cols] = await this.db.query('SHOW COLUMNS FROM ??', [table]);
        return cols.map(c => c.Field);
    }

    // GET - Afficher les tables
    async getTables() {
        const [rows] = await this.db.query('SHOW TABLES');
        return rows
            .map(r => Object.values(r)[0])
            .filter(tableName => tableName !== 'cours');
    }

    // INSERT - ajouter une valeur
    async insert(table, data) {
        const [result] = await this.db.query('INSERT INTO ?? SET ?', [table, data]);
        return result.insertId;
    }

    // Recupere la PK
    async getPrimaryKey(table) {
        const [cols] = await this.db.query('SHOW COLUMNS FROM ??', [table]);
        const pk = cols.find(c => c.Key === 'PRI');
        return pk ? pk.Field : 'id';
    }

    // DELETE - supprimer
    async delete(table, id) {
        const pk = await this.getPrimaryKey(table);
        await this.db.query(
            'DELETE FROM ?? WHERE ?? = ?',
            [table, pk, id]
        );
        return true;
    }

    // UPDATE - Mettre a jour
    async update(table, id, data) {
        const pk = await this.getPrimaryKey(table);
        await this.db.query('UPDATE ?? SET ? WHERE ?? = ?', [table, data, pk, id]);
        return true;
    }
}