import axios from 'axios';
import { io } from "socket.io-client";

import React from 'react';

// Classe-service qui sert a organiser la communication avec le serveur au scope du jeu et de la PageJeu
export class JeuService {
    constructor(onConnection, onDisconnect, onMoveresult, onCheckresult)
    {
        this.io = io(axios.defaults.baseURL, {
            withCredentials: true,
            autoConnect: false
        });

        this.io.on("connect", async (socket) => {
            await onConnection();
        });

        this.io.on("disconnect", async (socket) => {
            await onDisconnect();
        });

        this.io.on("moveresult", async (data) => {
            await onMoveresult(data);
        });

        this.io.on("checkresult", async (data) => {
            await onCheckresult(data);
        });
    }

    // Fonction qui permet a un utilisateur de partir une session wesockets
    async connectPartie(partieId)
    {
        this.io.io.opts.query = {
            partieId: partieId
         };
        this.io.disconnect().connect();
    }

    // Fonction qui met fin a la session websockets
    async disconnectPartie()
    {
        this.io.disconnect();
    }

    // Fonction qui cherche toutes les parties en cours pour le client
    async getAllPartiesEncours()
    {
        var result = null;
        await axios.get("getAllPartiesEncours", {
            withCredentials: true
        })
        .then(function (response) {
            //handle success
            result = response.data.result;
        })
        .catch(function (error) {
            //handle error
            console.log(error);
        })
        .finally(function () {
            //always executed
        });

        return result;
    }

    // Fonction qui demande au serveur la partie selon le id
    async getPartie(idPartie)
    {
        const params = new URLSearchParams();
        params.append("id", idPartie);
        var result = null;
        await axios.get("getPartie", {
            params,
            withCredentials: true
        })
        .then(function (response) {
            //handle success
            result = response.data.result;
        })
        .catch(function (error) {
            //handle error
            console.log(error);
        })
        .finally(function () {
            //always executed
        });
        return result;
    }
    
    // Fonction qui demande un profiljeu au serveur
    async getProfiljeu(idProfil)
    {
        const params = new URLSearchParams();
        params.append("id", idProfil);
        var result = null;
        await axios.get("getProfiljeu", {
            params,
            withCredentials: true
        })
        .then(function (response) {
            //handle success
            result = response.data.result;
        })
        .catch(function (error) {
            //handle error
            console.log(error);
        })
        .finally(function () {
            //always executed
        });
        return result;
    }
};

// Contexte global qui contient la service au but de IoD dans l'ensemble du code qui en a besoin
export const JeuServiceContext = React.createContext(
    {
        partie: null,
        setPartie: async () => {},
        jeuService: null
    }
);