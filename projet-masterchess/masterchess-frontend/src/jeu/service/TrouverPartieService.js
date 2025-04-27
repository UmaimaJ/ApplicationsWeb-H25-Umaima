import axios from 'axios';
import { io } from "socket.io-client";

import React from 'react';

export class TrouverPartieService
{
    constructor(onConnection, onDisconnect, onTrouve)
    {
        this.io = io("/trouverservice", {
            withCredentials: true,
            autoConnect: false,
            transports: ["websocket"]
        });

        this.io.on("connect", async (socket) => {
            await onConnection();
        });

        this.io.on("disconnect", async (socket) => {
            await onDisconnect();
        });

        this.io.on("trouveresult", async (data) => {
            await onTrouve(data);
        });

        this.socket = this.io.connect();
    }

    // Fonction qui permet a un utilisateur de partir une session wesockets
    async connect()
    {
        this.socket = this.io.connect();
    }

    // Fonction qui met fin a la session websockets
    async disconnect()
    {
        this.socket = this.io.disconnect();
    }

    async startTrouver()
    {
        const data = {
            type: 0
        }
        
        this.socket.emit("starttrouver", { data: data });
    }

    async endTrouver()
    {
        this.socket.emit("endtrouver");
    }
}

export const TrouverPartieServiceContext = React.createContext(
    {
        partieEncours: null,
        setPartieEncours: async () => {},
        trouverPartieService: null
    }
);