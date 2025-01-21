import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Card } from "react-bootstrap";
import { Spinner } from "react-bootstrap"; //Componente rappresentante il caricamento

export default function MyPurchases({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const loadPurchasedItems = async () => {
    // Recupera gli articoli acquistati dal marketplace facendo una query sugli eventi Offered con l'acquirente impostato come utente
    const filter = marketplace.filters.Bought(
      null,
      null,
      null,
      null,
      null,
      account
    );
    const results = await marketplace.queryFilter(filter);
    // Recupera i metadati di ogni NFT e mostrali sulla lista dell'utente
    const purchases = await Promise.all(
      results.map(async (i) => {
        // Recupera gli argomenti da ogni risultato
        i = i.args;
        // get uri url from nft contract
        const uri = await nft.tokenURI(i.tokenId);
        // Usa l'uri per recuperare gli NFT su Pinata
        const response = await fetch(uri);
        const metadata = await response.json();
        // Ottieni il prezzo totale dell'item (prezzo item + fee(commissione))
        const totalPrice = await marketplace.getTotalPrice(i.itemId);
        // Definisce l'oggetto messo nella lista
        let purchasedItem = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        };
        return purchasedItem;
      })
    );
    setLoading(false);
    setPurchases(purchases);
  };
  useEffect(() => {
    loadPurchasedItems();
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
    <div className="flex justify-center">
      {purchases.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Footer style={{ color: "#b8a78e" }}>
                    {ethers.utils.formatEther(item.totalPrice)} ETH
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ color: "#b89f8a", padding: "1rem 0" }}>
          <h2>Non hai Acquistato Nessun NFT</h2>
        </main>
      )}
    </div>
  );
}
