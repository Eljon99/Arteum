// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

//Contratto per gestire tutto il negozio Arteum
contract Marketplace is ReentrancyGuard {
    address payable public immutable feeAccount; // L'account che riceve il compenso
    uint public immutable feePercent; // La percentuale di compenso sulle vendite
    uint public itemCount = 0;

    struct Item {
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }

    // itemId -> Item
    mapping(uint => Item) public items;

    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );
    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    // Creazione degli item per pubblicarli sul Marketplace
    function makeItem(
        IERC721 _nft,
        uint _tokenId,
        uint _price
    ) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");

        itemCount++;
        // Trasferimento del NFT
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        // Aggiunta del nuovo item al mapping
        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );
        // Attivazione evento Offered
        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    // Acquisto di un NFT
    function purchaseItem(uint _itemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(
            msg.value >= _totalPrice,
            "not enough ether to cover item price and market fee"
        );
        require(!item.sold, "item already sold");
        // Aggiornamento dell'item allo stato venduto
        item.sold = true;
        // Pagamento del venditore e dell'account al quale si deve il compenso
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);
        // Trasferimento del NFT all'acquirente
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        // Attivazione evento Bought
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    // Funzione per il prezzo totale
    function getTotalPrice(uint _itemId) public view returns (uint) {
        return ((items[_itemId].price * (100 + feePercent)) / 100);
    }
}
