import React, { useState } from 'react';
import axios from 'axios';

const Compare = ({ uniqueSchemas, schemaSubjectList, setPageMsg }) => {

  const [schema, setSchema] = useState();
  const [subjectID, setSubjectID] = useState();
  const [subject, setSubject] = useState("No Selection");
  const [file, setFile] = useState();

  //const [pageMsg, setPageMsg] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  function handleSchemaChange(event) {
    document.getElementById("schemaError").innerHTML = "";
    setSchema(event.target.value);
    setSubjectID();
    setSubject();
    setPageMsg("");
    setFormSubmitted(false);
    setFileUploaded(false);
  }

  function handleSubjectChange(event) {
    document.getElementById("subjectError").innerHTML = "";
    setSubjectID(event.target.value);
    setSubject(event.target.value);
    setPageMsg("");
    setFormSubmitted(false);
    setFileUploaded(false);
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
      setPageMsg("Unknown file type.");
      document.getElementById("newFileError").innerHTML = "Unknown file type: " + newFile.type;
      console.error("Unknown file type: " + newFile.type);
    }
    setFormSubmitted(false);
    setFileUploaded(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const url = 'http://localhost:8000/compareFile/';
    const formData = new FormData();
    formData.append('schema', schema);
    formData.append('uploadedFile', file);
    formData.append('fileType', file.type);
    formData.append('subject', subject);
    formData.append('subject_ID', subjectID);
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      },
    };
    axios.post(url, formData, config)
      .then((response) => {
        document.getElementById("newFileError").innerHTML = "";
        setFileUploaded(true);
        setFormSubmitted(true);
        setPageMsg(response.data.message);
        console.log("response: ", { ...response });
      })
      .catch((error) => {
        setFileUploaded(false);
        setFormSubmitted(true);
        setPageMsg(error.message);
        console.log("error: ", { ...error })
        console.error("error.message: ", error.message);
      });
  }

  return (
    <div className="App">
      <form id="MainForm" onSubmit={handleSubmit}>
        <center>
          <h1>Compare File with DB Schema</h1>
          <label htmlFor="schema">Schema: </label>
          <select required id="schema" onChange={handleSchemaChange}><option key='-1'>Pick a Schema</option>
            {uniqueSchemas.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <p id="schemaError"></p>
          <label htmlFor="subject">Subject: </label>
          <select required id="subject" onChange={handleSubjectChange}><option key='-1'>Pick a Subject</option>
            {schemaSubjectList.map(item => (item[1] === schema) ? <option key={item[0]} value={item[2]}>{item[2]}</option> : "")}
          </select>
          <p id="subjectError"></p>
          <p >Only .csv and .xl* files allowed. Blank rows will be ignored.</p>
          <label htmlFor="fileToUpload">File: </label>
          <input required type="file" id="fileToUpload" onChange={handleFileChange} />
          <p id="newFileError"></p>
          <button>Compare Schema</button>
          {formSubmitted && fileUploaded && <center><b><p>Schema compare successful!</p></b></center>}
          {formSubmitted && !fileUploaded && <center><p><b>Schema compare failed!</b></p></center>}
        </center>
      </form>
    </div>
  );
};

export default Compare;
