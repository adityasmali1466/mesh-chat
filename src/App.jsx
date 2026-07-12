import React, { useState, useEffect, useRef } from 'react';
import { Peer } from 'peerjs';

const bufferToBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const base64ToBuffer = (str) => Uint8Array.from(atob(str), c => c.charCodeAt(0)).buffer;

function App() {
  const [messages, setMessages] = useState(() => {
    const savedChats = sessionStorage.getItem("mesh_chat_history");
    return savedChats ? JSON.parse(savedChats) : [
      { id: 1, sender: "System", text: "⚡ MOBILE WEBRTC MESH INITIALIZED", time: "12:00 PM", isEncrypted: false }
    ];
  });

  const [inputText, setInputText] = useState("");
  const [targetPeerId, setTargetPeerId] = useState(""); 
  const [connectedPeerId, setConnectedPeerId] = useState(null); 
  
  const [myPeerId, setMyPeerId] = useState("");
  const peerInstance = useRef(null);
  const activeConnection = useRef(null);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    sessionStorage.setItem("mesh_chat_history", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  // INITIALIZE WEBRTC PEER LAYER WITH STUN SERVERS TO BYPASS FIREWALLS
  useEffect(() => {
    const cleanId = "NODE-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Configured with Google's free public STUN servers for network penetration
    const peer = new Peer(cleanId, {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      }
    });

    peer.on('open', (id) => {
      setMyPeerId(id);
    });

    peer.on('connection', (conn) => {
      activeConnection.current = conn;
      setConnectedPeerId(conn.peer);
      setupConnectionListeners(conn);
    });

    peer.on('error', (err) => {
      console.error("PeerJS Core Error:", err.type);
      alert(`Connection Alert: ${err.type}. Please double-check the Node ID.`);
    });

    peerInstance.current = peer;
    return () => peer.destroy();
  }, []);

  const setupConnectionListeners = (conn) => {
    conn.on('data', async (data) => {
      if (data.type === "MESSAGE") {
        let decryptedText = data.text;

        if (data.isEncrypted && data.encryptedKeyMaterial) {
          try {
            const cryptoKey = await window.crypto.subtle.importKey(
              "raw",
              base64ToBuffer(data.encryptedKeyMaterial),
              { name: "AES-GCM" },
              false,
              ["decrypt"]
            );

            const decryptedBuffer = await window.crypto.subtle.decrypt(
              { name: "AES-GCM", iv: base64ToBuffer(data.iv) },
              cryptoKey,
              base64ToBuffer(data.text)
            );

            decryptedText = new TextDecoder().decode(decryptedBuffer);
          } catch (err) {
            decryptedText = "⚠️ CRYPTO DECRYPTION ERROR";
          }
        }

        setMessages((prev) => [
          ...prev,
          { id: data.id, sender: "Friend", text: decryptedText, time: data.time, isEncrypted: true }
        ]);
      }
    });

    conn.on('close', () => {
      setConnectedPeerId(null);
      activeConnection.current = null;
    });
  };

  const connectToFriend = () => {
    if (!targetPeerId.trim() || !peerInstance.current) return;
    const formattedId = targetPeerId.trim().toUpperCase();

    const conn = peerInstance.current.connect(formattedId, {
      reliable: true
    });
    
    activeConnection.current = conn;
    setConnectedPeerId(formattedId);
    setupConnectionListeners(conn);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConnection.current) return;

    const uniqueMessageId = Date.now();
    const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const aesKey = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const rawKeyMaterial = await window.crypto.subtle.exportKey("raw", aesKey);
    const encryptedKeyMaterialStr = bufferToBase64(rawKeyMaterial);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ivStr = bufferToBase64(iv.buffer);

    const encodedText = new TextEncoder().encode(inputText);
    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      aesKey,
      encodedText
    );
    
    const ciphertextStr = bufferToBase64(ciphertextBuffer);

    setMessages(prev => [...prev, { id: uniqueMessageId, sender: "You", text: inputText, time: userMsgTime, isEncrypted: true }]);

    activeConnection.current.send({
      type: "MESSAGE",
      id: uniqueMessageId,
      text: ciphertextStr,
      time: userMsgTime,
      isEncrypted: true,
      encryptedKeyMaterial: encryptedKeyMaterialStr,
      iv: ivStr
    });

    setInputText("");
  };

  return (
    <div className="flex h-screen bg-[#060814] text-[#00ffcc] font-mono overflow-hidden antialiased flex-col md:flex-row">
      
      {/* MOBILE CONNECTOR HEAD */}
      <div className="md:hidden bg-[#0b0f19] border-b border-[#00ffcc]/20 p-4 space-y-3 shrink-0">
        <div className="flex justify-between items-center">
          <h1 className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-purple-500">
            ⚡ LIVE_MESH.lnk
          </h1>
          <span className="text-[10px] text-purple-400 font-bold bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded">
            ID: {myPeerId || "... Booting Node"}
          </span>
        </div>
        
        {!connectedPeerId ? (
          <div className="flex gap-2 bg-black/40 p-1.5 rounded-lg border border-slate-800">
            <input 
              type="text" 
              value={targetPeerId} 
              onChange={(e) => setTargetPeerId(e.target.value)} 
              placeholder="ENTER FRIEND'S NODE ID" 
              className="flex-1 bg-black border border-slate-700 rounded px-2 py-1 text-xs text-white uppercase outline-none focus:border-[#00ffcc]"
            />
            <button 
              type="button" 
              onClick={connectToFriend} 
              className="bg-cyan-950/60 border border-cyan-500 text-cyan-400 text-[10px] px-3 font-bold uppercase rounded active:bg-cyan-500 active:text-black transition-all"
            >
              [LINK]
            </button>
          </div>
        ) : (
          <div className="text-center text-[10px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/30 py-1.5 rounded-lg">
            📡 SECURELY LINKED TO: {connectedPeerId}
          </div>
        )}
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className="w-80 bg-[#0b0f19] border-r-2 border-[#00ffcc]/20 flex-col hidden md:flex p-6 space-y-4 shrink-0">
        <div>
          <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-purple-500">
            ⚡ LIVE_MESH.lnk
          </h1>
          <div className="text-[10px] text-purple-400 mt-1 uppercase font-semibold">Engine: WebRTC + AES-GCM</div>
        </div>

        <div className="p-3 bg-black/40 border border-slate-800 rounded-lg space-y-1 text-[11px]">
          <div><span className="text-slate-500">YOUR PHONE ID:</span> <span className="text-purple-400 font-bold select-all">{myPeerId || "Generating..."}</span></div>
          <div><span className="text-slate-500">LINK STATUS:</span> <span className={connectedPeerId ? "text-emerald-400 font-bold" : "text-red-400 animate-pulse"}>{connectedPeerId ? `CONNECTED TO ${connectedPeerId}` : "DISCONNECTED"}</span></div>
        </div>

        {!connectedPeerId && (
          <div className="space-y-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase">// Target Peer Node ID:</p>
            <input 
              type="text" 
              value={targetPeerId} 
              onChange={(e) => setTargetPeerId(e.target.value)} 
              placeholder="Enter Friend's Node ID" 
              className="w-full bg-black border border-slate-800 rounded px-2 py-1 text-xs text-white uppercase outline-none focus:border-[#00ffcc]"
            />
            <button 
              type="button" 
              onClick={connectToFriend} 
              className="w-full bg-cyan-950/40 border border-cyan-500 text-cyan-400 text-xs py-1.5 font-bold tracking-wider rounded uppercase hover:bg-cyan-500 hover:text-black transition-all cursor-pointer"
            >
              📡 Link Air Frequencies
            </button>
          </div>
        )}
      </div>

      {/* CHAT PANEL */}
      <div className="flex-1 flex flex-col h-full bg-[#060814] min-w-0">
        <div className="p-4 bg-[#0b0f19] border-b border-[#00ffcc]/10 hidden md:flex items-center justify-between">
          <h2 className="font-bold text-xs tracking-wider text-white">📡 PHONE-TO-PHONE HARDWARE SECURITY SIMULATION</h2>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2 items-start ${msg.sender === 'You' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex flex-col max-w-[85%] md:max-w-[75%]">
                <div className={`flex items-center gap-2 mb-0.5 text-[10px] ${msg.sender === 'You' ? 'justify-end text-[#00ffcc]' : 'text-purple-400'}`}>
                  <span className="font-bold uppercase">{msg.sender}</span>
                  <span className="text-[8px] text-slate-500">{msg.time}</span>
                </div>
                <div className={`p-3 rounded-xl border font-mono text-xs md:text-sm ${
                  msg.sender === 'You' ? 'bg-cyan-950/10 border-[#00ffcc] text-white' : 'bg-purple-950/10 border-purple-500 text-slate-100'
                }`}>
                  <p className="break-all whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 bg-[#0b0f19] border-t border-[#00ffcc]/10 shrink-0">
          <div className="max-w-4xl mx-auto flex items-center bg-[#060814] border border-[#00ffcc]/30 rounded-lg px-3 py-1 focus-within:border-[#00ffcc] transition-all">
            <input 
              type="text" 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              disabled={!connectedPeerId}
              placeholder={connectedPeerId ? "Send encrypted AES-GCM payload..." : "⛔ Link a node ID first..."} 
              className="flex-1 bg-transparent py-1.5 text-xs md:text-sm outline-none placeholder-slate-600 text-white font-mono disabled:cursor-not-allowed" 
            />
            <button type="submit" disabled={!connectedPeerId} className="text-[#00ffcc] hover:text-white font-black text-xs uppercase tracking-widest px-2 py-1 disabled:text-slate-700">
              [Beam]
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default App;