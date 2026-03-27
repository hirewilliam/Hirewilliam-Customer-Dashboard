import { useState, useEffect, useRef } from "react";

const PURPLE = "#5a3fa0";
const PURPLE_LIGHT = "#7155b8";
const PURPLE_PALE = "#ede9f8";
const PURPLE_DARK = "#4a3488";
const GREEN = "#1a8a5a";
const RED = "#c93535";
const AMBER = "#b86a0a";
const INK = "#0f0e0c";
const INK_MID = "#3d3b35";
const INK_SOFT = "#72706a";
const INK_GHOST = "#b0ada4";
const PAPER = "#faf9f6";
const PAPER_WARM = "#f3f1ec";
const RULE = "#ddd9d0";

// ── Mock Data ──
const MOCK_PROSPECTS = [
  { id: "1", name: "Alex Morin", company: "Shipyard", role: "Founder", industry: "Dev Tools", score: 90, stage: "meeting", channel: "linkedin", lastAction: "Booked: Thu 2pm", avatar: "AM" },
  { id: "2", name: "Priya Kumar", company: "DataStack", role: "CEO", industry: "Analytics", score: 72, stage: "interested", channel: "email", lastAction: "Asked about pricing", avatar: "PK" },
  { id: "3", name: "Leo Tanaka", company: "Kitemaker", role: "Founder", industry: "PM Tool", score: 65, stage: "interested", channel: "instagram", lastAction: "Replied: tell me more", avatar: "LT" },
  { id: "4", name: "Jake Rivera", company: "Launchpad", role: "CTO", industry: "No-code", score: 45, stage: "contacted", channel: "email", lastAction: "Opened email 3x", avatar: "JR" },
  { id: "5", name: "Nina Patel", company: "FormFlow", role: "Founder", industry: "Forms", score: 35, stage: "contacted", channel: "linkedin", lastAction: "LinkedIn accepted", avatar: "NP" },
  { id: "6", name: "Sara Chen", company: "Metrify", role: "CEO", industry: "Analytics", score: 20, stage: "new", channel: "linkedin", lastAction: "LinkedIn sent", avatar: "SC" },
  { id: "7", name: "Tom Okoro", company: "Stackbase", role: "Founder", industry: "Dev Tools", score: 15, stage: "new", channel: "email", lastAction: "Email sent 2h ago", avatar: "TO" },
  { id: "8", name: "Dan Fields", company: "Beacon", role: "CEO", industry: "CRM", score: 100, stage: "won", channel: "email", lastAction: "Signed up", avatar: "DF" },
];

const MOCK_OUTREACH = [
  {
    id: "1", prospect: "Alex Morin", company: "Shipyard", channel: "linkedin",
    message: "Hey Alex, saw your post about struggling to hire your first SDR. What if you didn't have to? I help solo founders fill their pipeline without hiring. No calls, no contracts, you can see it working in 48 hours. Worth 15 mins?",
    status: "replied", research: "Alex's post from 3 days ago about hiring challenges",
    reply: "This looks great, let's chat. Thursday work?", time: "2h ago"
  },
  {
    id: "2", prospect: "Priya Kumar", company: "DataStack", channel: "email",
    subject: "Saw your Product Hunt launch",
    message: "Hey Priya, congrats on the PH launch. 200+ upvotes is solid. Quick question: now that you've got product attention, who's doing outbound to convert that into pipeline? If the answer is \"nobody\" or \"me, badly\" — I might be able to help.",
    status: "opened", research: "PH launch 4 days ago, upvote count", openCount: 3, time: "4h ago"
  },
  {
    id: "3", prospect: "Leo Tanaka", company: "Kitemaker", channel: "instagram",
    message: "Hey Leo, been following the Kitemaker journey. Building in public is hard when you're also trying to sell. What if the selling part ran itself?",
    status: "replied", research: "Leo actively posts build-in-public content — Instagram was the right channel",
    reply: "Intrigued. How does this work?", time: "6h ago"
  },
  {
    id: "4", prospect: "Nina Patel", company: "FormFlow", channel: "linkedin",
    message: "Hi Nina — I noticed FormFlow just crossed 1K users on your changelog. That's the inflection point where outbound starts mattering. Happy to show you what that looks like without hiring.",
    status: "sent", research: "FormFlow changelog update 2 days ago", time: "8h ago"
  },
  {
    id: "5", prospect: "Jake Rivera", company: "Launchpad", channel: "email",
    subject: "Quick question about Launchpad",
    message: "Hey Jake, I've been watching Launchpad grow — the no-code space is heating up. Curious: are you doing any outbound right now, or is it all inbound? Either way, I think I can help you 3x your pipeline this quarter.",
    status: "opened", research: "Recent funding announcement, growing team", openCount: 3, time: "12h ago"
  },
];

