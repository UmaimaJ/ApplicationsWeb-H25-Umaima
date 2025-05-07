/*
// src/admin/Admin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {password} from "prompts/lib/prompts";

// List of backend collections/tables you can manage
const TABLES = [
    'usager',
    'groupeprivileges',
    'video',
    'cours',
    'profiljeu',
    'partie',
    'completioncours',
    'privilege',
    'groupeprivileges_privilege',
    'modedepaiement',
    'transaction'
];

const Admin = () => {
    const [selectedTable, setSelectedTable] = useState('');
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (selectedTable) fetchTable();
    }, [selectedTable]);

    const fetchTable = async () => {
        try {
            const res = await axios.get(`/api/${selectedTable}`);
            const data = Array.isArray(res.data) ? res.data : [];
            setRows(data);
            setColumns(data.length > 0 ? Object.keys(data[0]) : []);
            setFormData({});
        } catch (err) {
            console.error(err);
            alert('Erreur lors du chargement de la table');
        }
    };

    const handleSelectChange = e => setSelectedTable(e.target.value);

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAdd = async () => {
        try {
            await axios.post(`/api/${selectedTable}`, formData);
            fetchTable();
        } catch (err) {
            console.error(err);
            alert('Erreur lors de l\'ajout');
        }
    };

    const handleDelete = async id => {
        if (!window.confirm(`Supprimer l'enregistrement ${id} ?`)) return;
        try {
            await axios.delete(`/api/${selectedTable}/${id}`);
            fetchTable();
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la suppression');
        }
    };

    return (
        <div className="admin-container">
            <h2>Administration</h2>

            {/!* Choix de la table *!/}
            <div className="admin-selector">
                <label>Choisir une table:</label>
                <select value={selectedTable} onChange={handleSelectChange}>
                    <option value="">-- aucun --</option>
                    {TABLES.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            {selectedTable && (
                <>
                    <h3>Table: {selectedTable}</h3>

                    {/!* Affichage des données *!/}
                    <table className="admin-table">
                        <thead>
                        <tr>
                            {columns.map(col => <th key={col}>{col}</th>)}
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map(row => {
                            const key = row.id ?? row._id;
                            return (
                                <tr key={key}>
                                    {columns.map(col => <td key={col}>{row[col]}</td>)}
                                    <td>
                                        <button onClick={() => handleDelete(key)}>Supprimer</button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    {/!* Formulaire d'ajout *!/}
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

export default Admin;
*/
