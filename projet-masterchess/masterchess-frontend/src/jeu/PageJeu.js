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

        const jeuService = new JeuService(this.onConnect, this.onDisconnect, this.onMoveresult);

        this.state = {
            game: new Chess(),
            jeuService: jeuService,
            enListe: true,
            connected: false,
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
        await this.state.jeuService.connectPartie();
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
            await this.setState({
                game: new Chess(),
                partie: partie,
                profiljeu1: profiljeu1,
                profiljeu2: profiljeu2
            });
        }
            
    }

    async onConnect()
    {
        this.setState({
            connected: true
        });
    }

    async onDisconnect()
    {
        this.setState({
            connected: false
        });
    }

    async onMoveresult(move)
    {
        console.log(await this.simulateMove(move));
    }

    async makeAMove(move)
    {
        if(this.state?.connected)
        {
            const data = {
                partieId: this.state.partie.id,
                profilId: this.state.profiljeu1,
                move: move
            };

            this.state.jeuService.io.emit("move", data);
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