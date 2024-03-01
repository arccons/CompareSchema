import React, { useState } from 'react';
import axios from 'axios';

const LinkAdmin = ({ schema, links, setGotDBdata, setPageMsg }) => {

    const [localDBstr, setLocalDBstr] = useState();
    const [schemaList, setSchemaList] = useState([]);
    const [localSchema, setLocalSchema] = useState();
    const [localSubject, setLocalSubject] = useState();
    const [localTable, setLocalTable] = useState();

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [linkCreated, setLinkCreated] = useState(false);

    function handleDBchange(event) {
        setLocalDBstr(event.target.value);
        setLocalSchema();
        document.getElementById("schema").value = '-1';
        setLocalSubject();
        document.getElementById("newSubject").value = '';
        document.getElementById("newSubjectError").innerHTML = "";
        setLocalTable();
        document.getElementById("newTable").value = '';
        document.getElementById("newTableError").innerHTML = "";
        console.log(event.target.value);
        let schList = schema.filter(sch => sch.DBstr === event.target.value).map(item => { return { schema: item.schema } });
        setSchemaList(schList);
    }

    function handleSchemaChange(event) {
        setLocalSchema(event.target.value.trim());
        setLocalSubject();
        document.getElementById("newSubject").value = '';
        document.getElementById("newSubjectError").innerHTML = "";
        setLocalTable();
        document.getElementById("newTable").value = '';
        document.getElementById("newTableError").innerHTML = "";
        setPageMsg("");
        console.log(event.target.value.trim());
    }

    function handleSubjectChange(event) {
        let enteredSubject = event.target.value.trim();
        if (enteredSubject.length === 0) {
            document.getElementById("newSubjectError").innerHTML = 'Blank entered.';
        } else {
            let subjTblList = schema.filter(item => item.schemaStr === localSchema);
            console.log(...subjTblList);
            let subjList = subjTblList.map(item => item.map(slItem => slItem.subject));
            console.log(...subjList);
            if (subjList.includes(enteredSubject)) {
                document.getElementById("newSubjectError").innerHTML = "Subject already in use in this schema. Subjects: " + subjList;
                setLocalSubject();
                setPageMsg("Subject already in use.");
            } else {
                document.getElementById("newSubjectError").innerHTML = "";
                setLocalSubject(enteredSubject);
                setPageMsg("");
            }
        }
        setLocalTable();
        document.getElementById("newTable").value = '';
        document.getElementById("newTableError").innerHTML = "";
    }

    function handleTableChange(event) {
        let enteredTable = event.target.value.trim();
        if (enteredTable.length !== 0) {
            setLocalTable(enteredTable);
            document.getElementById("newTableError").innerHTML = "";
            setPageMsg("");
        } else {
            let msgStr = "Blank entered for table";
            document.getElementById("newTableError").innerHTML = msgStr;
            setPageMsg(msgStr);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        const url = 'http://localhost:8080/createLink/';
        const formData = new FormData();
        const DBlist = localDBstr.split('.');
        console.log(DBlist);
        formData.append('DBtype', 'PostgreSQL');
        formData.append('DBserver', DBlist[1]);
        formData.append('targetDB', DBlist[2]);
        formData.append('schema', localSchema);
        formData.append('subject', localSubject);
        formData.append('tableName', localTable);
        console.log(formData)
        const config = {
            headers: {
                'content-type': 'application/json'
            },
        };
        axios.post(url, formData, config)
            .then((response) => {
                document.getElementById("newSubjectError").innerHTML = "";
                document.getElementById("newTableError").innerHTML = "";
                setGotDBdata(false);
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
                    <label htmlFor="DB">Database: </label>
                    <select required id="DB" onChange={handleDBchange}>
                        <option key='-1' value='-1'>Pick a Database</option>
                        {Array.from(new Set(schema.map(sch => sch.DBstr))).map((item, index) => <option key={index} value={item}>{item}</option>)}
                    </select>
                    <p></p>
                    <label htmlFor="schema">Schema: </label>
                    <select required id="schema" onChange={handleSchemaChange}>
                        <option key='-1' value='-1'>Pick a Schema</option>
                        {schemaList.map((item, index) => <option key={index} value={item.schema}>{item.schema}</option>)}
                    </select>
                    <p></p>
                    <label htmlFor="newSubject">Create a Subject: </label>
                    <input required type="text" id="newSubject" onInput={handleSubjectChange} />
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
}

export default LinkAdmin;
