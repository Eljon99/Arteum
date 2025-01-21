import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Card, Container } from "react-bootstrap";
import { Spinner } from "react-bootstrap"; //Componente rappresentante il caricamento

function renderSoldItems(items) {
  return (
    <>
      <h2 className="text-center my-4" style={{ color: "#d5bdaf" }}>
        Venduti
      </h2>
      <Row xs={1} md={2} lg={4} className="g-4 py-3">
        {items.map((item, idx) => (
          <Col key={idx} className="overflow-hidden">
            <Card style={{ boxShadow: "0px 4px 10px rgba(0,0,0,0.3)" }}>
              <Card.Img
                variant="top"
                src={item.image}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <Card.Footer
                style={{
                  color: "#b8a192",
                }}
              >
                Per {ethers.utils.formatEther(item.totalPrice)} ETH - Ricevuti{" "}
                {ethers.utils.formatEther(item.price)} ETH
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}

export default function MyListedItems({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);

  const loadListedItems = async () => {
    const itemCount = await marketplace.itemCount();
    let listedItems = [];
    let soldItems = [];
    for (let indx = 1; indx <= itemCount; indx++) {
      const i = await marketplace.items(indx);
      if (i.seller.toLowerCase() === account) {
        const uri = await nft.tokenURI(i.tokenId);
        const response = await fetch(uri);
        const metadata = await response.json();
        const totalPrice = await marketplace.getTotalPrice(i.itemId);
        let item = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        };
        listedItems.push(item);
        if (i.sold) soldItems.push(item);
      }
    }
    setLoading(false);
    setListedItems(listedItems);
    setSoldItems(soldItems);
  };

  useEffect(() => {
    loadListedItems();
  }, []);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );

  return (
    <Container className="py-5">
      {listedItems.length > 0 ? (
        <div>
          <h2 className="text-center my-4" style={{ color: "#b8a192" }}>
            In Vendita
          </h2>
          <Row xs={1} md={2} lg={4} className="g-4 py-3">
            {listedItems.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card style={{ boxShadow: "0px 4px 10px rgba(0,0,0,0.3)" }}>
                  <Card.Img
                    variant="top"
                    src={item.image}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <Card.Footer
                    style={{
                      backgroundColor:
                        "linear-gradient(to top, white, #f5ebe0)",
                      color: "#b8a192",
                    }}
                  >
                    {ethers.utils.formatEther(item.totalPrice)} ETH
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
          {soldItems.length > 0 && renderSoldItems(soldItems)}
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }} className="text-center">
          <h2 style={{ color: "#d5bdaf" }}>Non hai in Vendita Nessun NFT</h2>
        </main>
      )}
    </Container>
  );
}