const MOCK_CHAT = [
  { id: "1", sender: "william", content: "Morning! While you were asleep I sent 47 personalised messages. 6 founders replied. 2 want to book a call. I've put them in your Thursday slots.", time: "7:02 AM" },
  { id: "2", sender: "william", content: "Alex from Shipyard replied \"this looks great, let's chat.\" Booked for 2pm Thursday.", time: "7:02 AM" },
  { id: "3", sender: "william", content: "Priya from DataStack asked about pricing. I drafted a reply but need your approval before sending.", time: "7:03 AM" },
];

// ── Icons (inline SVG) ──
function IconSend({ s = 16 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>;
}
function IconHash({ s = 14 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>;
}

// ── Utility Components ──
function Avatar({ initials, bg = PURPLE, size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size > 28 ? 10 : 6, background: bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Badge({ text, color }) {
  const colors = {
    hot: { bg: "#fcebeb", text: "#a32d2d" },
    warm: { bg: "#fdf2e3", text: AMBER },
    new: { bg: "#e6f1fb", text: "#185fa5" },
    won: { bg: "#e4f5ed", text: GREEN },
    replied: { bg: "#e4f5ed", text: GREEN },
    opened: { bg: "#fdf2e3", text: AMBER },
    sent: { bg: PAPER_WARM, text: INK_SOFT },
    linkedin: { bg: "#e6f1fb", text: "#185fa5" },
    email: { bg: PAPER_WARM, text: INK_SOFT },
    instagram: { bg: PURPLE_PALE, text: PURPLE },
  };
  const c = colors[color] || colors.new;
  return <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: c.bg, color: c.text, whiteSpace: "nowrap" }}>{text}</span>;
}

function ScoreBar({ score }) {
  const color = score >= 80 ? GREEN : score >= 50 ? AMBER : score >= 30 ? "#378add" : INK_GHOST;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
      <div style={{ flex: 1, height: 3, borderRadius: 2, background: RULE }}>
        <div style={{ width: `${score}%`, height: "100%", borderRadius: 2, background: color }} />
      </div>
      <span style={{ fontSize: 10, color: INK_GHOST, minWidth: 20, textAlign: "right" }}>{score}</span>
    </div>
  );
}

// ── Sidebar ──
function Sidebar({ active, onNav }) {
  const channels = [
    { id: "chat", label: "talk-to-william", dot: true },
    { id: "pipeline", label: "pipeline" },
    { id: "outreach", label: "outreach-log", badge: "3" },
    { id: "leads", label: "hot-leads", badge: "4" },
    { id: "meetings", label: "meetings", badge: "2" },
    { id: "analytics", label: "analytics" },
  ];

  return (
    <div style={{ width: 220, background: "#16102a", padding: "14px 10px", color: "rgba(255,255,255,0.45)", fontSize: 13, display: "flex", flexDirection: "column", height: "100%", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px 16px", color: "#fff", fontSize: 15, fontWeight: 600 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>W</div>
        HireWilliam
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", padding: "10px 8px 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Channels</div>
      {channels.map(ch => (
        <div key={ch.id} onClick={() => onNav(ch.id)} style={{ padding: "5px 10px", borderRadius: 5, marginBottom: 1, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, background: active === ch.id ? "rgba(90,63,160,0.35)" : "transparent", color: active === ch.id ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 12, transition: "all 0.15s" }}>
          <IconHash s={11} />
          {ch.label}
          {ch.badge && <span style={{ marginLeft: "auto", fontSize: 9, background: RED, color: "#fff", padding: "1px 5px", borderRadius: 8, fontWeight: 600 }}>{ch.badge}</span>}
        </div>
      ))}
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", padding: "16px 8px 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Direct messages</div>
      <div onClick={() => onNav("chat")} style={{ padding: "5px 10px", borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: active === "chat" ? "rgba(90,63,160,0.35)" : "transparent", color: active === "chat" ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 12 }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#fff" }}>W</div>
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: "#44b700", border: "1.5px solid #16102a" }} />
        </div>
        William
      </div>
    </div>
  );
}

// ── Chat View ──
function ChatView() {
  const [msgs, setMsgs] = useState(MOCK_CHAT);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: Date.now().toString(), sender: "user", content: text, time: "now" };
    setMsgs(p => [...p, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const replies = {
        default: `Good question. Let me pull that up for you. Based on your pipeline right now — you've got 2 meetings booked this week, 4 hot leads that need follow-up, and 24 new prospects I'm still working. What do you want to dig into first?`,
        results: `Here's your overnight breakdown:\n\n47 messages sent across email, LinkedIn, and Instagram. 6 replies — that's a 12.7% reply rate, which is strong. 2 meetings booked for Thursday. 4 leads need follow-up today — I'll handle them unless you want to review first.`,
        prospects: `I found 12 SaaS founders in the dev tools space who posted about hiring challenges this week. Here are the top 5:\n\n1. Sarah Kim, BuildKit — posted about SDR burnout yesterday\n2. Marcus Webb, Deployfast — just raised seed, no sales hire yet\n3. Aisha Patel, CodeForge — launched on PH last week, 340 upvotes\n4. James Chen, StackPilot — tweeted about doing sales at midnight\n5. Ren Watanabe, Shiply — expanding to US market, no outbound\n\nWant me to start reaching out?`,
        pipeline: `Your pipeline right now:\n\n🔴 Meeting (3): Alex Morin, Thu 2pm — Shipyard. Two others pending confirmation.\n🟠 Interested (8): Priya Kumar asked about pricing. Leo Tanaka wants to know more. 6 others warming up.\n🔵 Contacted (15): Jake Rivera opened your email 3 times. Nina Patel accepted on LinkedIn.\n⚪ New (24): Fresh prospects I'm working through.\n🟢 Won (2): Dan Fields signed up last week.\n\nYour pipeline is healthy. The bottleneck is converting \"interested\" to \"meeting\" — I'm on it.`
      };
      let reply = replies.default;
      const t = text.toLowerCase();
      if (t.includes("result") || t.includes("overnight") || t.includes("today")) reply = replies.results;
      if (t.includes("prospect") || t.includes("find")) reply = replies.prospects;
      if (t.includes("pipeline") || t.includes("funnel")) reply = replies.pipeline;
      setMsgs(p => [...p, { id: (Date.now() + 1).toString(), sender: "william", content: reply, time: "now" }]);
      setTyping(false);
    }, 1500);
  }

  const suggestions = ["Show me today's results", "Who replied overnight?", "Find me 10 new prospects", "What's in my pipeline?"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderBottom: `1px solid ${RULE}` }}>
        <div style={{ position: "relative" }}>
          <Avatar initials="W" size={36} />
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: "#44b700", border: "2px solid #fff" }} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            William
            <span style={{ fontSize: 9, fontWeight: 600, background: PURPLE_PALE, color: PURPLE, padding: "2px 6px", borderRadius: 4 }}>AI</span>
          </div>
          <div style={{ fontSize: 11, color: GREEN }}>Online — always</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
            <Avatar initials="W" size={56} />
            <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 12, color: INK }}>Morning. I'm William.</h2>
            <p style={{ fontSize: 13, color: INK_SOFT, maxWidth: 360, marginTop: 6 }}>Tell me about your product, who your ideal customers are, and I'll get to work.</p>
          </div>
        )}

        {msgs.map(m => (
          <div key={m.id} style={{ display: "flex", gap: 10, flexDirection: m.sender === "user" ? "row-reverse" : "row" }}>
            {m.sender === "william" ? <Avatar initials="W" size={28} /> : <Avatar initials="Y" bg={PAPER_WARM} size={28} />}
            <div style={{ maxWidth: "75%", borderRadius: 16, padding: "10px 14px", background: m.sender === "william" ? PAPER_WARM : PURPLE, color: m.sender === "william" ? INK : "#fff" }}>
              <p style={{ fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap", margin: 0 }}>{m.content}</p>
              <p style={{ fontSize: 9, marginTop: 4, color: m.sender === "william" ? INK_GHOST : "rgba(255,255,255,0.6)", margin: 0 }}>{m.time}</p>
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ display: "flex", gap: 10 }}>
            <Avatar initials="W" size={28} />
            <div style={{ background: PAPER_WARM, borderRadius: 16, padding: "10px 14px", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: PURPLE, opacity: 0.5, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
              </div>
              <span style={{ fontSize: 11, color: INK_SOFT, marginLeft: 4 }}>William is thinking...</span>
            </div>
          </div>
        )}

        {msgs.length > 0 && msgs.length <= 3 && !typing && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 20, border: `1px solid ${RULE}`, background: "transparent", color: INK_SOFT, cursor: "pointer" }}>{s}</button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "12px 20px", borderTop: `1px solid ${RULE}` }}>
        <div style={{ display: "flex", gap: 10 }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Message William..."
            rows={1}
            style={{ flex: 1, resize: "none", borderRadius: 10, border: `1px solid ${RULE}`, padding: "10px 14px", fontSize: 13, outline: "none", fontFamily: "inherit", background: PAPER }}
          />
          <button onClick={send} disabled={!input.trim()} style={{ width: 40, height: 40, borderRadius: 10, background: input.trim() ? PURPLE : RULE, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "default", color: "#fff", transition: "all 0.15s" }}>
            <IconSend s={16} />
          </button>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.85); } 50% { opacity: 0.8; transform: scale(1.1); } }`}</style>
    </div>
  );
}

// ── Pipeline View ──
function PipelineView() {
  const stages = [
    { id: "new", label: "New", color: INK_SOFT },
    { id: "contacted", label: "Contacted", color: "#378add" },
    { id: "interested", label: "Interested", color: AMBER },
    { id: "meeting", label: "Meeting", color: RED },
    { id: "won", label: "Won", color: GREEN },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", gap: 6 }}>
        <IconHash s={14} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>pipeline</span>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: 8, padding: 12, background: PAPER_WARM, overflowY: "auto" }}>
        {stages.map(st => {
          const items = MOCK_PROSPECTS.filter(p => p.stage === st.id);
          return (
            <div key={st.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px 8px", fontSize: 12, fontWeight: 600, color: st.color }}>
                {st.label}
                <span style={{ fontSize: 10, fontWeight: 400, color: INK_GHOST, background: "#fff", padding: "0 6px", borderRadius: 8 }}>{items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {items.map(p => (
                  <div key={p.id} style={{ background: "#fff", border: `1px solid ${RULE}`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: INK_GHOST, marginBottom: 3 }}>{p.company} ({p.industry})</div>
                    <div style={{ fontSize: 10, color: st.id === "won" || st.id === "meeting" ? GREEN : INK_SOFT }}>{p.lastAction}</div>
                    <ScoreBar score={p.score} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Outreach Log ──
function OutreachView() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", gap: 6 }}>
        <IconHash s={14} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>outreach-log</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {MOCK_OUTREACH.map(o => (
          <div key={o.id} style={{ padding: "16px 20px", borderBottom: `1px solid ${PAPER_WARM}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{o.prospect}, {o.company}</span>
              <Badge text={o.channel} color={o.channel} />
              <Badge text={o.status} color={o.status} />
              <span style={{ fontSize: 10, color: INK_GHOST, marginLeft: "auto" }}>{o.time}</span>
            </div>
            {o.subject && <div style={{ fontSize: 11, fontWeight: 600, color: INK_MID, marginBottom: 4 }}>Subject: {o.subject}</div>}
            <div style={{ fontSize: 12, color: INK_SOFT, lineHeight: 1.55, padding: "10px 14px", background: PAPER_WARM, borderRadius: 8, marginBottom: 8 }}>{o.message}</div>
            <div style={{ fontSize: 10, color: INK_GHOST, marginBottom: 4 }}>
              {o.status === "opened" ? `Opened ${o.openCount}x` : o.status === "replied" ? "Delivered + read" : o.status === "sent" ? "Delivered" : ""} · Research: {o.research}
            </div>
            {o.reply && (
              <div style={{ fontSize: 12, color: GREEN, padding: "8px 12px", background: "#e4f5ed", borderLeft: `2.5px solid #6cc49a`, borderRadius: "0 8px 8px 0", marginTop: 8 }}>
                {o.prospect} replied: "{o.reply}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hot Leads ──
function LeadsView() {
  const hot = MOCK_PROSPECTS.filter(p => p.score >= 50).sort((a, b) => b.score - a.score);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", gap: 6 }}>
        <IconHash s={14} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>hot-leads</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {hot.map(p => {
          const heat = p.score >= 80 ? "hot" : p.score >= 60 ? "warm" : "new";
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${PAPER_WARM}` }}>
              <Avatar initials={p.avatar} bg={heat === "hot" ? "#fcebeb" : heat === "warm" ? "#fdf2e3" : "#e6f1fb"} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: INK_SOFT }}>{p.company} · {p.lastAction}</div>
              </div>
              <Badge text={heat.charAt(0).toUpperCase() + heat.slice(1)} color={heat} />
              <div style={{ width: 60 }}><ScoreBar score={p.score} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Meetings ──
function MeetingsView() {
  const meetings = [
    { id: "1", prospect: "Alex Morin", company: "Shipyard", time: "Thu 2:00 PM", duration: "30 min", status: "confirmed" },
    { id: "2", prospect: "Sarah Kim", company: "BuildKit", time: "Thu 4:30 PM", duration: "15 min", status: "pending" },
    { id: "3", prospect: "Dan Fields", company: "Beacon", time: "Fri 10:00 AM", duration: "30 min", status: "confirmed" },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", gap: 6 }}>
        <IconHash s={14} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>meetings</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {meetings.map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: PAPER_WARM, borderRadius: 10, marginBottom: 8 }}>
            <div style={{ width: 48, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: PURPLE }}>{m.time.split(" ")[0]}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{m.time.split(" ")[1]} {m.time.split(" ")[2]}</div>
            </div>
            <div style={{ width: 1, height: 36, background: RULE }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.prospect}</div>
              <div style={{ fontSize: 11, color: INK_SOFT }}>{m.company} · {m.duration}</div>
            </div>
            <Badge text={m.status === "confirmed" ? "Confirmed" : "Pending"} color={m.status === "confirmed" ? "won" : "warm"} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Analytics ──
function AnalyticsView() {
  const stats = [
    { label: "Messages sent", value: "312", change: "+47 today" },
    { label: "Replies", value: "38", change: "12.2% rate" },
    { label: "Meetings booked", value: "11", change: "+2 today" },
    { label: "Pipeline value", value: "24", change: "Active prospects" },
  ];
  const days = [
    { day: "Mon", sent: 42, replies: 5 }, { day: "Tue", sent: 47, replies: 6 },
    { day: "Wed", sent: 38, replies: 4 }, { day: "Thu", sent: 51, replies: 7 },
    { day: "Fri", sent: 45, replies: 6 }, { day: "Sat", sent: 44, replies: 5 },
    { day: "Sun", sent: 45, replies: 5 },
  ];
  const maxSent = Math.max(...days.map(d => d.sent));

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", gap: 6 }}>
        <IconHash s={14} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>analytics</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: PAPER_WARM, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: INK_GHOST, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: INK }}>{s.value}</div>
              <div style={{ fontSize: 10, color: GREEN, marginTop: 2 }}>{s.change}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: INK_MID, marginBottom: 12 }}>Last 7 days</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160, padding: "0 8px" }}>
          {days.map(d => (
            <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 9, color: INK_GHOST }}>{d.sent}</div>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ height: (d.sent / maxSent) * 100, background: PURPLE, borderRadius: "4px 4px 0 0", minHeight: 4, transition: "height 0.3s" }} />
                <div style={{ height: (d.replies / maxSent) * 100, background: GREEN, borderRadius: "0 0 4px 4px", minHeight: 4, transition: "height 0.3s" }} />
              </div>
              <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 4 }}>{d.day}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: INK_SOFT }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: PURPLE }} /> Sent
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: INK_SOFT }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: GREEN }} /> Replies
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Right Panel (shown on chat view) ──
function RightPanel() {
  const hot = MOCK_PROSPECTS.filter(p => p.score >= 45).sort((a, b) => b.score - a.score).slice(0, 4);
  return (
    <div style={{ width: 200, borderLeft: `1px solid ${RULE}`, padding: 12, fontSize: 11, background: PAPER, flexShrink: 0, overflowY: "auto" }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: INK_GHOST, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Overnight results</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
        {[{ l: "Sent", v: "47", c: "While you slept" }, { l: "Replies", v: "6", c: "12.7% rate" }, { l: "Meetings", v: "2", c: "Booked Thu" }, { l: "Hot leads", v: "4", c: "Need follow-up" }].map(s => (
          <div key={s.l} style={{ background: PAPER_WARM, borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, color: INK_GHOST }}>{s.l}</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{s.v}</div>
            <div style={{ fontSize: 9, color: GREEN }}>{s.c}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, fontWeight: 600, color: INK_GHOST, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Hot leads</div>
      {hot.map(p => {
        const heat = p.score >= 80 ? "hot" : p.score >= 60 ? "warm" : "new";
        return (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0" }}>
            <Avatar initials={p.avatar} bg={heat === "hot" ? "#fcebeb" : heat === "warm" ? "#fdf2e3" : "#e6f1fb"} size={22} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
              <div style={{ fontSize: 9, color: INK_GHOST }}>{p.lastAction}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [page, setPage] = useState("chat");

  const views = {
    chat: <ChatView />,
    pipeline: <PipelineView />,
    outreach: <OutreachView />,
    leads: <LeadsView />,
    meetings: <MeetingsView />,
    analytics: <AnalyticsView />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", color: INK, background: "#fff", overflow: "hidden" }}>
      <Sidebar active={page} onNav={setPage} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {views[page]}
        </div>
        {page === "chat" && <RightPanel />}
      </div>
    </div>
  );
}
