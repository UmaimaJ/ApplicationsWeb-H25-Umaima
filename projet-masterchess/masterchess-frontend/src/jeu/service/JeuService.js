import axios from 'axios';
import { io } from "socket.io-client";

import React from 'react';

export class JeuService {
    constructor(onConnection, onDisconnect, onMoveresult)
    {
        this.io = io("http://localhost:4000", {
            withCredentials: true,
            autoConnect: false
        });

        this.io.on("connect", (socket) => {
            onConnection();
        });

        this.io.on("disconnect", (socket) => {
            onDisconnect();
        });

        this.io.on("moveresult", (data) => {
            onMoveresult(data);
        });
    }

    async connectPartie(partieId, profiljeuId)
    {
        this.io.io.opts.query = {
            partieId: partieId,
            profiljeuId: profiljeuId
         };
        this.io.disconnect().connect();
    }

    async disconnectPartie()
    {
        this.io.disconnect();
    }

    async getAllPartiesEncours()
    {
        console.log("BEFORE");
        var result = null;
        await axios.get("http://localhost:4000/getAllPartiesEncours", {
            withCredentials: true
        })
        .then(function (response) {
            //handle success
            result = response.data.result;
            console.log("SUCCESS");
        })
        .catch(function (error) {
            //handle error
            console.log("ERROR");
            console.log(error);
        })
        .finally(function () {
            console.log("FINALLY");
            //always executed
        });

        return result;
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

    async createPartie(nomprofiljeu1, nomprofiljeu2) {
        var result = null;
        await axios.post("http://localhost:4000/createPartie", {
            nomprofiljeu1: nomprofiljeu1,
            nomprofiljeu2: nomprofiljeu2,
        },{
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

export const JeuServiceContext = React.createContext(
    {
        service: null
    }
);