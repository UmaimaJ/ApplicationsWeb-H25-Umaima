import React, { useState, useEffect, useContext, useRef } from 'react';
import { Navigate } from "react-router-dom";

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

    const [ partiesEncours, setPartiesEncours ] = useState([]);
    const displayPartiesService = new DisplayPartiesService();

    const [ partieEncours, setPartieEncours ] = useState(null);
    const [ rechercheEncours, setRechercheEncours ] = useState();
    const [ disponnibleChercher, setDisponnibleChercher] = useState(false);
    const trouverPartieService = new TrouverPartieService(onConnection, onDisconnect, onTrouveresult);
    const [ mesParties, setMesParties ] = useState(true);

    useEffect(() => {
        refreshPartiesEncours();
    }, []);

    useEffect(() => {
        trouverPartieService.connect();

        return () => {
            trouverPartieService.endTrouver().then(() => {
                trouverPartieService.disconnect();
            });
        }
    }, []);

    const partiesEndRef = useRef(null)

    const partiesEnded = async () => {
        if(partiesEndRef)
        {
            partiesEndRef.current?.scrollIntoView( { behavior: "smooth" } );
        }
    };

    useEffect(() => {
        setRechercheEncours(sessionUsager?.rechercheencours ?? false);
    }, [ sessionUsager ]);

    async function onBtnCreer()
    {
        const inputProfiljeu1 = document.querySelector("#nomprofiljeu1Creer");
        const inputProfiljeu2 = document.querySelector("#nomprofiljeu2Creer");

        const inputProfiljeu1Invalid = document.querySelector("#nomprofiljeu1Creer-invalid");
        const inputProfiljeu2Invalid = document.querySelector("#nomprofiljeu2Creer-invalid");

        const compteProfiljeu1 = inputProfiljeu1.value.trim();
        const compteProfiljeu2 = inputProfiljeu2.value.trim();

        await setInvalidTooltip(inputProfiljeu1Invalid, null);
        await setInvalidTooltip(inputProfiljeu2Invalid, null);

        var erroredOnFields = [];

        if(!compteProfiljeu1 || compteProfiljeu1 === "")
        {
            await setInvalidTooltip(inputProfiljeu1Invalid, 'Le nom de compte ne peut pas être vide.');
            erroredOnFields.push(true);
        }
            
        if(!compteProfiljeu2 || compteProfiljeu2 === "")
        {
            await setInvalidTooltip(inputProfiljeu2Invalid, 'Le nom de compte ne peut pas être vide.');
            erroredOnFields.push(true);
        }

        if(erroredOnFields.length > 0)
            return;

        var erroredOnCreate = [];
        try{
            const partie = await displayPartiesService.createPartie(compteProfiljeu1, compteProfiljeu2);

            if(partie)
            {
                await refreshPartiesEncours();
            }
        }
        catch(error)
        {
            if(error.message === "createPartie: profiljeu 1 invalid")
            {
                await setInvalidTooltip(inputProfiljeu1Invalid, 'Entrez un nom de compte valide.');
                erroredOnCreate.push(true);
            }

            if(error.message === "createPartie: profiljeu 2 invalid")
            {
                await setInvalidTooltip(inputProfiljeu2Invalid, 'Entrez un nom de compte valide.');
                erroredOnCreate.push(true);
            }

            if(error.message === "createPartie: insert failed")
            {
                await setInvalidTooltip(inputProfiljeu1Invalid, 'Erreur interne du serveur.');
                erroredOnCreate.push(true);
                await setInvalidTooltip(inputProfiljeu2Invalid, 'Erreur interne du serveur.');
                erroredOnCreate.push(true);
            }
        }
                
    }

    async function setInvalidTooltip(tooltip, message)
    {
        if(!message || message === "")
            tooltip.style.display = "none";
        if(message)
            tooltip.style.display = "block";

        tooltip.innerText = message;
    }

    async function refreshPartiesEncours()
    {
        setPartiesEncours(await displayPartiesService.getAllPartiesEncours());
    }

    async function onBtnOuvrirPartie(idPartie, sessionUsager)
    {
        if(idPartie)
            setToJeu({ idPartie: idPartie, sessionUsager: sessionUsager });
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

    async function onMesPartiesClicked(event)
    {
        setMesParties(event.target.checked);
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
            if(partieId)
                setToJeu({ idPartie: partieId, sessionUsager: sessionUsager });
        }
    }

    if (toJeu) {
        return <Navigate to={"/PageJeu/" + toJeu.idPartie} replace={true} />;
    }

    return (
        <div className="parties-container">
            { disponnibleChercher && 
            <div className="panneau-parties-header card">
                <div className="card-body card-body-obtenir-partie">
                    <h5 class="card-title">Jouer</h5>
                    <ul class="nav nav-tabs" id="myTab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="creer-tab" data-bs-toggle="tab" data-bs-target="#creer" type="button" role="tab" aria-controls="creer" aria-selected="true">Créer</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="liste-tab" data-bs-toggle="tab" data-bs-target="#liste" type="button" role="tab" aria-controls="liste" aria-selected="false">Liste</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="trouver-tab" data-bs-toggle="tab" data-bs-target="#trouver" type="button" role="tab" aria-controls="trouver" aria-selected="false">Trouver</button>
                        </li>
                    </ul>
                    <div class="tab-content" id="myTabContent">
                        <div class="tab-pane fade show active" id="creer" role="tabpanel" aria-labelledby="home-tab">
                            <div className="input-group mw-100 p-1">
                                <div className="input-group-prepend w-15">
                                    <span className="input-group-text" id="basic-addon1">Joueur 1</span>
                                </div>
                                <input id="nomprofiljeu1Creer" type="text" className="form-control w-50" placeholder="Nom d'utilsateur du joueur 1" aria-label="Nom d'utilsateur du joueur 1" aria-describedby="basic-addon1"></input>
                                <div id="nomprofiljeu1Creer-invalid" className="invalid-tooltip"></div>
                            </div>
                            <br></br>
                            <div className="input-group mw-100 p-1">
                                <div className="input-group-prepend w-15">
                                    <span className="input-group-text" id="basic-addon2">Joueur 2</span>
                                </div>
                                <input id="nomprofiljeu2Creer" type="text" className="form-control w-50" placeholder="Nom d'utilsateur du joueur 2" aria-label="Nom d'utilsateur du joueur 2" aria-describedby="basic-addon2"></input>
                                <div id="nomprofiljeu2Creer-invalid" className="invalid-tooltip"></div>
                            </div>
                            <br></br>
                            <button id="btnCreer" className="buttonCreate" onClick={onBtnCreer}>Créer partie</button>
                        </div>
                        <div class="tab-pane fade" id="liste" role="tabpanel" aria-labelledby="liste-tab">
                            <div id="browser-parties" className="browser-parties card-body overflow-scroll">
                                <div className="input-group mw-100 p-2">
                                    {/* <label>
                                        <input id="cbMesParties"
                                            label="Mes parties"
                                            onChange={onMesPartiesClicked}
                                            key="mesPartiesKey"
                                            type="checkbox"
                                            checked={mesParties}
                                        />
                                        Mes parties
                                    </label> */}
                                    {/* <br></br> */}
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
                                            <>
                                                {Object.values(partiesEncours ?? []).map((entry, i) =>
                                                {
                                                    // if(mesParties)
                                                        if(!(entry.id_joueur1 === sessionUsager?.id_profiljeu || entry.id_joueur2 === sessionUsager?.id_profiljeu))
                                                            return <></>;
                                                    // <DisplayPartieComponent ref={partiesEndRef} key={entry.id} partie={entry} id={"display-partie" + entry.id} onClick={() => onBtnOuvrirPartie(entry.id, sessionUsager) }></DisplayPartieComponent>)}
                                                    const trcomp = (<tr id={"display-partie" + entry.id} onClick={() => onBtnOuvrirPartie(entry.id, sessionUsager)} key={entry.id} ref={partiesEndRef}>
                                                            <th scope="row">{ entry?.id }</th>
                                                            <td>{ entry?.compte_joueur1 }</td>
                                                            <td>{ entry?.compte_joueur2 }</td>
                                                        </tr>);
                                                    if(i == partiesEncours.length - 1)
                                                    {
                                                        partiesEnded();
                                                    }
                                                    return trcomp;
                                                }
                                                )}
                                            </>
                                        </tbody>
                                    </table>
                                    </DisplayPartiesServiceContext.Provider>
                                </div>
                            </div>
                            <button id="btnRafraichirParties" className="buttonRefresh" onClick={onBtnRefreshPartiesEncours}>Rafraichir</button>
                        </div>
                        <div class="tab-pane fade" id="trouver" role="tabpanel" aria-labelledby="trouver-tab">
                            <div className="input-group mw-100 p-1">
                                <button id="btnChercherPartie" className="buttonChercher" onClick={onBtnChercherPartie}>Trouver</button>
                                { rechercheEncours == 1 && <label id="lblChercherPartie">recherche en cours</label> }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            }
        </div>
    );
   
}

export default PageListeJeux;