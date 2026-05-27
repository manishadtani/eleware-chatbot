/**
 * Eleware Accounting — AI Chatbot Embed Script
 * 
 * Usage: Apni website ke </body> se pehle yeh line add karo:
 * <script src="https://YOUR-DEPLOYED-URL.vercel.app/chatwidget.js"></script>
 */
(function () {
  // ============ CONFIG ============
  // Deploy ke baad yahan apna URL daalein
  var API_BASE = window.__ELEWARE_CHAT_API || "";

  // Auto-detect: agar script src se load hua hai toh wahan se base URL le lo
  if (!API_BASE) {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf("chatwidget.js") !== -1) {
        API_BASE = scripts[i].src.replace("/chatwidget.js", "");
        break;
      }
    }
  }
  // =================================

  // Styles
  var style = document.createElement("style");
  style.textContent = "\n\
    #elw-chat-btn {\n\
      position:fixed; bottom:20px; right:20px;\n\
      background:#059669; color:white;\n\
      border:none; border-radius:50px;\n\
      padding:12px 22px; font-size:14px; font-weight:500;\n\
      cursor:pointer; z-index:99999;\n\
      display:flex; align-items:center; gap:8px;\n\
      box-shadow:0 4px 20px rgba(5,150,105,0.35);\n\
      transition:all 0.3s ease;\n\
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;\n\
    }\n\
    #elw-chat-btn:hover { background:#047857; transform:scale(1.05); }\n\
    \n\
    #elw-chat-panel {\n\
      position:fixed; bottom:80px; right:20px;\n\
      width:380px; max-height:600px;\n\
      background:white; border-radius:16px;\n\
      box-shadow:0 10px 40px rgba(0,0,0,0.15);\n\
      z-index:99999; display:none;\n\
      flex-direction:column; overflow:hidden;\n\
      border:1px solid #e5e7eb;\n\
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;\n\
    }\n\
    #elw-chat-panel.open { display:flex; }\n\
    @media(max-width:480px) {\n\
      #elw-chat-panel { width:calc(100vw - 24px); right:12px; bottom:70px; max-height:75vh; }\n\
    }\n\
    \n\
    #elw-chat-header {\n\
      padding:14px 18px; border-bottom:1px solid #f3f4f6;\n\
      display:flex; align-items:center; justify-content:space-between;\n\
      background:white;\n\
    }\n\
    #elw-chat-header-info { display:flex; align-items:center; gap:10px; }\n\
    #elw-chat-header-icon {\n\
      width:36px; height:36px; border-radius:50%; background:#ecfdf5;\n\
      display:flex; align-items:center; justify-content:center;\n\
    }\n\
    #elw-chat-header h3 { font-size:14px; font-weight:600; margin:0; color:#111; }\n\
    #elw-chat-header p { font-size:11px; margin:0; color:#6b7280; }\n\
    #elw-close-btn {\n\
      background:none; border:none; font-size:20px; cursor:pointer; color:#9ca3af;\n\
      width:30px; height:30px; display:flex; align-items:center; justify-content:center;\n\
      border-radius:50%; transition:all 0.2s;\n\
    }\n\
    #elw-close-btn:hover { background:#f3f4f6; color:#111; }\n\
    \n\
    #elw-chat-messages {\n\
      flex:1; overflow-y:auto; padding:14px;\n\
      min-height:280px; max-height:380px; background:#f9fafb;\n\
    }\n\
    .elw-msg { margin-bottom:10px; display:flex; }\n\
    .elw-msg.user { justify-content:flex-end; }\n\
    .elw-msg.ai { justify-content:flex-start; }\n\
    .elw-bubble {\n\
      max-width:80%; padding:10px 14px; border-radius:14px;\n\
      font-size:13px; line-height:1.5; word-break:break-word;\n\
    }\n\
    .elw-msg.user .elw-bubble {\n\
      background:#059669; color:white; border-bottom-right-radius:4px;\n\
    }\n\
    .elw-msg.ai .elw-bubble {\n\
      background:white; color:#111; border:1px solid #e5e7eb;\n\
      border-bottom-left-radius:4px;\n\
    }\n\
    \n\
    #elw-chat-input-area {\n\
      padding:10px 12px; border-top:1px solid #f3f4f6;\n\
      display:flex; gap:8px; background:white;\n\
    }\n\
    #elw-chat-input {\n\
      flex:1; border:1px solid #d1d5db; border-radius:10px;\n\
      padding:10px 14px; font-size:13px; outline:none;\n\
      font-family:inherit;\n\
    }\n\
    #elw-chat-input:focus { border-color:#059669; box-shadow:0 0 0 2px rgba(5,150,105,0.15); }\n\
    #elw-chat-send {\n\
      background:#059669; color:white; border:none;\n\
      border-radius:10px; padding:10px 14px; cursor:pointer;\n\
      font-size:14px; transition:background 0.2s;\n\
    }\n\
    #elw-chat-send:hover { background:#047857; }\n\
    #elw-chat-send:disabled { opacity:0.4; cursor:not-allowed; }\n\
    \n\
    #elw-lead-form { padding:0; }\n\
    #elw-lead-form input {\n\
      width:100%; border:1px solid #d1d5db; border-radius:10px;\n\
      padding:10px 14px; font-size:13px; margin-bottom:8px;\n\
      outline:none; box-sizing:border-box; font-family:inherit;\n\
    }\n\
    #elw-lead-form input:focus { border-color:#059669; }\n\
    #elw-lead-form button {\n\
      width:100%; background:#059669; color:white;\n\
      border:none; border-radius:10px; padding:12px;\n\
      font-size:14px; font-weight:500; cursor:pointer; margin-top:6px;\n\
      font-family:inherit; transition:background 0.2s;\n\
    }\n\
    #elw-lead-form button:hover { background:#047857; }\n\
    \n\
    .elw-typing { display:flex; gap:4px; padding:8px 14px; }\n\
    .elw-dot {\n\
      width:7px; height:7px; background:#9ca3af; border-radius:50%;\n\
      animation:elw-bounce 1.4s infinite ease-in-out both;\n\
    }\n\
    .elw-dot:nth-child(2) { animation-delay:0.15s; }\n\
    .elw-dot:nth-child(3) { animation-delay:0.3s; }\n\
    @keyframes elw-bounce {\n\
      0%,80%,100% { transform:scale(0); }\n\
      40% { transform:scale(1); }\n\
    }\n\
  ";
  document.head.appendChild(style);

  // State
  var sessionId = localStorage.getItem("eleware_chat_session");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("eleware_chat_session", sessionId);
  }
  var userDetails = JSON.parse(localStorage.getItem("eleware_user") || "null");
  var messages = [];
  var isLoading = false;

  // Create floating button
  var btn = document.createElement("button");
  btn.id = "elw-chat-btn";
  btn.innerHTML =
    '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg> Ask an Expert';
  btn.onclick = function () {
    panel.classList.toggle("open");
  };
  document.body.appendChild(btn);

  // Create panel
  var panel = document.createElement("div");
  panel.id = "elw-chat-panel";
  document.body.appendChild(panel);

  function renderHeader() {
    return '<div id="elw-chat-header">' +
      '<div id="elw-chat-header-info">' +
      '<div id="elw-chat-header-icon"><svg width="18" height="18" fill="none" stroke="#059669" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg></div>' +
      '<div><h3>Eleware Accounting</h3><p>Online • Financial clarity, always</p></div>' +
      '</div>' +
      '<button id="elw-close-btn" onclick="document.getElementById(\'elw-chat-panel\').classList.remove(\'open\')">✕</button>' +
      '</div>';
  }

  function renderForm() {
    panel.innerHTML = renderHeader() +
      '<div style="padding:20px;background:#f9fafb;flex:1;">' +
      '<div style="background:white;border-radius:12px;padding:20px;border:1px solid #f3f4f6;">' +
      '<h3 style="text-align:center;font-size:15px;font-weight:600;margin:0 0 4px;color:#111;">Talk to our AI assistant</h3>' +
      '<p style="text-align:center;font-size:12px;color:#6b7280;margin:0 0 16px;">Quick intro and we\'ll get you answers</p>' +
      '<div id="elw-lead-form">' +
      '<input type="text" id="elw-name" placeholder="Full name" />' +
      '<input type="email" id="elw-email" placeholder="Email address" />' +
      '<input type="tel" id="elw-phone" placeholder="Phone number" />' +
      '<button onclick="window.__elwStart()">Get Started</button>' +
      '</div></div></div>';
  }

  function renderChat() {
    panel.innerHTML = renderHeader() +
      '<div id="elw-chat-messages"></div>' +
      '<div id="elw-chat-input-area">' +
      '<input type="text" id="elw-chat-input" placeholder="Type your message..." />' +
      '<button id="elw-chat-send" onclick="window.__elwSend()">➤</button>' +
      '</div>';
    var input = document.getElementById("elw-chat-input");
    if (input) input.addEventListener("keypress", function (e) { if (e.key === "Enter") window.__elwSend(); });
    renderMessages();
  }

  function renderMessages() {
    var el = document.getElementById("elw-chat-messages");
    if (!el) return;
    var html = "";
    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      html += '<div class="elw-msg ' + m.role + '"><div class="elw-bubble">' + escapeHtml(m.text) + '</div></div>';
    }
    if (isLoading) {
      html += '<div class="elw-msg ai"><div class="elw-bubble"><div class="elw-typing"><div class="elw-dot"></div><div class="elw-dot"></div><div class="elw-dot"></div></div></div></div>';
    }
    el.innerHTML = html;
    el.scrollTop = el.scrollHeight;
  }

  function escapeHtml(t) {
    var d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
  }

  // Global handlers
  window.__elwStart = async function () {
    var name = document.getElementById("elw-name").value.trim();
    var email = document.getElementById("elw-email").value.trim();
    var phone = document.getElementById("elw-phone").value.trim();
    if (!name || !email || !phone) { alert("Please fill all fields"); return; }

    userDetails = { name: name, email: email, phone: phone };
    localStorage.setItem("eleware_user", JSON.stringify(userDetails));

    try {
      await fetch(API_BASE + "/api/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDetails),
      });
    } catch (e) { /* ignore */ }

    messages = [{ role: "ai", text: "Hi " + name + "! I'm the Eleware Accounting assistant. Ask me anything about GST, tax filing, bookkeeping, company registration, or any financial query." }];
    renderChat();
  };

  window.__elwSend = async function () {
    if (isLoading) return;
    var input = document.getElementById("elw-chat-input");
    var text = input.value.trim();
    if (!text) return;

    messages.push({ role: "user", text: text });
    input.value = "";
    isLoading = true;
    renderMessages();

    var formatted = messages.map(function (m) {
      return { role: m.role === "ai" ? "assistant" : "user", content: m.text };
    });

    try {
      var res = await fetch(API_BASE + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userDetails,
          sessionId: sessionId,
          messages: formatted,
          meetingBooked: false,
        }),
      });
      var data = await res.json();
      messages.push({ role: "ai", text: data.reply || "Something went wrong." });
    } catch (e) {
      messages.push({ role: "ai", text: "Connection error. Please try again." });
    }

    isLoading = false;
    renderMessages();
  };

  // Init
  if (userDetails) {
    messages = [{ role: "ai", text: "Welcome back, " + userDetails.name + "! How can I help you with your accounting or tax queries today?" }];
    renderChat();
  } else {
    renderForm();
  }
})();
