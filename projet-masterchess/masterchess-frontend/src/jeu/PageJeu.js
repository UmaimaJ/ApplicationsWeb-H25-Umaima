import { createContext, useContext } from 'react';
import React from 'react';

import { toDests, pieceMap } from './utilJeu.js';
import { Chessboard } from "react-chessboard";
import { Chess, Move, SQUARES } from "chess.js";

import { findFlagUrlByIso2Code } from "country-flags-svg";

import rectangle from "../style/rectangle.svg";
import timericon from "../style/timer-icon.svg";
import board from "../style/board.svg";

import 'bootstrap/dist/css/bootstrap.css';
import './PageJeu.css';
import DisplayPartieComponent from "./components/DisplayPartieComponent";

import { JeuServiceContext, JeuService } from "./service/JeuService";
import { ComptesServiceContext } from "../login/service/ComptesService.js"
import { DisplayPartiesServiceContext, DisplayPartiesService } from './service/DisplayPartiesService';

class PageJeu extends React.Component {

    constructor(props)
    {
        super(props);

        this.onJeuPieceDrop = this.onJeuPieceDrop.bind(this);
        this.onBtnCreer = this.onBtnCreer.bind(this);
        this.onBtnOuvrirPartie = this.onBtnOuvrirPartie.bind(this);
        this.onBtnOuvrirListe = this.onBtnOuvrirListe.bind(this);
        this.onBtnRefreshPartiesEncours = this.onBtnRefreshPartiesEncours.bind(this);
        
        this.onConnect = this.onConnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.onMoveresult = this.onMoveresult.bind(this);

        this.moveQueueThink = this.moveQueueThink.bind(this);
        this.moveQueueThinkId = null;
        this.moveQueue = [];

        const displayPartiesService = new DisplayPartiesService();
        const jeuService = new JeuService(this.onConnect, this.onDisconnect, this.onMoveresult);

        this.state = {
            game: new Chess(),
            jeuService: jeuService,
            displayPartiesService: displayPartiesService,
            enListe: true,
            connected: false,
            partie: null,
            profiljeu1: null,
            profiljeu2: null,
            profiljeuUp: null,
            profiljeuDown: null,
            partiesEncours: null,
            gagnant: null,
            choixPromotion: null
        }

    }

    static async getDerivedStateFromProps(props, state)
    {
    }

    async componentDidMount()
    {
        if(this.state.enListe)
        {
            await this.updatePartiesEncours();
        }
    }

    async componentWillUnmount()
    {
        // await this.updatePartie(null, null);
    }

    async updatePartiesEncours()
    {
        const partiesEncours = await this.state.jeuService.getAllPartiesEncours();
        this.setState({
            partiesEncours: partiesEncours
        });
    }

    async updatePartie(idPartie, sessionUsager)
    {
        if(idPartie)
        {
            const partie = await this.state.jeuService.getPartie(idPartie);
    
            if(partie)
            {
                const profiljeu1 = await this.state.jeuService.getProfiljeu(partie?.id_joueur1);
                const profiljeu2 = await this.state.jeuService.getProfiljeu(partie?.id_joueur2);
                const profiljeuUp = (profiljeu1?.id == sessionUsager.id_profiljeu ? profiljeu2 : profiljeu1);
                const profiljeuDown = (profiljeu1?.id != sessionUsager.id_profiljeu ? profiljeu2 : profiljeu1);

                await this.state.jeuService.connectPartie(partie.id);
                this.setState({
                    game: partie?.historiquetables ? new Chess(partie.historiquetables) : new Chess(),
                    partie: partie,
                    profiljeu1: profiljeu1,
                    profiljeu2: profiljeu2,
                    profiljeuUp: profiljeuUp,
                    profiljeuDown: profiljeuDown,
                    gagnant: partie.id_gagnant
                });
            }
            else
            {
                await this.state.jeuService.disconnectPartie();
                this.setState({
                    game: null,
                    partie: null,
                    profiljeu1: null,
                    profiljeu2: null,
                    profiljeuUp: null,
                    profiljeuDown: null,
                    gagnant: null
                });
            }
        }
        else
        {
            await this.state.jeuService.disconnectPartie();
            this.setState({
                game: null,
                partie: null,
                profiljeu1: null,
                profiljeu2: null,
                profiljeuUp: null,
                profiljeuDown: null,
                gagnant: null
            });
        }
            
    }

    async onConnect()
    {
        if(this.state.connected)
            await this.resetConnectionStatus();

        if(!this.state.connected)
            this.setState({
                connected: true
            });
    }

