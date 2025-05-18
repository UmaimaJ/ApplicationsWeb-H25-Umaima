import React, { useContext, useState } from 'react';
import { ComptesServiceContext, ComptesService } from "../../login/service/ComptesService.js";
import '../style/PageCharger.css';
import { CheckoutProvider ,PaymentElement, useCheckout } from "@stripe/react-stripe-js";

const PaiementComponent = () => {
    const checkout = useCheckout();
    const { sessionUsager, setSessionUsager, comptesService } = useContext(ComptesServiceContext);

    const handleSubmit = async (event) => {
        event.preventDefault();

        await checkout.updateEmail(sessionUsager?.courriel ?? null);
        const result = await checkout.confirm();

        if (result.type === 'error') {
            console.log(result.error.message);
        } else {
            //faire quoi a la fin avant du redirect
        }
    };

    return (
        <div className='card-body'>
            <h2 className='card-title'>Chargement de 1000 gemmes pour 5 CAD</h2>
            <label>Fournissez le mode de paiement:</label>
            <form onSubmit={handleSubmit}>
                <PaymentElement />
                <br></br>
                <button className='btn btn-primary'>Envoyer</button>
            </form>
        </div>
    )
};

export default PaiementComponent;