import axios from 'axios';

const JeuService = {
    getAllPartiesEncours: async function()
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
    },

    getPartie: async function(idPartie)
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
    },
    
    getProfiljeu: async function(idProfil)
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
    },

    createPartie: async function(idprofiljeu1, idprofiljeu2) {
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