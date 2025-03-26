import axios from 'axios';
import React from 'react';

// Classe-service qui décrit la gestion des parties en communication avec le serveur
export class DisplayPartiesService {
    constructor()
    {
    }

    // Cherche la partie selon le id dans le serveur
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
            result = response.result;
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
    
    // Cherche le profil jeu dans le serveur selon le id
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
            result = response.data;
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

    // Crée une nouvelle partie dans le serveur
    async createPartie(idprofiljeu1, idprofiljeu2) {
        var result = null;
        await axios.post("createPartie", {
            idprofiljeu1: idprofiljeu1,
            idprofiljeu2: idprofiljeu2,
        },{
            withCredentials: true
        })
        .then(function (response) {
            //handle success
            result = response.data;
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

export const DisplayPartiesServiceContext = React.createContext(
    {
        service: new DisplayPartiesService()
    }
);