// src/admin/AdminDemo.jsx
import React, { useState, useEffect } from 'react';
import './Admin.css';

// Données factices pour l'aperçu UI
const DEMO_DATA = {
    usager: [
        { id: 1, compte: 'Gabriel1', courriel: 'test@test.test', id_groupeprivileges: 1 },
        { id: 2, compte: 'Gabriel2', courriel: 'test@test.test', id_groupeprivileges: 2 },
    ],
    cours: [
        { id: 1, cout: 100, niveau: 1 },
        { id: 2, cout: 200, niveau: 2 },
    ],
    jeu: [
        { id: 1, nom: 'Puzzle Quest', difficulty: 'Easy' },
        { id: 2, nom: 'Action Hero', difficulty: 'Hard' },
    ],
};

const TABLES = Object.keys(DEMO_DATA);

const AdminDemo = () => {
    const [selectedTable, setSelectedTable] = useState('');
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (selectedTable) {
            const data = DEMO_DATA[selectedTable] || [];
            setRows(data);
            setColumns(data.length > 0 ? Object.keys(data[0]) : []);
            setFormData({});
        }
    }, [selectedTable]);

    const handleSelectChange = e => setSelectedTable(e.target.value);

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAdd = () => {
        const newId = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
        const newRow = { ...formData, id: newId };
        setRows(prev => [...prev, newRow]);
        setFormData({});
    };

    const handleDelete = id => {
        setRows(prev => prev.filter(r => r.id !== id));
    };

    return (
        <div className="admin-container">
            <h2>Admin UI Demo</h2>
            <div className="admin-selector">
                <label>Choisir une table :</label>
                <select value={selectedTable} onChange={handleSelectChange}>
                    <option value="">-- aucun --</option>
                    {TABLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {selectedTable && (
                <>
                    <h3>Table : {selectedTable}</h3>

                    <table className="admin-table">
                        <thead>
                        <tr>
                            {columns.map(col => <th key={col}>{col}</th>)}
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map(row => (
                            <tr key={row.id}>
                                {columns.map(col => <td key={col}>{row[col]}</td>)}
                                <td>
                                    <button onClick={() => handleDelete(row.id)}>Supprimer</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="admin-add-form">
                        <h4>Ajouter un enregistrement</h4>
                        {columns.map(col => (
                            <div key={col} className="admin-form-field">
                                <label>{col}</label>
                                <input
                                    name={col}
                                    value={formData[col] || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                        ))}
                        <button onClick={handleAdd}>Ajouter</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDemo;
