import React from "react";
import { AppBar, Toolbar, Typography, styled, } from "@mui/material";
//import {makeStyles} from "@mui/styles";
import { Link } from "react-router-dom";

const useStyles = styled((theme) => ({
  navlinks: { marginLeft: theme.spacing(30), display: "inline-flex", position: "right" },
  logo: { flexGrow: "1", cursor: "pointer", },
  link: {
    textAlign: "center",
    textDecoration: "none",
    color: "white",
    fontSize: "20px",
    marginLeft: theme.spacing(20),
    "&:hover": {
      color: "yellow",
      borderBottom: "1px solid white",
    },
    display: "inline-block",
  },
}));

function Navbar() {
  const classes = useStyles();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" className={classes.logo}>DB File Compare</Typography>
        <div className={classes.navlinks}>
          <Link to="/" className={classes.link}> Compare Schema </Link>
          <Link to="/linkAdmin" className={classes.link}> Link Admin </Link>
          <Link to="/schemaAdmin" className={classes.link}> Schema Admin </Link>
          <Link to="/about" className={classes.link}> About </Link>
          <Link to="/contact" className={classes.link}> Contact </Link>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
