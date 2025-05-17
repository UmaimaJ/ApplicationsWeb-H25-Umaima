import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from "react-router";

import { DisplayProfiljeuService } from './service/DisplayProfiljeuService';

import './style/PageProfil.css';

import magnifyingIcon from "./style/magnifying-glass.png"

function PageProfil() {

    const { idProfiljeu } = useParams();
    const navigate = useNavigate();

    const displayProfiljeuService = new DisplayProfiljeuService();
    const [ profiljeuData, setProfiljeuData ] = useState(null);

    const partieHistoriqueEnd = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            const profiljeuData = await displayProfiljeuService.getProfiljeuData(idProfiljeu);
            return profiljeuData;
        }

        fetchData().then((data) => {
            setProfiljeuData(data.result);
        });
    }, []);

    const partiesHistoriqueEnded = async () => {
        if(partieHistoriqueEnd)
        {
            partieHistoriqueEnd.current?.scrollIntoView( );
        }
    };

    const buttonOuvrirPartieStyle = {
        backgroundImage: "url(" + magnifyingIcon + ")"
    };

    return (
        <div className="profil-container">
            <div className="panneau-profil card">
                <div className="card-body">
                    <h5 className="card-title">{profiljeuData?.compte ?? "<empty>"}</h5>
                    <div className="info-block">
                        <label>ELO:</label><label>{profiljeuData?.elo ?? "0"}</label>
                        <br></br>
                        <label>Date de création:</label><label>{profiljeuData?.datecreation ?? "N/A"}</label>
                    </div>

                    <div className="panneau-liste-parties-historique overflow-scroll container-fluid mw-100">
                        <div className="col">
                            {(profiljeuData?.parties ?? []).toReversed().map((entry, i) => {
                                const entryelement =
                                    <div ref={partieHistoriqueEnd} key={i} className="row">
                                        <div className="entry">
                                            <div className={"joueur-box" + (entry.compte_gagnant ? (entry.compte_gagnant == entry.compte_joueur1 ? " gagnant" : " perdant") : "")}>
                                                <label>{entry.compte_joueur1 + (entry.compte_gagnant ? (entry.compte_gagnant == entry.compte_joueur1 ? "🏆" : "") : "")}</label>
                                            </div>
                                            <div className={"joueur-box" + (entry.compte_gagnant ? (entry.compte_gagnant == entry.compte_joueur2 ? " gagnant" : " perdant") : "")}>
                                                <label>{entry.compte_joueur2 + (entry.compte_gagnant ? (entry.compte_gagnant == entry.compte_joueur2 ? "🏆" : "") : "")}</label>
                                            </div>
                                            <div className="info-box">
                                                <label className="datefin">{entry.datefin ? entry.datefin.split("T")[0] : ""}</label>
                                                <label classname="elo">{(entry.elo ?? "0")}</label>
                                            </div>
                                            <button className="open-partie" style={ buttonOuvrirPartieStyle } onClick={() => { navigate("/PageJeu/" + entry.id); }}></button>
                                            {/* Open Source png https://fonts.google.com/icons?selected=Material+Symbols+Outlined:search:FILL@0;wght@400;GRAD@0;opsz@24&icon.query=magnifying&icon.size=24&icon.color=%23e3e3e3 */}
                                        </div>
                                    </div>;
                                return entryelement;
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
   
}

export default PageProfil;