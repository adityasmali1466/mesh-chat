import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "System", text: "⚡ SECURE MESH OVERLAY INITIALIZED", time: "11:25 AM", isEncrypted: false },
    { id: 2, sender: "User_Node_1", text: "System link online. Ready to swap data codes. 🛸", time: "11:26 AM", isEncrypted: false }
  ]);
  const [inputText, setInputText] = useState("");
  const [secretKey, setSecretKey] = useState("3");
  const [useEncryption, setUseEncryption] = useState(false);
  const [cipherType, setCipherType] = useState("Caesar"); 
  const [isGlitching, setIsGlitching] = useState(false);

  // NEW ATTACK SIMULATOR STATES
  const [snifferActive, setSnifferActive] = useState(false);
  const [stolenPackets, setStolenPackets] = useState([]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!useEncryption && messages.length > 2) {
      setIsGlitching(true);
      const timer = setTimeout(() => setIsGlitching(false), 800); 
      return () => clearTimeout(timer);
    }
  }, [messages, useEncryption]);

  const getAvatarUrl = (sender) => {
    if (sender === "You") return "https://api.dicebear.com/7.x/bottts/svg?seed=YouNode";
    if (sender === "System") return "https://api.dicebear.com/7.x/bottts/svg?seed=Mainframe";
    return "https://api.dicebear.com/7.x/bottts/svg?seed=GhostNode";
  };

  const encryptText = (text, shift) => {
    return text
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 32 && code <= 126) {
          return String.fromCharCode(((code - 32 + parseInt(shift)) % 95) + 32);
        }
        return char;
      })
      .join('');
  };

  const decryptText = (text, shift) => {
    return text
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 32 && code <= 126) {
          return String.fromCharCode(((code - 32 - parseInt(shift) + 95) % 95) + 32);
        }
        return char;
      })
      .join('');
  };

  const convertToAESBlocks = (text) => {
    let hexArray = text.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
    while (hexArray.length % 16 !== 0 || hexArray.length === 0) {
      hexArray.push("00");
    }
    return hexArray.slice(0, 16); 
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let finalPayload = inputText;
    if (useEncryption) {
      if (cipherType === "Caesar") {
        finalPayload = encryptText(inputText, secretKey);
      } else {
        finalPayload = "AES_BLOCK_E[" + convertToAESBlocks(inputText).join(":") + "]";
      }
    }
    
    // IF SNIFFER IS ACTIVE, HACKER INTERCEPTS THE DATA PACKET LIVE
    if (snifferActive) {
      const hackLog = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        interceptedData: finalPayload,
        danger: !useEncryption, // True if unsecured plain text
        decryptedLeak: useEncryption ? "FAIL: DATA IS CRYPTO-LOCKED 🔒" : `LEAK DETECTED: "${inputText}" 🔓`
      };
      setStolenPackets(prev => [hackLog, ...prev]);
    }

    const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: messages.length + 1,
      sender: "You",
      text: finalPayload,
      time: userMsgTime,
      isEncrypted: useEncryption,
      cipherKey: secretKey,
      modeUsed: cipherType,
      rawText: inputText 
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputText("");

    setTimeout(() => {
      let replyText = "Data transmission logs clear. Node link standing by... ⚡";
      if (useEncryption) {
        if (cipherType === "Caesar") {
          replyText = encryptText(`Decryption complete! Caesar shift matched at [Key: ${secretKey}].`, secretKey);
        } else {
          replyText = "AES_BLOCK_E[" + convertToAESBlocks("AES Handshake Verified Safe.").join(":") + "]";
        }
      } else {
        replyText = "💥 ACCESS ALERT: Unsecured packet broadcast caught on listener node!";
      }

      const peerMsg = {
        id: updatedMessages.length + 1,
        sender: "User_Node_1",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: useEncryption,
        cipherKey: secretKey,
        modeUsed: cipherType,
        rawText: cipherType === "Caesar" ? "" : "AES Handshake Verified Safe."
      };
      
      setMessages(prev => [...prev, peerMsg]);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-[#060814] text-[#00ffcc] font-mono overflow-hidden antialiased">
      
      {/* 1. LEFT SIDEBAR */}
      <div className="w-80 bg-[#0b0f19] border-r-2 border-[#00ffcc]/20 flex flex-col hidden md:flex">
        <div className="p-6 pt-8 pb-4 border-b border-[#00ffcc]/10">
          <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-purple-500">
            ⚡ NEON_MESH.lnk
          </h1>
          <div className="text-[10px] text-purple-400 mt-1 uppercase font-semibold">Protocol Level v4.2.0</div>
        </div>
        
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          <div>
            <p className="px-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Security Status</p>
            <div className={`p-3.5 rounded-lg border text-xs space-y-2 transition-all duration-200 ${
              isGlitching ? 'animate-bounce border-red-500 bg-red-950/40 text-red-400 scale-95 shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
              useEncryption ? 'bg-emerald-950/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 
              'bg-amber-950/10 border-amber-500/30 text-amber-400'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isGlitching ? 'bg-red-500 animate-ping' : useEncryption ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                <span className="font-bold tracking-wider uppercase">
                  {isGlitching ? 'CRITICAL INTRUSION' : useEncryption ? `${cipherType} Active` : 'PLAIN PACKET DANGER'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                {isGlitching ? 'Warning intercept triggered!' : useEncryption ? `Packets shielded via ${cipherType}.` : 'Traffic vulnerable to wiretapping listeners.'}
              </p>
            </div>
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

        <div className="p-4 bg-[#060814] border-t border-[#00ffcc]/10 text-[10px] text-slate-500 text-center">
          CORE HOPS: <span className="text-purple-400 font-bold">127.0.0.1 // SYSTEM_LIVE</span>
        </div>
      </div>

      {/* 2. CHAT STREAM BOARD */}
      <div className="flex-1 flex flex-col h-full bg-[#060814]">
        
        <div className="p-4 bg-[#0b0f19] border-b-2 border-[#00ffcc]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <h2 className="font-bold text-sm tracking-wider text-white">📡 BROADCAST_FEED // cyber-lab</h2>
          </div>
        </div>

        {/* Dynamic Glowing Bubbles Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 items-start ${msg.sender === 'You' ? 'flex-row-reverse' : 'flex-row'}`}>
              <img src={getAvatarUrl(msg.sender)} className="w-8 h-8 rounded border border-slate-700 p-0.5" alt="avatar" />
              <div className="flex flex-col max-w-[75%]">
                <div className={`flex items-center gap-2 mb-1 text-[11px] ${msg.sender === 'You' ? 'justify-end text-[#00ffcc]' : 'text-purple-400'}`}>
                  <span className="font-bold uppercase">{msg.sender}</span>
                  <span className="text-[9px] text-slate-500">{msg.time}</span>
                </div>
                <div className={`p-4 rounded-xl border font-mono text-sm ${
                  msg.sender === 'You' ? 'bg-cyan-950/10 border-[#00ffcc] text-white' : 'bg-purple-950/10 border-purple-500 text-slate-100'
                }`}>
                  {msg.isEncrypted && msg.modeUsed === "AES-128" ? (
                    <div className="space-y-3">
                      <p className="text-xs text-purple-400 uppercase font-bold tracking-widest">// 16-Byte Block Array Matrix:</p>
                      <div className="grid grid-cols-4 gap-1.5 bg-black/60 p-2 rounded border border-purple-500/30 text-center text-xs text-purple-300 font-bold">
                        {msg.text.replace("AES_BLOCK_E[", "").replace("]", "").split(":").map((hex, i) => (
                          <div key={i} className="bg-purple-950/40 p-1 border border-purple-500/20 rounded">{hex}</div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-emerald-500/20 text-xs text-emerald-400 animate-pulse">
                        🔓 AES Decrypted Status: "{msg.rawText}"
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="break-all whitespace-pre-wrap">{msg.text}</p>
                      {msg.isEncrypted && msg.modeUsed === "Caesar" && (
                        <div className="mt-2 pt-2 border-t border-[#00ffcc]/20 text-[11px] text-[#00ffcc]">
                          🔓 Caesar Decoded: {decryptText(msg.text, msg.cipherKey)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* BRAND NEW LIVE INTRUDER ATTACK CONSOLE PANEL */}
        {snifferActive && (
          <div className="mx-6 mb-2 p-4 bg-black border-2 border-red-500/50 rounded-xl max-h-44 overflow-y-auto font-mono text-xs shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-fadeIn">
            <div className="flex items-center justify-between border-b border-red-500/30 pb-2 mb-2">
              <span className="text-red-500 font-black tracking-widest animate-pulse">🚨 LIVE PACKET WIRE_TAP SNIFFER ACTIVE</span>
              <span className="text-slate-500 text-[10px]">Listening on Interface: eth0</span>
            </div>
            <div className="space-y-2">
              {stolenPackets.length === 0 ? (
                <p className="text-slate-500 italic animate-pulse">Waiting for network traffic packets to pass through baseline node...</p>
              ) : (
                stolenPackets.map((pkt, idx) => (
                  <div key={idx} className={`p-2 rounded border text-[11px] ${pkt.danger ? 'bg-red-950/20 border-red-900 text-red-400' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">⏱️ Intercepted: {pkt.time}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${pkt.danger ? 'bg-red-500 text-black' : 'bg-emerald-500 text-black'}`}>
                        {pkt.danger ? 'Plaintext Leaked' : 'Crypto Locked'}
                      </span>
                    </div>
                    <p className="break-all"><span className="text-slate-500 font-bold">Captured Hex/String:</span> {pkt.interceptedData}</p>
                    <p className="mt-1 font-bold tracking-wide">{pkt.decryptedLeak}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 3. INPUT CONTROL PANEL */}
        <form onSubmit={handleSend} className="p-4 bg-[#0b0f19] border-t-2 border-[#00ffcc]/20">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between bg-black border border-[#00ffcc]/20 px-4 py-2 rounded-lg text-[11px]">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-400 font-bold tracking-widest">
                <input type="checkbox" checked={useEncryption} onChange={(e) => setUseEncryption(e.target.checked)} className="accent-[#00ffcc]" />
                <span className={useEncryption ? 'text-[#00ffcc]' : 'text-slate-500'}>
                  {useEncryption ? '⚡ CRYPTO MATRIX ENABLED' : '🔓 UNPROTECTED TUNNEL'}
                </span>
              </label>
              
              {useEncryption && (
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span>ALGO:</span>
                    <select value={cipherType} onChange={(e) => setCipherType(e.target.value)} className="bg-[#121824] border border-[#00ffcc]/40 text-[#00ffcc] rounded px-2 py-0.5 outline-none font-bold text-xs cursor-pointer">
                      <option value="Caesar">CAESAR SHIFT</option>
                      <option value="AES-128">AES BLOCK 16-BYTE</option>
                    </select>
                  </div>
                  {cipherType === "Caesar" && (
                    <div className="flex items-center gap-1.5">
                      <span>SHIFT INDEX:</span>
                      <input type="number" min="1" max="25" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="w-10 bg-[#121824] border border-[#00ffcc]/40 rounded text-center text-[#00ffcc] font-bold outline-none" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center bg-[#060814] border border-[#00ffcc]/30 rounded-lg px-4 py-1.5 focus-within:border-[#00ffcc] transition-all">
              <span className="text-[#00ffcc]/50 mr-2 text-sm font-bold">&gt;_</span>
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Initialize core transmission payload..." className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder-slate-600 text-white font-mono" />
              <button type="submit" className="text-[#00ffcc] hover:text-white font-black text-xs uppercase tracking-widest px-3 py-1 cursor-pointer">
                [Execute]
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}

export default App;