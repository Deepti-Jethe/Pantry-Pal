import React from "react";
import { Link } from "react-router-dom";

function ErrorPage() {
  return (
    <div className="ErrorPage">
      <h1>Error :/</h1>
      <h4>
        You are not authorised to access this page or this page does not exist
      </h4>
      <h3>
        Go to the Home Page: <Link to="/"> Home Page</Link>
      </h3>
    </div>
  );
}

export default ErrorPage;
