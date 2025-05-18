import React, { useState } from 'react';
import './login.css';
import 'bootstrap/dist/css/bootstrap.css';

import PageAccueil from "../accueil/PageAccueil"
import { AccueilServiceContext, AccueilService } from '../accueil/service/AccueilService';
import { ComptesServiceContext, ComptesService } from './service/ComptesService';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (event, {navigate, accueilService}, {sessionUsager, setSessionUsager, comptesService}) => {
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
                navigate("/");
            }
        } else if (!success) {
            console.log(`ERROR:` + axiosResponse?.data?.message)
            const alert = document.getElementById("signup_alert")
            console.log(alert)
            alert.style.display = "block"
            alert.innerHTML = "Erreur: L'utilisateur existe déjà"
        }
    };

    return (
        <AccueilServiceContext.Consumer>
        {({navigate, accueilService}) => (
        <ComptesServiceContext.Consumer>
        {({sessionUsager, setSessionUsager, comptesService}) => (
        <div className="login-container">
            <h2>Sign Up</h2>
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
                <button id="boutonSubmit" className="buttonYasser" type="submit">Sign Up</button>
            </form>
            <div id="signup_alert" style={{display: "none"}} className="alert alert-danger">aaaaaaa</div>
        </div>

        )}
        </ComptesServiceContext.Consumer>
        )}
        </AccueilServiceContext.Consumer>
    );
};

export default SignUp;