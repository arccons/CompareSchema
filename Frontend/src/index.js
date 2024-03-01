import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from 'axios';
import ReactDOM from 'react-dom/client';
//import CssBaseline from '@mui/material/CssBaseline';
//import { ThemeProvider } from '@mui/material/styles';
//import theme from './theme';

import Layout from "./Layout";
import Compare from "./pages/Compare";
import Contact from "./pages/Contact";
import NoPage from "./pages/NoPage";
import About from "./pages/About";
import SchemaAdmin from './pages/SchemaAdmin';
import LinkAdmin from './pages/LinkAdmin';

export default function App() {

  const [DBs, setDBs] = useState([]);
  const [schema, setSchema] = useState([]);
  const [links, setLinks] = useState([]);
  const [schemaLinks, setSchemaLinks] = useState([]);
  const [gotDBdata, setGotDBdata] = useState(false);
  const [pageMsg, setPageMsg] = useState("");

  useEffect(() => {
    console.log("useEffect: Entered.");
    if (!gotDBdata) {
      console.log("useEffect: Getting subject list.");

      const url = 'http://localhost:8080/subjectList/';
      const config = {
        headers: {
          'content-type': 'application/json'
        },
      }
      axios.get(url, config)
        .then((response) => {
          //console.log(response.data);
          setDBs(response.data.DBs);
          setSchema(response.data.schema);
          setLinks(response.data.links);
          setSchemaLinks(response.data.schemaLinks);
          setGotDBdata(true);

          // For communicating with user
          setPageMsg("");

          // REMOVE: Code for testing
          //console.log(response.data.DBs);
          //console.log(response.data.schema);
          //console.log(response.data.links);
          //console.log(response.data.schemaLinks);
        })
        .catch((error) => {
          console.error("Error getting subject list: ", error);
          setPageMsg("Error getting subject list: " + error);
          setGotDBdata(false);
        });
    }
  }, [gotDBdata])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout pageMsg={pageMsg} />}>
          <Route index element={<Compare DBtype={'PostgreSQL'} schema={schema} schemaLinks={schemaLinks}
            setPageMsg={setPageMsg} />} />
          <Route path="linkAdmin" element={<LinkAdmin schema={schema} links={links}
            setGotDBdata={setGotDBdata}
            setPageMsg={setPageMsg} />} />
          <Route path="schemaAdmin" element={<SchemaAdmin schema={schema}
            setGotDBdata={setGotDBdata}
            setPageMsg={setPageMsg} />} />
          <Route path="contact" element={<Contact setPageMsg={setPageMsg} />} />
          <Route path="about" element={<About setPageMsg={setPageMsg} />} />
          <Route path="*" element={<NoPage setPageMsg={setPageMsg} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(<App />);
