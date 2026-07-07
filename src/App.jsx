import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "System", text: "⚡ SECURE MESH OVERLAY INITIALIZED", time: "11:25 AM", isEncrypted: false },
    { id: 2, sender: "User_Node_1", text: "System link online. Ready to swap data codes. 🛸", time: "11:26 AM", isEncrypted: false }
  ]);
  const [inputText, setInputText] = useState("");
  const [secretKey, setSecretKey] = useState("3");
  const [useEncryption, setUseEncryption] = useState(false);
  
  // BRAND NEW STATES FOR NEW FEATURES
  const [cipherType, setCipherType] = useState("Caesar"); // "Caesar" or "AES-128"
  const [isGlitching, setIsGlitching] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Trigger a temporary glitch effect when an unencrypted packet is sent
  useEffect(() => {
    if (!useEncryption && messages.length > 2) {
      setIsGlitching(true);
      const timer = setTimeout(() => setIsGlitching(false), 800); // Shake for 800ms
      return () => clearTimeout(timer);
    }
  }, [messages, useEncryption]);

  const getAvatarUrl = (sender) => {
    if (sender === "You") return "https://api.dicebear.com/7.x/bottts/svg?seed=YouNode";
    if (sender === "System") return "https://api.dicebear.com/7.x/bottts/svg?seed=Mainframe";
    return "https://api.dicebear.com/7.x/bottts/svg?seed=GhostNode";
  };

  // CAESAR CIPHER
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

  // AES BLOCK SIMULATOR FUNCTION (Converts text into Hexadecimal Grid Blocks)
  const convertToAESBlocks = (text) => {
    let hexArray = text.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
    // Pad out to make multiples of 16 blocks if short
    while (hexArray.length % 16 !== 0 || hexArray.length === 0) {
      hexArray.push("00");
    }
    return hexArray.slice(0, 16); // Return first 16-byte block matrix loop
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let finalPayload = inputText;
    if (useEncryption) {
      if (cipherType === "Caesar") {
        finalPayload = encryptText(inputText, secretKey);
      } else {
        // AES Mode obfuscates via block string formatting
        finalPayload = "AES_BLOCK_E[" + convertToAESBlocks(inputText).join(":") + "]";
      }
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
      rawText: inputText // Kept for decoding demonstration inline
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
          replyText = "AES_BLOCK_E[" + convertToAESBlocks("AES 128-Bit Rijndael Block Matrix Handshake Verified.").join(":") + "]";
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
        rawText: cipherType === "Caesar" ? "" : "AES 128-Bit Rijndael Block Matrix Handshake Verified."
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
          <div className="text-[10px] text-purple-400 mt-1 uppercase font-semibold">Protocol Level v4.1.0</div>
        </div>
        
        {/* Dynamic Security Feed Section with shake glitch wrapper */}
        <div className="flex-1 px-4 py-4 space-y-4">
          <div>
            <p className="px-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Security Status</p>
            
            {/* GLITCH ALERT APPLIED HERE */}
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
                {isGlitching ? 'Warning intercept triggered by plain array streaming!' :
                 useEncryption ? `Data streaming through encrypted ${cipherType} array matrix.` : 
                 'Core alert: System currently sending raw plain data characters.'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Active Feeds</p>
            <div className="flex items-center gap-4 p-3 bg-[#0e1424] rounded-lg border border-[#00ffcc]/10">
              <img src={getAvatarUrl("User_Node_1")} className="w-9 h-9 bg-[#060814] rounded border border-purple-500 p-1" alt="avatar" />
              <div>
                <p className="text-sm font-bold text-white">ghost_node_01</p>
                <p className="text-[10px] text-[#00ffcc]/60">Channel: #secure-broadcast</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#060814] border-t border-[#00ffcc]/10 text-[10px] text-slate-500 text-center">
          CORE HOPS: <span className="text-purple-400 font-bold">127.0.0.1 // MATRIX_STABLE</span>
        </div>
      </div>

      {/* 2. CHAT FEED BLOCK */}
      <div className="flex-1 flex flex-col h-full bg-[#060814]">
        
        {/* Terminal Header */}
        <div className="p-4 bg-[#0b0f19] border-b-2 border-[#00ffcc]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <h2 className="font-bold text-sm tracking-wider text-white">📡 SYSTEM_TUNNEL // core-link</h2>
          </div>
        </div>

        {/* Dynamic Glowing Bubbles */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 items-start ${msg.sender === 'You' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <img src={getAvatarUrl(msg.sender)} className={`w-8 h-8 rounded border p-0.5 ${
                msg.sender === 'You' ? 'border-[#00ffcc]' : 'border-purple-500'
              }`} alt="peer" />

              <div className="flex flex-col max-w-[75%]">
                <div className={`flex items-center gap-2 mb-1 text-[11px] ${msg.sender === 'You' ? 'justify-end text-[#00ffcc]' : 'text-purple-400'}`}>
                  <span className="font-bold uppercase tracking-wider">{msg.sender}</span>
                  <span className="text-[9px] text-slate-500">{msg.time}</span>
                  {msg.isEncrypted && (
                    <span className="text-[9px] bg-purple-500/10 border border-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded">
                      🔒 {msg.modeUsed}
                    </span>
                  )}
                </div>

                <div className={`p-4 rounded-xl border font-mono text-sm ${
                  msg.sender === 'You' 
                    ? 'bg-cyan-950/10 border-[#00ffcc] text-white shadow-[0_0_12px_rgba(0,255,204,0.1)]' 
                    : 'bg-purple-950/10 border-purple-500 text-slate-100 shadow-[0_0_12px_rgba(147,51,234,0.1)]'
                }`}>
                  
                  {/* Dynamic Layout styling based on Cipher Type selection */}
                  {msg.isEncrypted && msg.modeUsed === "AES-128" ? (
                    <div className="space-y-3">
                      <p className="text-xs text-purple-400 uppercase font-bold tracking-widest">// 16-Byte Block Array Matrix Payload:</p>
                      <div className="grid grid-cols-4 gap-1.5 bg-black/60 p-2.5 rounded border border-purple-500/30 text-center font-bold text-xs text-purple-300">
                        {msg.text.replace("AES_BLOCK_E[" , "").replace("]", "").split(":").map((hex, index) => (
                          <div key={index} className="bg-purple-950/40 p-1 border border-purple-500/20 rounded">{hex}</div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-emerald-500/20 text-xs text-emerald-400 animate-pulse">
                        🔓 AES Auto-Decrypted State: "{msg.rawText || "Handshake Safe"}"
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="break-all whitespace-pre-wrap tracking-wide">{msg.text}</p>
                      {msg.isEncrypted && msg.modeUsed === "Caesar" && (
                        <div className="mt-3 pt-2 border-t border-[#00ffcc]/20 text-[11px] text-[#00ffcc]">
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

        {/* 3. SCI-FI CONTROL CONSOLE INPUT */}
        <form onSubmit={handleSend} className="p-4 bg-[#0b0f19] border-t-2 border-[#00ffcc]/20">
          <div className="max-w-4xl mx-auto space-y-3">
            
            {/* Extended Multi-Cipher Control Panel */}
            <div className="flex items-center justify-between bg-black border border-[#00ffcc]/20 px-4 py-2 rounded-lg text-[11px]">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-400 font-bold tracking-widest">
                <input 
                  type="checkbox" 
                  checked={useEncryption} 
                  onChange={(e) => setUseEncryption(e.target.checked)}
                  className="accent-[#00ffcc]"
                />
                <span className={useEncryption ? 'text-[#00ffcc]' : 'text-slate-500'}>
                  {useEncryption ? '⚡ CRYPTO MATRIX ENABLED' : '🔓 UNPROTECTED TUNNEL'}
                </span>
              </label>
              
              {useEncryption && (
                <div className="flex items-center gap-4 text-slate-400">
                  {/* SELECT DROPDOWN MODULE */}
                  <div className="flex items-center gap-1.5">
                    <span>ALGO:</span>
                    <select 
                      value={cipherType} 
                      onChange={(e) => setCipherType(e.target.value)}
                      className="bg-[#121824] border border-[#00ffcc]/40 text-[#00ffcc] rounded px-2 py-0.5 outline-none text-xs font-bold cursor-pointer"
                    >
                      <option value="Caesar">CAESAR SHIFT</option>
                      <option value="AES-128">AES BLOCK 16-BYTE</option>
                    </select>
                  </div>

                  {cipherType === "Caesar" && (
                    <div className="flex items-center gap-1.5">
                      <span>SHIFT INDEX:</span>
                      <input 
                        type="number" min="1" max="25" value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        className="w-10 bg-[#121824] border border-[#00ffcc]/40 rounded text-center text-[#00ffcc] font-bold outline-none"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input keyboard row */}
            <div className="flex items-center bg-[#060814] border border-[#00ffcc]/30 rounded-lg px-4 py-1.5 focus-within:border-[#00ffcc] transition-all">
              <span className="text-[#00ffcc]/50 mr-2 text-sm font-bold">&gt;_</span>
              <input 
                type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                placeholder="Initialize core transmission payload..."
                className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder-slate-600 text-white font-mono"
              />
              <button type="submit" className="text-[#00ffcc] hover:text-white font-black text-xs uppercase tracking-widest px-3 py-1">
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