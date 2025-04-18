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
import { AccueilServiceContext } from '../accueil/service/AccueilService.js';
import PageListeJeux from './PageListeJeux.jsx';

class PageJeu extends React.Component {

    constructor(props)
    {
        super(props);

        this.onConnect = this.onConnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.onMoveresult = this.onMoveresult.bind(this);
        this.onJeuPieceDrop = this.onJeuPieceDrop.bind(this);
        this.moveQueueThink = this.moveQueueThink.bind(this);
        this.moveQueueThinkId = null;
        this.moveQueue = [];

        const jeuService = new JeuService(this.onConnect, this.onDisconnect, this.onMoveresult);

        this.state = {
            jeuService: jeuService,
            connected: false,
            partie: null,
            game: null,
            profiljeu1: null,
            profiljeu2: null,
            profiljeuUp: null,
            profiljeuDown: null,
            idGagnant: null
        }

        this.onBtnOuvrirListe = this.onBtnOuvrirListe.bind(this);

    }

    async componentDidMount()
    {
        setTimeout(async () => {
            if(this.props.idPartie)
            {
                await this.updatePartie(this.props.idPartie, this.props.sessionUsager);
            }
        }, 500);

        if(this.messagesEnd)
            this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }

    async componentDidUpdate()
    {
        if(this.messagesEnd)
            this.messagesEnd.scrollIntoView({ behavior: "smooth" });
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
                const game = partie.historiquetables ? new Chess(partie.historiquetables) : new Chess();

                await this.state.jeuService.connectPartie(partie.id);
                await this.setStateAsync({
                    partie: partie,
                    game: game,
                    profiljeu1: profiljeu1,
                    profiljeu2: profiljeu2,
                    profiljeuUp: profiljeuUp,
                    profiljeuDown: profiljeuDown,
                    idGagnant: partie.id_gagnant
                });
            }
            else
            {
                await this.state.jeuService.disconnectPartie();
                await this.setStateAsync({
                    partie: null,
                    game: null,
                    profiljeu1: null,
                    profiljeu2: null,
                    profiljeuUp: null,
                    profiljeuDown: null,
                    idGagnant: null
                });
            }
        }
        else
        {
            await this.state.jeuService.disconnectPartie();
            await this.setStateAsync({
                partie: null,
                game: null,
                profiljeu1: null,
                profiljeu2: null,
                profiljeuUp: null,
                profiljeuDown: null,
                idGagnant: null
            });
        }
            
    }

    async onConnect()
    {
        if(this.state.connected)
            await this.resetConnectionStatus();

        if(!this.state.connected)
            await this.setStateAsync({
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
        var move = null;
        if(this.state.connected)
        {
            while((move = this.moveQueue.pop()) !== undefined)
            {
                await this.simulateMove(move);
            }
        }
    }

    async queueMove(move)
    {
        this.moveQueue.push(move);
    }

    async onDisconnect()
    {
        await this.setStateAsync({
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
            if(this.moveQueue.length > 0)
                return;

            if(this.state.partie?.id_joueurcourant != this.state.profiljeuDown?.id)
                return;

            const data = {
                partieId: this.state.partie.id,
                profiljeuId: this.state.profiljeu1.id,
                move: move
            };
            this.state.jeuService.io.emit("move", { data: data });
        }
    }

    async simulateMove(move) {
        console.log(move);
        const gameCopy = this.state.game;
        try
        {
            var result = null;
            if(move)
            {
                result = gameCopy.move(move);
                await this.setStateAsync({ game: gameCopy });
                await this.thinkJoueurCourant();
            }
            if(this.state.game.isGameOver())
            {
                const idGagnant = this.state.game.turn() == "b" ? this.state.profiljeu1.id : this.state.profiljeu2.id;
                await this.setStateAsync({
                    idGagnant: idGagnant,
                    partie: {
                        ...this.state.partie,
                        id_gagnant: idGagnant
                    }
                });
                await this.thinkJoueurCourant();
            }
            return result; // null if it wont move this time after move calculated
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

    async onBtnOuvrirListe(event, setPageCourante)
    {
        setPageCourante(<PageListeJeux></PageListeJeux>);
    }

    render() {
        return ( this.state.connected &&
            // Rendre disponnible la service avec le contexte aux composantes sous-jacentes
            <AccueilServiceContext.Consumer>
            {({pageCourante, setPageCourante, accueilService}) => (
            <ComptesServiceContext.Consumer>
            {({sessionUsager, setSessionUsager, comptesService}) => (
                <JeuServiceContext.Provider value={ { service: this.state.jeuService} }>
                    <div class="jeu-container">
                        <div class="playpage-game">
                            <div class="playpage-infobar">
                                <div class="playpage-profile left clear" style={ !this.state.idGagnant ? {backgroundColor: this.state.partie?.id_joueurcourant != sessionUsager.id_profiljeu ? "green": ""} : {}}>
                                    <div class="playpage-profile-pfp">
                                        <img class="playpage-profile-pfp-icon" src={rectangle} />
                                    </div>
                                    <div class="playpage-profile-userdata">
                                        <label class="playpage-profile-username">{this.state.profiljeuUp?.compte ?? "<blank>"}</label>
                                        <label class="playpage-profile-userinfo">{this.state.profiljeuUp?.elo ?? "sans placement"}</label>
                                        <img className="playpage-profile-userflag" src={findFlagUrlByIso2Code(this.state.profiljeuUp?.pays ?? "")}></img>
                                    </div>
                                </div>
                                { (this.state.idGagnant != null) &&
                                    (<div class="playpage-timer right">
                                        <>
                                            <label class="playpage-timer-label">{this.state.idGagnant != sessionUsager.id_profiljeu ? "Gagnant" : "Perdant" }</label>
                                        </>
                                    </div>
                                )}
                            </div>
                            <div className="playpage-game-board board">
                                <Chessboard id="BasicBoard" position={this.state.game?.fen() ?? "start"} onPieceDrop={this.onJeuPieceDrop} boardOrientation={sessionUsager.id_profiljeu == this.state.profiljeu1?.id ? "white" : "black"}/>
                            </div>
                            <div class="playpage-infobar">
                                <div class="playpage-profile left clear" style={ !this.state.idGagnant ? {backgroundColor: this.state.partie?.id_joueurcourant == sessionUsager.id_profiljeu ? "green": ""} : {}}>
                                    <div class="playpage-profile-pfp">
                                        <img class="playpage-profile-pfp-icon" src={rectangle} />
                                    </div>
                                    <div class="playpage-profile-userdata">
                                        <label class="playpage-profile-username">{this.state.profiljeuDown?.compte ?? "<blank>"}</label>
                                        <label class="playpage-profile-userinfo">{this.state.profiljeuDown?.elo ?? "sans placement"}</label>
                                        <img className="playpage-profile-userflag" src={findFlagUrlByIso2Code(this.state.profiljeuDown?.pays ?? "")}></img>
                                    </div>
                                </div>
                                { (this.state.idGagnant != null) &&
                                    (<div class="playpage-timer right">
                                        <>
                                            <label class="playpage-timer-label">{this.state.idGagnant == sessionUsager.id_profiljeu ? "Gagnant" : "Perdant" }</label>
                                        </>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="my-sidebar">
                            <button className="btn-retourner" onClick={(event) => this.onBtnOuvrirListe(event, setPageCourante)}>Retourner</button>
                            <div id="move-info-panel" className="move-info-panel">
                                {this.state.game?.history({ verbose: true }).map((entry, i) => 
                                    <div key={i} ref={(el) => { this.messagesEnd = el; }} className="move-entry"><label style={{color: (entry.color === 'w'? 'white' : "grey")}} key={i}>joueur: {entry.color === 'w' ? this.state.profiljeu1.compte : this.state.profiljeu2.compte} de: {entry.from} à: {entry.to} {entry.captured && " capturé: " + entry.captured}
                                    </label></div>)}
                            </div>
                        </div>
                    </div>
                </JeuServiceContext.Provider>
            )}
            </ComptesServiceContext.Consumer>
            )}
            </AccueilServiceContext.Consumer>
        );
    }

    async setStateAsync(newState) {
        return new Promise((resolve) => {
            this.setState(newState, resolve);
        });
    };
   
    async delay(ms) 
    {
        return new Promise(res => setTimeout(res, ms));
    }

}

export default PageJeu;