    async resetConnectionStatus()
    {
        if(this.moveQueueThinkId)
        {
            clearTimeout(this.moveQueueThinkId);
            this.moveQueue = [];
            this.moveQueueThinkId = null;
        }
    }

    async moveQueueThink()
    {
        let moveframe = null;
        if(this.state.connected)
        {
            while(moveframe = this.moveQueue.pop())
            {
                if(moveframe) await this.simulateMove(moveframe);
            }
        }
    }

    async queueMove(moveframe)
    {
        this.moveQueue.push(moveframe);
    }

    async onDisconnect()
    {
        this.setState({
            connected: false
        });
    }

    async onMoveresult(moveframe)
    {
        if(moveframe.partieId == this.state.partie?.id)
        {
            await this.queueMove(moveframe.move);
            if(this.moveQueueThinkId)
            {
                clearTimeout(this.moveQueueThinkId);
                this.moveQueueThinkId = null;
            }
            this.moveQueueThinkId = setTimeout(this.moveQueueThink, 1000);
        }
    }

    async makeAMove(move)
    {
        if(this.state.connected)
        {
            const data = {
                partieId: this.state.partie.id,
                profiljeuId: this.state.profiljeu1.id,
                move: move
            };
            this.state.jeuService.io.emit("move", { data: data });
        }
    }

    async simulateMove(move) {
        const gameCopy = this.state.game;
        try
        {
            const result = gameCopy.move(move);
            await this.setStateAsync({ game: gameCopy });
            await this.thinkJoueurCourant();
            if(this.state.game.isCheckmate())
            {
                const gagnant = this.state.game.turn() == "b" ? this.state.profiljeu1.id : this.state.profiljeu2.id;
                this.setState({
                    gagnant: gagnant,
                    partie: {
                        ...this.state.partie,
                        id_gagnant: gagnant
                    }
                });
                await this.thinkJoueurCourant();
            }
            return result; // null if cant move
        }
        catch(err)
        {
            return null;
        }
        return null;
        
    }

    async thinkJoueurCourant()
    {
        const joueurCourantId = this.state.partie.id_joueurcourant != this.state.partie.id_joueur1 ? this.state.partie.id_joueur1 : this.state.partie.id_joueur2;
        this.setState(
            {
                partie: {
                    ...this.state.partie,
                    id_joueurcourant: joueurCourantId
                }
            }
        );
    }

    async onJeuPieceDrop(sourceSquare, targetSquare, piece)
    {
        const promotion = pieceMap[piece];

        await this.makeAMove({
            from: sourceSquare,
            to: targetSquare,
            promotion: promotion
        });
    }

    async onBtnCreer()
    {
        const inputProfiljeu1 = document.querySelector("#nomprofiljeu1Creer");
        const inputProfiljeu2 = document.querySelector("#nomprofiljeu2Creer");

        const partie = await this.state.jeuService.createPartie(inputProfiljeu1.value, inputProfiljeu2.value);
        if(partie)
        {
            await this.onBtnRefreshPartiesEncours();
        }
    }

    async onBtnOuvrirPartie(idPartie, sessionUsager)
    {
        await this.updatePartie(idPartie, sessionUsager);
        this.setState({
            enListe: false
        });
    }

    async onBtnOuvrirListe()
    {
        await this.updatePartie(null, null);
        this.setState({
            enListe: true
        });
    }

    async onBtnRefreshPartiesEncours()
    {
        await this.updatePartiesEncours();
    }

