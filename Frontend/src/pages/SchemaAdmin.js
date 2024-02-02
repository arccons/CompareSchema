import React, { useState } from 'react';
import axios from 'axios';

import { getUniqueList } from "../ARC/ArrayUtils"

const SchemaAdmin = ({ server, uniqueSchemas, setPageMsg }) => {
    const [DBtype, setDBtype] = useState();
    const [DB, setDB] = useState();
    const [schema, setSchema] = useState();

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [schemaCreated, setSchemaCreated] = useState(false);

    function handleDBtypeChange(event) {
        document.getElementById("newDB").value = "";
        document.getElementById("newSchema").value = "";
        setDBtype(event.target.value);
        setDB();
        setSchema();
        setPageMsg("");
        setFormSubmitted(false);
        setSchemaCreated(false);
    }

    function handleDBChange(event) {
        document.getElementById("newDBerror").innerHTML = "";
        document.getElementById("newSchemaError").innerHTML = "";
        document.getElementById("newSchema").value = "";
        setDB(event.target.value);
        setSchema();
        setPageMsg("");
        setFormSubmitted(false);
        setSchemaCreated(false);
    }

    function handleSchemaChange(event) {
        document.getElementById("newSchemaError").innerHTML = "";
        setSchema(event.target.value);
        setPageMsg("");
        setFormSubmitted(false);
        setSchemaCreated(false);
    }

    function handleSubmit(event) {
        event.preventDefault();
        const db_schema = server + '.' + DB + '.' + schema;
        if (!uniqueSchemas.includes(db_schema)) {
            const url = 'http://localhost:8000/createSchema/';
            const formData = new FormData();
            formData.append('schema', schema);
            formData.append('DB', DB);
            formData.append('DBtype', DBtype);
            formData.append('server', server);
            console.log(formData)
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                },
            };
            axios.post(url, formData, config)
                .then((response) => {
                    setSchemaCreated(true);
                    setFormSubmitted(true);
                    setPageMsg(response.data.message);
                    console.log("response.data.message: ", response.data.message);
                })
                .catch((error) => {
                    setSchemaCreated(false);
                    setFormSubmitted(true);
                    setPageMsg(error.message);
                    console.error("error.message: ", error.message);
                });
        }
        else {
            setPageMsg("Schema already in use.")
        }
    }

    return (
        <div className="App">
            <form id="MainForm" onSubmit={handleSubmit}>
                <center><h1>New DB Schema</h1></center>
                <center>
                    {/* <label htmlFor="schema">Choose a Schema: </label> */}
                    <label htmlFor="dbType">Database Type: </label>
                    <select required id="dbType" onChange={handleDBtypeChange}>
                        <option>Pick a Database Type</option>
                        <option key='PostgreSQL' value='PostgreSQL'>Postgre SQL</option>
                        <option key='SQL Server' value='SQL Server'>SQL Server</option>
                    </select>
                    <p id="newDBtypeerror"></p>
                    <label htmlFor="newDB">Database: </label>
                    <input required type="text" id="newDB" onChange={handleDBChange} />
                    <p id="newDBerror"></p>
                    <label htmlFor="newSchema">Schema: </label>
                    <input required type="text" id="newSchema" onChange={handleSchemaChange} />
                    <p id="newSchemaError"></p>
                    <button>Create Schema</button>
                </center>
            </form>
            {formSubmitted && schemaCreated && <center><b><p>Schema created!</p></b></center>}
            {formSubmitted && !schemaCreated && <center><p><b>Schema creation failed!</b></p></center>}
        </div>
    );
};

export default SchemaAdmin;
