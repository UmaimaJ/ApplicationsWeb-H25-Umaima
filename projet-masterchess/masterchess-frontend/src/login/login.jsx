import React, { useState } from 'react';
import './login.css';

import { ComptesServiceContext, ComptesService } from './service/ComptesService';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event, {sessionUsager, setSessionUsager, service}) => {
        event.preventDefault();
        const axiosResponse = await service.postLogin(username, password);
        const success = axiosResponse?.data?.success;
        console.log("DATA");
        console.log(axiosResponse?.data);
        if(success)
        {
            const axiosResponse = await service.getSessionUsager();
            const success = axiosResponse?.data?.success;
            if(success)
                setSessionUsager(axiosResponse.data.usager);
        }
    };

    return (
        <ComptesServiceContext.Consumer>
        {({sessionUsager, setSessionUsager, service}) => (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit(event, {sessionUsager, setSessionUsager, service});
                }}>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
        )}
        </ComptesServiceContext.Consumer>
    );
};

export default Login;