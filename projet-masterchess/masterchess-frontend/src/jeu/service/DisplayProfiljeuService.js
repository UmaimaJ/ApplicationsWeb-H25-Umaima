import axios from 'axios';
import React from 'react';

// Classe-service qui décrit la gestion des parties en communication avec le serveur
export class DisplayProfiljeuService {
    constructor()
    {
    }

    async getProfiljeuData(profiljeuId)
    {
        const params = new URLSearchParams();
        params.append("id", profiljeuId);
        var result = null;
        await axios.get("getProfiljeuProfil", {
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
}

export const DisplayProfiljeuServiceContext = React.createContext(
    {
        profilJeuData: [],
        setProfilJeuData: async () => {},
        displayProfiljeuService: new DisplayProfiljeuService()
    }
);