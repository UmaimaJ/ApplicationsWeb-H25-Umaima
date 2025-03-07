import axios from 'axios';
import React from 'react';

export class DisplayPartiesService {
    constructor()
    {
    }

    async getPartie(idPartie)
    {
        const params = new URLSearchParams();
        params.append("id", idPartie);
        var result = null;
        await axios.get("http://localhost:4000/getPartie", {
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
    
    async getProfiljeu(idProfil)
    {
        const params = new URLSearchParams();
        params.append("id", idProfil);
        var result = null;
        await axios.get("http://localhost:4000/getProfiljeu", {
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

    async createPartie(idprofiljeu1, idprofiljeu2) {
        var result = null;
        await axios.post("http://localhost:4000/createPartie", {
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