import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
//import { SubjectsProvider } from "./SubjectsContext";
import axios from 'axios';

import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

import Layout from "./pages/Layout";
import Compare from "./pages/Compare";
import Contact from "./pages/Contact";
import NoPage from "./pages/NoPage";
import About from "./pages/About";
import SchemaAdmin from './pages/SchemaAdmin';
import LinkAdmin from './pages/LinkAdmin';

export default function App() {

  const [uniqueSchemas, setUniqueSchemas] = useState([]);
  const [schemaSubjectList, setSchemaSubjectList] = useState([]);
  const [schemaTableList, setSchemaTableList] = useState([]);
  const [gotSubjectList, setGotSubjectList] = useState(false);

  const [pageMsg, setPageMsg] = useState("");

  useEffect(() => {
    console.log("useEffect: Entered.");
    if (!gotSubjectList) {
      console.log("useEffect: Getting subject list.");
      axios.get("http://localhost:8000/getSubjectList")
        .then((response) => {
          let schemas = Array.from(response.data.UNIQUE_SCHEMAS.values());
          let schemaSubjects = Array.from(response.data.SCHEMA_SUBJECTS.values());
          let schemaTables = Array.from(response.data.SCHEMA_TABLES.values());
          setUniqueSchemas(schemas);
          setSchemaTableList(schemaTables);
          setSchemaSubjectList(schemaSubjects);
          setGotSubjectList(true);
          setPageMsg("");
          console.log("response", { ...response })
        })
        .catch((error) => {
          console.error("Error getting subject list: ", error.message);
          setPageMsg("Error getting subject list: " + error.message);
          setGotSubjectList(false);
        });
    }
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout pageMsg={pageMsg} />}>
          <Route index element={<Compare
            uniqueSchemas={uniqueSchemas}
            schemaSubjectList={schemaSubjectList}
            setPageMsg={setPageMsg} />} />
          <Route path="linkAdmin" element={<LinkAdmin
            uniqueSchemas={uniqueSchemas}
            schemaSubjectList={schemaSubjectList}
            schemaTableList={schemaTableList}
            setGotSubjectList={setGotSubjectList}
            setPageMsg={setPageMsg} />} />
          <Route path="schemaAdmin" element={<SchemaAdmin
            uniqueSchemas={uniqueSchemas}
            setPageMsg={setPageMsg} />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <App />
  </ThemeProvider>
);
