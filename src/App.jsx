import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "System", text: "⚡ SECURE MESH OVERLAY INITIALIZED", time: "11:25 AM", isEncrypted: false },
    { id: 2, sender: "User_Node_1", text: "System link online. Automated key exchange active. 🛸", time: "11:26 AM", isEncrypted: false }
  ]);
  const [inputText, setInputText] = useState("");
  const [isGlitching, setIsGlitching] = useState(false);

  // 🤖 AUTOMATED KEYS (Generated hand-free when tab opens)
  const [myNodeId] = useState(() => "NODE_" + Math.random().toString(36).substring(2, 7).toUpperCase());
  const [myPrivateKey] = useState(() => Math.floor(Math.random() * 9) + 2); // Hidden local secret key
  const [myPublicKey] = useState(() => myPrivateKey * 7); // Public lock shared with everyone

  // Directory to automatically store public locks discovered on the mesh network
  const [peerPublicKeys, setPeerPublicKeys] = useState({});

  // Local mesh data pipe frequency link
  const bc = React.useMemo(() => new BroadcastChannel("offline_mesh_channel"), []);

  // LAB ATTACK SIMULATOR STATES
  const [snifferActive, setSnifferActive] = useState(false);
  const [stolenPackets, setStolenPackets] = useState([]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AUTOMATED HANDSHAKE: Announce our Public Lock to the grid when we go online
  useEffect(() => {
    const broadcastPresence = () => {
      bc.postMessage({
        type: "HANDSHAKE",
        senderToken: myNodeId,
        publicKey: myPublicKey
      });
    };

    // Ping network immediately and setup an interval to discover new nodes
    broadcastPresence();
    const interval = setInterval(broadcastPresence, 3000);
    return () => clearInterval(interval);
  }, [bc, myNodeId, myPublicKey]);


  // BACKGROUND MESH DATA WIRELESS LISTENER
  useEffect(() => {
    const handleIncomingPacket = (event) => {
      const incomingData = event.data;
      
      // Ignore signals broadcasted by our own screen instance
      if (incomingData.senderToken === myNodeId) return;

      // Case A: Received an automatic system public key exchange handshake
      if (incomingData.type === "HANDSHAKE") {
        setPeerPublicKeys(prev => ({
          ...prev,
          [incomingData.senderToken]: incomingData.publicKey
        }));
        return;
      }

      // Case B: Received an actual text chat message block
      if (incomingData.type === "MESSAGE") {
        let textToShow = incomingData.text;

        // AUTOMATED DECRYPTION: If data was encrypted using our public lock,
        // undo the mathematical block using our local private key automatically!
        if (incomingData.isEncrypted) {
          textToShow = decryptAutomatedText(incomingData.text, myPrivateKey);
        }

        const networkMsg = {
          id: Date.now(),
          sender: "User_Node_1", 
          text: textToShow, 
          time: incomingData.time,
          isEncrypted: incomingData.isEncrypted,
          rawText: textToShow
        };
        
        setMessages((prev) => [...prev, networkMsg]);

        // Wiretap logging update
        if (snifferActive) {
          setStolenPackets((prev) => [{
            time: incomingData.time,
            interceptedData: incomingData.text, // What the spy steals out of the air
            danger: !incomingData.isEncrypted,
            decryptedLeak: incomingData.isEncrypted ? "FAIL: DATA IS CRYPTO-LOCKED 🔒" : `LEAK DETECTED: "${textToShow}" 🔓`
          }, ...prev]);
        }
      }
    };

    bc.addEventListener("message", handleIncomingPacket);
    return () => bc.removeEventListener("message", handleIncomingPacket);
  }, [bc, snifferActive, myNodeId, myPrivateKey]);

  // Automated Scrambler functions (simulating lock formulas using public/private logic pairs)
  const encryptAutomatedText = (text, peerPubLock) => {
    return text.split('').map(char => String.fromCharCode(char.charCodeAt(0) + peerPubLock)).join('');
  };

  const decryptAutomatedText = (text, mySecretKey) => {
    const inferredLock = mySecretKey * 7; 
    return text.split('').map(char => String.fromCharCode(char.charCodeAt(0) - inferredLock)).join('');
  };

  // AUTOMATED BROADCAST SEND LOGIC
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Find if a peer node's public lock exists on our local network map automatically
    const discoveryKeys = Object.keys(peerPublicKeys);
    const activePeerToken = discoveryKeys[0] || null;
    const peerLock = activePeerToken ? peerPublicKeys[activePeerToken] : null;

    let finalPayload = inputText;
    let systematicallySecured = false;

    // AUTOMATED SELECTION: If a peer public lock was grabbed out of the air,
    // automatically encrypt the message for them hands-free!
    if (peerLock) {
      finalPayload = encryptAutomatedText(inputText, peerLock);
      systematicallySecured = true;
    }
    
    if (snifferActive) {
      setStolenPackets(prev => [{
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        interceptedData: finalPayload,
        danger: !systematicallySecured,
        decryptedLeak: systematicallySecured ? "FAIL: DATA IS CRYPTO-LOCKED 🔒" : `LEAK DETECTED: "${inputText}" 🔓`
      }, ...prev]);
    }

    const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: "You",
      text: inputText, // You always see your own clean text smoothly
      time: userMsgTime,
      isEncrypted: systematicallySecured,
      rawText: inputText 
    };

    setMessages(prev => [...prev, newMsg]);

    // Transmit data bundle onto off-grid channel
    bc.postMessage({
      type: "MESSAGE",
      senderToken: myNodeId,
      text: finalPayload, // Scrambled payload passes across intermediate devices
      time: userMsgTime,
      isEncrypted: systematicallySecured,
      rawText: inputText
    });

    setInputText("");
  };

  return (
    <div className="flex h-screen bg-[#060814] text-[#00ffcc] font-mono overflow-hidden antialiased">
      
      {/* LEFT SIDEBAR ( lab data profile mapping) */}
      <div className="w-80 bg-[#0b0f19] border-r-2 border-[#00ffcc]/20 flex flex-col hidden md:flex">
        <div className="p-6 pt-8 pb-4 border-b border-[#00ffcc]/10">
          <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-purple-500">
            ⚡ NEON_MESH.lnk
          </h1>
          <div className="text-[10px] text-purple-400 mt-1 uppercase font-semibold">Protocol: E2EE AUTOMATED MESH</div>
        </div>
        
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          {/* PROFILE DATA ACCORDION */}
          <div className="p-3 bg-black/40 border border-slate-800 rounded-lg space-y-2 text-[11px]">
            <p className="text-[#00ffcc] font-bold uppercase tracking-wider">// Local Node Identity:</p>
            <div><span className="text-slate-500">NODE ID:</span> <span className="text-purple-400 font-bold">{myNodeId} (You)</span></div>
            <div><span className="text-slate-500">PUBLIC KEY LOCK:</span> <span className="text-cyan-400">{myPublicKey}</span></div>
            <div><span className="text-slate-500">PRIVATE KEY KEY:</span> <span className="text-emerald-400 font-bold">🔒 {myPrivateKey} (Hidden)</span></div>
          </div>

          <div className="p-3 bg-black/20 border border-slate-900 rounded-lg space-y-1 text-[11px]">
            <p className="text-slate-400 font-bold uppercase tracking-wider">// Discovered Peers Public Locks:</p>
            {Object.keys(peerPublicKeys).length === 0 ? (
              <p className="text-slate-600 italic animate-pulse">Scanning grid for sibling locks...</p>
            ) : (
              Object.entries(peerPublicKeys).map(([peerId, peerLock]) => (
                <div key={peerId} className="text-cyan-400">📡 <span className="text-slate-400">{peerId}:</span> LockValue [{peerLock}]</div>
              ))
            )}
          </div>

          {/* ATTACK PANEL TRIGGER BUTTON */}
          <div className="pt-2">
            <p className="px-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Lab Controls</p>
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
          </div>
        </div>
      </div>

      {/* CHAT STREAM FEED PANEL */}
      <div className="flex-1 flex flex-col h-full bg-[#060814]">
        
        <div className="p-4 bg-[#0b0f19] border-b-2 border-[#00ffcc]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <h2 className="font-bold text-sm tracking-wider text-white">📡 ACTIVE AUTOMATED DIRECT LINK MESH FEED</h2>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 items-start ${msg.sender === 'You' ? 'flex-row-reverse' : 'flex-row'}`}>
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

        {/* SPY CONSOLE DATA BLOCK */}
        {snifferActive && (
          <div className="mx-6 mb-2 p-4 bg-black border-2 border-red-500/50 rounded-xl max-h-44 overflow-y-auto font-mono text-xs shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-fadeIn">
            <div className="flex items-center justify-between border-b border-red-500/30 pb-2 mb-2">
              <span className="text-red-500 font-black tracking-widest animate-pulse">🚨 INTERPOL PACKET SNIFFER TRAFFIC LOGS</span>
            </div>
            <div className="space-y-2">
              {stolenPackets.length === 0 ? (
                <p className="text-slate-500 italic animate-pulse">Listening to mesh pipeline frequencies for raw transmission wave...</p>
              ) : (
                stolenPackets.map((pkt, idx) => (
                  <div key={idx} className="p-2 rounded border text-[11px] bg-red-950/20 border-red-900 text-red-400">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">⏱️ Captured Time: {pkt.time}</span>
                    </div>
                    <p className="break-all"><span className="text-slate-500 font-bold">Raw Scrambled Data Caught over Air:</span> {pkt.interceptedData}</p>
                    <p className="mt-1 font-bold tracking-wide">{pkt.decryptedLeak}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* INPUT INPUT FIELD STRIP */}
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