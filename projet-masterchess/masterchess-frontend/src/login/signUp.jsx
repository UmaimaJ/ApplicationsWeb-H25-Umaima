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

    async function setInvalidTooltip(tooltip, message)
    {
        if(!message || message === "")
            tooltip.style.display = "none";
        if(message)
            tooltip.style.display = "block";

        tooltip.innerText = message;
    }

    const handleSubmit = async (event, {navigate, accueilService}, {sessionUsager, setSessionUsager, comptesService}) => {
        event.preventDefault();

        const usernameInvalid = document.querySelector("#username-invalid");
        const passwordInvalid = document.querySelector("#password-invalid");
        const emailInvalid = document.querySelector("#email-invalid");

        await setInvalidTooltip(usernameInvalid, null);
        await setInvalidTooltip(passwordInvalid, null);
        await setInvalidTooltip(emailInvalid, null);

        const usernameRegex = /^.*(?=.{3,})(?=.*[a-zA-Z\d]).*$/;
        if(!usernameRegex.test(username))
        {
            await setInvalidTooltip(usernameInvalid, "Doit avoir 3 ou plus caractères alphanumériques.");
            return;
        }

        const passwordRegex = /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d).*$/;
        if(!passwordRegex.test(password))
        {
            await setInvalidTooltip(passwordInvalid, "Doit avoir 8 ou plus caractères alphanumériques.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            await setInvalidTooltip(emailInvalid, "Mauvais format de courriel(exemple: courriel@service.com).");
            return;
        }

        try
        {
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
            }
        }
        catch(error)
        {
            if(error.message === "insertUsager: compte non-unique")
            {
                await setInvalidTooltip(usernameInvalid, "Le nom d'usager existe déjà.");
                return;
            }
            if(error.message === "insertUsager: courriel non-unique")
            {
                await setInvalidTooltip(emailInvalid, "Le courriel existe déjà.");
                return;
            }
        }
    };

    return (
        <AccueilServiceContext.Consumer>
        {({navigate, accueilService}) => (
        <ComptesServiceContext.Consumer>
        {({sessionUsager, setSessionUsager, comptesService}) => (
        <div className="login-container">
            <h2>Inscription</h2>
            <form onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit(event, {navigate, accueilService}, {sessionUsager, setSessionUsager, comptesService});
                }}>
                <div className="input-group mw-100 p-1 form-group">
                    <label htmlFor="username">Nom d'utilisateur:</label>
                    <input class="inputYasser"
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <div id="username-invalid" className="invalid-tooltip"></div>
                </div>
                <div className="input-group mw-100 p-1 form-group">
                    <label htmlFor="email">Courriel:</label>
                    <input class="inputYasser"
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div id="email-invalid" className="invalid-tooltip"></div>
                </div>
                <div className="input-group mw-100 p-1 form-group">
                    <label htmlFor="password">Mot de passe:</label>
                    <input class="inputYasser"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <div id="password-invalid" className="invalid-tooltip"></div>
                </div>
                <button class="buttonYasser" type="submit">S'inscrire</button>
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