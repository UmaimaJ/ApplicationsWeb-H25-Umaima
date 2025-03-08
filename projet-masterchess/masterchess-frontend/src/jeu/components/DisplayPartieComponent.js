import React from 'react';
import { DisplayPartiesServiceContext } from '../service/DisplayPartiesService';

import './DisplayPartieComponent.css';
import 'bootstrap/dist/css/bootstrap.css';

// Composante qui décrit en HTML la partie dans le but de les lister dans PageJeu.js
class DisplayPartieComponent extends React.Component {
    constructor(props)
    {
        super(props);

        this.state = {
            onClick: props.onClick,
            service: props.service,    
            partie: props.partie
        };
    }

    render()
    {

        return (
            //Consommer la service DisplayPartieService
            <DisplayPartiesServiceContext.Consumer>
            {({service}) => (
                // <div class="partie-body" id={"divPartie" + this.state.partie.id} onClick={this.state.onClick}>
                //     <div class="partie-body-inner">
                //         <label>{ this.state.partie.compte_joueur1 }</label>
                //         <br></br>
                //         <label>vs</label>
                //         <br></br>
                //         <label>{ this.state.partie.compte_joueur2 }</label>
                //     </div>
                // </div>
                <tr id={"divPartie" + this.state.partie.id} onClick={this.state.onClick}>
                    <th scope="row" style={ { width: 25 } }>{ this.state.partie?.id }</th>
                    <td>{ this.state.partie.compte_joueur1 }</td>
                    <td>{ this.state.partie.compte_joueur2 }</td>
                </tr>

            )}
            </DisplayPartiesServiceContext.Consumer>
        )
    }
}

export default DisplayPartieComponent;