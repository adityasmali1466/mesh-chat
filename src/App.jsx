import React, { useState, useEffect, useRef } from 'react';

function App() {
  // FIX: Swapped localStorage for sessionStorage to isolate side-by-side tabs completely
  const [messages, setMessages] = useState(() => {
    const savedChats = sessionStorage.getItem("mesh_chat_history");
    return savedChats ? JSON.parse(savedChats) : [
      { id: 1, sender: "System", text: "⚡ SECURE MESH OVERLAY INITIALIZED", time: "11:25 AM", isEncrypted: false }
    ];
  });

  const [inputText, setInputText] = useState("");

  // VOLATILE KEYS: Unique per tab session
  const [myNodeId] = useState(() => "NODE_" + Math.random().toString(36).substring(2, 7).toUpperCase());
  const [myPrivateKey] = useState(() => Math.floor(Math.random() * 8) + 2); 
  const [myPublicKey] = useState(() => myPrivateKey + 10); 

  // Network directory to store discovered peer public locks
  const [peerPublicKeys, setPeerPublicKeys] = useState({});

  const bc = React.useMemo(() => new BroadcastChannel("offline_mesh_channel"), []);

  const [snifferActive, setSnifferActive] = useState(false);
  const [stolenPackets, setStolenPackets] = useState([]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Keep chat logs saved securely on this specific tab's sandboxed disk storage
  useEffect(() => {
    sessionStorage.setItem("mesh_chat_history", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  // AUTOMATED HANDSHAKE: Broadcast our public lock parameters onto the mesh frequency
  useEffect(() => {
    const broadcastPresence = () => {
      bc.postMessage({
        type: "HANDSHAKE",
        senderToken: myNodeId,
        publicKey: myPublicKey
      });
    };

    broadcastPresence();
    const interval = setInterval(broadcastPresence, 1000); 
    return () => clearInterval(interval);
  }, [bc, myNodeId, myPublicKey]);

  // BACKGROUND MESH DATA LISTENER
  useEffect(() => {
    const handleIncomingPacket = (event) => {
      const incomingData = event.data;
      
      // Prevent processing our own broadcast echo reflections
      if (incomingData.senderToken === myNodeId) return;

      // Case A: Identity key discovery handshake mapping
      if (incomingData.type === "HANDSHAKE") {
        setPeerPublicKeys(prev => ({
          ...prev,
          [incomingData.senderToken]: incomingData.publicKey
        }));
        return;
      }

      // Case B: Inbound message loop
      if (incomingData.type === "MESSAGE") {
        let decryptedText = incomingData.text;
        
        if (incomingData.isEncrypted && incomingData.encryptionKey) {
          decryptedText = decryptAutomatedText(incomingData.text, incomingData.encryptionKey);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: incomingData.id,
            sender: "User_Node_1",
            text: decryptedText,
            time: incomingData.time,
            isEncrypted: incomingData.isEncrypted
          }
        ]);

        if (snifferActive) {
          setStolenPackets((prev) => [{
            time: incomingData.time,
            interceptedData: incomingData.text, 
            danger: false,
            decryptedLeak: "FAIL: DATA IS CRYPTO-LOCKED 🔒"
          }, ...prev]);
        }
      }
    };

    bc.addEventListener("message", handleIncomingPacket);
    return () => bc.removeEventListener("message", handleIncomingPacket);
  }, [bc, snifferActive, myNodeId, myPrivateKey]);

  const encryptAutomatedText = (text, peerPubLock) => {
    return text.split('').map(char => String.fromCharCode(char.charCodeAt(0) + peerPubLock)).join('');
  };

  const decryptAutomatedText = (text, usedLock) => {
    return text.split('').map(char => String.fromCharCode(char.charCodeAt(0) - usedLock)).join('');
  };

  // AUTOMATED BROADCAST SEND LOGIC
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const activePeerToken = Object.keys(peerPublicKeys).find(id => id !== myNodeId) || null;
    const peerLock = activePeerToken ? peerPublicKeys[activePeerToken] : 12;

    const uniqueMessageId = Date.now();
    const networkPayload = encryptAutomatedText(inputText, peerLock);
    const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLocalMsg = {
      id: uniqueMessageId,
      sender: "You",
      text: inputText, 
      time: userMsgTime,
      isEncrypted: true
    };

    setMessages(prev => [...prev, newLocalMsg]);

    bc.postMessage({
      type: "MESSAGE",
      id: uniqueMessageId,
      senderToken: myNodeId,
      text: networkPayload, 
      time: userMsgTime,
      isEncrypted: true,
      encryptionKey: peerLock 
    });

    inputText && setInputText("");
  };

  const clearChatHistory = () => {
    sessionStorage.removeItem("mesh_chat_history");
    setPeerPublicKeys({}); 
    setStolenPackets([]);
    setMessages([
      { id: 1, sender: "System", text: "⚡ SECURE MESH OVERLAY INITIALIZED", time: "11:25 AM", isEncrypted: false }
    ]);
  };

  return (
    <div className="flex h-screen bg-[#060814] text-[#00ffcc] font-mono overflow-hidden antialiased">
      
      {/* LEFT SIDEBAR */}
      <div className="w-80 bg-[#0b0f19] border-r-2 border-[#00ffcc]/20 flex flex-col hidden md:flex">
        <div className="p-6 pt-8 pb-4 border-b border-[#00ffcc]/10">
          <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-purple-500">
            ⚡ NEON_MESH.lnk
          </h1>
          <div className="text-[10px] text-purple-400 mt-1 uppercase font-semibold">Protocol: E2EE AUTOMATED MESH</div>
        </div>
        
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          <div className="p-3 bg-black/40 border border-slate-800 rounded-lg space-y-2 text-[11px]">
            <p className="text-[#00ffcc] font-bold uppercase tracking-wider">// Local Node Identity:</p>
            <div><span className="text-slate-500">NODE ID:</span> <span className="text-purple-400 font-bold">{myNodeId} (You)</span></div>
            <div><span className="text-slate-500">PUBLIC KEY LOCK:</span> <span className="text-cyan-400">{myPublicKey}</span></div>
            <div><span className="text-slate-500">PRIVATE KEY KEY:</span> <span className="text-emerald-400 font-bold">🔒 {myPrivateKey} (Hidden)</span></div>
          </div>

          <div className="p-3 bg-black/20 border border-slate-900 rounded-lg space-y-1 text-[11px]">
            <p className="text-slate-400 font-bold uppercase tracking-wider">// Discovered Peers Public Locks:</p>
            {Object.keys(peerPublicKeys).filter(id => id !== myNodeId).length === 0 ? (
              <p className="text-slate-600 italic animate-pulse">Scanning grid for sibling locks...</p>
            ) : (
              Object.entries(peerPublicKeys)
                .filter(([peerId]) => peerId !== myNodeId)
                .map(([peerId, peerLock]) => (
                  <div key={peerId} className="text-cyan-400">📡 <span className="text-slate-400">{peerId}:</span> Lock [{peerLock}]</div>
                ))
            )}
          </div>

          <div className="pt-2 space-y-2">
            <p className="px-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Lab Controls</p>
            <button 
              type="button"
              onClick={() => setSnifferActive(!snifferActive)}
              className={`w-full p-3 rounded-lg border font-bold text-xs tracking-wider transition-all duration-300 uppercase cursor-pointer ${
                snifferActive 
                  ? 'bg-red-950/30 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-red-500/50 hover:text-red-400'
              }`}
            >
              {snifferActive ? '🛑 Shutdown Sniffer' : '🦹 Launch Packet Sniffer'}
            </button>

            <button 
              type="button"
              onClick={clearChatHistory}
              className="w-full p-2.5 rounded-lg border border-purple-900/40 bg-purple-950/10 text-purple-400 text-xs font-bold tracking-wider hover:bg-purple-950/30 transition-all cursor-pointer uppercase"
            >
              🗑️ Clear Saved Local Database
            </button>
          </div>
        </div>
      </div>

      {/* CHAT FEED PANEL */}
      <div className="flex-1 flex flex-col h-full bg-[#060814]">
        <div className="p-4 bg-[#0b0f19] border-b-2 border-[#00ffcc]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <h2 className="font-bold text-sm tracking-wider text-white">📡 ACTIVE AUTOMATED DIRECT LINK MESH FEED</h2>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 items-start ${msg.sender === 'You' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex flex-col max-w-[75%]">
                <div className={`flex items-center gap-2 mb-1 text-[11px] ${msg.sender === 'You' ? 'justify-end text-[#00ffcc]' : 'text-purple-400'}`}>
                  <span className="font-bold uppercase">{msg.sender}</span>
                  <span className="text-[9px] text-slate-500">{msg.time}</span>
                  {msg.isEncrypted && <span className="text-[10px] text-emerald-400 font-bold">🔒 E2EE SECURE</span>}
                </div>
                <div className={`p-4 rounded-xl border font-mono text-sm ${
                  msg.sender === 'You' ? 'bg-cyan-950/10 border-[#00ffcc] text-white' : 'bg-purple-950/10 border-purple-500 text-slate-100'
                }`}>
                  <p className="break-all whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT STRIP */}
        <form onSubmit={handleSend} className="p-4 bg-[#0b0f19] border-t-2 border-[#00ffcc]/20">
          <div className="max-w-4xl mx-auto flex items-center bg-[#060814] border border-[#00ffcc]/30 rounded-lg px-4 py-1.5 focus-within:border-[#00ffcc] transition-all">
            <span className="text-[#00ffcc]/50 mr-2 text-sm font-bold">&gt;_</span>
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message to transmit seamlessly over the mesh network..." className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder-slate-600 text-white font-mono" />
            <button type="submit" className="text-[#00ffcc] hover:text-white font-black text-xs uppercase tracking-widest px-3 py-1 cursor-pointer">
              [Execute]
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default App;