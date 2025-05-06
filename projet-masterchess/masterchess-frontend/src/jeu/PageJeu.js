import React, { Component } from "react";
import { withParams, withLocation, withNavigation, withSessionUsager } from '../util/wrappers.js';

import { toDests, pieceMap } from './utilJeu.js';
import { Chessboard } from "react-chessboard";
import { Chess, Move, SQUARES } from "chess.js";

import { findFlagUrlByIso2Code } from "country-flags-svg";

import person from "../style/person2.svg";
import timericon from "../style/timer-icon.svg";

import 'bootstrap/dist/css/bootstrap.css';
import './PageJeu.css';

import { JeuServiceContext, JeuService } from "./service/JeuService";
import { ComptesServiceContext } from "../login/service/ComptesService.js"
import { DisplayPartiesServiceContext, DisplayPartiesService } from './service/DisplayPartiesService';
import { AccueilServiceContext } from '../accueil/service/AccueilService.js';

class PageJeu extends React.Component {

    constructor(props)
    {
        super(props);

        this.onConnect = this.onConnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);

        this.onMoveresult = this.onMoveresult.bind(this);
        this.onCheckresult = this.onCheckresult.bind(this);
        this.onEndroundresult = this.onEndroundresult.bind(this);
        this.onJeuPieceDrop = this.onJeuPieceDrop.bind(this);

        this.moveQueueThink = this.moveQueueThink.bind(this);
        this.moveQueueThinkId = null;
        this.moveQueue = [];
        this.checkQueueThink = this.checkQueueThink.bind(this);
        this.checkQueueThinkId = null;
        this.checkQueue = [];
        this.endroundQueueThink = this.endroundQueueThink.bind(this);
        this.endroundQueueThinkId = null;
        this.endroundQueue = [];

        const jeuService = new JeuService(this.onConnect, this.onDisconnect, this.onMoveresult, this.onCheckresult, this.onEndroundresult);

        this.state = {
            jeuService: jeuService,
            connected: false,
            partie: null,
            game: null,
            profiljeu1: null,
            profiljeu2: null,
            profiljeuUp: null,
            profiljeuDown: null,
            timerUp: null,
            timerDown: null,
            timerUproundstart: null,
            timerDownroundstart: null,
            gagnantId: null,
            joueurcourantId: null,
            timerfuncIdUp: null,
            timerfuncIdDown: null,
            timersPartis: false
        }

