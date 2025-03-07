import axios from 'axios';
import React from 'react';

export class ComptesService {
    constructor()
    {
    }

    async getSessionUsager()
    {
        var result = null;
        await axios.get("http://localhost:4000/getSession", {
            withCredentials: true
        })
        .then(function (response) {
            //handle success
            result = response;
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

    async postLogin(username, password)
    {
        var result = null;
        await axios.post("http://localhost:4000/login", {
            username: username,
            password: password
        }, {
            withCredentials: true
        })
        .then(function (response) {
            //handle success
            result = response;
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

    async postSignUp(username, password, email)
    {
        var result = null;
        await axios.post("http://localhost:4000/signup", {
            username: username,
            password: password,
            email: email
        }, {
            withCredentials: true
        })
        .then(function (response) {
            //handle success
            result = response;
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

    async postLogout()
    {
        var result = null;
        await axios.post("http://localhost:4000/logout", {
        }, {
            withCredentials: true
        })
        .then(function (response) {
            //handle success
            result = response;
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

export const ComptesServiceContext = React.createContext(
    {
        sessionUsager: null,
        setSessionUsager: () => {},
        comptesService: null
    }
);