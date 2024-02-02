import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";

const Layout = ({ pageMsg }) => {
  return (
    <>
      <Navbar></Navbar>
      <Outlet />
      <center><p>{pageMsg}</p></center>
    </>
  )
};

export default Layout;
