import React, { useState, useEffect, useContext, useRef } from 'react';
import { Navigate, useParams } from "react-router-dom";
import { ServiceCoursContext } from './service/ServiceCours.js';

import 'bootstrap/dist/css/bootstrap.css';
import './PageDisplayCours.css';

function PageDisplayCours() {
    let params = useParams();
    const { service } = useContext(ServiceCoursContext);
    const [ cours, setCours ] = useState(null);

    const fetchData = async () => {
        setCours(await service.getCours(params.idCours));
    }

    useEffect(() => {
        fetchData();
    });

    return (
        <div className="page-displaycours-container">
            <p>{cours?.pagecontenu ?? ""}</p>
        </div>
    );
   
}

export default PageDisplayCours;