import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

function Home() {
    const [zone_report, getReport] = useState();
    const token = Cookies.get('token');
    const isAuthenticated = token != null ? true : false;

    useEffect(() => {
        axios({
            method: 'POST',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/zone_report',
            headers: {
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        }).then(res => {
            getReport(res);
            console.log(res);
        })
    }, []);

    return (
        <div>
            {isAuthenticated == true ? <div>
                You are authenticated!
        </div> : <div>Please login to use the administration dashboard.</div>}
        </div>
    );
}

export default Home;