    render() {
        if(this.state.enListe)
        {
            return (
                <ComptesServiceContext.Consumer>
                {({sessionUsager, setSessionUsager, comptesService}) => (
                    <div class="panneau-parties-container">
                        <div class="panneau-parties-header">
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text" style={ { width: 125} } id="basic-addon1">First player</span>
                                </div>
                                <input id="nomprofiljeu1Creer" type="text" class="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1"></input>
                            </div>
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text" style={ { width: 125} } id="basic-addon2">Second player</span>
                                </div>
                                <input id="nomprofiljeu2Creer" type="text" class="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon2"></input>
                            </div>
                            <button id="btnCreer" class="buttonCreate" onClick={this.onBtnCreer}>Create match</button>
                            <button id="btnRefreshParties" class="buttonRefresh" onClick={this.onBtnRefreshPartiesEncours}>Refresh</button>
                        </div>
                        <DisplayPartiesServiceContext.Provider value={ { service: this.state.displayPartiesService } }>
                        <div class="liste-parties">
                            <table class="table table-hover table-dark">
                                <thead>
                                    <tr>
                                        <th scope="col">Identifier</th>
                                        <th scope="col">Player one</th>
                                        <th scope="col">Player two</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {Object.values(this.state.partiesEncours ? this.state.partiesEncours : [] ).map((entry, i) =>
                                    <DisplayPartieComponent key={entry.id} partie={entry} id={"display-partie" + entry.id} onClick={() => this.onBtnOuvrirPartie(entry.id, sessionUsager) }></DisplayPartieComponent>)}
                                </tbody>
                            </table>
                            <div class="liste-parties-soak"></div>
                        </div>
                        </DisplayPartiesServiceContext.Provider>
                    </div>
                )}
                </ComptesServiceContext.Consumer>
            );
        }
        return (
            // Rendre disponnible le service avec le contexte
            <ComptesServiceContext.Consumer>
            {({sessionUsager, setSessionUsager, comptesService}) => (
                <JeuServiceContext.Provider value={ { service: this.state.jeuService} }>
                    <div class="jeu-container">
                        <div class="playpage-game">
                            <div class="playpage-infobar">
                                <div class="playpage-profile left clear" style={ !this.state.gagnant ? {backgroundColor: this.state.partie.id_joueurcourant != sessionUsager.id_profiljeu ? "green": ""} : {}}>
                                    <div class="playpage-profile-pfp">
                                        <img class="playpage-profile-pfp-icon" src={rectangle} />
                                    </div>
                                    <div class="playpage-profile-userdata">
                                        <label class="playpage-profile-username">{this.state.profiljeuUp?.compte ?? "<blank>"}</label>
                                        <label class="playpage-profile-userinfo">{this.state.profiljeuUp?.elo ?? "sans placement"}</label>
                                        <img className="playpage-profile-userflag" src={findFlagUrlByIso2Code(this.state.profiljeuUp?.pays ?? "")}></img>
                                    </div>
                                </div>
                                { (this.state.gagnant != null) &&
                                    (<div class="playpage-timer right">
                                        <>
                                            <label class="playpage-timer-label">{this.state.gagnant != sessionUsager.id_profiljeu ? "Gagnant" : "Perdant" }</label>
                                        </>
                                    </div>
                                )}
                            </div>
                            <div className="playpage-game-board board">
                                <Chessboard id="BasicBoard" position={this.state.game?.fen() ?? ""} onPieceDrop={this.onJeuPieceDrop} boardOrientation={sessionUsager.id_profiljeu == this.state.profiljeu1.id? "white" : "black"}/>
                            </div>
                            <div class="playpage-infobar">
                                <div class="playpage-profile left clear" style={ !this.state.gagnant ? {backgroundColor: this.state.partie.id_joueurcourant == sessionUsager.id_profiljeu ? "green": ""} : {}}>
                                    <div class="playpage-profile-pfp">
                                        <img class="playpage-profile-pfp-icon" src={rectangle} />
                                    </div>
                                    <div class="playpage-profile-userdata">
                                        <label class="playpage-profile-username">{this.state.profiljeuDown?.compte ?? "<blank>"}</label>
                                        <label class="playpage-profile-userinfo">{this.state.profiljeuDown?.elo ?? "sans placement"}</label>
                                        <img className="playpage-profile-userflag" src={findFlagUrlByIso2Code(this.state.profiljeuDown?.pays ?? "")}></img>
                                    </div>
                                </div>
                                { (this.state.gagnant != null) &&
                                    (<div class="playpage-timer right">
                                        <>
                                            <label class="playpage-timer-label">{this.state.gagnant == sessionUsager.id_profiljeu ? "Gagnant" : "Perdant" }</label>
                                        </>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div class="my-sidebar">
                            <button class="btn-retourner" onClick={this.onBtnOuvrirListe}>Retourner</button>
                            <div class="move-info-panel">
                                {this.state.game?.history({ verbose: true }).map((entry, i) =>
                                    <label style={{color: (entry.color === 'w'? 'white' : "black"), backgroundColor: "grey"}} key={i}>joueur: {entry.color === 'w' ? this.state.profiljeu1.compte : this.state.profiljeu2.compte} from: {entry.from} to: {entry.to}
                                    </label>)}
                            </div>
                        </div>
                    </div>
                </JeuServiceContext.Provider>
            )}
            </ComptesServiceContext.Consumer>
        );
    }

    async setStateAsync(newState) {
        return new Promise((resolve) => {
            this.setState(newState, resolve);
        });
    };
   
}

export default PageJeu;