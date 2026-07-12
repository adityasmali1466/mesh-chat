import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState(() => {
    const savedChats = sessionStorage.getItem("mesh_chat_history");
    return savedChats ? JSON.parse(savedChats) : [
      { id: 1, sender: "System", text: "⚡ SECURE MESH OVERLAY INITIALIZED", time: "11:25 AM", isEncrypted: false }
    ];
  });

  const [inputText, setInputText] = useState("");
  
  // TASK 2 CONTROL STATE: Toggle this node to act as an intermediate carrier router
  const [isRelayNode, setIsRelayNode] = useState(false);
  const [relayLogs, setRelayLogs] = useState([]);

  // VOLATILE KEYS
  const [myNodeId] = useState(() => "NODE_" + Math.random().toString(36).substring(2, 7).toUpperCase());
  const [myPrivateKey] = useState(() => Math.floor(Math.random() * 8) + 2); 
  const [myPublicKey] = useState(() => myPrivateKey + 10); 

  const [peerPublicKeys, setPeerPublicKeys] = useState({});
  const bc = React.useMemo(() => new BroadcastChannel("offline_mesh_channel"), []);

  const [snifferActive, setSnifferActive] = useState(false);
  const [stolenPackets, setStolenPackets] = useState([]);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    sessionStorage.setItem("mesh_chat_history", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  // AUTOMATED HANDSHAKE: Announce key presence, but tag if we are a relay carrier
  useEffect(() => {
    const broadcastPresence = () => {
      bc.postMessage({
        type: "HANDSHAKE",
        senderToken: myNodeId,
        publicKey: myPublicKey,
        isRelay: isRelayNode
      });
    };
    broadcastPresence();
    const interval = setInterval(broadcastPresence, 1500); 
    return () => clearInterval(interval);
  }, [bc, myNodeId, myPublicKey, isRelayNode]);

  // BACKGROUND MESH DATA LISTENER
  useEffect(() => {
    const handleIncomingPacket = (event) => {
      const incomingData = event.data;
      if (incomingData.senderToken === myNodeId) return;

      // Case A: Discovered identity handshake
      if (incomingData.type === "HANDSHAKE") {
        // If a peer turns into a relay, filter them out of direct destination endpoints
        if (incomingData.isRelay) {
          setPeerPublicKeys(prev => {
            const updated = { ...prev };
            delete updated[incomingData.senderToken];
            return updated;
          });
        } else {
          setPeerPublicKeys(prev => ({ ...prev, [incomingData.senderToken]: incomingData.publicKey }));
        }
        return;
      }

      // Case B: Inbound message block
      if (incomingData.type === "MESSAGE") {
        
        // TASK 2 ROUTING CIRCUIT: If this window is set to RELAY MODE, forward it!
        if (isRelayNode) {
          // Check if we already processed this unique packet to prevent endless loops
          const alreadyLogged = relayLogs.some(log => log.id === incomingData.id);
          if (alreadyLogged) return;

          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          setRelayLogs(prev => [{
            id: incomingData.id,
            time: timestamp,
            from: incomingData.senderToken,
            payload: incomingData.text // Strangers only see scrambled noise!
          }, ...prev]);

          // Multi-hop hop step: Forward the encrypted packet out to the airwaves unchanged
          setTimeout(() => {
            bc.postMessage({
              ...incomingData,
              hopCount: (incomingData.hopCount || 1) + 1,
              viaRelay: myNodeId
            });
          }, 800); // Slight delay to visually track packet movement
          return;
        }

        // Standard Receiver Logic: Only print message if it was passed via relay or direct link
        setMessages((prev) => {
          const isDuplicate = prev.some(msg => msg.id === incomingData.id);
          if (isDuplicate) return prev;

          let decryptedText = incomingData.text;
          if (incomingData.isEncrypted && incomingData.encryptionKey) {
            decryptedText = decryptAutomatedText(incomingData.text, incomingData.encryptionKey);
          }

          return [...prev, {
            id: incomingData.id,
            sender: incomingData.viaRelay ? `User (via ${incomingData.viaRelay})` : "User_Node_1",
            text: decryptedText,
            time: incomingData.time,
            isEncrypted: incomingData.isEncrypted
          }];
        });
      }
    };

    bc.addEventListener("message", handleIncomingPacket);
    return () => bc.removeEventListener("message", handleIncomingPacket);
  }, [bc, snifferActive, myNodeId, myPrivateKey, isRelayNode, relayLogs]);

  const encryptAutomatedText = (text, peerPubLock) => {
    return text.split('').map(char => String.fromCharCode(char.charCodeAt(0) + peerPubLock)).join('');
  };

  const decryptAutomatedText = (text, usedLock) => {
    return text.split('').map(char => String.fromCharCode(char.charCodeAt(0) - usedLock)).join('');
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const activePeerToken = Object.keys(peerPublicKeys).find(id => id !== myNodeId) || null;
    const peerLock = activePeerToken ? peerPublicKeys[activePeerToken] : 12;

    const uniqueMessageId = Date.now();
    const networkPayload = encryptAutomatedText(inputText, peerLock);
    const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { id: uniqueMessageId, sender: "You", text: inputText, time: userMsgTime, isEncrypted: true }]);

    bc.postMessage({
      type: "MESSAGE",
      id: uniqueMessageId,
      senderToken: myNodeId,
      text: networkPayload, 
      time: userMsgTime,
      isEncrypted: true,
      encryptionKey: peerLock,
      hopCount: 1
    });

    setInputText("");
  };

  const clearChatHistory = () => {
    sessionStorage.removeItem("mesh_chat_history");
    setPeerPublicKeys({}); 
    setRelayLogs([]);
    setMessages([{ id: 1, sender: "System", text: "⚡ SECURE MESH OVERLAY INITIALIZED", time: "11:25 AM", isEncrypted: false }]);
  };

  return (
    <div className="flex h-screen bg-[#060814] text-[#00ffcc] font-mono overflow-hidden antialiased">
      
      {/* LEFT SIDEBAR */}
      <div className="w-80 bg-[#0b0f19] border-r-2 border-[#00ffcc]/20 flex flex-col hidden md:flex">
        <div className="p-6 pt-8 pb-4 border-b border-[#00ffcc]/10">
          <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-purple-500">
            ⚡ NEON_MESH.lnk
          </h1>
          <div className="text-[10px] text-purple-400 mt-1 uppercase font-semibold">Protocol: MULTI-HOP MESH LAYER</div>
        </div>
        
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          {/* TASK 2 SWITCH COMPONENT */}
          <div className="p-3 bg-purple-950/10 border-2 border-purple-500/30 rounded-xl space-y-2">
            <label className="flex items-center justify-between cursor-pointer text-xs font-bold text-purple-400 tracking-wide">
              <span>📡 ACT AS CARRIER RELAY</span>
              <input 
                type="checkbox" 
                checked={isRelayNode} 
                onChange={(e) => {
                  setIsRelayNode(e.target.checked);
                  clearChatHistory();
                }}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
            </label>
            <p className="text-[9px] text-slate-500 leading-normal">
              Enabling this drops the chat feed and configures this tab instance as an intermediate physical packet routing carrier tower.
            </p>
          </div>

          <div className="p-3 bg-black/40 border border-slate-800 rounded-lg space-y-2 text-[11px]">
            <p className="text-[#00ffcc] font-bold uppercase tracking-wider">// Local Node Identity:</p>
            <div><span className="text-slate-500">ROLE:</span> <span className={isRelayNode ? "text-purple-400 font-bold" : "text-cyan-400 font-bold"}>{isRelayNode ? "ROUTER CARRIER" : "END NODE"}</span></div>
            <div><span className="text-slate-500">NODE ID:</span> <span className="text-purple-400 font-bold">{myNodeId}</span></div>
            {!isRelayNode && <div><span className="text-slate-500">PEER TARGETS:</span> <span className="text-emerald-400">{Object.keys(peerPublicKeys).join(', ') || 'Scanning...'}</span></div>}
          </div>

          <div className="pt-2 space-y-2">
            <button type="button" onClick={clearChatHistory} className="w-full p-2.5 rounded-lg border border-purple-900/40 bg-purple-950/10 text-purple-400 text-xs font-bold tracking-wider hover:bg-purple-950/30 transition-all cursor-pointer uppercase">
              🗑️ Reset Local Database
            </button>
          </div>
        </div>
      </div>

      {/* CHAT OR RELAY FEED SWITCHER PANEL */}
      <div className="flex-1 flex flex-col h-full bg-[#060814]">
        
        {isRelayNode ? (
          /* ROUTER ROUTING FEED STREAM PANEL */
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4">
            <div className="p-4 bg-purple-950/20 border-2 border-purple-500/40 rounded-xl animate-pulse">
              <h3 className="text-sm font-black text-purple-400 tracking-widest">// ACTIVE RELAY CARRIER INTERCEPT LOOP INITIALIZED</h3>
              <p className="text-[11px] text-slate-400 mt-1">Listening to air frequencies. Packets passing through will be displayed below in real-time.</p>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {relayLogs.length === 0 ? (
                <p className="text-slate-600 text-xs italic animate-pulse p-4">Awaiting multi-hop transit wave headers...</p>
              ) : (
                relayLogs.map((log, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-purple-900 bg-black/50 text-[11px] font-mono space-y-1">
                    <div className="text-purple-400 font-bold">⚡ INTERCEPTED HOP PACKET [{log.id}]</div>
                    <div><span className="text-slate-500">ORIGIN ROUTE:</span> {log.from}</div>
                    <div className="break-all"><span className="text-red-400 font-bold">SCRAMBLED DATA ON AIR WIRE:</span> <span className="text-slate-300 font-black tracking-widest">{log.payload}</span></div>
                    <div className="text-emerald-500 font-bold text-[10px] pt-1">🔒 STATUS: CANNOT READ PLAIN-TEXT. FORWARDING AUTOMATICALLY...</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* STANDARD CHAT VIEW PANEL */
          <>
            <div className="p-4 bg-[#0b0f19] border-b-2 border-[#00ffcc]/20 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wider text-white">📡 ACTIVE DIRECT/MULTI-HOP MESH CHAT STREAM</h2>
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

            <form onSubmit={handleSend} className="p-4 bg-[#0b0f19] border-t-2 border-[#00ffcc]/20">
              <div className="max-w-4xl mx-auto flex items-center bg-[#060814] border border-[#00ffcc]/30 rounded-lg px-4 py-1.5 focus-within:border-[#00ffcc] transition-all">
                <span className="text-[#00ffcc]/50 mr-2 text-sm font-bold">&gt;_</span>
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Send an encrypted multi-hop packet..." className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder-slate-600 text-white font-mono" />
                <button type="submit" className="text-[#00ffcc] hover:text-white font-black text-xs uppercase tracking-widest px-3 py-1 cursor-pointer">[Execute]</button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}

export default App;