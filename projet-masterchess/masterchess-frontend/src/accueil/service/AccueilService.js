import axios from 'axios';
import React from 'react';

export class AccueilService {
    constructor()
    {
    }

};

export const AccueilServiceContext = React.createContext(
    {
        navigate: async () => {},
        accueilService: null
    }
);