import React, { useState, useEffect, useContext, useRef } from 'react';
import { Navigate } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.css';
import './style/PageListeJeux.css';
import DisplayPartieComponent from "./components/DisplayPartieComponent";
import PageJeu from "./PageJeu";

import { ComptesServiceContext, ComptesService } from "../login/service/ComptesService";
import { AccueilServiceContext } from '../accueil/service/AccueilService';
import { DisplayPartiesServiceContext, DisplayPartiesService } from './service/DisplayPartiesService';
import { TrouverPartieServiceContext, TrouverPartieService } from "./service/TrouverPartieService";

function PageListeJeux() {
    const { navigate, accueilService } = useContext(AccueilServiceContext);
    const [ toJeu, setToJeu ] = useState(null);

    const { sessionUsager, setSessionUsager, comptesService } = useContext(ComptesServiceContext);

    const displayPartiesService = new DisplayPartiesService();
    const [ partiesEncours, setPartiesEncours ] = useState([]);

    const trouverPartieService = new TrouverPartieService(onConnection, onDisconnect, onTrouveresult);
    const [ partieEncours, setPartieEncours ] = useState(null);
    const [ rechercheEncours, setRechercheEncours ] = useState(sessionUsager.rechercheencours);
    const [ disponnibleChercher, setDisponnibleChercher] = useState(false);

    useEffect(() => {
        refreshPartiesEncours();
    }, []);

    useEffect(() => {
        trouverPartieService.connect();

        return () => {
            trouverPartieService.disconnect();
        }
    }, []);

    const partiesEndRef = useRef(null)

    useEffect(() => {
        if(partiesEndRef)
        {
            partiesEndRef.current?.scrollIntoView( { behavior: "smooth" } );
        }
    }, [ partiesEncours ]);

    async function onBtnCreer()
    {
        const inputProfiljeu1 = document.querySelector("#nomprofiljeu1Creer");
        const inputProfiljeu2 = document.querySelector("#nomprofiljeu2Creer");

        const partie = await displayPartiesService.createPartie(inputProfiljeu1.value, inputProfiljeu2.value);
        if(partie)
        {
            await refreshPartiesEncours();
        }
    }

    async function refreshPartiesEncours()
    {
        setPartiesEncours(await displayPartiesService.getAllPartiesEncours());
    }

    async function onBtnOuvrirPartie(idPartie, sessionUsager)
    {
        if(idPartie)
            setToJeu({ idPartie: idPartie, sessionUsager: sessionUsager });
        // navigate("/PageJeu/" + idPartie, { state: {
        //     sessionUsager: sessionUsager
        // } });
    }

    async function onBtnRefreshPartiesEncours()
    {
        refreshPartiesEncours();
    }

    async function onBtnChercherPartie()
    {
        if(!rechercheEncours)
        {
            await trouverPartieService.startTrouver();
            setRechercheEncours(1);
        }
        else
        {
            await trouverPartieService.endTrouver();
            setRechercheEncours(0);
        }
    }

    async function onConnection()
    {
        setDisponnibleChercher(true);
    }

    async function onDisconnect()
    {
        setDisponnibleChercher(false);
    }

    async function onTrouveresult(trouveframe)
    {
        const partieId = trouveframe.partieId;
        if(partieId)
        {
            // navigate("/jeu/" + partieId);
            this.setToJeu({ idPartie: partieId, sessionUsager: sessionUsager });
        }
    }

    if (toJeu) {
        return <Navigate to={"/PageJeu/" + toJeu.idPartie} state={toJeu} replace={true} />;
    }

    return (
        <div className="parties-container">
            { disponnibleChercher && 
            <div className="panneau-parties-header card">
                <div className="card-body">
                    <h5 class="card-title">Trouver une partie</h5>
                    <div className="input-group mw-100 p-2">
                        <div className="input-group-prepend w-25">
                            <span className="input-group-text" id="basic-addon1">Joueur 1</span>
                        </div>
                        <input id="nomprofiljeu1Creer" type="text" className="form-control w-50" placeholder="Nom d'utilsateur du joueur 1" aria-label="Nom d'utilsateur du joueur des pièces blanches" aria-describedby="basic-addon1"></input>
                    </div>
                    <div className="input-group mw-100 p-2">
                        <div className="input-group-prepend w-25">
                            <span className="input-group-text" id="basic-addon2">Joueur 2</span>
                        </div>
                        <input id="nomprofiljeu2Creer" type="text" class="form-control w-50" placeholder="Nom d'utilsateur du joueur 2" aria-label="Nom d'utilsateur du joueur des pièces noires" aria-describedby="basic-addon2"></input>
                    </div>
                    <div className="input-group mw-100 p-2">
                        <button id="btnCreer" className="buttonCreate" onClick={onBtnCreer}>Créer match</button>
                        <button id="btnRafraichirParties" className="buttonRefresh" onClick={onBtnRefreshPartiesEncours}>Rafraichir</button>
                        <button id="btnChercherPartie" className="buttonChercher" onClick={onBtnChercherPartie}>Trouver</button>
                        { rechercheEncours == 1 && <label id="lblChercherPartie">recherche en cours</label> }
                    </div>
                </div>
                <div id="browser-parties" className="browser-parties card-body overflow-scroll">
                    <div className="input-group mw-100 p-2">
                        <DisplayPartiesServiceContext.Provider value={ { partiesEncours, setPartiesEncours, displayPartiesService } }>
                        <table className="table-parties table table-hover table-dark mw-100">
                            <colgroup>
                                <col span="1" style={ { width: "10%" } }/>
                                <col span="1" style={ { width: "40%" } }/>
                                <col span="1" style={ { width: "40%" } }/>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Joueur 1</th>
                                    <th scope="col">Joueur 2</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(partiesEncours ?? []).map((entry, i) =>
                                    // <DisplayPartieComponent ref={partiesEndRef} key={entry.id} partie={entry} id={"display-partie" + entry.id} onClick={() => onBtnOuvrirPartie(entry.id, sessionUsager) }></DisplayPartieComponent>)}
                                    <tr id={"display-partie" + entry.id} onClick={() => onBtnOuvrirPartie(entry.id, sessionUsager)} key={entry.id} ref={partiesEndRef}>
                                        <th scope="row">{ entry?.id }</th>
                                        <td>{ entry?.compte_joueur1 }</td>
                                        <td>{ entry?.compte_joueur2 }</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {/* <div className="liste-parties-soak"></div> */}
                        </DisplayPartiesServiceContext.Provider>
                    </div>
                </div>
            </div>
            }
        </div>
    );
   
}

export default PageListeJeux;