import React, { useState } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "System", text: "Welcome to the Mesh Chat decentralized node network.", time: "11:25 AM" },
    { id: 2, sender: "User_Node_1", text: "Hey! Is this connection working offline?", time: "11:26 AM" },
    { id: 3, sender: "You", text: "Yes, it's running smoothly on the local framework via Tailwind v4!", time: "11:27 AM" }
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: messages.length + 1,
      sender: "You",
      text: inputText,
      time: userMsgTime
    };

    // 1. Add your message to the screen
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputText("");

    // 2. Simulate a response from another network node after 1.5 seconds
    setTimeout(() => {
      const replies = [
        "Data packet acknowledged. Connection strength is optimal! 📶",
        "Received! Your local node is successfully sync'd with my terminal.",
        "That works flawlessly! Let's start building the decentralized storage logic next. 🚀",
        "Encryption keys verified. Security protocols look tight! 🔐"
      ];
      
      // Pick a random reply from the list
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const peerMsg = {
        id: updatedMessages.length + 1,
        sender: "User_Node_1",
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, peerMsg]);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: Network Status & Active Users */}
      <div className="w-64 bg-[#1e293b] border-r border-slate-700/50 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <h1 className="text-xl font-bold text-cyan-400 tracking-wide">🔗 Mesh Network</h1>
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
        </div>
        <div className="p-4 flex-1 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Peers</p>
            <div className="space-y-1">
              <div className="p-2 bg-slate-700/30 rounded-lg border border-slate-700 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div> User_Node_1
              </div>
              <div className="p-2 hover:bg-slate-700/20 rounded-lg text-sm flex items-center gap-2 text-slate-400">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div> Peer_Node_Beta
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-900/40 border-t border-slate-700/50 text-xs text-slate-400">
          Local Address: <code className="text-cyan-300">127.0.0.1:5173</code>
        </div>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full bg-[#0f172a]">
        
        {/* Chat Header */}
        <div className="p-4 bg-[#1e293b]/60 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg"># global-mesh-room</h2>
            <p className="text-xs text-slate-400">Decentralized broadcast workspace</p>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold ${msg.sender === 'You' ? 'text-cyan-400' : 'text-purple-400'}`}>
                  {msg.sender}
                </span>
                <span className="text-[10px] text-slate-500">{msg.time}</span>
              </div>
              <div className={`p-3 rounded-2xl max-w-md text-sm shadow-md border ${
                msg.sender === 'You' 
                  ? 'bg-cyan-600 text-white border-cyan-500 rounded-tr-none' 
                  : 'bg-[#1e293b] text-slate-200 border-slate-700 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* 3. MESSAGE INPUT BOX */}
        <form onSubmit={handleSend} className="p-4 bg-[#1e293b]/40 border-t border-slate-700/50">
          <div className="flex gap-2 max-w-4xl mx-auto bg-[#1e293b] rounded-xl border border-slate-700 p-1 focus-within:border-cyan-500 transition-all">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Broadcast encrypted data packet to mesh..." 
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder-slate-500"
            />
            <button 
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Send Packet
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default App;