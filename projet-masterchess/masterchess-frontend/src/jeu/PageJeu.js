import { createContext, useContext } from 'react';
import React from 'react';

import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

import rectangle from "../style/rectangle.svg";
import timericon from "../style/timer-icon.svg";
import board from "../style/board.svg";

import './PageJeu.css';
import JeuService from "./service/JeuService";

const PartieContext = createContext(null);

class PageJeu extends React.Component {

    constructor(props)
    {
        super(props);

        this.onJeuPieceDrop = this.onJeuPieceDrop.bind(this);
        this.onBtnCreer = this.onBtnCreer.bind(this);
        this.onBtnOuvrirPartie = this.onBtnOuvrirPartie.bind(this);
        this.onBtnRefreshPartiesEncours = this.onBtnRefreshPartiesEncours.bind(this);
        
        this.onConnect = this.onConnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.onMoveresult = this.onMoveresult.bind(this);

        this.moveQueueThink = this.moveQueueThink.bind(this);
        this.moveQueueThinkId = null;
        this.moveQueue = [];

        const jeuService = new JeuService(this.onConnect, this.onDisconnect, this.onMoveresult);

        this.state = {
            game: new Chess(),
            jeuService: jeuService,
            enListe: true,
            connected: false,
            partie: null,
            profiljeuCourantId: 1,
            partiesEncours: jeuService.getAllPartiesEncours()
        }

    }
    static async getDerivedStateFromProps(props, state)
    {
        return {
            partiesEncours: state.jeuService.getAllPartiesEncours()
        };
    }

    async componentDidMount()
    {
        
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
            
    }

    async onConnect()
    {
        if(this.state.connected)
            await this.resetConnectionStatus();

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
        let move = null;
        if(this.state.connected)
        {
            while(move = this.moveQueue.pop())
            {
                if(move) await this.simulateMove(move);
                console.log("test")
                console.log(move);
            }
        }
    }

    async queueMove(move)
    {
        this.moveQueue.push(move);
    }

    async onDisconnect()
    {
        this.setState({
            connected: false
        });
    }

    async onMoveresult(move)
    {
        if(move.partieId == this.state.partie?.id)
        {
            await this.queueMove(move.move);
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

    async onBtnRefreshPartiesEncours()
    {
        await this.updatePartiesEncours();
    }

    render() {
        if(this.state.enListe)
        {
            return (
                <div>
                    <button id="btnRefreshParties" onClick={this.onBtnRefreshPartiesEncours}>Refresh</button>
                    <input id="idprofiljeu1Creer"></input>
                    <input id="idprofiljeu2Creer"></input>
                    <button id="btnCreer" onClick={this.onBtnCreer}>Creer partie.</button>
                    <div>
                        {Object.values(this.state.partiesEncours).map((entry, i) =>
                            <button key={entry.id} id={"btnOuvrir" + entry.id} onClick={() => this.onBtnOuvrirPartie(entry.id) }>Ouvrir {entry.id}</button>)}
                    </div>
                </div>
            );
        }
        return (
            <PartieContext.Provider value={this.state.partie}>
                <div class="jeu-container">
                    <div class="playpage-game">
                        <div class="playpage-infobar">
                            <div class="playpage-profile left clear">
                                <div class="playpage-profile-pfp">
                                    <img class="playpage-profile-pfp-icon" src={rectangle} />
                                </div>
                                <div class="playpage-profile-userdata">
                                    <label class="playpage-profile-username">{this.state.profiljeu2.compte}</label>
                                    <label class="playpage-profile-userinfo">Joueur 2</label>
                                </div>
                            </div>
                            <div class="playpage-timer right">
                                <img class="playpage-timer-icon" src={timericon} />
                                <label class="playpage-timer-label">3:15</label>
                            </div>
                        </div>
                        <div class="playpage-game-board">
                            <Chessboard id="BasicBoard" position={this.state.game.fen()} onPieceDrop={this.onJeuPieceDrop}/>
                        </div>
                        <div class="playpage-infobar">
                            <div class="playpage-profile left clear">
                                <div class="playpage-profile-pfp">
                                    <img class="playpage-profile-pfp-icon" src={rectangle} />
                                </div>
                                <div class="playpage-profile-userdata">
                                    <label class="playpage-profile-username">{this.state.profiljeu1.compte}</label>
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
                        <div class="move-info-panel">
                            {this.state?.game.history({ verbose: true }).map((entry, i) =>
                                <label style={{color: (entry.color === 'w'? 'white' : "black"), backgroundColor: "grey"}} key={i}>joueur: {entry.color === 'w' ? this.state.profiljeu1.compte : this.state.profiljeu2.compte} from: {entry.from} to: {entry.to}
                                </label>)}
                        </div>
                    </div>
                </div>           
            </PartieContext.Provider>
        );
    }
   
}

export default PageJeu;