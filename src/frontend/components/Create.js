import { useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button } from "react-bootstrap";

const PINATA_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjOWQxMDlhNy0yMmNkLTQ2NTktOTQ3ZS1iMGUzMGI4Yjk4NzIiLCJlbWFpbCI6ImVsam9uaGlkYTk5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0N2VhZDY1N2JkZjJhOWIwYmJhMiIsInNjb3BlZEtleVNlY3JldCI6ImJhODYyZDAxNzYyOWZlZWM1NGQ1MWViNmNhMDUxNjYzMTk5NWVjODBkZTk1MDJjMjQ1MWUxOGViNDBiODFlZDYiLCJleHAiOjE3NjY3ODA3Nzd9.2DaP9pnt3Rp_yglAXDZgrXdUDYzRleRu8ul-XzRFTnc";

const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // Carica i dati dell'NFT su Pinata
  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== "undefined") {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${PINATA_JWT}`,
            },
            body: formData,
          }
        );
        // Controllo sull'upload su Pinata
        if (!response.ok) {
          throw new Error("Errore durante l'upload su Pinata");
        }

        const result = await response.json();
        console.log(result);
        setImage(
          `https://pink-historic-hummingbird-748.mypinata.cloud/ipfs/${result.IpfsHash}`
        );
      } catch (error) {
        console.error("Errore durante l'upload su Pinata", error);
      }
    }
  };
  // Creazione dell'NFT
  const createNFT = async () => {
    if (!image || !price || !name || !description) return;
    try {
      const metadata = {
        image,
        price,
        name,
        description,
      };

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metadata),
        }
      );

      if (!response.ok) {
        throw new Error("Errore durante l'upload dei metadata su Pinata");
      }

      const result = await response.json();
      mintThenList(result);
    } catch (error) {
      console.error("Errore durante l'upload dei metadata su Pinata", error);
    }
  };
  // Carica l'NFT sul catalogo dopo averlo creato
  const mintThenList = async (result) => {
    const uri = `https://pink-historic-hummingbird-748.mypinata.cloud/ipfs/${result.IpfsHash}`;
    // Mint dell'NFT
    await (await nft.mint(uri)).wait();
    // Ottiene il tokenId del nuovo NFT
    const id = await nft.tokenCount();
    // Approva il marketplace a spendere l'NFT
    await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    // Aggiunge l'NFT al marketplace
    const listingPrice = ethers.utils.parseEther(price.toString());
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control
                onChange={(e) => setName(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Nome"
              />
              <Form.Control
                onChange={(e) => setDescription(e.target.value)}
                size="lg"
                required
                as="textarea"
                placeholder="Descrizione"
              />
              <Form.Control
                onChange={(e) => setPrice(e.target.value)}
                size="lg"
                required
                type="number"
                placeholder="Prezzo in ETH"
              />
              <div className="d-grid px-0">
                <Button
                  onClick={createNFT}
                  size="lg"
                  style={{
                    backgroundColor: "#d5bdaf",
                    borderColor: "#d5bdaf",
                    color: "white",
                  }}
                >
                  Crea & Lista NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Create;
