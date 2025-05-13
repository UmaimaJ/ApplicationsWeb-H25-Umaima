import React, { useState } from 'react';
import './style/PageCharger.css';
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider } from '@stripe/react-stripe-js';

import PaiementComponent from './components/PaiementComponent.jsx';
import { ChargerService } from './service/ChargerService.js';

const stripePromise = loadStripe("");

const PageCharger = () => {

    const chargerService = new ChargerService();

    const fetchClientSecret = async () => {
        const data = await chargerService.createCheckoutSession();
        return data.checkoutSessionClientSecret;
    };

    return (
        <CheckoutProvider stripe={stripePromise} options={{fetchClientSecret}}>
            <div className="charger-container">
                <div className="panneau-charger-header card">
                    <PaiementComponent></PaiementComponent>
                </div>
            </div>
        </CheckoutProvider>
    )
};

export default PageCharger;