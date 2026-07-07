import React, { useState } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "System", text: "Welcome to the Mesh Chat decentralized node network.", time: "11:25 AM", isEncrypted: false },
    { id: 2, sender: "User_Node_1", text: "Connection secure. All packets are passing through standard local protocols.", time: "11:26 AM", isEncrypted: false }
  ]);
  const [inputText, setInputText] = useState("");
  const [secretKey, setSecretKey] = useState("3"); // Default shifting key
  const [useEncryption, setUseEncryption] = useState(false);

  // Simple Caesar Cipher Implementation for demonstration
  const encryptText = (text, shift) => {
    return text
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        // Simple shift transformation for all printable ASCII characters
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

    // Automated Secure Reply Logic
    setTimeout(() => {
      let replyText = "Data packet acknowledged. Security check passed! 🔐";
      if (useEncryption) {
        replyText = encryptText(`Decrypted successfully using Key [${secretKey}]! Safe transmission confirmed. ✅`, secretKey);
      } else {
        replyText = "Warning: Transmitting in plaintext data format. Switch on encryption for safe routing! ⚠️";
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
    <div className="flex h-screen bg-[#0f172a] text-slate-100 font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR */}
      <div className="w-64 bg-[#1e293b] border-r border-slate-700/50 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <h1 className="text-xl font-bold text-cyan-400 tracking-wide">🔗 Mesh Network</h1>
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
        </div>
        <div className="p-4 flex-1 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Security Status</p>
            <div className={`p-3 rounded-lg border text-sm space-y-2 ${useEncryption ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-amber-950/20 border-amber-500/30'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${useEncryption ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                <span className="font-medium text-xs uppercase">{useEncryption ? 'Cipher Active' : 'Plaintext Mode'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {useEncryption ? 'Packets are obfuscated using a local symmetric key cipher.' : 'Traffic vulnerable to packet capture.'}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-900/40 border-t border-slate-700/50 text-xs text-slate-400">
          Local Node: <code className="text-cyan-300">127.0.0.1:5173</code>
        </div>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full bg-[#0f172a]">
        
        {/* Header */}
        <div className="p-4 bg-[#1e293b]/60 backdrop-blur-md border-b border-slate-700/50">
          <h2 className="font-semibold text-lg"># secure-mesh-broadcast</h2>
          <p className="text-xs text-slate-400">Cryptographic Symmetric-Key Interface</p>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold ${msg.sender === 'You' ? 'text-cyan-400' : 'text-purple-400'}`}>
                  {msg.sender}
                </span>
                <span className="text-[10px] text-slate-500">{msg.time}</span>
                {msg.isEncrypted && (
                  <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded">
                    🔑 Encrypted (Key: {msg.cipherKey})
                  </span>
                )}
              </div>
              <div className={`p-3 rounded-2xl max-w-md text-sm shadow-md border ${
                msg.sender === 'You' 
                  ? 'bg-cyan-600 text-white border-cyan-500 rounded-tr-none' 
                  : 'bg-[#1e293b] text-slate-200 border-slate-700 rounded-tl-none'
              }`}>
                <p className="font-mono break-all">{msg.text}</p>
                
                {/* Real-time Inline Decryption Utility for the UI */}
                {msg.isEncrypted && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-xs text-slate-300 italic">
                    🔓 Decrypted payload: {decryptText(msg.text, msg.cipherKey)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 3. INPUT BAR WITH CRYPTO MODULE */}
        <form onSubmit={handleSend} className="p-4 bg-[#1e293b]/40 border-t border-slate-700/50 space-y-3">
          
          {/* Encryption Control Panel */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/60 p-2 rounded-xl border border-slate-700/60 max-w-4xl mx-auto text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={useEncryption} 
                onChange={(e) => setUseEncryption(e.target.checked)}
                className="accent-cyan-400"
              />
              <span className={`font-semibold ${useEncryption ? 'text-emerald-400' : 'text-slate-400'}`}>
                Activate Cipher Modules
              </span>
            </label>
            
            {useEncryption && (
              <div className="flex items-center gap-2 animate-fadeIn">
                <span className="text-slate-400">Symmetric Shift Key:</span>
                <input 
                  type="number" 
                  min="1" 
                  max="25" 
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.value || e.target.value)}
                  className="w-12 bg-slate-800 border border-slate-600 rounded px-1.5 py-0.5 text-center text-cyan-300 outline-none focus:border-cyan-400"
                />
              </div>
            )}
          </div>

          {/* Text Input Box */}
          <div className="flex gap-2 max-w-4xl mx-auto bg-[#1e293b] rounded-xl border border-slate-700 p-1 focus-within:border-cyan-500 transition-all">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={useEncryption ? "Enter raw data to encrypt and stream..." : "Enter unencrypted message packet..."}
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder-slate-500"
            />
            <button 
              type="submit"
              className={`text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors ${
                useEncryption ? 'bg-emerald-400 hover:bg-emerald-500' : 'bg-cyan-500 hover:bg-cyan-600'
              }`}
            >
              {useEncryption ? 'Send Ciphertext' : 'Send Packet'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default App;