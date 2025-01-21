import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Card, Button } from "react-bootstrap";
import { Spinner } from "react-bootstrap"; //Componente rappresentante l'icona di caricamento
import { Toast, ToastContainer } from "react-bootstrap"; // Componente che permette di mostrare la finestra di messaggio

const Home = ({ marketplace, nft }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    success: false,
  });

  const showToast = (message, success = true) => {
    setToast({ show: true, message, success });
    setTimeout(() => setToast({ show: false, message: "", success }), 3000); // Nasconde il toast dopo 3 secondi
  };

  const loadMarketplaceItems = async () => {
    // Carica tutti gli item non venduti
    const itemCount = await marketplace.itemCount();
    let items = [];
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i);
      if (!item.sold) {
        // Ottieni l'uri dal contratto NFT
        const uri = await nft.tokenURI(item.tokenId);
        // Utilizzare l'uri per recuperare i metadati dell'NFT memorizzati su Pinata
        const response = await fetch(uri);
        const metadata = await response.json();
        // Ottieni il prezzo totale dell'item(prezzo dell'item + fee)
        const totalPrice = await marketplace.getTotalPrice(item.itemId);
        // Aggiungi l'item all'array di item
        items.push({
          totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        });
      }
    }
    setLoading(false);
    setItems(items);
  };

  const buyMarketItem = async (item) => {
    setLoading(true);
    try {
      await (
        await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })
      ).wait();
      showToast("NFT acquistato con successo!", true);
    } catch (error) {
      showToast("Errore durante l'acquisto: " + error.message, false);
    }
    setLoading(false);
    loadMarketplaceItems();
  };

  useEffect(() => {
    loadMarketplaceItems();
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
      <div
        className="welcome-message"
        style={{
          color: "#6f4f28",
          textAlign: "center",
          marginBottom: "20px",
          marginTop: "20px",
        }}
      >
        <h1>Benvenuto su Arteum</h1>
        <p>Scopri e acquista fantastici NFT da collezionare!</p>
      </div>
      {items.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card className="shadow card-custom">
                  <Card.Img
                    variant="top"
                    src={item.image}
                    style={{
                      maxHeight: "200px",
                      objectFit: "cover",
                      border: "1px solid #f5ebe0", // Aggiungi un bordo sottile
                    }}
                  />
                  <Card.Body>
                    <Card.Title style={{ color: "#b8a192" }}>
                      {item.name}
                    </Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      onClick={() => buyMarketItem(item)}
                      style={{
                        backgroundColor: "#d5bdaf",
                        borderColor: "#d5bdaf",
                        color: "white",
                      }}
                      size="lg"
                    >
                      Acquista {ethers.utils.formatEther(item.totalPrice)} ETH
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main
          style={{
            textAlign: "center",
            padding: "2rem 0",
            color: "#b89f8a",
            backgroundColor: "#f5ebe0",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ color: "#8c6f5b", fontWeight: "bold" }}>
            Non vi Sono NFT Disponibili al Momento
          </h2>
          <p style={{ color: "#8c6f5b", fontStyle: "italic" }}>
            Prova a tornare più tardi o a creare nuovi NFT.
          </p>
        </main>
      )}
      {/* Toast Container per i messaggi */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg={toast.success ? "success" : "danger"} show={toast.show}>
          <Toast.Body style={{ color: "white" }}>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};
export default Home;
