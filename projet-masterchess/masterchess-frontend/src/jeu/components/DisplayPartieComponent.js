import React from 'react';
import { DisplayPartiesServiceContext } from '../service/DisplayPartiesService';

import './DisplayPartieComponent.css';

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
            <DisplayPartiesServiceContext.Consumer>
            {({service}) => (
                <div class="partie-body" id={"divPartie" + this.state.partie.id} onClick={this.state.onClick}>
                    <div class="partie-body-inner">
                        <label>{ this.state.partie.compte_joueur1 }</label>
                        <br></br>
                        <label>vs</label>
                        <br></br>
                        <label>{ this.state.partie.compte_joueur2 }</label>
                    </div>
                </div>
            )}
            </DisplayPartiesServiceContext.Consumer>
        )
    }
}

export default DisplayPartieComponent;