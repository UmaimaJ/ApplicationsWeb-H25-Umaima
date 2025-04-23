class TrouverPartiesService
{
    constructor(io, mysqlConnection, partiesService)
    {
        this.mysql = mysqlConnection;
        this.io = io;
        this.partiesService = partiesService;

        this.recherches = {};

        this.onConnect = this.onConnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.onStartTrouver = this.onStartTrouver.bind(this);
        this.onEndTrouver = this.onEndTrouver.bind(this);

        this.trouverThink = this.trouverThink.bind(this);
        if(this.trouverThinkId)
        {
            clearInterval(this.trouverThinkId);
            this.trouverThinkId = undefined;
        }
        this.trouverThinkId = setInterval(async () => { await this.trouverThink(); }, 5000);
        
        const namespace = this.io.of("/trouverservice");
        namespace.on("connect", this.onConnect);
        namespace.on("disconnect", this.onDisconnect);
    }

    async onConnect(socket)
    {
        const data = {
            profiljeuId: socket?.request?.session?.user?.usager?.id_profiljeu
        }

        //event pour chaque connection sur boundMove
        const socketarg = socket;
        var boundStartTrouver = async function(event, socket = socketarg)
        {
            return await this.onStartTrouver(event, socket);
        };
        boundStartTrouver = boundStartTrouver.bind(this);
        socket.on("starttrouver", boundStartTrouver);

        var boundEndTrouver = async function(event, socket = socketarg)
        {
            return await this.onEndTrouver(event, socket);
        };
        boundEndTrouver = boundEndTrouver.bind(this);
        socket.on("endtrouver", boundEndTrouver);
    }

    async onDisconnect(socket)
    {
        const data = {
            profiljeuId: socket?.request?.session?.user?.usager?.id_profiljeu
        }

        if(!data.profiljeuId)
            return;

        this.clearData(data.profiljeuId);
    }

    async onStartTrouver(event, socket)
    {
        var data = {
            profiljeuId: socket?.request?.session?.user?.usager?.id_profiljeu,
            type: event?.data?.type,
            socket: socket
        }

        if(!data.profiljeuId)
            return;

        if(data.type === undefined)
            return;

        data.startedRecherche = Date.now();
        await this.setRechercheEncours(data.profiljeuId, 1);

        this.recherches[data.profiljeuId] = { data: data };
    }

    async onEndTrouver(event, socket)
    {
        const data = {
            profiljeuId: socket?.request?.session?.user?.usager?.id_profiljeu
        }

        if(!data.profiljeuId)
            return;

        await this.setRechercheEncours(data.profiljeuId, 0);
        await this.clearData(data.profiljeuId);
    }

    async trouverThink()
    {
        if(Object.entries(this.recherches).length < 2)
            return;

        //TODO sort by elo

        for(var i=0; i<Object.entries(this.recherches).length; i+=2)
        {
            if(i < Object.entries(this.recherches).length - 1)
            {
                const [index1, entry1] = Object.entries(this.recherches).at(i);
                const [index2, entry2] = Object.entries(this.recherches).at(i+1);

                await this.trouve(entry1.data, entry2.data);
            }
        }
    }

    async trouve(data1, data2)
    {
        const partie = await this.partiesService.createPartieWithIds(data1.profiljeuId, data2.profiljeuId);
        data1.socket.emit("trouveresult", { partieId: partie.id });
        data2.socket.emit("trouveresult", { partieId: partie.id });

        await this.setRechercheEncours(data1.profiljeuId, 0);
        await this.setRechercheEncours(data2.profiljeuId, 0);

        delete this.recherches[data1.profiljeuId];
        delete this.recherches[data2.profiljeuId];
    }

    async clearData(profiljeuId)
    {
        delete this.recherches[profiljeuId];
    }

    async setRechercheEncours(profiljeuId, value)
    {
        const [ results, fields ] = await this.mysql.query(`
            UPDATE profiljeu
            SET
            rechercheencours = ?
            WHERE id = ?;
            `, [ value, profiljeuId ]);

        if(results > 0)
            return true;

        return false;
    }

    async sleep(ms)
    {
        return await new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default TrouverPartiesService;