// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TinyMuseum {
    uint256 public nextObjectId = 1;

    struct ObjectCard {
        address curator;
        string objectName;
        string category;
        string era;
        string label;
        uint256 createdAt;
    }

    mapping(uint256 => ObjectCard) private objects;

    event ObjectSaved(
        uint256 indexed objectId,
        address indexed curator,
        string objectName,
        string category,
        string era
    );

    function saveObject(
        string calldata objectName,
        string calldata category,
        string calldata era,
        string calldata label
    ) external returns (uint256 objectId) {
        require(bytes(objectName).length > 0 && bytes(objectName).length <= 42, "Invalid object");
        require(bytes(category).length > 0 && bytes(category).length <= 24, "Invalid category");
        require(bytes(era).length > 0 && bytes(era).length <= 24, "Invalid era");
        require(bytes(label).length > 0 && bytes(label).length <= 220, "Invalid label");

        objectId = nextObjectId++;
        objects[objectId] = ObjectCard({
            curator: msg.sender,
            objectName: objectName,
            category: category,
            era: era,
            label: label,
            createdAt: block.timestamp
        });

        emit ObjectSaved(objectId, msg.sender, objectName, category, era);
    }

    function getObject(
        uint256 objectId
    )
        external
        view
        returns (
            address curator,
            string memory objectName,
            string memory category,
            string memory era,
            string memory label,
            uint256 createdAt
        )
    {
        ObjectCard storage entry = objects[objectId];
        return (
            entry.curator,
            entry.objectName,
            entry.category,
            entry.era,
            entry.label,
            entry.createdAt
        );
    }
}
