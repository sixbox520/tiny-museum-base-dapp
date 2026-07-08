import type { Address } from "viem";

export const MAX_OBJECT_LENGTH = 42;
export const MAX_CATEGORY_LENGTH = 24;
export const MAX_ERA_LENGTH = 24;
export const MAX_LABEL_LENGTH = 220;

export const tinyMuseumAbi = [
  {
    type: "event",
    name: "ObjectSaved",
    inputs: [
      { name: "objectId", type: "uint256", indexed: true },
      { name: "curator", type: "address", indexed: true },
      { name: "objectName", type: "string", indexed: false },
      { name: "category", type: "string", indexed: false },
      { name: "era", type: "string", indexed: false },
    ],
  },
  {
    type: "function",
    name: "saveObject",
    stateMutability: "nonpayable",
    inputs: [
      { name: "objectName", type: "string" },
      { name: "category", type: "string" },
      { name: "era", type: "string" },
      { name: "label", type: "string" },
    ],
    outputs: [{ name: "objectId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getObject",
    stateMutability: "view",
    inputs: [{ name: "objectId", type: "uint256" }],
    outputs: [
      { name: "curator", type: "address" },
      { name: "objectName", type: "string" },
      { name: "category", type: "string" },
      { name: "era", type: "string" },
      { name: "label", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "nextObjectId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function isAddressLike(value?: string) {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

const configuredTinyMuseumContractAddress =
  process.env.NEXT_PUBLIC_TINY_MUSEUM_CONTRACT_ADDRESS?.trim();

export const tinyMuseumContractAddress = isAddressLike(
  configuredTinyMuseumContractAddress,
)
  ? (configuredTinyMuseumContractAddress as Address)
  : undefined;
