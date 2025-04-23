import React, { useState, useEffect, useContext } from 'react';

import 'bootstrap/dist/css/bootstrap.css';
import './style/PageListeJeux.css';
import DisplayPartieComponent from "./components/DisplayPartieComponent";
import PageJeu from "./PageJeu";

import { ComptesServiceContext, ComptesService } from "../login/service/ComptesService";
import { AccueilServiceContext } from '../accueil/service/AccueilService';
import { DisplayPartiesServiceContext, DisplayPartiesService } from './service/DisplayPartiesService';
import { TrouverPartieServiceContext, TrouverPartieService } from "./service/TrouverPartieService";

function PageListeJeux() {
    const { pageCourante, setPageCourante, accueilService } = useContext(AccueilServiceContext);
    const { sessionUsager, setSessionUsager, comptesService } = useContext(ComptesServiceContext);

    const displayPartiesService = new DisplayPartiesService();
    const [ partiesEncours, setPartiesEncours ] = useState([]);

    const trouverPartieService = new TrouverPartieService(onConnection, onDisconnect, onTrouveresult);
    const [ partieEncours, setPartieEncours ] = useState(null);
    const [ chercherEncours, setChercherEncours ] = useState(false);
    

    useEffect(() => {
        refreshPartiesEncours();
    }, []);

    useEffect(() => {
        trouverPartieService.connect();

        return () => {
            trouverPartieService.disconnect();
        }
    }, []);

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
        setPageCourante(<PageJeu idPartie={idPartie} sessionUsager={sessionUsager}></PageJeu>)
    }

    async function onBtnRefreshPartiesEncours()
    {
        refreshPartiesEncours();
    }

    async function onBtnChercherPartie()
    {
        if(!chercherEncours)
        {
            await trouverPartieService.startTrouver();
            setChercherEncours(true);
        }
        else
        {
            await trouverPartieService.endTrouver();
            setChercherEncours(false);
        }
    }

    async function onConnection()
    {
        const buttonChercherPartie = document.querySelector("#btnChercherPartie");
        // buttonChercherPartie.setAttribute("hidden", "false");
    }

    async function onDisconnect()
    {
        const buttonChercherPartie = document.querySelector("#btnChercherPartie");
        // buttonChercherPartie.setAttribute("hidden", "true");
    }

    async function onTrouveresult(trouveframe)
    {
        const partieId = trouveframe.partieId;
        console.log("ONTROUVE:");
        console.log(trouveframe);
        if(partieId)
        {
            setPageCourante(<PageJeu idPartie={partieId} sessionUsager={sessionUsager}></PageJeu>)
        }
    }

    return (
        <div class="panneau-parties-container">
            <div class="panneau-parties-header">
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <span class="input-group-text" style={ { width: 125} } id="basic-addon1">Blanches</span>
                    </div>
                    <input id="nomprofiljeu1Creer" type="text" class="form-control" placeholder="Nom d'utilsateur du joueur des pièces blanches" aria-label="Nom d'utilsateur du joueur des pièces blanches" aria-describedby="basic-addon1"></input>
                </div>
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <span class="input-group-text" style={ { width: 125} } id="basic-addon2">Noires</span>
                    </div>
                    <input id="nomprofiljeu2Creer" type="text" class="form-control" placeholder="Nom d'utilsateur du joueur des pièces noires" aria-label="Nom d'utilsateur du joueur des pièces noires" aria-describedby="basic-addon2"></input>
                </div>
                <button id="btnCreer" class="buttonCreate" onClick={onBtnCreer}>Créer match</button>
                <button id="btnRafraichirParties" class="buttonRefresh" onClick={onBtnRefreshPartiesEncours}>Rafraichir</button>
                <button id="btnChercherPartie" class="buttonChercher" hidden={false} onClick={onBtnChercherPartie}>Chercher</button>
            </div>
            <DisplayPartiesServiceContext.Provider value={ { partiesEncours, setPartiesEncours, displayPartiesService } }>
            <div class="liste-parties">
                <table class="table table-hover table-dark">
                    <thead>
                        <tr>
                            <th scope="col">Identificateur</th>
                            <th scope="col">Joueur 1</th>
                            <th scope="col">Joueur 2</th>
                        </tr>
                    </thead>
                    <tbody>
                    {Object.values(partiesEncours ?? []).map((entry, i) =>
                        <DisplayPartieComponent key={entry.id} partie={entry} id={"display-partie" + entry.id} onClick={() => onBtnOuvrirPartie(entry.id, sessionUsager) }></DisplayPartieComponent>)}
                    </tbody>
                </table>
                <div class="liste-parties-soak"></div>
            </div>
            </DisplayPartiesServiceContext.Provider>
        </div>
    );
   
}

export default PageListeJeux;