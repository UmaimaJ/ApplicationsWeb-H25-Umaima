import { createContext, useContext } from 'react';
import React from 'react';

import rectangle from "../style/rectangle.svg";
import timericon from "../style/timer-icon.svg";
import board from "../style/board.svg";

import './PageJeu.css';
import JeuService from "./service/JeuService";

const PartieContext = createContext(null);

class PageJeu extends React.Component {
    async componentDidMount()
    {
        console.log(this.props.idPartie);
        const partie = await JeuService.getPartie(this.props.idPartie);
        const profilJoueur = await JeuService.getProfilJoueur(partie.id_joueur1);

        if(this.props.idPartie)
            this.setState({
                partie: partie,
                profilJoueur: profilJoueur
        });
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
                                    <label class="playpage-profile-username">{this.state.profilJoueur.compte}</label>
                                    <label class="playpage-profile-userinfo">Joueur 1</label>
                                </div>
                            </div>
                            <div class="playpage-timer right">
                                <img class="playpage-timer-icon" src={timericon} />
                                <label class="playpage-timer-label">3:15</label>
                            </div>
                        </div>
                        <img class="playpage-game-board" src={board} />
                        <div class="playpage-infobar">
                            <div class="playpage-profile left clear">
                                <div class="playpage-profile-pfp">
                                    <img class="playpage-profile-pfp-icon" src={rectangle} />
                                </div>
                                <div class="playpage-profile-userdata">
                                    <label class="playpage-profile-username">Robot</label>
                                    <label class="playpage-profile-userinfo">Joueur 2</label>
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