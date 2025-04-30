import React, { Component, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import  { ComptesService, ComptesServiceContext } from "../login/service/ComptesService.js";

export function withNavigation(Component) {
    return props => <Component {...props} navigate={useNavigate()} />;
}
  
export function withLocation(Component) {
    return props => <Component {...props} location={useLocation()} />;
}

export function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}

export function withSessionUsager(Component) {
    const WithSessionUsagerComponent = (props) => {
        const { sessionUsager, setSessionUsager, comptesService } = useContext(ComptesServiceContext);
        return <Component {...props} sessionUsager={sessionUsager} />;
    }
    return WithSessionUsagerComponent;
}