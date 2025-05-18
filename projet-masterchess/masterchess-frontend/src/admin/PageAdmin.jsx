// src/admin/PageAdmin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const API_BASE = 'admin';
const PageAdmin = () => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const res = await axios.get(`${API_BASE}/tables`);
            const data = res.data;
            setTables(Array.isArray(data) ? data : (data.tables || []));
        } catch (error) {
            console.error('Erreur récupération des tables :', error);
        }
    };

    useEffect(() => {
        if (selectedTable) {
            fetchData(selectedTable);
        } else {
            setColumns([]);
            setRows([]);
            setFormData({});
            setIsEditing(false);
            setEditId(null);
        }
    }, [selectedTable]);

    const fetchData = async (table) => {
        try {
            const [colsRes, rowsRes] = await Promise.all([
                axios.get(`${API_BASE}/${table}/columns`),
                axios.get(`${API_BASE}/${table}`)
            ]);
            setColumns(colsRes.data);
            setRows(rowsRes.data);
            setFormData({});
            setIsEditing(false);
            setEditId(null);
        } catch (error) {
            console.error('Erreur récupération données :', error);
        }
    };

    const handleSelectChange = (e) => setSelectedTable(e.target.value);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAdd = async () => {
        try {
            await axios.post(`${API_BASE}/${selectedTable}`, formData);
            fetchData(selectedTable);
        } catch (error) {
            console.error('Erreur ajout enregistrement :', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE}/${selectedTable}/${id}`);
            setRows(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Erreur suppression :', error);
        }
    };

    const handleEdit = (row) => {
        setFormData(row);
        setIsEditing(true);
        setEditId(row.id);
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`${API_BASE}/${selectedTable}/${editId}`, formData);
            fetchData(selectedTable);
        } catch (error) {
            console.error('Erreur mise à jour :', error);
        }
    };

    return (
        <div className="admin-container">
            {/*Header*/}
            <h2>Interface d'administration</h2>

            {/*Selectionner une table*/}
            <div className="admin-selector">
                <label>Choisir une table :</label>
                <select value={selectedTable} onChange={handleSelectChange}>
                    <option value="">-- aucune --</option>
                    {Array.isArray(tables) && tables.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            {/*Table selectionnné*/}
            {selectedTable && (
                <>
                    <h3>Table : {selectedTable}</h3>
                    <div className="admin-table-wrapper">
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
                                        <button onClick={() => handleEdit(row)}>Modifier</button>
                                        <button onClick={() => handleDelete(row.id)}>Supprimer</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/*Forumulaire add/update*/}
                    <div className="admin-add-form">
                        <h4>{isEditing ? 'Modifier un enregistrement' : 'Ajouter un enregistrement'}</h4>
                        {columns.map(col => {
                            if (col === 'id' && !isEditing) return null;
                            return (
                                <div key={col} className="admin-form-field">
                                    <label>{col}</label>
                                    <input
                                        name={col}
                                        value={formData[col] || ''}
                                        onChange={handleInputChange}
                                        disabled={col === 'id' && !isEditing}
                                    />
                                </div>
                            );
                        })}

                        {/*Boutons*/}
                        <div className="admin-form-actions">
                            {isEditing ? (
                                <>
                                    <button onClick={handleUpdate}>Mettre à jour</button>
                                    <button onClick={() => { setIsEditing(false); setFormData({}); }}>Annuler</button>
                                </>
                            ) : (
                                <button onClick={handleAdd}>Ajouter</button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PageAdmin;
