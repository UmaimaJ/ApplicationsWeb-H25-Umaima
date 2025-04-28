import React, { useState } from 'react';
import './login.css';

import PageAccueil from '../accueil/PageAccueil';
import { AccueilServiceContext, AccueilService } from '../accueil/service/AccueilService';
import { ComptesServiceContext, ComptesService } from './service/ComptesService';
import SignUp from './signUp';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event, {navigate, accueilService}, {sessionUsager, setSessionUsager, comptesService}) => {
        event.preventDefault();
        const axiosResponse = await comptesService.postLogin(username, password);
        const success = axiosResponse?.data?.success;
        if(success)
        {
            const axiosResponse = await comptesService.getSessionUsager();
            const success = axiosResponse?.data?.success;
            if(success)
            {
                setSessionUsager(axiosResponse.data.usager);
                navigate("/");
            }
        }
    };

    return (
        <AccueilServiceContext.Consumer>
        {({navigate, accueilService}) => (
        <ComptesServiceContext.Consumer>
        {({sessionUsager, setSessionUsager, comptesService}) => (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit(event, {navigate, accueilService}, {sessionUsager, setSessionUsager, comptesService});
                }}>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input class="inputYasser"
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input class="inputYasser"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button class="buttonYasser" type="submit">Login</button>
            </form>
        </div>
        )}
        </ComptesServiceContext.Consumer>
        )}
        </AccueilServiceContext.Consumer>
    );
};

export default Login;