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
    async componentDidMount()
    {
        this.onDrop = this.onDrop.bind(this);

        console.log(this.props.idPartie);
        const partie = await JeuService.getPartie(this.props.idPartie);
        const profilJoueur1 = await JeuService.getProfilJoueur(partie?.id_joueur1);
        const profilJoueur2 = await JeuService.getProfilJoueur(partie?.id_joueur2);

        if(this.props.idPartie)
            this.setState({
                game: new Chess(),
                partie: partie,
                profilJoueur1: profilJoueur1,
                profilJoueur2: profilJoueur2
        });
    }

    async makeAMove(move) {
        const gameCopy = new Chess(this.state.game.fen());
        try
        {
            const result = gameCopy.move(move);
            this.setState({game: gameCopy});
            return result; // null if cant move
        }
        catch(err)
        {
            return null;
        }
        return null;

    }

    async onDrop(sourceSquare, targetSquare)
    {
        const move = await this.makeAMove({
            from: sourceSquare,
            to: targetSquare
        });

        if(!move)
            return false;

        return true;
    }

    render() {
        if(!this.state?.partie)
        {
            return (
                <label>Pas de partie en cours</label>
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
                                    <label class="playpage-profile-username">{this.state.profilJoueur2.compte}</label>
                                    <label class="playpage-profile-userinfo">Joueur 2</label>
                                </div>
                            </div>
                            <div class="playpage-timer right">
                                <img class="playpage-timer-icon" src={timericon} />
                                <label class="playpage-timer-label">3:15</label>
                            </div>
                        </div>
                        <div class="playpage-game-board">
                            <Chessboard id="BasicBoard" position={this.state.game.fen()} onPieceDrop={this.onDrop}/>
                        </div>
                        <div class="playpage-infobar">
                            <div class="playpage-profile left clear">
                                <div class="playpage-profile-pfp">
                                    <img class="playpage-profile-pfp-icon" src={rectangle} />
                                </div>
                                <div class="playpage-profile-userdata">
                                    <label class="playpage-profile-username">{this.state.profilJoueur1.compte}</label>
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
                            <br />
                            <label class="move-info-label">A2A3</label>
                            <label class="move-info-label">B2B3</label>
                            <label class="move-info-label">C2C3</label>
                            <label class="move-info-label">D2D3</label>
                            <label class="move-info-label">E2E3</label>
                        </div>
                    </div>
                </div>           
            </PartieContext.Provider>
        );
    }
   
}

export default PageJeu;