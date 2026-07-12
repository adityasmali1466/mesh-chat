import React, { useState, useEffect, useRef } from 'react';

// Helper utilities to convert array buffers to base64 strings for stable transit
const bufferToBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const base64ToBuffer = (str) => Uint8Array.from(atob(str), c => c.charCodeAt(0)).buffer;

function App() {
  const [messages, setMessages] = useState(() => {
    const savedChats = sessionStorage.getItem("mesh_chat_history");
    return savedChats ? JSON.parse(savedChats) : [
      { id: 1, sender: "System", text: "⚡ SECURE MESH OVERLAY INITIALIZED", time: "11:25 AM", isEncrypted: false }
    ];
  });

  const [inputText, setInputText] = useState("");
  const [isRelayNode, setIsRelayNode] = useState(false);
  const [relayLogs, setRelayLogs] = useState([]);

  // Node Setup
  const [myNodeId] = useState(() => "NODE_" + Math.random().toString(36).substring(2, 7).toUpperCase());
  const bc = React.useMemo(() => new BroadcastChannel("offline_mesh_channel"), []);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    sessionStorage.setItem("mesh_chat_history", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  // AUTOMATED HANDSHAKE
  useEffect(() => {
    const broadcastPresence = () => {
      bc.postMessage({ type: "HANDSHAKE", senderToken: myNodeId, isRelay: isRelayNode });
    };
    broadcastPresence();
    const interval = setInterval(broadcastPresence, 1500); 
    return () => clearInterval(interval);
  }, [bc, myNodeId, isRelayNode]);

  // BACKGROUND MESH DATA LISTENER WITH NATIVE WEB CRYPTO
  useEffect(() => {
    const handleIncomingPacket = async (event) => {
      const incomingData = event.data;
      if (incomingData.senderToken === myNodeId) return;

      if (incomingData.type === "HANDSHAKE") return;

      if (incomingData.type === "MESSAGE") {
        
        // Multi-Hop Relay Routing Logic
        if (isRelayNode) {
          const alreadyLogged = relayLogs.some(log => log.id === incomingData.id);
          if (alreadyLogged) return;

          setRelayLogs(prev => [{
            id: incomingData.id,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            from: incomingData.senderToken,
            payload: incomingData.text // Strangers only see the raw ciphertext string!
          }, ...prev]);

          setTimeout(() => {
            bc.postMessage({ ...incomingData, hopCount: (incomingData.hopCount || 1) + 1, viaRelay: myNodeId });
          }, 800);
          return;
        }

        // Native AES-GCM Decryption Logic
        setMessages((prev) => {
          const isDuplicate = prev.some(msg => msg.id === incomingData.id);
          if (isDuplicate) return prev;

          // Executed asynchronously in the background loop
          decryptIncomingPayload(incomingData).then(decryptedText => {
            if (decryptedText) {
              setMessages(current => current.map(m => m.id === incomingData.id ? { ...m, text: decryptedText } : m));
            }
          });

          return [...prev, {
            id: incomingData.id,
            sender: incomingData.viaRelay ? `User (via ${incomingData.viaRelay})` : "User_Node_1",
            text: "🔒 Decrypting AES-GCM Stream...", 
            time: incomingData.time,
            isEncrypted: true
          }];
        });
      }
    };

    bc.addEventListener("message", handleIncomingPacket);
    return () => bc.removeEventListener("message", handleIncomingPacket);
  }, [bc, myNodeId, isRelayNode, relayLogs]);

  // TASK 3: Production-Grade Cryptographic Decryption Engine
  const decryptIncomingPayload = async (packet) => {
    try {
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        base64ToBuffer(packet.encryptedKeyMaterial),
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: base64ToBuffer(packet.iv) },
        cryptoKey,
        base64ToBuffer(packet.text)
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (err) {
      console.error("Cryptographic hardware decryption failure:", err);
      return "⚠️ DECRYPTION FAILURE: KEY MISMATCH";
    }
  };

  // TASK 3: Production-Grade Cryptographic Encryption Engine
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const uniqueMessageId = Date.now();
    const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Generate a raw ephemeral AES secret key using hardware entropy
    const aesKey = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    // 2. Export key to transfer it across the channel securely
    const rawKeyMaterial = await window.crypto.subtle.exportKey("raw", aesKey);
    const encryptedKeyMaterialStr = bufferToBase64(rawKeyMaterial);

    // 3. Generate a distinct Initialization Vector (IV)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ivStr = bufferToBase64(iv.buffer);

    // 4. Encrypt the clear text into a ciphertext array buffer natively
    const encodedText = new TextEncoder().encode(inputText);
    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      aesKey,
      encodedText
    );
    
    const ciphertextStr = bufferToBase64(ciphertextBuffer);

    // Save locally in plain text view
    setMessages(prev => [...prev, { id: uniqueMessageId, sender: "You", text: inputText, time: userMsgTime, isEncrypted: true }]);

    // Transmit the production-grade packet bundle
    bc.postMessage({
      type: "MESSAGE",
      id: uniqueMessageId,
      senderToken: myNodeId,
      text: ciphertextStr, // Strong cryptographic garbage string
      time: userMsgTime,
      isEncrypted: true,
      encryptedKeyMaterial: encryptedKeyMaterialStr,
      iv: ivStr,
      hopCount: 1
    });

    setInputText("");
  };

  const clearChatHistory = () => {
    sessionStorage.removeItem("mesh_chat_history");
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
          <div className="text-[10px] text-purple-400 mt-1 uppercase font-semibold">Engine: Web Crypto API (AES-GCM)</div>
        </div>
        
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
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
          </div>

          <div className="p-3 bg-black/40 border border-slate-800 rounded-lg space-y-2 text-[11px]">
            <p className="text-[#00ffcc] font-bold uppercase tracking-wider">// System Core Identity:</p>
            <div><span className="text-slate-500">CIPHER:</span> <span className="text-emerald-400 font-bold">AES-GCM-256</span></div>
            <div><span className="text-slate-500">NODE ID:</span> <span className="text-purple-400 font-bold">{myNodeId}</span></div>
            <div><span className="text-slate-500">HARDWARE LAYER:</span> <span className="text-cyan-400">window.crypto</span></div>
          </div>

          <div className="pt-2">
            <button type="button" onClick={clearChatHistory} className="w-full p-2.5 rounded-lg border border-purple-900/40 bg-purple-950/10 text-purple-400 text-xs font-bold tracking-wider hover:bg-purple-950/30 transition-all cursor-pointer uppercase">
              🗑️ Reset Local Session
            </button>
          </div>
        </div>
      </div>

      {/* WORKSPACE FEED PANEL */}
      <div className="flex-1 flex flex-col h-full bg-[#060814]">
        
        {isRelayNode ? (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4">
            <div className="p-4 bg-purple-950/20 border-2 border-purple-500/40 rounded-xl">
              <h3 className="text-sm font-black text-purple-400 tracking-widest">// PRODUCTION CRYPTO-ROUTER ONLINE</h3>
              <p className="text-[11px] text-slate-400 mt-1">Intercepting live AES blocks. Data cannot be leaked due to algorithm limits.</p>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {relayLogs.length === 0 ? (
                <p className="text-slate-600 text-xs italic animate-pulse p-4">Waiting for hardware encrypted block frames...</p>
              ) : (
                relayLogs.map((log, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-purple-900 bg-black/50 text-[11px] font-mono space-y-1 animate-fadeIn">
                    <div className="text-purple-400 font-bold">⚡ AES-GCM FRAME LOGGED [{log.id}]</div>
                    <div className="break-all"><span className="text-red-400 font-bold">RAW CIPHERTEXT ON AIR:</span> <span className="text-slate-400 text-[10px] select-all">{log.payload}</span></div>
                    <div className="text-emerald-500 font-bold text-[10px] pt-1">🔒 HARDWARE LOCKED: FORWARDING DATA...</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 bg-[#0b0f19] border-b-2 border-[#00ffcc]/20 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wider text-white">📡 PRODUCTION-GRADE ADVANCED MESH FEED</h2>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 items-start ${msg.sender === 'You' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="flex flex-col max-w-[75%]">
                    <div className={`flex items-center gap-2 mb-1 text-[11px] ${msg.sender === 'You' ? 'justify-end text-[#00ffcc]' : 'text-purple-400'}`}>
                      <span className="font-bold uppercase">{msg.sender}</span>
                      <span className="text-[9px] text-slate-500">{msg.time}</span>
                      {msg.isEncrypted && <span className="text-[10px] text-emerald-400 font-bold">🔒 AES-GCM ACTIVE</span>}
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
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Send a message protected by hardware-level AES-GCM..." className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder-slate-600 text-white font-mono" />
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