import React, { useState } from 'react';
import './login.css';

import PageAccueil from "../accueil/PageAccueil"
import { AccueilServiceContext, AccueilService } from '../accueil/service/AccueilService';
import { ComptesServiceContext, ComptesService } from './service/ComptesService';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (event, {pageCourante, setPageCourante, accueilService}, {sessionUsager, setSessionUsager, comptesService}) => {
        event.preventDefault();
        const axiosResponse = await comptesService.postSignUp(username, password, email);
        const success = axiosResponse?.data?.success;
        if(success)
        {
            const axiosResponse = await comptesService.getSessionUsager();
            const success = axiosResponse?.data?.success;
            if(success)
            {
                setSessionUsager(axiosResponse.data.usager);
                setPageCourante(<PageAccueil></PageAccueil>);
            }
        }
    };

    return (
        <AccueilServiceContext.Consumer>
        {({pageCourante, setPageCourante, accueilService}) => (
        <ComptesServiceContext.Consumer>
        {({sessionUsager, setSessionUsager, comptesService}) => (
        <div className="login-container">
            <h2>Sign Up</h2>
            <form onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit(event, {pageCourante, setPageCourante, accueilService}, {sessionUsager, setSessionUsager, comptesService});
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
                    <label htmlFor="email">Email:</label>
                    <input class="inputYasser"
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                <button class="buttonYasser" type="submit">Sign Up</button>
            </form>
        </div>
        )}
        </ComptesServiceContext.Consumer>
        )}
        </AccueilServiceContext.Consumer>
    );
};

export default SignUp;