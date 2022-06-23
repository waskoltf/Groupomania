import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Navbar,
  Container,
  Nav,
  Form,
  FormControl,
  Button,
  NavDropdown,
} from "react-bootstrap";
import axios from "axios";
import Identicon from "react-identicons";
import "./NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setLoggedIn(true);
      axios
        .post(`http://localhost:4200/api/user/data`, {
          token: localStorage.getItem("token"),
        })
        .then((res) => {
          setName(res.data.name);
          setEmail(res.data.email);
        })
        .catch((err) => {
          localStorage.removeItem("token");
          setLoggedIn(false);
        });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    navigate("/");
  };



  return (
    <>
      <Navbar collapseOnSelect expand="lg" sticky="top" variant="dark">
        <Container>
          <Navbar.Brand
            onClick={() => {
              navigate("/");
            }}
          >
            Groupomania
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse>


            {loggedIn ? (
              <Nav>
                <Nav.Link>
                  <Button
                    variant="success"
                    className="new-post"
                    onClick={() => {
                      navigate("/new");
                    }}
                  >
                    Create New Post
                  </Button>
                </Nav.Link>
                <NavDropdown
                  align={{ lg: "end" }}
                  title={
                    <Identicon className="user-icon" string={email} size={40} />
                  }
                >
                  <NavDropdown.Item>{name}</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item
                    onClick={() => {
                      navigate("/profile");
                    }}
                  >
                    My Posts
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            ) : (
              <Nav>
                <Nav.Link>
                  <Button
                    variant="success"
                    className="login"
                    onClick={() => {
                      navigate("/login");
                    }}
                  >
                    Login
                  </Button>
                </Nav.Link>
                <Nav.Link>
                  <Button
                    variant="success"
                    className="signup"
                    onClick={() => {
                      navigate("/signup");
                    }}
                  >
                    Signup
                  </Button>
                </Nav.Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
