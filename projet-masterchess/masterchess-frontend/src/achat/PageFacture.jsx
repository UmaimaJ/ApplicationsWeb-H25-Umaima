import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from "react-router-dom";

import { ChargerService } from "./service/ChargerService.js";

import './style/PageCharger.css';

const PageFacture = () => {
    let params = useParams();

    const chargerService = new ChargerService();
    const [facture, setFacture] = useState(null);

    const fetchData = async () => {
        setFacture(await chargerService.getFacture(params.idFacture));
        console.log(params.idFacture);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const prixunite = 0.005;
    const tps = 0.05;
    const tvq = 0.09975;
    const taxes = (tps * (facture?.quantite ?? 0) * prixunite) + ( tvq * (facture?.quantite ?? 0) * prixunite);

    const dateCreation = facture?.dateCreation ?? new Date(Date.now());
    const total = ((facture?.quantite ?? 0) * prixunite) + taxes;

    return (
        <div className="charger-container">
            <div className="panneau-charger-header card">
                <div className='card-body'>
                    <h2 className='card-title'>Chargement de 1000 gemmes pour 5 CAD</h2>
                    <div className='facture'>
                        <div className='facture-row'>
                            <label>Produit:</label>
                            <label>Gemmes ChessMaster</label>
                        </div>
                        <div className='facture-row'>
                            <label>No. facture:</label>
                            <label>{facture?._id}</label>
                        </div>
                        <div className='facture-row'>
                            <label>Quantité:</label>
                            <label>{facture?.quantite}</label>
                        </div>
                        <div className='facture-row'>
                            <label>Prix/unité:</label>
                            <label>{prixunite.toFixed(4)}$</label>
                        </div>
                        <div className='facture-row'>
                            <label>Taxes:</label>
                            <label>{taxes.toFixed(4)}$</label>
                        </div>
                        <div className='facture-row'>
                            <label>Date transaction:</label>
                            <label>{new Date(facture?.dateCreation).toLocaleDateString()}</label>
                        </div>
                        <div className='facture-row-total'>
                            <label>Total:</label>
                            <label>{total.toFixed(2)}$</label>
                        </div>
                    </div>
                    <br></br>
                    <p>Merci pour avoir choisi ChessMaster.</p>
                    <input className='btn btn-primary' type="button" value="Imprimmer" onClick={ () => { window.print() } }></input>
                </div>
            </div>
        </div>
    )
};

export default PageFacture;