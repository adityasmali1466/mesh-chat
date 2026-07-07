import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "System", text: "⚡ SECURE MESH OVERLAY INITIALIZED", time: "11:25 AM", isEncrypted: false },
    { id: 2, sender: "User_Node_1", text: "System link online. Ready to swap data codes. 🛸", time: "11:26 AM", isEncrypted: false }
  ]);
  const [inputText, setInputText] = useState("");
  const [secretKey, setSecretKey] = useState("3");
  const [useEncryption, setUseEncryption] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cyber Punk Custom Grid Avatars
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

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let finalPayload = inputText;
    if (useEncryption) {
      finalPayload = encryptText(inputText, secretKey);
    }
    
    const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: messages.length + 1,
      sender: "You",
      text: finalPayload,
      time: userMsgTime,
      isEncrypted: useEncryption,
      cipherKey: secretKey
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputText("");

    setTimeout(() => {
      let replyText = "Data transmission logs clear. Node link standing by... ⚡";
      if (useEncryption) {
        replyText = encryptText(`Decryption complete! Symmetric shift matched at [Key: ${secretKey}]. Connection stable. 🛡️`, secretKey);
      } else {
        replyText = "💥 ACCESS ALERT: Unsecured packet broadcast! Toggle upper quantum cipher shield immediately.";
      }

      const peerMsg = {
        id: updatedMessages.length + 1,
        sender: "User_Node_1",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: useEncryption,
        cipherKey: secretKey
      };
      
      setMessages(prev => [...prev, peerMsg]);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-[#060814] text-[#00ffcc] font-mono overflow-hidden antialiased selection:bg-cyan-500 selection:text-black">
      
      {/* 1. LEFT SIDEBAR: Cyber Terminal Deck */}
      <div className="w-80 bg-[#0b0f19] border-r-2 border-[#00ffcc]/20 flex flex-col hidden md:flex shadow-[5px_0_15px_rgba(0,255,204,0.05)]">
        <div className="p-6 pt-8 pb-4 border-b border-[#00ffcc]/10">
          <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-purple-500 animate-pulse">
            ⚡ NEON_MESH.lnk
          </h1>
          <div className="text-[10px] text-purple-400 mt-1 uppercase font-semibold">Protocol Level v4.0.9</div>
        </div>
        
        {/* Connection Nodes */}
        <div className="flex-1 px-4 py-4 space-y-2">
          <p className="px-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Connected Feeds</p>
          <div className="flex items-center gap-4 p-3.5 bg-[#0e1424] rounded-lg border border-[#00ffcc]/30 shadow-[0_0_10px_rgba(0,255,204,0.1)] cursor-pointer">
            <div className="relative">
              <img src={getAvatarUrl("User_Node_1")} className="w-10 h-10 bg-[#060814] rounded-lg border border-[#00ffcc]/50 p-1" alt="avatar" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#00ffcc] rounded-full border-2 border-[#0b0f19] animate-ping"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#00ffcc] rounded-full border-2 border-[#0b0f19]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white tracking-wide">ghost_node_01</p>
              <p className="text-[11px] text-[#00ffcc]/70">P2P Signal Level: 98%</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#060814] border-t border-[#00ffcc]/10 text-[10px] text-slate-500 text-center">
          CORE HOPS: <span className="text-purple-400 font-bold">127.0.0.1 // DEV_STAGE</span>
        </div>
      </div>

      {/* 2. CHAT STREAM BOARD */}
      <div className="flex-1 flex flex-col h-full bg-[#060814]">
        
        {/* Terminal Header Bar */}
        <div className="p-4 bg-[#0b0f19] border-b-2 border-[#00ffcc]/20 flex items-center justify-between shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3">
            <img src={getAvatarUrl("User_Node_1")} className="w-8 logic-avatar h-8 bg-black border border-purple-500 rounded p-0.5" alt="avatar" />
            <div>
              <h2 className="font-bold text-sm tracking-wider text-white">📡 BROADCAST_FEED // global</h2>
              <p className="text-[10px] text-purple-400">Quantum Matrix Security Mode</p>
            </div>
          </div>
        </div>

        {/* Dynamic Glowing Bubbles */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0b0f19]/40 via-[#060814] to-[#060814]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 items-start ${msg.sender === 'You' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <img src={getAvatarUrl(msg.sender)} className={`w-8 h-8 rounded border p-0.5 ${
                msg.sender === 'You' ? 'border-[#00ffcc] bg-cyan-950/30' : 'border-purple-500 bg-purple-950/30'
              }`} alt="peer" />

              <div className="flex flex-col max-w-[75%]">
                {/* Username Header badge */}
                <div className={`flex items-center gap-2 mb-1 text-[11px] ${msg.sender === 'You' ? 'justify-end text-[#00ffcc]' : 'text-purple-400'}`}>
                  <span className="font-bold uppercase tracking-wider">{msg.sender}</span>
                  <span className="text-[9px] text-slate-500 font-mono">{msg.time}</span>
                </div>

                {/* Cyber glass bubble */}
                <div className={`p-4 rounded-xl border font-mono text-sm leading-relaxed ${
                  msg.sender === 'You' 
                    ? 'bg-cyan-950/10 border-[#00ffcc] text-white shadow-[0_0_15px_rgba(0,255,204,0.15)]' 
                    : 'bg-purple-950/10 border-purple-500 text-slate-100 shadow-[0_0_15px_rgba(147,51,234,0.15)]'
                }`}>
                  <p className="break-all whitespace-pre-wrap tracking-wide">{msg.text}</p>
                  
                  {msg.isEncrypted && (
                    <div className="mt-3 pt-2 border-t border-[#00ffcc]/20 text-[11px] text-[#00ffcc] animate-pulse">
                      ⚡ DECRYPTED RAW_HEX: {decryptText(msg.text, msg.cipherKey)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. SCI-FI DASHBOARD INPUT CONTROL */}
        <form onSubmit={handleSend} className="p-4 bg-[#0b0f19] border-t-2 border-[#00ffcc]/20">
          <div className="max-w-4xl mx-auto space-y-3">
            
            {/* Cyber Shield Switcher */}
            <div className="flex items-center justify-between bg-black border border-[#00ffcc]/20 px-4 py-2 rounded-lg text-[11px]">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-400 font-bold tracking-widest">
                <input 
                  type="checkbox" 
                  checked={useEncryption} 
                  onChange={(e) => setUseEncryption(e.target.checked)}
                  className="accent-[#00ffcc]"
                />
                <span className={useEncryption ? 'text-[#00ffcc] drop-shadow-[0_0_5px_rgba(0,255,204,0.5)]' : 'text-slate-500'}>
                  {useEncryption ? '⚡ QUANTUM CIPHER LOADED' : '🔓 OPEN WIRELESS TRANS'}
                </span>
              </label>
              
              {useEncryption && (
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="uppercase text-[10px]">Shift Index:</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="25" 
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="w-12 bg-[#121824] border border-[#00ffcc]/40 rounded text-center text-[#00ffcc] font-bold outline-none shadow-[0_0_5px_rgba(0,255,204,0.3)]"
                  />
                </div>
              )}
            </div>

            {/* Input console bar */}
            <div className="flex items-center bg-[#060814] border border-[#00ffcc]/30 rounded-lg px-4 py-1.5 focus-within:border-[#00ffcc] focus-within:shadow-[0_0_10px_rgba(0,255,204,0.2)] transition-all">
              <span className="text-[#00ffcc]/50 mr-2 text-sm font-bold">&gt;_</span>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={useEncryption ? "Input plaintext to modulate..." : "Broadcast standard packet data link..."}
                className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder-slate-600 text-white font-mono"
              />
              <button 
                type="submit"
                className="text-[#00ffcc] hover:text-white font-black text-xs uppercase tracking-widest px-3 py-1 transition-all"
              >
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