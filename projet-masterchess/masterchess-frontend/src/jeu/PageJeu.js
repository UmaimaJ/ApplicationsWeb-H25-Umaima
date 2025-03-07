import { createContext, useContext } from 'react';
import React from 'react';

import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

import rectangle from "../style/rectangle.svg";
import timericon from "../style/timer-icon.svg";
import board from "../style/board.svg";

import './PageJeu.css';
import DisplayPartieComponent from "./components/DisplayPartieComponent";

import { JeuServiceContext, JeuService } from "./service/JeuService";
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
            profiljeuCourantId: 1,
            partiesEncours: null
        }

    }

    static async getDerivedStateFromProps(props, state)
    {
        return {
            //partiesEncours: state.jeuService.getAllPartiesEncours()
        };
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
        this.updatePartie(null);
    }

    async updatePartiesEncours()
    {
        const partiesEncours = await this.state.jeuService.getAllPartiesEncours();
        this.setState({
            partiesEncours: partiesEncours
        });
    }

    async updatePartie(idPartie)
    {
        if(idPartie)
        {
            const partie = await this.state.jeuService.getPartie(idPartie);
            const profiljeu1 = await this.state.jeuService.getProfiljeu(partie?.id_joueur1);
            const profiljeu2 = await this.state.jeuService.getProfiljeu(partie?.id_joueur2);
    
            if(partie)
            {
                await this.state.jeuService.connectPartie(partie.id, this.state.profiljeuCourantId);
                this.setState({
                    game: partie?.historiquetables ? new Chess(partie.historiquetables) : new Chess(),
                    partie: partie,
                    profiljeu1: profiljeu1,
                    profiljeu2: profiljeu2,
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
                console.log("test")
                console.log(moveframe);
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
        if(this.state?.connected)
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
            this.setState({ game: gameCopy });
            return result; // null if cant move
        }
        catch(err)
        {
            return null;
        }
        return null;
        
    }

    async onJeuPieceDrop(sourceSquare, targetSquare)
    {
        const move = await this.makeAMove({
            from: sourceSquare,
            to: targetSquare
        });

        if(!move)
            return false;

        return true;
    }

    async onBtnCreer()
    {
        const inputProfiljeu1 = document.querySelector("#idprofiljeu1Creer");
        const inputProfiljeu2 = document.querySelector("#idprofiljeu2Creer");

        const idPartie = await this.state.jeuService.createPartie(inputProfiljeu1.value, inputProfiljeu2.value);
    }

    async onBtnOuvrirPartie(idPartie)
    {
        await this.updatePartie(idPartie);
        this.setState({
            enListe: false
        });
    }

    async onBtnOuvrirListe()
    {
        await this.updatePartie(null);
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
                <div class="panneau-parties-container">
                    <button id="btnRefreshParties" onClick={this.onBtnRefreshPartiesEncours}>Refresh</button>
                    <input id="nomprofiljeu1Creer"></input>
                    <input id="nomprofiljeu2Creer"></input>
                    <button id="btnCreer" onClick={this.onBtnCreer}>Creer partie.</button>
                    <DisplayPartiesServiceContext.Provider value={ { service: this.state.displayPartiesService } }>
                        <div class="liste-parties">
                            {Object.values(this.state.partiesEncours ? this.state.partiesEncours : [] ).map((entry, i) =>
                                <DisplayPartieComponent key={entry.id} partie={entry} id={"display-partie" + entry.id} onClick={() => this.onBtnOuvrirPartie(entry.id) }></DisplayPartieComponent>)}
                        </div>
                    </DisplayPartiesServiceContext.Provider>
                </div>
            );
        }
        return (
            <JeuServiceContext.Provider value={ { service: this.state.jeuService} }>
                <div class="jeu-container">
                    <div class="playpage-game">
                        <div class="playpage-infobar">
                            <div class="playpage-profile left clear">
                                <div class="playpage-profile-pfp">
                                    <img class="playpage-profile-pfp-icon" src={rectangle} />
                                </div>
                                <div class="playpage-profile-userdata">
                                    <label class="playpage-profile-username">{this.state.profiljeu2?.compte ?? "<blank>"}</label>
                                    <label class="playpage-profile-userinfo">Joueur 2</label>
                                </div>
                            </div>
                            <div class="playpage-timer right">
                                <img class="playpage-timer-icon" src={timericon} />
                                <label class="playpage-timer-label">3:15</label>
                            </div>
                        </div>
                        <div class="playpage-game-board">
                            <Chessboard id="BasicBoard" position={this.state.game?.fen() ?? ""} onPieceDrop={this.onJeuPieceDrop}/>
                        </div>
                        <div class="playpage-infobar">
                            <div class="playpage-profile left clear">
                                <div class="playpage-profile-pfp">
                                    <img class="playpage-profile-pfp-icon" src={rectangle} />
                                </div>
                                <div class="playpage-profile-userdata">
                                    <label class="playpage-profile-username">{this.state.profiljeu1?.compte ?? "<blank>"}</label>
                                    <label class="playpage-profile-userinfo">Joueur 1</label>
                                </div>
                            </div>
                            <div class="playpage-timer right">
                                <img class="playpage-timer-icon" src={timericon} />
                                <label class="playpage-timer-label">3:15</label>
                            </div>
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
        );
    }
   
}

export default PageJeu;