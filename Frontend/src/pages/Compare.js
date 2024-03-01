import React, { useState } from 'react';
import axios from 'axios';

const Compare = ({ DBtype, schema, schemaLinks, setPageMsg }) => {

  const [localDBserver, setLocalDBserver] = useState();
  const [localTargetDB, setLocalTargetDB] = useState();
  const [localSchema, setLocalSchema] = useState();
  const [localSubject, setLocalSubject] = useState();
  const [localTableName, setLocalTableName] = useState();
  const [file, setFile] = useState();

  const [subjectList, setSubjectList] = useState([]);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  function handleSchemaChange(event) {
    let pickedSchemaStr = event.target.value;
    console.log(pickedSchemaStr);
    if (pickedSchemaStr === '-1') {
      setLocalSchema();
      setSubjectList([]);
      setLocalDBserver();
      setLocalTargetDB();
      setLocalSchema();
    } else {
      setLocalSchema(pickedSchemaStr);
      let pickedSchemaLinks = schemaLinks.filter(sl => sl.schemaStr === pickedSchemaStr);
      console.log(...pickedSchemaLinks);
      if (pickedSchemaLinks.length > 0) {
        let subjList = pickedSchemaLinks.map(psl => psl.subject);
        setSubjectList(subjList);
        //console.log(...subjList);
        let DBvalues = pickedSchemaStr.split('.');
        setLocalDBserver(DBvalues[0]);
        setLocalTargetDB(DBvalues[1]);
        setLocalSchema(DBvalues[2]);
      }

      document.getElementById("schemaError").innerHTML = "";
      setLocalSubject();
      document.getElementById("subjectError").innerHTML = "";
      document.getElementById("subject").value = "-1";
      setFile();
      document.getElementById("newFileError").innerHTML = "";
      document.getElementById("newFile").value = "";
      setPageMsg("");
      setLocalTableName();
    }
  }

  function handleSubjectChange(event) {
    let pickedSubject = event.target.value;
    if (pickedSubject === '-1') {
      setLocalSubject();
      setLocalTableName();
    }
    else {
      setLocalSubject(pickedSubject);
      let tableName = schemaLinks.filter(sl => sl.DBtype === DBtype
        && sl.DBserver === localDBserver
        && sl.targetDB === localTargetDB
        && sl.schema === localSchema
        && sl.subject === pickedSubject)
        .map(item => item.tableName);
      console.log("Table Name = " + tableName);
      setLocalTableName(tableName);
    }
    document.getElementById("subjectError").innerHTML = "";
    document.getElementById("subjectError").value = "";
    setFile();
    document.getElementById("newFileError").innerHTML = "";
    document.getElementById("newFileError").value = "";

    setPageMsg("");
  }

  function handleFileChange(event) {
    document.getElementById("newFileError").innerHTML = "";
    let newFile = event.target.files[0];
    console.log(newFile.type);
    if (["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(newFile.type)) {
      setFile(newFile);
      setPageMsg("");
    }
    else {
      setFile();
      setPageMsg("Unknown file type.");
      document.getElementById("newFileError").innerHTML = "Unknown file type: " + newFile.type;
      console.error("Unknown file type: " + newFile.type);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const url = 'http://localhost:8000/compareFile/';
    const formData = new FormData();
    formData.append('DBtype', DBtype);
    formData.append('DBserver', localDBserver);
    formData.append('targetDB', localTargetDB);
    formData.append('schema', localSchema);
    formData.append('subject', localSubject);
    formData.append('tableName', localTableName);
    formData.append('uploadedFile', file);
    formData.append('fileType', file.type);
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      },
    };
    axios.post(url, formData, config)
      .then((response) => {
        setFileUploaded(true);
        setFormSubmitted(true);
        setPageMsg(response.data.message);
        console.log(response.data.message);
      })
      .catch((error) => {
        setFileUploaded(false);
        setFormSubmitted(true);
        setPageMsg(error.message);
        console.error("error.message: ", error.message);
      });
  }

  return (
    <div className="App">
      <form id="MainForm" onSubmit={handleSubmit}>
        <center>
          <h1>Compare File with DB Schema</h1>
          <label htmlFor="schema">Schema: </label>
          <select required id="schema" onChange={handleSchemaChange}>
            <option key='-1' value='-1'>Pick a Schema</option>
            {schema.map((item, index) => <option key={index} value={item.schemaStr}>{item.schemaStr}</option>)}
          </select>
          <p id="schemaError"></p>
          <label htmlFor="subject">Subject: </label>
          <select required id="subject" onChange={handleSubjectChange}>
            <option key='-1' value='-1'>Pick a Subject</option>
            {subjectList.map((sl, index) => { return <option key={index} value={sl}>{sl}</option> })}
          </select>
          <p id="subjectError"></p>
          <p >Only .csv and .xl* files allowed. Blank rows will be ignored.</p>
          <label htmlFor="newFile">File: </label>
          <input required type="file" id="newFile" onChange={handleFileChange} />
          <p id="newFileError"></p>
          <button>Compare Schema</button>
          {formSubmitted && fileUploaded && <center><b><p>Schema compare successful!</p></b></center>}
          {formSubmitted && !fileUploaded && <center><p><b>Schema compare failed!</b></p></center>}
        </center>
      </form>
    </div>
  );
}

export default Compare;
