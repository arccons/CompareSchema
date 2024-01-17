import React, {useState, useEffect} from 'react';
import axios from 'axios';

const Home = (props) => {

  const [file, setFile] = useState();
  const [subject, setSubject] = useState("No Selection");
  const [table, setTable] = useState();
  const [subjectList, setSubjectList] = useState([]);
  const [tableList, setTableList] = useState([]);

  const [pageMsg, setPageMsg] = useState("");
  const [gotSubjectList, setGotSubjectList] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  useEffect (() => {
    console.log("useEffect: Entered.");
    if(!gotSubjectList) {
      console.log("useEffect: Getting subject list.");
      document.getElementById("MainForm").reset();
      console.log("Form reset.")
      axios.get("http://localhost:8000/getSubjectList")
        .then((response) => {
          console.log(response.data.SUBJECTS, response.data.TABLE_NAMES);
          setSubjectList(response.data.SUBJECTS);
          setTableList(response.data.TABLE_NAMES);
          setGotSubjectList(true);
          console.log(subjectList, tableList);
        })
        .catch((error) => {
          console.error("Error getting subject list: ", error.message);
          setPageMsg("Error getting subject list: " + error.message);
          //setSubjectList([]);
          //setTableList([]);
          setGotSubjectList(false);
          }
      );
    }
  });

/*   function handleLoad(event) {
    console.log("handleLoad: ", props.newSubject);
    document.getElementById("newSubjectError").innerHTML = "";
    document.getElementById("newTableError").innerHTML = "";
    document.getElementById("newFileError").innerHTML = "";
    //document.getElementById("uploadSuccessMessage").innerHTML = "";
    //document.getElementById("uploadErrorMessage").innerHTML = "";
    setFile();
    setSubject("No selection");
    setTable();
    setPageMsg("");
    setFileUploaded(false);
    setFormSubmitted(false);
    console.log("Form reset.");
    document.getElementById("MainForm").reset();
  } */

  function handleSubjectChange(event) {
    if (props.newSubject) {
      if (subjectList.includes(event.target.value)) {
        document.getElementById("newSubjectError").innerHTML = "Subject already in use. Subjects: " + subjectList;
        console.log("Subject already in use. Subjects: " + subjectList);
        setPageMsg("Subject already in use.");
      }
      else {
        setSubject(event.target.value);
        setPageMsg("");
      }
    }
    else {
      setSubject(event.target.value);
      setPageMsg("");
    }
    setFormSubmitted(false);
    setFileUploaded(false);
  }

  function handleTableChange(event) {
    if (props.newSubject) {
      if (tableList.includes(event.target.value)) {
        setPageMsg("Table already in use.");
        document.getElementById("newTableError").innerHTML = "Table already in use. Tables: " + tableList;
        console.log("Table already in use. Tables: " + tableList);
      }
      else {
        setTable(event.target.value);
        setPageMsg("");
      }
    }
    else {
      setTable(event.target.value);
      setPageMsg("");
    }
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
      setFormSubmitted(false);
      document.getElementById("newFileError").innerHTML= "Unknown file type: " + newFile.type;
      console.log("Unknown file type: " + newFile.type);
    }
    setFormSubmitted(false);
    setFileUploaded(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const url = 'http://localhost:8000/processFile/';
    const formData = new FormData();
    formData.append('uploadedFile', file);
    formData.append('fileType', file.type);
    formData.append('subject', subject);
    if (props.newSubject) {
      formData.append('table', table);
    }
    console.log(file.type)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      },
    };

    axios.post(url, formData, config)
      .then((response) => {
        console.log(response.data.message);
        setFileUploaded(true);
        setFormSubmitted(true);
        setGotSubjectList(false);
        setPageMsg("File upload successful.");
      })
      .catch((error) => {
        setPageMsg(error.message);
        setFileUploaded(false);
        setFormSubmitted(true);
        console.error("Error uploading file: ", error.message);
      });
    }

  return (
    <div className="App">
        <form id="MainForm" onSubmit={handleSubmit}>
          <center><h1>DB File Upload</h1></center>
          
          {!props.newSubject &&
            <>
            <center>
              <label htmlFor="subject">Choose a Subject: </label>
                <select id="subject" onChange={handleSubjectChange}><option key='0' value="No Selection">Pick One</option>
                  {subjectList.map((sL)=><option key={sL} value={sL}>{sL}</option>)}
                </select>
                <br></br>
            </center>
            </>}
          {props.newSubject && 
            <>
              <center>
                <label htmlFor="newSubject">Create a Subject: </label>
                  <input type="text" id="newSubject" required onChange={handleSubjectChange}/>
                  <p id="newSubjectError"></p>
                  <br></br>
                  <label htmlFor="newTable">Table for the Subject: </label>
                  <input type="text" id="newTable" onChange={handleTableChange} required/>
                  <p id="newTableError"></p>
              </center>
            </>
          }
          <center>
            <br></br>
            <label htmlFor="fileToUpload">Choose a File: </label>
            <input type="file" id="fileToUpload" onChange={handleFileChange}/>
            <p>Only .csv and .xl* files allowed</p>
            <p id="newFileError"></p>
            <p>[Dates will be stored in <b>YYYY-MM-DD</b> format]</p>
            <button onSubmit={handleSubmit}>Upload</button>
          </center>
          {formSubmitted && fileUploaded && <center><b><p>Upload successful!</p></b></center>}
          {formSubmitted && !fileUploaded && <center><p><b>Upload failed!</b></p></center>}
          {formSubmitted && <center>{pageMsg}</center>}
        </form>
    </div>
  );
};

export default Home;
