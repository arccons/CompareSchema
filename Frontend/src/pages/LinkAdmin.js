import React, { useState } from 'react';
import axios from 'axios';

import { getUniqueList } from "../ARC/ArrayUtils"

const LinkAdmin = ({ uniqueSchemas, schemaSubjectList, schemaTableList, setGotSubjectList, setPageMsg }) => {

    const [schema, setSchema] = useState();
    const [subject, setSubject] = useState();
    const [table, setTable] = useState();

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [linkCreated, setLinkCreated] = useState(false);

    function handleSchemaChange(event) {
        document.getElementById("schemaError").innerHTML = "";
        setSchema(event.target.value);
        setSubject();
        document.getElementById("newSubject").value = "";
        setTable();
        document.getElementById("newTable").value = "";
        setPageMsg("");
        setFormSubmitted(false);
        setLinkCreated(false);
    }

    function handleSubjectChange(event) {
        document.getElementById("newSubjectError").innerHTML = "";
        function getSchemaSubjects() {
            let subjList = schemaSubjectList.filter((item) => item['SCHEMA'] === schema);
            return getUniqueList(subjList, 'SUBJECT');
        }

        if (getSchemaSubjects().includes(event.target.value)) {
            document.getElementById("newSubjectError").innerHTML = "Subject already in use. Subjects: " + getSchemaSubjects();
            console.error("Subject already in use: " + event.target.value);
            setPageMsg("Subject already in use.");
        }
        else {
            setSubject(event.target.value);
            setPageMsg("");
        }
        setFormSubmitted(false);
        setLinkCreated(false);
    }

    function handleTableChange(event) {
        document.getElementById("newTableError").innerHTML = "";
        //let tableList = Array.from(subjectList['TABLE_NAME']);
        function getSchemaTables() {
            let tableList = schemaTableList.filter((item) => item['SCHEMA'] === schema);
            return getUniqueList(tableList, 'TABLE');
        }

        if (getSchemaTables().includes(event.target.value)) {
            setPageMsg("Table already in use in this schema.");
            document.getElementById("newTableError").innerHTML = "Table already in use in this schema. Tables: " + getSchemaTables();
            console.log("Table already in use: " + event.target.value);
        }
        else {
            setTable(event.target.value);
            setPageMsg("");
        }
        setFormSubmitted(false);
        setLinkCreated(false);
    }

    function handleSubmit(event) {
        event.preventDefault();
        const url = 'http://localhost:8000/createLink/';
        const formData = new FormData();
        formData.append('schema', schema);
        formData.append('subject', subject);
        formData.append('table', table);
        console.log(formData)
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            },
        };
        axios.post(url, formData, config)
            .then((response) => {
                document.getElementById("newSubjectError").innerHTML = "";
                document.getElementById("newTableError").innerHTML = "";
                setGotSubjectList(false);
                setLinkCreated(true);
                setFormSubmitted(true);
                setPageMsg(response.data.message);
                console.log("response.data.message: ", response.data.message);
            })
            .catch((error) => {
                setLinkCreated(false);
                setFormSubmitted(true);
                setPageMsg(error.message);
                console.error("error.message: ", error.message);
            });
    }

    return (
        <div className="App">
            <form id="MainForm" onSubmit={handleSubmit}>
                <center><h1>New Subject and DB Table Link</h1></center>
                <center>
                    {/* <label htmlFor="schema">Choose a Schema: </label> */}
                    <select required id="schema" onChange={handleSchemaChange}><option key='-1'>Pick a Schema</option>
                        {uniqueSchemas.map(item => <option key={item} value={item}>{item}</option>)}
                    </select>
                    <p id="schemaError"></p>
                    <label htmlFor="newSubject">Create a Subject: </label>
                    <input required type="text" id="newSubject" onChange={handleSubjectChange} />
                    <p id="newSubjectError"></p>
                    <label htmlFor="newTable">Table for the Subject: </label>
                    <input required type="text" id="newTable" onChange={handleTableChange} />
                    <p id="newTableError"></p>
                    <button>Link Subject</button>
                </center>
            </form>
            {formSubmitted && linkCreated && <center><b><p>Link created!</p></b></center>}
            {formSubmitted && !linkCreated && <center><p><b>Link creation failed!</b></p></center>}
        </div>
    );
};

export default LinkAdmin;
