import React, { useState } from 'react';
import './login.css';

import { ComptesServiceContext, ComptesService } from './service/ComptesService';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (event, {sessionUsager, setSessionUsager, comptesService}) => {
        event.preventDefault();
        const success = comptesService.postSignUp(username, password, email).success;
        if(success)
        {
            const json = comptesService.getSessionUsager();
            console.log("Signed up and logged in: ", json.user.compte);
            setSessionUsager(json.usager);
        }
    };

    return (
        <ComptesServiceContext.Consumer>
        {({sessionUsager, setSessionUsager, comptesService}) => (
        <div className="login-container">
            <h2>Sign Up</h2>
            <form onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit(event, {sessionUsager, setSessionUsager, comptesService});
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
    );
};

export default SignUp;