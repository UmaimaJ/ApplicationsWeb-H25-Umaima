import axios from 'axios';
import { io } from "socket.io-client";

class JeuService {
    constructor(onConnection, onDisconnect, onMoveresult)
    {
        this.io = io("http://localhost:4000");

        this.io.on("connect", (socket) => {
            onConnection();
        });

        this.io.on("disconnect", (socket) => {
            onDisconnect();
        });

        this.io.on("moveresult", (data) => {
            onMoveresult(data.move);
        });
    }

    async connectPartie()
    {
        this.io.connect();
    }

    async getAllPartiesEncours()
    {
        var result = null;
        await axios.get("http://localhost:4000/getAllPartiesEncours")
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

    async getPartie(idPartie)
    {
        const params = new URLSearchParams();
        params.append("id", idPartie);
        var result = null;
        await axios.get("http://localhost:4000/getPartie", {
            params
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
    
    async getProfiljeu(idProfil)
    {
        const params = new URLSearchParams();
        params.append("id", idProfil);
        var result = null;
        await axios.get("http://localhost:4000/getProfiljeu", {
            params
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
            idprofiljeu2: idprofiljeu2
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

export default JeuService;