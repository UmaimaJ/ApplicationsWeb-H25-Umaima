import React, { useState } from 'react';
import './PageContact.css';
import axios from 'axios';

const PageContact = () => {
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        sujet: '',
        message: ''
    });

    // Message de confirmation
    const [envoyeMessage, setEnvoyeMessage] = useState(false);

    // handleChange classique
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Quand le message est envoyé
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Envoie une requete
            await axios.post('contactrequests', formData);
            // Envoie le message de confirmation
            setEnvoyeMessage(true);
        } catch (err) {
            // Erreur
            console.error('Erreur enregistrement contact :', err);
        } finally {
            // Reset les formulaire
            setFormData({ nom:'', email:'', sujet:'', message:'' });
            setTimeout(() => setEnvoyeMessage(false), 3000);
        }
    };

    return (
        <div className="contact-container">
            <h2>Contactez-nous</h2>
            <p className="contact-intro">
                Une question sur ChessMaster? N'hésitez pas à nous contacter!
            </p>

            {envoyeMessage && (
                <div className="message-succes">
                    Message envoyé avec succès !
                </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                    <label htmlFor="nom">Nom</label>
                    <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Couriel</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="sujet">Sujet</label>
                    <input
                        type="text"
                        id="sujet"
                        name="sujet"
                        value={formData.sujet}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="5"
                    />
                </div>

                <button type="submit" className="btn-envoyer">
                    Envoyer
                </button>
            </form>
        </div>
    );
};

export default PageContact;