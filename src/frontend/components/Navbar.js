import { Link } from "react-router-dom";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import market from "./images/market.png";

const Navigation = ({ web3Handler, account }) => {
  return (
    <Navbar
      expand="lg"
      style={{
        background: "linear-gradient(to bottom, white, #f5ebe0)",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
      }}
      variant="dark"
    >
      <Container>
        <Navbar.Brand>
          <img
            src={market}
            width="40"
            height="40"
            className=""
            alt="Arteum Logo"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" style={{ color: "#b89f8a" }}>
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/create"
              className="nav-link"
              style={{ color: "#b89f8a" }}
            >
              Crea
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/my-listed-items"
              className="nav-link"
              style={{ color: "#b89f8a" }}
            >
              Miei NFT
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/my-purchases"
              className="nav-link"
              style={{ color: "#b89f8a" }}
            >
              Acquistati
            </Nav.Link>
          </Nav>
          <Nav>
            {account ? (
              <Nav.Link
                href={`https://etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button nav-button btn-sm mx-4"
              >
                <Button
                  variant="outline-light"
                  style={{ backgroundColor: "#d5bdaf", color: "white" }}
                >
                  {account.slice(0, 5) + "..." + account.slice(38, 42)}
                </Button>
              </Nav.Link>
            ) : (
              <Button
                onClick={web3Handler}
                style={{
                  backgroundColor: "#d5bdaf",
                  borderColor: "#d5bdaf",
                  color: "white",
                }}
              >
                Login
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
