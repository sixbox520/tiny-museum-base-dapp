"use client";

import {
  Archive,
  BadgeCheck,
  Building2,
  Clock3,
  Frame,
  Landmark,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseEventLogs, type Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  MAX_CATEGORY_LENGTH,
  MAX_ERA_LENGTH,
  MAX_LABEL_LENGTH,
  MAX_OBJECT_LENGTH,
  tinyMuseumAbi,
  tinyMuseumContractAddress,
} from "@/lib/tiny-museum";

const CATEGORIES = ["Artifact", "Photo", "Tool", "Keepsake"] as const;
const ERAS = ["Found 2019", "Vintage", "Recent", "Unknown"] as const;

function shortAddress(address?: Address) {
  if (!address || address === "0x0000000000000000000000000000000000000000") return "--";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(value?: bigint) {
  if (!value) return "--";
  return new Date(Number(value) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function friendlyError(error: unknown) {
  if (!(error instanceof Error)) return "Transaction was cancelled.";
  if (error.message.includes("User rejected")) return "Request cancelled in wallet.";
  if (error.message.includes("Invalid object")) return "Object name needs 1 to 42 characters.";
  if (error.message.includes("Invalid category")) return "Choose a short category.";
  if (error.message.includes("Invalid era")) return "Era needs 1 to 24 characters.";
  if (error.message.includes("Invalid label")) return "Label needs 1 to 220 characters.";
  return error.message;
}

function ObjectLabel({
  objectName,
  category,
  era,
  label,
  curator,
  createdAt,
}: {
  objectName: string;
  category: string;
  era: string;
  label: string;
  curator?: Address;
  createdAt?: bigint;
}) {
  return (
    <article className="relative overflow-hidden rounded-[8px] border border-[#1f1b17] bg-[#f8f0dc] p-5 text-[#1f1b17] shadow-[0_26px_80px_rgba(31,27,23,0.2)] sm:p-8">
      <div className="absolute inset-x-0 top-0 h-3 bg-[#b73535]" />
      <div className="absolute bottom-0 left-0 h-40 w-full bg-[linear-gradient(90deg,rgba(31,27,23,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(31,27,23,0.06)_1px,transparent_1px)] bg-[size:18px_18px]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#7b5b2d]">
              Tiny Museum
            </p>
            <h2 className="mt-4 max-w-4xl break-words text-5xl font-black leading-none sm:text-7xl">
              {objectName || "Untitled object"}
            </h2>
          </div>
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[8px] border border-[#1f1b17] bg-[#1f1b17] text-[#f8f0dc]">
            <Landmark className="h-9 w-9" />
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[8px] border border-[#1f1b17] bg-[#1f1b17] p-4 text-[#f8f0dc]">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#f1bf42]">Category</p>
            <p className="mt-2 break-words text-3xl font-black">{category}</p>
          </div>
          <div className="rounded-[8px] border border-[#1f1b17] bg-[#f1bf42] p-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#7a5511]">Era</p>
            <p className="mt-2 break-words text-3xl font-black">{era}</p>
          </div>
          <div className="rounded-[8px] border border-[#1f1b17] bg-[#e3efe1] p-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#476345]">Chain</p>
            <p className="mt-2 text-3xl font-black">Base</p>
          </div>
        </div>

        <section className="mt-5 rounded-[8px] border border-[#1f1b17] bg-[#fff9eb] p-5">
          <div className="flex items-center gap-2">
            <Frame className="h-5 w-5 text-[#b73535]" />
            <h3 className="text-xl font-black">Object label</h3>
          </div>
          <p className="mt-5 min-h-[220px] whitespace-pre-wrap text-2xl font-semibold leading-10">
            {label || "Write the story this small object deserves."}
          </p>
        </section>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[8px] border border-[#1f1b17] bg-[#fff9eb] p-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#7b5b2d]">Curator</p>
            <p className="mt-2 text-xl font-black">{shortAddress(curator)}</p>
          </div>
          <div className="rounded-[8px] border border-[#1f1b17] bg-[#fff9eb] p-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#7b5b2d]">Filed</p>
            <p className="mt-2 text-xl font-black">{formatDate(createdAt)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function TinyMuseumApp() {
  const [objectIdInput, setObjectIdInput] = useState("1");
  const [objectName, setObjectName] = useState("Brass Train Ticket");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Artifact");
  const [era, setEra] = useState<(typeof ERAS)[number]>("Found 2019");
  const [label, setLabel] = useState(
    "A pocket-sized ticket from a late train ride. The stamp is faded, but the date still feels like a tiny proof of motion.",
  );
  const [status, setStatus] = useState("Save one object label on Base.");
  const [lastAction, setLastAction] = useState<"create" | null>(null);

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: hash, writeContractAsync, isPending: writing } = useWriteContract();
  const { data: receipt, isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  const selectedConnector =
    connectors.find((connector) => connector.id === "injected") ??
    connectors.find((connector) => connector.id === "baseAccount") ??
    connectors[0];
  const parsedObjectId = BigInt(Math.max(1, Number(objectIdInput || "1")));

  const objectQuery = useReadContract({
    abi: tinyMuseumAbi,
    address: tinyMuseumContractAddress,
    functionName: "getObject",
    args: [parsedObjectId],
    query: { enabled: Boolean(tinyMuseumContractAddress), refetchInterval: 12000 },
  });

  const totalQuery = useReadContract({
    abi: tinyMuseumAbi,
    address: tinyMuseumContractAddress,
    functionName: "nextObjectId",
    query: { enabled: Boolean(tinyMuseumContractAddress), refetchInterval: 12000 },
  });

  const tuple = objectQuery.data as
    | readonly [Address, string, string, string, string, bigint]
    | undefined;

  const liveObject = useMemo(
    () =>
      tuple
        ? {
            curator: tuple[0],
            objectName: tuple[1],
            category: tuple[2],
            era: tuple[3],
            label: tuple[4],
            createdAt: tuple[5],
          }
        : undefined,
    [tuple],
  );

  const totalObjects = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;
  const validFields =
    objectName.trim().length > 0 &&
    objectName.trim().length <= MAX_OBJECT_LENGTH &&
    category.trim().length > 0 &&
    category.trim().length <= MAX_CATEGORY_LENGTH &&
    era.trim().length > 0 &&
    era.trim().length <= MAX_ERA_LENGTH &&
    label.trim().length > 0 &&
    label.trim().length <= MAX_LABEL_LENGTH;

  const createBlocker = !tinyMuseumContractAddress
    ? "Contract not deployed yet. Run npm run deploy:contract, then add NEXT_PUBLIC_TINY_MUSEUM_CONTRACT_ADDRESS."
    : !isConnected
      ? "Connect wallet first."
      : chainId !== base.id
        ? "Switch to Base first."
        : !validFields
          ? "Fill object name, category, era, and label."
          : "";

  useEffect(() => {
    if (!receipt || lastAction !== "create") return;
    void totalQuery.refetch();
    void objectQuery.refetch();
    const logs = parseEventLogs({
      abi: tinyMuseumAbi,
      logs: receipt.logs,
      eventName: "ObjectSaved",
    });
    const objectId = logs[0]?.args.objectId;
    window.setTimeout(() => {
      if (objectId) setObjectIdInput(objectId.toString());
      setStatus(objectId ? `Object #${objectId.toString()} saved on Base.` : "Object saved on Base.");
    }, 0);
  }, [lastAction, objectQuery, receipt, totalQuery]);

  async function connectWallet() {
    const connectorQueue = [
      connectors.find((connector) => connector.id === "injected"),
      connectors.find((connector) => connector.id === "baseAccount"),
      selectedConnector,
    ]
      .filter((connector): connector is NonNullable<typeof selectedConnector> => Boolean(connector))
      .filter((connector, index, queue) => queue.findIndex((item) => item.id === connector.id) === index);

    if (connectorQueue.length === 0) {
      setStatus("No wallet connector found. Open this app inside Base App or a wallet browser.");
      return;
    }

    let lastError: unknown;
    setStatus("Opening wallet connection...");
    for (const connector of connectorQueue) {
      try {
        await connectAsync({ connector });
        setStatus("Wallet connected. Save an object when ready.");
        return;
      } catch (error) {
        lastError = error;
      }
    }
    setStatus(friendlyError(lastError));
  }

  async function saveObject() {
    const contractAddress = tinyMuseumContractAddress;
    if (createBlocker) {
      setStatus(createBlocker);
      return;
    }
    if (!contractAddress) {
      setStatus("Contract not deployed yet. Run npm run deploy:contract first.");
      return;
    }
    try {
      setLastAction("create");
      setStatus("Confirm the object label in your wallet.");
      await writeContractAsync({
        address: contractAddress,
        abi: tinyMuseumAbi,
        functionName: "saveObject",
        args: [objectName.trim(), category.trim(), era.trim(), label.trim()],
        chainId: base.id,
      });
      setStatus("Object label sent. Waiting for Base confirmation...");
    } catch (error) {
      setStatus(friendlyError(error));
    }
  }

  return (
    <main className="min-h-screen bg-[#efe7d1] text-[#1f1b17]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[392px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[8px] border border-[#1f1b17] bg-[#fff9eb] p-4 shadow-[0_20px_80px_rgba(31,27,23,0.12)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#7b5b2d]">Tiny Museum</p>
              <h1 className="mt-2 text-4xl font-black leading-none">Curate tiny objects.</h1>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] border border-[#1f1b17] bg-[#b73535] text-[#fff9eb]">
              <Building2 className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[8px] border border-[#1f1b17] bg-[#f8f0dc] p-3">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#7b5b2d]">Objects</p>
              <p className="mt-2 text-3xl font-black">{totalObjects}</p>
            </div>
            <div className="rounded-[8px] border border-[#1f1b17] bg-[#1f1b17] p-3 text-[#fff9eb]">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#f1bf42]">Chain</p>
              <p className="mt-2 text-xl font-black">Base</p>
            </div>
          </div>

          <section className="mt-4 rounded-[8px] border border-[#1f1b17] bg-[#f8f0dc] p-4">
            <h2 className="text-xl font-black">New label</h2>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#7b5b2d]">Object</span>
                <input
                  value={objectName}
                  onChange={(event) => setObjectName(event.target.value)}
                  maxLength={MAX_OBJECT_LENGTH}
                  className="mt-1 w-full rounded-[8px] border border-[#1f1b17] bg-[#fff9eb] px-3 py-3 font-black outline-none"
                />
              </label>
              <div>
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#7b5b2d]">Category</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {CATEGORIES.map((value) => (
                    <button
                      key={value}
                      className={`rounded-[8px] border px-2 py-3 text-sm font-black ${
                        value === category ? "border-[#1f1b17] bg-[#1f1b17] text-[#fff9eb]" : "border-[#1f1b17] bg-[#fff9eb]"
                      }`}
                      onClick={() => setCategory(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#7b5b2d]">Era</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {ERAS.map((value) => (
                    <button
                      key={value}
                      className={`rounded-[8px] border px-2 py-3 text-sm font-black ${
                        value === era ? "border-[#1f1b17] bg-[#f1bf42]" : "border-[#1f1b17] bg-[#fff9eb]"
                      }`}
                      onClick={() => setEra(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#7b5b2d]">Label</span>
                <textarea
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  maxLength={MAX_LABEL_LENGTH}
                  rows={5}
                  className="mt-1 w-full rounded-[8px] border border-[#1f1b17] bg-[#fff9eb] px-3 py-3 text-sm font-bold leading-6 outline-none"
                />
              </label>
            </div>
          </section>

          <div className="mt-4 space-y-3">
            {isConnected && chainId !== base.id ? (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#1f1b17] bg-[#f1bf42] px-4 py-3 font-black disabled:opacity-60"
                disabled={switching}
                onClick={() => switchChain({ chainId: base.id })}
              >
                {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Switch to Base
              </button>
            ) : (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#b73535] px-4 py-3 font-black text-[#fff9eb] disabled:opacity-60"
                disabled={writing || confirming}
                onClick={saveObject}
              >
                {writing || confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Save Object
              </button>
            )}
            {isConnected ? (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#1f1b17] bg-[#fff9eb] px-4 py-3 font-black"
                onClick={disconnectWallet}
              >
                {shortAddress(address)}
              </button>
            ) : (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#1f1b17] bg-[#fff9eb] px-4 py-3 font-black disabled:opacity-60"
                disabled={!selectedConnector || connecting}
                onClick={connectWallet}
              >
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Connect wallet
              </button>
            )}
            <p className="rounded-[8px] border border-[#1f1b17] bg-[#f8f0dc] px-3 py-3 text-sm font-bold leading-6">{status}</p>
            {hash ? (
              <a
                className="block rounded-[8px] border border-[#1f1b17] bg-[#1f1b17] px-3 py-3 text-xs font-black leading-5 text-[#f1bf42] underline"
                href={`https://basescan.org/tx/${hash}`}
                rel="noreferrer"
                target="_blank"
              >
                View transaction on BaseScan
              </a>
            ) : null}
            {createBlocker && isConnected ? (
              <p className="rounded-[8px] border border-[#1f1b17] bg-[#fff9eb] px-3 py-3 text-xs font-bold leading-5">{createBlocker}</p>
            ) : null}
          </div>
        </aside>

        <section className="grid gap-4">
          <ObjectLabel
            objectName={liveObject?.objectName || objectName}
            category={liveObject?.category || category}
            era={liveObject?.era || era}
            label={liveObject?.label ?? label}
            curator={liveObject?.curator}
            createdAt={liveObject?.createdAt}
          />
          <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
            <div className="rounded-[8px] border border-[#1f1b17] bg-[#fff9eb] p-4">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <h2 className="text-2xl font-black">Load object</h2>
              </div>
              <label className="mt-4 block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#7b5b2d]">Object ID</span>
                <input
                  value={objectIdInput}
                  onChange={(event) => setObjectIdInput(event.target.value.replace(/\D/g, ""))}
                  className="mt-1 w-full rounded-[8px] border border-[#1f1b17] bg-[#f8f0dc] px-3 py-3 text-2xl font-black outline-none"
                />
              </label>
            </div>
            <div className="rounded-[8px] border border-[#1f1b17] bg-[#fff9eb] p-4">
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#7b5b2d]">What it does</p>
              <p className="mt-3 max-w-xl text-sm font-bold leading-6">
                Tiny Museum saves an object label with name, category, era, curator wallet, and timestamp on Base.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#1f1b17] bg-[#f8f0dc] px-3 py-2 text-xs font-black">
                  <Archive className="h-4 w-4 text-[#b73535]" /> Object card
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#1f1b17] bg-[#f8f0dc] px-3 py-2 text-xs font-black">
                  <Clock3 className="h-4 w-4 text-[#b73535]" /> Timestamp
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#1f1b17] bg-[#f8f0dc] px-3 py-2 text-xs font-black">
                  <ShieldCheck className="h-4 w-4 text-[#b73535]" /> Public record
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#1f1b17] bg-[#f8f0dc] px-3 py-2 text-xs font-black">
                  <BadgeCheck className="h-4 w-4 text-[#b73535]" /> Curator wallet
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#1f1b17] bg-[#f8f0dc] px-3 py-2 text-xs font-black">
                  <Ticket className="h-4 w-4 text-[#b73535]" /> Object ID
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