        this.onBtnOuvrirListe = this.onBtnOuvrirListe.bind(this);

    }

    async componentDidMount()
    {
        setTimeout(async () => {
            console.log(this.props);
            if(this.props.params.idPartie)
            {
                await this.updatePartie(this.props.params.idPartie, this.props.sessionUsager);
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

    async componentWillUnmount()
    {
        await this.stopTimers();
        await this.updatePartie(null);
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
                const timerUp = (profiljeu1?.id == sessionUsager.id_profiljeu ? partie.timer2roundsum : partie.timer1roundsum);
                const timerDown = (profiljeu1?.id != sessionUsager.id_profiljeu ? partie.timer2roundsum : partie.timer1roundsum);
                const timerUproundstart = (profiljeu1?.id == sessionUsager.id_profiljeu ? partie.timer2roundstart : partie.timer1roundstart);
                const timerDownroundstart = (profiljeu1?.id != sessionUsager.id_profiljeu ? partie.timer2roundstart : partie.timer1roundstart);
                const game = partie.historiquetables ? new Chess(partie.historiquetables) : new Chess();

                await this.state.jeuService.connectPartie(partie.id);
                await this.setStateAsync({
                    partie: partie,
                    game: game,
                    profiljeu1: profiljeu1,
                    profiljeu2: profiljeu2,
                    profiljeuUp: profiljeuUp,
                    profiljeuDown: profiljeuDown,
                    timerUp: timerUp,
                    timerDown: timerDown,
                    timerUproundstart: timerUproundstart,
                    timerDownroundstart: timerDownroundstart,
                    timerDisplayUp: timerUp,
                    timerDisplayDown: timerDown,
                    gagnantId: partie.id_gagnant,
                    joueurcourantId: partie.id_joueurcourant,
                });

                if(this.state.timerUp && this.state.timerDown)
                {
                    if(!this.state.timersPartis)
                        await this.startTimers();
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
                    timerUp: null,
                    timerDown: null,
                    timerDisplayUp: null,
                    timerDisplayDown: null,
                    gagnantId: null,
                    joueurcourantId: null,
                    timerfuncIdUp: null,
                    timerfuncIdDown: null,
                    timersPartis: false
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
                timerUp: null,
                timerDown: null,
                timerDisplayUp: null,
                timerDisplayDown: null,
                gagnantId: null,
                joueurcourantId: null,
                timerfuncIdUp: null,
                timerfuncIdDown: null,
                timersPartis: false
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

    async onDisconnect()
    {
        await this.setStateAsync({
            connected: false
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

        if(this.checkQueueThinkId)
        {
            clearTimeout(this.checkQueueThinkId);
            this.checkQueue = [];
            this.checkQueueThinkId = null;
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

    async endroundQueueThink()
    {
        var endround = null;
        if(this.state.connected)
        {
            while((endround = this.endroundQueue.pop()) !== undefined)
            {
                await this.simulateEndround(endround);
            }
        }
    }

    async queueEndround(endround)
    {
        this.endroundQueue.push(endround);
    }

    async checkQueueThink()
    {
        var check = null;
        if(this.state.connected)
        {
            while((check = this.checkQueue.pop()) !== undefined)
            {
                await this.simulateCheck(check);
            }
        }
    }

    async queueCheck(check)
    {
        this.checkQueue.push(check);
    }

    async onMoveresult(moveframe)
    {
        if(moveframe.partieId == this.state.partie?.id)
        {
            if(this.state.partie.statut == 2)
                return;

            await this.queueMove(moveframe.move);
            if(this.moveQueueThinkId)
            {
                clearTimeout(this.moveQueueThinkId);
                this.moveQueueThinkId = null;
            }
            this.moveQueueThinkId = setTimeout(this.moveQueueThink, 100);
        }
    }

    async onEndroundresult(endroundframe)
    {
        if(endroundframe.partieId == this.state.partie?.id)
        {
            if(this.state.partie.statut == 2)
                return;

            await this.queueEndround(endroundframe.endround);
            if(this.endroundQueueThinkId)
            {
                clearTimeout(this.endroundQueueThinkId);
                this.endroundQueueThinkId = null;
            }
            this.endroundQueueThinkId = setTimeout(this.endroundQueueThink, 100);
        }
    }

    async onCheckresult(checkframe)
    {
        if(checkframe.partieId == this.state.partie?.id)
        {
            if(this.state.partie.statut == 2)
                return;

            await this.queueCheck(checkframe.check);
            if(this.checkQueueThinkId)
            {
                clearTimeout(this.checkQueueThinkId);
                this.checkQueueThinkId = null;
            }
            this.checkQueueThinkId = setTimeout(this.checkQueueThink, 100);
        }
    }

    async makeAMove(move)
    {
        if(this.state.connected)
        {
            if(this.state.partie.statut == 2)
                return;

            if(this.state.joueurcourantId != this.state.profiljeuDown.id)
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
        if(this.state.partie.statut == 2)
            return;

        const gameCopy = this.state.game;
        try
        {
            var result = null;
            if(move)
            {
                result = gameCopy.move(move);
                await this.setStateAsync({ game: gameCopy });
            }
            return result; // null if it wont move this time after move calculated
        }
        catch(err)
        {
            return null;
        }
        return null;
        
    }

    async simulateEndround(endround)
    {
        if(this.state.partie.statut == 2)
            return;

        const partie = this.state.partie;
        const timerUp = (this.state.profiljeu1?.id == this.state.profiljeuDown.id ? endround.timer2roundsum : endround.timer1roundsum);//2 == up
        const timerDown = (this.state.profiljeu1?.id != this.state.profiljeuDown.id ? endround.timer2roundsum : endround.timer1roundsum);//2 == down
        const timerUproundstart = (this.state.profiljeu1?.id == this.state.profiljeuDown.id ? endround.timer2roundstart : endround.timer1roundstart);//2 == up
        const timerDownroundstart = (this.state.profiljeu1?.id != this.state.profiljeuDown.id ? endround.timer2roundstart : endround.timer1roundstart);//2 == down

        await this.setStateAsync({
            partie: {
                ...this.state.partie,
                id_joueurcourant: endround.id_joueurcourant,
                timer1roundsum: endround.timer1roundsum,
                timer2roundsum: endround.timer2roundsum,
                timer1roundstart: endround.timer1roundstart,
                timer2roundstart: endround.timer2roundstart
            },
            timerUp: timerUp,
            timerDown: timerDown,
            timerDisplayUp: timerUp,
            timerDisplayDown: timerDown,
            timerUproundstart: timerUproundstart,
            timerDownroundstart: timerDownroundstart,
            joueurcourantId: endround.id_joueurcourant,
        });

        //les deux joueurs ont fait leur premier move
        if(this.state.timerUp !== null || this.state.timerDown !== null)
        {
            if(!this.state.timersPartis)
                await this.startTimers();
        }
    }

    async startTimers()
    {
        var timerfuncIdUp = this.state.timerfuncIdUp ? this.state.timerfuncIdUp : setInterval((async () => {
            await this.setStateAsync({
                timerDisplayUp: this.state.timerUproundstart ? this.state.timerUp + (Date.now() - (this.state.timerUproundstart ?? Date.now())) : this.state.timerUp
            });
        }).bind(this), 1000);
        var timerfuncIdDown = this.state.timerfuncIdDown ? this.state.timerfuncIdDown : setInterval((async () => {
            await this.setStateAsync({
                timerDisplayDown: this.state.timerDownroundstart ? this.state.timerDown + (Date.now() - (this.state.timerDownroundstart ?? Date.now())) : this.state.timerDown
            });
        }).bind(this), 1000);
        await this.setStateAsync({
            timerfuncIdUp: timerfuncIdUp,
            timerfuncIdDown: timerfuncIdDown,
            timersPartis: true
        });
    }

    async stopTimers()
    {
        if(this.state.timerfuncIdUp)
            clearInterval(this.state.timerfuncIdUp);
        if(this.state.timerfuncIdDown)
            clearInterval(this.state.timerfuncIdDown);
        await this.setStateAsync({
            timerfuncIdUp: null,
            timerfuncIdDown: null,
            timersPartis: false
        });
    }

    async sleep(ms)
    {
        return await new Promise(resolve => setTimeout(resolve, ms));
    }

    async simulateCheck(check)
    {
        if(this.state.partie.statut == 2)
            return;

        if(check.id_gagnant)
        {
            await this.stopTimers();
        }

        await this.setStateAsync({
            partie: {
                ...this.state.partie,
                id_gagnant: check.id_gagnant,
                statut: check.statut
            },
            gagnantId: check.id_gagnant
        });
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

    async onBtnOuvrirListe(event, navigate)
    {
        navigate("/PageListeJeux");
    }

    render() {
        return ( this.state.connected &&
            // Rendre disponnible la service avec le contexte aux composantes sous-jacentes
            <AccueilServiceContext.Consumer>
            {({navigate, accueilService}) => (
            <ComptesServiceContext.Consumer>
            {({sessionUsager, setSessionUsager, comptesService}) => (
                <JeuServiceContext.Provider value={ { service: this.state.jeuService} }>
                    <div class="jeu-container">
                        <div class="playpage-game">
                            <div class="playpage-infobar">
                                <div class="playpage-profile left clear" style={ !this.state.gagnantId ? {backgroundColor: this.state.joueurcourantId != sessionUsager.id_profiljeu ? "green": ""} : {}}>
                                    <div class="playpage-profile-pfp">
                                        <img class="playpage-profile-pfp-icon" src={person} />
                                    </div>
                                    <div class="playpage-profile-userdata">
                                        <label class="playpage-profile-username">{this.state.profiljeuUp?.compte ?? "<blank>"}</label>
                                        <label class="playpage-profile-userinfo">{this.state.profiljeuUp?.elo ?? "sans placement"}</label>
                                        <img className="playpage-profile-userflag" src={findFlagUrlByIso2Code(this.state.profiljeuUp?.pays ?? "")}></img>
                                    </div>
                                </div>
                                { (this.state.gagnantId != null) &&
                                    (<div class="playpage-timer right">
                                        <>
                                            <label class="playpage-timer-label">{this.state.gagnantId != sessionUsager.id_profiljeu ? "Gagnant" : "Perdant" }</label>
                                        </>
                                    </div>
                                )}
                                { (this.state.gagnantId == null) &&
                                    (<div class="playpage-timer right">
                                        <>
                                            <label class="playpage-timer-label">{ Math.floor((60000 - this.state.timerDisplayUp) / 1000) }</label>
                                        </>
                                    </div>
                                )}
                            </div>
                            <div className="playpage-game-board board">
                                <Chessboard id="BasicBoard" position={this.state.game?.fen() ?? "start"} onPieceDrop={this.onJeuPieceDrop} boardOrientation={sessionUsager.id_profiljeu == this.state.profiljeu1?.id ? "white" : "black"}/>
                            </div>
                            <div class="playpage-infobar">
                                <div class="playpage-profile left clear" style={ !this.state.gagnantId ? {backgroundColor: this.state.joueurcourantId == sessionUsager.id_profiljeu ? "green": ""} : {}}>
                                    <div class="playpage-profile-pfp">
                                        <img class="playpage-profile-pfp-icon" src={person} />
                                    </div>
                                    <div class="playpage-profile-userdata">
                                        <label class="playpage-profile-username">{this.state.profiljeuDown?.compte ?? "<blank>"}</label>
                                        <label class="playpage-profile-userinfo">{this.state.profiljeuDown?.elo ?? "sans placement"}</label>
                                        <img className="playpage-profile-userflag" src={findFlagUrlByIso2Code(this.state.profiljeuDown?.pays ?? "")}></img>
                                    </div>
                                </div>
                                { (this.state.gagnantId != null) &&
                                    (<div class="playpage-timer right">
                                        <>
                                            <label class="playpage-timer-label">{this.state.gagnantId == sessionUsager.id_profiljeu ? "Gagnant" : "Perdant" }</label>
                                        </>
                                    </div>
                                )}
                                { (this.state.gagnantId == null) &&
                                    (<div class="playpage-timer right">
                                        <>
                                            <label class="playpage-timer-label">{ Math.floor((60000 - this.state.timerDisplayDown) / 1000) }</label>
                                        </>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="my-sidebar">
                            <button className="btn-retourner" onClick={(event) => this.onBtnOuvrirListe(event, navigate)}>X</button>
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

export default withParams(withSessionUsager(PageJeu));