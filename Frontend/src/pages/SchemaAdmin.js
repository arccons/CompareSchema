import React, { useState } from 'react';
import axios from 'axios';

//import { getUniqueList } from "../ARC/ArrayUtils"

const SchemaAdmin = ({ schema, setGotDBdata, setPageMsg }) => {
    const [localDBtype, setLocalDBtype] = useState();
    const [localServer, setLocalServer] = useState();
    const [localDB, setLocalDB] = useState();
    const [localSchema, setLocalSchema] = useState();

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [schemaCreated, setSchemaCreated] = useState(false);

    function handleDBtypeChange(event) {
        document.getElementById("newDBtypeError").value = "";
        setLocalDBtype(event.target.value);
        document.getElementById("newServerError").value = "";
        setLocalServer();
        document.getElementById("newDBerror").value = "";
        setLocalDB();
        document.getElementById("newSchemaError").value = "";
        setLocalSchema();
        setPageMsg("");
    }

    function handleServerChange(event) {
        document.getElementById("newServerError").value = "";
        setLocalServer(event.target.value.trim());
        document.getElementById("newDBerror").value = "";
        setLocalDB();
        document.getElementById("newSchemaError").value = "";
        setLocalSchema();
        setPageMsg("");
    }

    function handleDBChange(event) {
        document.getElementById("newDBerror").value = "";
        setLocalDB(event.target.value.trim());
        document.getElementById("newSchemaError").value = "";
        setLocalSchema();
        setPageMsg("");
    }

    function handleSchemaChange(event) {
        let enteredSchema = event.target.value.trim();
        document.getElementById("newSchemaError").value = "";
        setLocalSchema(event.target.value.trim());
        setPageMsg("");
        const localSchemaStr = localServer + '.' + localDB + '.' + enteredSchema;
        //console.log(schema);
        let pickedSchema = schema.filter(sch => sch.DBtype === localDBtype && sch.schemaStr === localSchemaStr);
        if (pickedSchema.length === 0) {
            setLocalSchema(enteredSchema);
        } else {
            setPageMsg("Schema already set up for this database.");
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        const url = 'http://localhost:8080/createSchema/';
        const formData = new FormData();
        formData.append('DBtype', localDBtype);
        formData.append('DBserver', localServer);
        formData.append('targetDB', localDB);
        formData.append('schema', localSchema)
        console.log(formData)
        const config = {
            headers: {
                'content-type': 'application/json'
            },
        };
        axios.post(url, formData, config)
            .then((response) => {
                setSchemaCreated(true);
                setFormSubmitted(true);
                setPageMsg(response.data.message);
                setGotDBdata(false);
                console.log("response.data.message: ", response.data.message);
            })
            .catch((error) => {
                setSchemaCreated(false);
                setFormSubmitted(true);
                setPageMsg(error.message);
                console.error("error.message: ", error.message);
            });
    }

    return (
        <div className="App">
            <form id="MainForm" onSubmit={handleSubmit}>
                <center><h1>New DB Schema</h1></center>
                <center>
                    <label htmlFor="dbType">Database Type: </label>
                    <select required id="dbType" onChange={handleDBtypeChange}>
                        <option key='-1' value='-1'>Pick a Database Type</option>
                        <option key='PostgreSQL' value='PostgreSQL'>Postgre SQL</option>
                        <option key='SQL Server' value='SQL Server'>SQL Server</option>
                    </select>
                    <p id="newDBtypeError"></p>
                    <label htmlFor="newServer">DB Server: </label>
                    <input required type="text" id="newServer" onChange={handleServerChange} />
                    <p id="newServerError"></p>
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
