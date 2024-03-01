import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
//import {makeStyles} from "@mui/styles";
import { Link } from "react-router-dom";

function Navbar() {
  //const classes = useStyles();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">DB File Upload</Typography>
        <div>
          <Link to="/"> Compare Schema </Link>
          <Link to="/linkAdmin"> Link Admin </Link>
          <Link to="/schemaAdmin"> Schema Admin </Link>
          <Link to="/about"> About </Link>
          <Link to="/contact"> Contact </Link>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
