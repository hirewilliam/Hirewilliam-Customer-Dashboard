import { useState, useEffect, useRef } from "react";
import { getWilliamResponse } from "./claudeApi.js";

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

// ── Enhanced Mock Data with Activity Tracking ──
const INITIAL_PROSPECTS = [
  { id: "1", name: "Alex Morin", company: "Shipyard", role: "Founder", industry: "Dev Tools", score: 90, stage: "meeting", channel: "linkedin", lastAction: "Booked: Thu 2pm", avatar: "AM", lastActivityTime: Date.now() - 7200000, activities: [{ time: Date.now() - 7200000, action: "Meeting booked" }] },
  { id: "2", name: "Priya Kumar", company: "DataStack", role: "CEO", industry: "Analytics", score: 72, stage: "interested", channel: "email", lastAction: "Asked about pricing", avatar: "PK", lastActivityTime: Date.now() - 14400000, activities: [{ time: Date.now() - 14400000, action: "Replied positively" }] },
  { id: "3", name: "Leo Tanaka", company: "Kitemaker", role: "Founder", industry: "PM Tool", score: 65, stage: "interested", channel: "instagram", lastAction: "Replied: tell me more", avatar: "LT", lastActivityTime: Date.now() - 21600000, activities: [{ time: Date.now() - 21600000, action: "Replied" }] },
  { id: "4", name: "Jake Rivera", company: "Launchpad", role: "CTO", industry: "No-code", score: 45, stage: "contacted", channel: "email", lastAction: "Opened email 3x", avatar: "JR", lastActivityTime: Date.now() - 43200000, activities: [{ time: Date.now() - 43200000, action: "Message opened" }] },
  { id: "5", name: "Nina Patel", company: "FormFlow", role: "Founder", industry: "Forms", score: 35, stage: "contacted", channel: "linkedin", lastAction: "LinkedIn accepted", avatar: "NP", lastActivityTime: Date.now() - 86400000, activities: [{ time: Date.now() - 86400000, action: "Accepted connection" }] },
  { id: "6", name: "Sara Chen", company: "Metrify", role: "CEO", industry: "Analytics", score: 20, stage: "new", channel: "linkedin", lastAction: "LinkedIn sent", avatar: "SC", lastActivityTime: Date.now() - 259200000, activities: [{ time: Date.now() - 259200000, action: "Initial message sent" }] },
  { id: "7", name: "Tom Okoro", company: "Stackbase", role: "Founder", industry: "Dev Tools", score: 15, stage: "new", channel: "email", lastAction: "Email sent 2h ago", avatar: "TO", lastActivityTime: Date.now() - 7200000, activities: [{ time: Date.now() - 7200000, action: "Initial email sent" }] },
  { id: "8", name: "Dan Fields", company: "Beacon", role: "CEO", industry: "CRM", score: 100, stage: "won", channel: "email", lastAction: "Signed up", avatar: "DF", lastActivityTime: Date.now() - 604800000, activities: [{ time: Date.now() - 604800000, action: "Became customer" }] },
  { id: "9", name: "Rachel Green", company: "TechFlow", role: "Founder", industry: "Analytics", score: 28, stage: "new", channel: "linkedin", lastAction: "Researching", avatar: "RG", lastActivityTime: Date.now() - 432000000, activities: [{ time: Date.now() - 432000000, action: "Profile researched" }] },
  { id: "10", name: "Marcus Chen", company: "BuildFlow", role: "CRO", industry: "Dev Tools", score: 55, stage: "contacted", channel: "email", lastAction: "No response yet", avatar: "MC", lastActivityTime: Date.now() - 172800000, activities: [{ time: Date.now() - 172800000, action: "Initial email sent" }] },
  { id: "11", name: "Sofia Rodriguez", company: "PayFlow", role: "CEO", industry: "Fintech", score: 78, stage: "interested", channel: "linkedin", lastAction: "Asked for demo", avatar: "SR", lastActivityTime: Date.now() - 3600000, activities: [{ time: Date.now() - 3600000, action: "Requested demo" }] },
];

const MOCK_PROSPECTS = INITIAL_PROSPECTS;

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
    message: "Hey Priya, congrats on the PH launch. 200+ upvotes is solid. Quick question: now that you've got product attention, who's doing outbound to convert that into pipeline? If the answer is \"nobody\" or \"me, badly\" - I might be able to help.",
    status: "opened", research: "PH launch 4 days ago, upvote count", openCount: 3, time: "4h ago"
  },
  {
    id: "3", prospect: "Leo Tanaka", company: "Kitemaker", channel: "instagram",
    message: "Hey Leo, been following the Kitemaker journey. Building in public is hard when you're also trying to sell. What if the selling part ran itself?",
    status: "replied", research: "Leo actively posts build-in-public content - Instagram was the right channel",
    reply: "Intrigued. How does this work?", time: "6h ago"
  },
  {
    id: "4", prospect: "Nina Patel", company: "FormFlow", channel: "linkedin",
    message: "Hi Nina - I noticed FormFlow just crossed 1K users on your changelog. That's the inflection point where outbound starts mattering. Happy to show you what that looks like without hiring.",
    status: "sent", research: "FormFlow changelog update 2 days ago", time: "8h ago"
  },
  {
    id: "5", prospect: "Jake Rivera", company: "Launchpad", channel: "email",
    subject: "Quick question about Launchpad",
    message: "Hey Jake, I've been watching Launchpad grow - the no-code space is heating up. Curious: are you doing any outbound right now, or is it all inbound? Either way, I think I can help you 3x your pipeline this quarter.",
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
function IconLock({ s = 14 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}

// ── Responsive Hook ──
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= breakpoint
  );
  useEffect(() => {
    let timer;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIsMobile(window.innerWidth <= breakpoint), 100);
    };
    window.addEventListener("resize", handler);
    return () => { clearTimeout(timer); window.removeEventListener("resize", handler); };
  }, [breakpoint]);
  return isMobile;
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
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: c.bg, color: c.text, whiteSpace: "nowrap" }}>{text}</span>;
}

function ScoreBar({ score }) {
  const color = score >= 80 ? GREEN : score >= 50 ? AMBER : score >= 30 ? "#378add" : INK_GHOST;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
      <div style={{ flex: 1, height: 3, borderRadius: 2, background: RULE }}>
        <div style={{ width: `${score}%`, height: "100%", borderRadius: 2, background: color }} />
      </div>
      <span style={{ fontSize: 11, color: INK_GHOST, minWidth: 20, textAlign: "right" }}>{score}</span>
    </div>
  );
}

// ── Sidebar ──
function Sidebar({ active, onNav, onClose }) {
  const channels = [
    { id: "chat", label: "talk-to-william", dot: true },
    { id: "outreach", label: "outreach-log", badge: "3" },
    { id: "meetings", label: "meetings", badge: "2" },
    { id: "pipeline", label: "pipeline" },
    { id: "analytics", label: "analytics" },
    { id: "founders", label: "for-founders", lock: true },
  ];

  return (
    <div style={{ width: 220, background: "#16102a", padding: "20px 12px 14px", color: "rgba(255,255,255,0.45)", fontSize: 14, display: "flex", flexDirection: "column", height: "100%", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px 20px", color: "#fff", fontSize: 17, fontWeight: 700 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff", flexShrink: 0 }}>W</div>
        HireWilliam
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 4px", touchAction: "manipulation" }}
          >×</button>
        )}
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", padding: "10px 8px 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Channels</div>
      {channels.map(ch => (
        <div key={ch.id} onClick={() => onNav(ch.id)} style={{ padding: "5px 10px", borderRadius: 5, marginBottom: 1, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, background: active === ch.id ? "rgba(90,63,160,0.35)" : "transparent", color: active === ch.id ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 13, transition: "all 0.15s" }}>
          {ch.lock ? <IconLock s={11} /> : <IconHash s={11} />}
          {ch.label}
          {ch.badge && <span style={{ marginLeft: "auto", fontSize: 10, background: RED, color: "#fff", padding: "1px 5px", borderRadius: 8, fontWeight: 600 }}>{ch.badge}</span>}
        </div>
      ))}
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", padding: "16px 8px 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Direct messages</div>
      <div onClick={() => onNav("chat")} style={{ padding: "5px 10px", borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: active === "chat" ? "rgba(90,63,160,0.35)" : "transparent", color: active === "chat" ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 13 }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>W</div>
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: "#44b700", border: "1.5px solid #16102a" }} />
        </div>
        William
      </div>
    </div>
  );
}

// ── Chat View ──
const WILLIAM_INITIAL_MSG = `So You found me. Good

I'm William and by the time I'm done setting up, I'll know your buyers better than they know themselves. I'll reach them on the right channel, at the right moment, with a message so specific they'll wonder who told me about them.


Click around  this dashboard is yours. This is where you can communicate with me as your new sales hire . The pipeline. The outreach log. The analytics. This is what 10am looks like after you sleep in while I have been still closing deals at 3am.


Message Terry Lee the founder at terrylee@hirewilliam.com
Tell her I sent you and you want in.

She built me. But between us  I'm the one who does all  the work she just checks her emails now`;

const WILLIAM_FINAL_MSG = `Look, I could sit here and chat all day but that's not what I was built for. I was built to fill your calendar with people who want to buy what you're selling. And I'm almost ready to prove it.

I'm not live yet. Message Terry Lee (terrylee@hirewilliam.com) 
I promise she will get you all set`;

function ChatView() {
  const [msgs, setMsgs] = useState([
    { id: "intro", sender: "william", content: WILLIAM_INITIAL_MSG, time: "now" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [chatLocked, setChatLocked] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  function send() {
    const text = input.trim();
    if (!text || chatLocked) return;
    const userMsg = { id: Date.now().toString(), sender: "user", content: text, time: "now" };
    setMsgs(p => [...p, userMsg]);
    setInput("");
    setTyping(true);

    (async () => {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setMsgs(p => [...p, { id: (Date.now() + 1).toString(), sender: "william", content: WILLIAM_FINAL_MSG, time: "now" }]);
      setTyping(false);
      setChatLocked(true);
    })();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 14, padding: isMobile ? "12px 16px" : "22px 24px", borderBottom: `1px solid ${RULE}`, flexShrink: 0, minHeight: isMobile ? 60 : 84 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Avatar initials="W" size={isMobile ? 36 : 46} />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: isMobile ? 9 : 12, height: isMobile ? 9 : 12, borderRadius: "50%", background: "#44b700", border: "2.5px solid #fff" }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: isMobile ? 15 : 18, display: "flex", alignItems: "center", gap: 8, lineHeight: 1.3 }}>
            William
            <span style={{ fontSize: 12, fontWeight: 600, background: PURPLE_PALE, color: PURPLE, padding: "2px 7px", borderRadius: 4 }}>AI</span>
          </div>
          <div style={{ fontSize: isMobile ? 12 : 14, color: GREEN, marginTop: 2 }}>Online - always</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "12px 14px" : "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
            <Avatar initials="W" size={56} />
            <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 12, color: INK }}>Morning. I'm William.</h2>
            <p style={{ fontSize: 14, color: INK_SOFT, maxWidth: 360, marginTop: 6 }}>Tell me about your product, who your ideal customers are, and I'll get to work.</p>
          </div>
        )}

        {msgs.map(m => (
          <div key={m.id} style={{ display: "flex", gap: 10, flexDirection: m.sender === "user" ? "row-reverse" : "row" }}>
            {m.sender === "william" ? <Avatar initials="W" size={28} /> : <Avatar initials="Y" bg={PAPER_WARM} size={28} />}
            <div style={{ maxWidth: "75%", borderRadius: 16, padding: "10px 14px", background: m.sender === "william" ? PAPER_WARM : PURPLE, color: m.sender === "william" ? INK : "#fff" }}>
              <p style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap", margin: 0 }}>{m.content}</p>
              <p style={{ fontSize: 10, marginTop: 4, color: m.sender === "william" ? INK_GHOST : "rgba(255,255,255,0.6)", margin: 0 }}>{m.time}</p>
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
              <span style={{ fontSize: 12, color: INK_SOFT, marginLeft: 4 }}>William is thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={{ padding: isMobile ? "10px 14px" : "14px 20px", borderTop: `1px solid ${RULE}`, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => { if (!chatLocked) setInput(e.target.value); }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={chatLocked ? "Chat ended" : "Message William..."}
            rows={1}
            disabled={chatLocked}
            style={{ flex: 1, resize: "none", borderRadius: 10, border: `1px solid ${RULE}`, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", background: chatLocked ? RULE : PAPER, color: chatLocked ? INK_GHOST : INK, cursor: chatLocked ? "not-allowed" : "text" }}
          />
          <button onClick={send} disabled={!input.trim() || chatLocked} style={{ width: 40, height: 40, borderRadius: 10, background: (input.trim() && !chatLocked) ? PURPLE : RULE, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: (input.trim() && !chatLocked) ? "pointer" : "default", color: "#fff", transition: "all 0.15s" }}>
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
  const [prospects, setProspects] = useState(MOCK_PROSPECTS);
  const [filter, setFilter] = useState({ channel: null, time: null, score: null });
  const [draggedCard, setDraggedCard] = useState(null);
  const isMobile = useIsMobile();

  const stages = [
    { id: "new", label: "New", color: INK_SOFT, desc: "Researching" },
    { id: "contacted", label: "Contacted", color: "#378add", desc: "First message sent" },
    { id: "interested", label: "Interested", color: AMBER, desc: "Positive response" },
    { id: "meeting", label: "Meeting", color: RED, desc: "Call scheduled" },
    { id: "won", label: "Won", color: GREEN, desc: "Customer" },
    { id: "lost", label: "Lost", color: INK_GHOST, desc: "Not a fit" },
  ];

  // Helper: time since activity
  const timeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Helper: determine if lead is stale
  const isStale = (timestamp) => Date.now() - timestamp > 432000000; // 5+ days

  // Helper: get conversion rate
  const getConversionRate = (stageId) => {
    const stageIndex = stages.findIndex(s => s.id === stageId);
    if (stageIndex === 0) return null; // No rate for "New"
    const prevStageId = stages[stageIndex - 1].id;
    const prevCount = prospects.filter(p => p.stage === prevStageId).length;
    const currentCount = prospects.filter(p => p.stage === stageId).length;
    if (prevCount === 0) return null;
    return Math.round((currentCount / prevCount) * 100);
  };

  // Filter prospects
  const filteredProspects = prospects.filter(p => {
    if (filter.channel && p.channel !== filter.channel) return false;
    if (filter.time) {
      const hours = filter.time === "today" ? 24 : filter.time === "week" ? 168 : 720;
      if (Date.now() - p.lastActivityTime > hours * 3600000) return false;
    }
    if (filter.score) {
      const scores = { hot: [80, 100], warm: [50, 79], cold: [0, 49] };
      const range = scores[filter.score];
      if (p.score < range[0] || p.score > range[1]) return false;
    }
    return true;
  });

  // Drag handlers
  const handleDragStart = (e, prospect) => {
    setDraggedCard(prospect);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    if (!draggedCard) return;
    setProspects(p => p.map(prospect => 
      prospect.id === draggedCard.id 
        ? { ...prospect, stage: stageId, lastActivityTime: Date.now(), activities: [...(prospect.activities || []), { time: Date.now(), action: "Manually moved" }] }
        : prospect
    ));
    setDraggedCard(null);
  };

  if (isMobile) {
    return (
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <IconHash s={14} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>pipeline</span>
            <span style={{ fontSize: 11, color: INK_GHOST, marginLeft: 8 }}>{filteredProspects.length} prospects</span>
          </div>
        </div>

        {/* Compact Filters */}
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${RULE}`, display: "flex", gap: 6, alignItems: "center", background: PAPER_WARM, flexShrink: 0, flexWrap: "wrap" }}>
          <select
            value={filter.channel || ""}
            onChange={(e) => setFilter({ ...filter, channel: e.target.value || null })}
            style={{ fontSize: 12, padding: "4px 6px", borderRadius: 6, border: `1px solid ${RULE}`, background: "#fff", cursor: "pointer" }}
          >
            <option value="">All channels</option>
            <option value="email">Email</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
          </select>
          <select
            value={filter.score || ""}
            onChange={(e) => setFilter({ ...filter, score: e.target.value || null })}
            style={{ fontSize: 12, padding: "4px 6px", borderRadius: 6, border: `1px solid ${RULE}`, background: "#fff", cursor: "pointer" }}
          >
            <option value="">All scores</option>
            <option value="hot">Hot (80+)</option>
            <option value="warm">Warm (50-79)</option>
            <option value="cold">Cold (0-49)</option>
          </select>
          {(filter.channel || filter.time || filter.score) && (
            <button
              onClick={() => setFilter({ channel: null, time: null, score: null })}
              style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "none", background: RULE, color: INK, cursor: "pointer" }}
            >Clear</button>
          )}
        </div>

        {/* Vertical list grouped by stage */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {stages.map(st => {
            const items = filteredProspects.filter(p => p.stage === st.id);
            if (items.length === 0) return null;
            return (
              <div key={st.id} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: st.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: st.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{st.label}</span>
                  <span style={{ fontSize: 11, color: INK_GHOST }}>{items.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map(p => (
                    <div key={p.id} style={{ background: "#fff", border: `1px solid ${RULE}`, borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: INK_SOFT }}>{p.company} · {p.role}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: p.score >= 80 ? GREEN : p.score >= 50 ? AMBER : INK_GHOST, marginLeft: 8, flexShrink: 0 }}>{p.score}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Badge text={p.channel} color={p.channel} />
                        <span style={{ fontSize: 10, color: INK_GHOST }}>{timeAgo(p.lastActivityTime)}</span>
                      </div>
                      <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 6, lineHeight: 1.4 }}>{p.lastAction}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {filteredProspects.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: INK_GHOST, fontSize: 14 }}>No prospects match this filter.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconHash s={14} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>pipeline</span>
          <span style={{ fontSize: 11, color: INK_GHOST, marginLeft: 8 }}>{filteredProspects.length} prospects</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${RULE}`, display: "flex", gap: 8, alignItems: "center", background: PAPER_WARM, flexShrink: 0, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: INK_SOFT, textTransform: "uppercase" }}>Filter:</span>
        <select
          value={filter.channel || ""}
          onChange={(e) => setFilter({ ...filter, channel: e.target.value || null })}
          style={{ fontSize: 12, padding: "5px 8px", borderRadius: 6, border: `1px solid ${RULE}`, background: "#fff", cursor: "pointer" }}
        >
          <option value="">All channels</option>
          <option value="email">Email</option>
          <option value="linkedin">LinkedIn</option>
          <option value="instagram">Instagram</option>
        </select>
        <select
          value={filter.time || ""}
          onChange={(e) => setFilter({ ...filter, time: e.target.value || null })}
          style={{ fontSize: 12, padding: "5px 8px", borderRadius: 6, border: `1px solid ${RULE}`, background: "#fff", cursor: "pointer" }}
        >
          <option value="">All time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
        <select
          value={filter.score || ""}
          onChange={(e) => setFilter({ ...filter, score: e.target.value || null })}
          style={{ fontSize: 12, padding: "5px 8px", borderRadius: 6, border: `1px solid ${RULE}`, background: "#fff", cursor: "pointer" }}
        >
          <option value="">All scores</option>
          <option value="hot">Hot (80+)</option>
          <option value="warm">Warm (50-79)</option>
          <option value="cold">Cold (0-49)</option>
        </select>
        {(filter.channel || filter.time || filter.score) && (
          <button
            onClick={() => setFilter({ channel: null, time: null, score: null })}
            style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "none", background: RULE, color: INK, cursor: "pointer" }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", background: PAPER_WARM }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${stages.length}, minmax(160px, 1fr))`, gap: 8, padding: 12, minWidth: stages.length * 168 + "px" }}>
        {stages.map(st => {
          const items = filteredProspects.filter(p => p.stage === st.id);
          const conversionRate = getConversionRate(st.id);
          const prevStageCount = stages.findIndex(s => s.id === st.id) > 0 
            ? filteredProspects.filter(p => p.stage === stages[stages.findIndex(s => s.id === st.id) - 1].id).length 
            : null;

          return (
            <div
              key={st.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, st.id)}
              style={{ display: "flex", flexDirection: "column", gap: 0 }}
            >
              {/* Column Header with Conversion Rate */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: st.color }}>{st.label}</div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: INK_GHOST, background: "#fff", padding: "2px 6px", borderRadius: 6 }}>
                    {items.length}
                  </span>
                </div>
                {conversionRate && (
                  <div style={{ fontSize: 10, color: INK_GHOST, padding: "0 4px" }}>
                    {conversionRate}% converted from {stages[stages.findIndex(s => s.id === st.id) - 1].label}
                  </div>
                )}
                <div style={{ fontSize: 9, color: INK_GHOST, padding: "0 4px", fontStyle: "italic" }}>{st.desc}</div>
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 100 }}>
                {items.map(p => {
                  const stale = isStale(p.lastActivityTime);
                  const recentMove = Date.now() - p.lastActivityTime < 3600000; // moved in last hour
                  
                  return (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p)}
                      style={{
                        background: stale ? `rgba(255,255,255,0.5)` : "#fff",
                        border: recentMove ? `2px solid ${GREEN}` : `1px solid ${RULE}`,
                        borderRadius: 8,
                        padding: "10px 12px",
                        cursor: "grab",
                        opacity: stale ? 0.6 : 1,
                        transition: "all 0.2s",
                        boxShadow: recentMove ? `0 0 8px ${GREEN}40` : "none",
                      }}
                      onDragEnd={() => setDraggedCard(null)}
                    >
                      {/* Card Content */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: INK_SOFT }}>{p.company}</div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: p.score >= 80 ? GREEN : p.score >= 50 ? AMBER : INK_GHOST }}>
                          {p.score}
                        </div>
                      </div>

                      {/* Channel Badge */}
                      <div style={{ marginBottom: 6 }}>
                        <Badge text={p.channel} color={p.channel} />
                      </div>

                      {/* Last Activity */}
                      <div style={{ fontSize: 10, color: INK_GHOST, marginBottom: 6 }}>
                        {p.lastAction}
                      </div>

                      {/* Activity Timeline */}
                      <div style={{ fontSize: 9, display: "flex", alignItems: "center", gap: 4, color: INK_GHOST }}>
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: recentMove ? GREEN : st.color,
                        }} />
                        Moved {timeAgo(p.lastActivityTime)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

// ── Outreach Log ──
function OutreachView() {
  const [filter, setFilter] = useState("all");

  const CONVOS = [
    {
      id: "1", name: "Alex Morin", company: "Shipyard", channel: "linkedin", status: "replied", stage: "Meeting booked",
      stageColor: GREEN, time: "2h ago", avatar: "AM",
      thread: [
        { from: "william", text: "Hey Alex, saw your post about struggling to hire your first SDR. What if you didn't have to? I help solo founders fill their pipeline without hiring. No calls, no contracts, you can see it working in 48 hours. Worth 15 mins?", time: "Yesterday, 11:32 PM", research: "Alex's LinkedIn post from 3 days ago about hiring challenges" },
        { from: "prospect", text: "This looks great, let's chat. Thursday work?", time: "Today, 8:14 AM" },
        { from: "william", text: "Thursday's perfect. I've sent you a calendar link for 2pm - does that work? Looking forward to it.", time: "Today, 8:22 AM" },
        { from: "prospect", text: "Confirmed. See you then.", time: "Today, 8:30 AM" },
      ]
    },
    {
      id: "2", name: "Priya Kumar", company: "DataStack", channel: "email", status: "pending approval", stage: "Awaiting your review",
      stageColor: AMBER, time: "4h ago", avatar: "PK", needsApproval: true,
      thread: [
        { from: "william", text: "Subject: Saw your Product Hunt launch\n\nHey Priya, congrats on the PH launch. 200+ upvotes is solid. Quick question: now that you've got product attention, who's doing outbound to convert that into pipeline? If the answer is \"nobody\" or \"me, badly\" - I might be able to help.", time: "Yesterday, 10:15 PM", research: "Product Hunt launch 4 days ago, 200+ upvotes" },
        { from: "prospect", text: "Hey, thanks! We're actually struggling with exactly this. What does pricing look like?", time: "Today, 6:45 AM" },
        { from: "william", text: "DRAFT - waiting for your approval:\n\nGreat question, Priya. It's $499/month, everything included - outreach, follow-ups, meeting booking, the works. No per-message fees, no contracts. Want me to show you what I'd do for DataStack specifically? I can find 5 prospects and draft outreach right now, free.", time: "Today, 7:02 AM", draft: true },
      ]
    },
    {
      id: "3", name: "Leo Tanaka", company: "Kitemaker", channel: "instagram", status: "replied", stage: "Interested",
      stageColor: AMBER, time: "6h ago", avatar: "LT",
      thread: [
        { from: "william", text: "Hey Leo, been following the Kitemaker journey. Building in public is hard when you're also trying to sell. What if the selling part ran itself?", time: "Yesterday, 9:45 PM", research: "Leo actively posts build-in-public content on Instagram" },
        { from: "prospect", text: "Intrigued. How does this work?", time: "Today, 5:30 AM" },
        { from: "william", text: "Short version: I handle your entire outbound - finding the right people, writing personalised messages, handling replies, booking meetings. You wake up to calls on your calendar instead of an empty pipeline. Want me to show you what I'd send to your ideal customers?", time: "Today, 5:48 AM" },
      ]
    },
    {
      id: "4", name: "Jake Rivera", company: "Launchpad", channel: "email", status: "opened", stage: "Engaged - no reply yet",
      stageColor: "#378add", time: "12h ago", avatar: "JR",
      thread: [
        { from: "william", text: "Subject: Quick question about Launchpad\n\nHey Jake, I've been watching Launchpad grow - the no-code space is heating up. Curious: are you doing any outbound right now, or is it all inbound? Either way, I think I can help you 3x your pipeline this quarter.", time: "2 days ago, 10:00 PM", research: "Recent funding announcement, growing team, no visible outbound" },
        { from: "system", text: "Opened 3 times. Last opened 4 hours ago. No reply yet.", time: "Today" },
        { from: "william", text: "QUEUED - follow-up in 24h:\n\nHey Jake, just bumping this up. I know you're busy shipping - that's exactly why I exist. Happy to show you what personalised outreach to your ICP looks like. Takes 5 minutes to see it.", time: "Scheduled: Tomorrow, 9:00 AM", queued: true },
      ]
    },
    {
      id: "5", name: "Nina Patel", company: "FormFlow", channel: "linkedin", status: "sent", stage: "Contacted",
      stageColor: "#378add", time: "8h ago", avatar: "NP",
      thread: [
        { from: "william", text: "Hi Nina - I noticed FormFlow just crossed 1K users on your changelog. That's the inflection point where outbound starts mattering. Happy to show you what that looks like without hiring.", time: "Yesterday, 11:00 PM", research: "FormFlow changelog update showing 1K users milestone" },
        { from: "system", text: "Connection request accepted. Message delivered.", time: "Today, 3:15 AM" },
      ]
    },
    {
      id: "6", name: "Sara Chen", company: "Metrify", channel: "linkedin", status: "sent", stage: "New - first contact",
      stageColor: INK_SOFT, time: "1d ago", avatar: "SC",
      thread: [
        { from: "william", text: "Hey Sara, saw Metrify is building in the analytics space - competitive market but your positioning around real-time dashboards stands out. Are you doing any outbound to get in front of data teams, or is it all inbound right now?", time: "2 days ago, 11:30 PM", research: "Metrify website review, LinkedIn profile, recent analytics industry posts" },
        { from: "system", text: "Connection request pending.", time: "Yesterday" },
      ]
    },
    {
      id: "7", name: "Dan Fields", company: "Beacon", channel: "email", status: "won", stage: "Signed up",
      stageColor: GREEN, time: "3d ago", avatar: "DF",
      thread: [
        { from: "william", text: "Subject: Beacon + better outbound\n\nHey Dan, I noticed Beacon is hiring its first AE - which tells me you've got product-market fit and now need pipeline. What if you could skip the SDR hire entirely and have someone filling your AE's calendar from day one?", time: "2 weeks ago", research: "Job posting for AE on Beacon careers page" },
        { from: "prospect", text: "This is exactly what we need. Can we talk this week?", time: "12 days ago" },
        { from: "william", text: "Absolutely. I've sent a calendar link - pick any slot that works. Looking forward to showing you what I can do for Beacon.", time: "12 days ago" },
        { from: "system", text: "Meeting held. Dan signed up for HireWilliam.", time: "1 week ago" },
        { from: "prospect", text: "Just signed up. Let's get started.", time: "1 week ago" },
        { from: "william", text: "Welcome aboard, Dan. Already researching your ICP. You'll have your first batch of prospects by tomorrow morning.", time: "1 week ago" },
      ]
    },
  ];

  function Badge({ text, bg, color }) {
    return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: bg, color, whiteSpace: "nowrap" }}>{text}</span>;
  }

  function ChannelBadge({ channel }) {
    const c = { linkedin: { bg: "#e6f1fb", color: "#185fa5", label: "LinkedIn" }, email: { bg: PAPER_WARM, color: INK_SOFT, label: "Email" }, instagram: { bg: PURPLE_PALE, color: PURPLE, label: "Instagram" } };
    const ch = c[channel] || c.email;
    return <Badge text={ch.label} bg={ch.bg} color={ch.color} />;
  }

  function StatusDot({ status }) {
    const colors = { replied: GREEN, "pending approval": AMBER, opened: "#378add", sent: INK_GHOST, won: GREEN };
    return <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[status] || INK_GHOST, flexShrink: 0 }} />;
  }

  function Avatar({ initials, size = 36 }) {
    return <div style={{ width: size, height: size, borderRadius: 8, background: PURPLE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 700, flexShrink: 0 }}>{initials}</div>;
  }

  function MessageBubble({ msg }) {
    const isW = msg.from === "william";
    const isP = msg.from === "prospect";
    const isSys = msg.from === "system";

    if (isSys) {
      return (
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <span style={{ fontSize: 12, color: INK_GHOST, background: PAPER_WARM, padding: "4px 12px", borderRadius: 12 }}>{msg.text}</span>
          <div style={{ fontSize: 11, color: INK_GHOST, marginTop: 4 }}>{msg.time}</div>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: isP ? "row-reverse" : "row", gap: 8, marginBottom: 4 }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: isW ? PURPLE : PAPER_WARM, color: isW ? "#fff" : INK_SOFT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
          {isW ? "W" : "P"}
        </div>
        <div style={{ maxWidth: "80%" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: isW ? PURPLE : INK_MID, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
            {isW ? "William" : "Prospect"}
            {isW && <span style={{ fontSize: 9, fontWeight: 600, background: PURPLE_PALE, color: PURPLE, padding: "1px 5px", borderRadius: 3 }}>AI</span>}
            {msg.draft && <span style={{ fontSize: 9, fontWeight: 600, background: "#fdf2e3", color: AMBER, padding: "1px 5px", borderRadius: 3 }}>DRAFT</span>}
            {msg.queued && <span style={{ fontSize: 9, fontWeight: 600, background: "#e6f1fb", color: "#185fa5", padding: "1px 5px", borderRadius: 3 }}>QUEUED</span>}
          </div>
          <div style={{
            padding: "10px 14px",
            borderRadius: isP ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
            background: isP ? "#e4f5ed" : msg.draft ? "#fdf2e3" : PAPER_WARM,
            border: msg.draft ? `1.5px dashed ${AMBER}` : msg.queued ? `1.5px dashed #378add` : "none",
            fontSize: 14, lineHeight: 1.55, color: INK_MID, whiteSpace: "pre-wrap"
          }}>
            {msg.text}
          </div>
          {msg.research && (
            <div style={{ fontSize: 11, color: INK_GHOST, marginTop: 4, fontStyle: "italic" }}>
              Research: {msg.research}
            </div>
          )}
          <div style={{ fontSize: 11, color: INK_GHOST, marginTop: 3 }}>{msg.time}</div>
        </div>
      </div>
    );
  }

  function ConvoRow({ convo }) {
    const [open, setOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const isMobile = useIsMobile();

    return (
      <div style={{ borderBottom: `1px solid ${RULE}` }}>
        <div
          onClick={() => setOpen(!open)}
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", cursor: "pointer",
            background: open ? PAPER_WARM : "transparent", transition: "background 0.15s",
          }}
        >
          <Avatar initials={convo.avatar} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: INK }}>{convo.name}</span>
              <span style={{ fontSize: 13, color: INK_SOFT }}>{convo.company}</span>
            </div>
            <div style={{ fontSize: 12, color: INK_SOFT, marginTop: 2 }}>{convo.stage}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 8, flexShrink: 0 }}>
            {!isMobile && <ChannelBadge channel={convo.channel} />}
            <StatusDot status={convo.status} />
            <span style={{ fontSize: 12, color: INK_GHOST, minWidth: isMobile ? 30 : 50, textAlign: "right" }}>{convo.time}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={INK_GHOST} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {open && (
          <div style={{ padding: isMobile ? "0 12px 16px 12px" : "0 20px 20px 66px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {convo.thread.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            </div>

            {convo.needsApproval && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                <button style={{ padding: "8px 16px", borderRadius: 8, background: GREEN, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Approve & send</button>
                <button style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", color: INK_SOFT, border: `1px solid ${RULE}`, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Edit before sending</button>
                <button style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", color: RED, border: `1px solid ${RULE}`, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Don't send</button>
              </div>
            )}

            <div style={{ display: "flex", flexWrap: isMobile ? "wrap" : "nowrap", gap: 8 }}>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Jump in and reply yourself..."
                rows={1}
                style={{ flex: 1, minWidth: isMobile ? "100%" : undefined, resize: "none", borderRadius: 8, border: `1px solid ${RULE}`, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff" }}
              />
              <button style={{ padding: "8px 14px", borderRadius: 8, background: replyText.trim() ? PURPLE : RULE, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: replyText.trim() ? "pointer" : "default", transition: "background 0.15s" }}>Send</button>
              {!isMobile && <button style={{ padding: "8px 14px", borderRadius: 8, background: "transparent", color: INK_SOFT, border: `1px solid ${RULE}`, fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>I'll handle this one</button>}
            </div>
          </div>
        )}
      </div>
    );
  }

  const filters = [
    { id: "all", label: "All conversations", count: CONVOS.length },
    { id: "replied", label: "Replied", count: CONVOS.filter(c => c.status === "replied").length },
    { id: "pending approval", label: "Needs approval", count: CONVOS.filter(c => c.status === "pending approval").length },
    { id: "opened", label: "Opened", count: CONVOS.filter(c => c.status === "opened").length },
    { id: "sent", label: "Sent", count: CONVOS.filter(c => c.status === "sent").length },
  ];

  const filtered = filter === "all" ? CONVOS : CONVOS.filter(c => c.status === filter);

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", fontFamily: "'DM Sans', system-ui, sans-serif", color: INK, background: "#fff" }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INK_GHOST} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>
          <span style={{ fontWeight: 600, fontSize: 15 }}>outreach-log</span>
          <span style={{ fontSize: 12, color: INK_GHOST, marginLeft: 4 }}>{CONVOS.length} conversations</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, padding: "12px 20px", borderBottom: `1px solid ${RULE}`, overflowX: "auto", flexShrink: 0 }}>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: "5px 12px", borderRadius: 20, border: `1px solid ${filter === f.id ? PURPLE : RULE}`,
              background: filter === f.id ? PURPLE_PALE : "transparent", color: filter === f.id ? PURPLE : INK_SOFT,
              fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s"
            }}
          >
            {f.label}
            <span style={{ fontSize: 11, fontWeight: 600, background: filter === f.id ? PURPLE : PAPER_WARM, color: filter === f.id ? "#fff" : INK_GHOST, padding: "1px 6px", borderRadius: 10 }}>{f.count}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.map(c => <ConvoRow key={c.id} convo={c} />)}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: INK_GHOST, fontSize: 14 }}>No conversations match this filter.</div>
        )}
      </div>
    </div>
  );
}

// ── Meetings ──
function MeetingsView() {
  const isMobile = useIsMobile();
  const meetings = [
    { id: "1", prospect: "Alex Morin", company: "Shipyard", time: "Thu 2:00 PM", duration: "30 min", status: "confirmed" },
    { id: "2", prospect: "Sarah Kim", company: "BuildKit", time: "Thu 4:30 PM", duration: "15 min", status: "pending" },
    { id: "3", prospect: "Dan Fields", company: "Beacon", time: "Fri 10:00 AM", duration: "30 min", status: "confirmed" },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: isMobile ? "14px 16px" : "18px 20px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <IconHash s={14} />
        <span style={{ fontWeight: 600, fontSize: 15 }}>meetings</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : 20 }}>
        {meetings.map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 14, padding: isMobile ? "12px 14px" : "14px 16px", background: PAPER_WARM, borderRadius: 10, marginBottom: 8, flexWrap: isMobile ? "wrap" : "nowrap" }}>
            <div style={{ width: 48, textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: PURPLE }}>{m.time.split(" ")[0]}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{m.time.split(" ")[1]} {m.time.split(" ")[2]}</div>
            </div>
            <div style={{ width: 1, height: 36, background: RULE, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{m.prospect}</div>
              <div style={{ fontSize: 12, color: INK_SOFT }}>{m.company} · {m.duration}</div>
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
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const isMobile = useIsMobile();

  const stats = [
    { label: "Messages sent", value: 312, change: "+47 today", icon: "📤", color: PURPLE },
    { label: "Replies", value: 38, change: "12.2% rate", icon: "💬", color: GREEN },
    { label: "Meetings booked", value: 11, change: "+2 today", icon: "📅", color: AMBER },
    { label: "Pipeline value", value: 24, change: "Active prospects", icon: "🚀", color: "#378add" },
  ];

  const timeframes = [
    { id: "7d", label: "7 days", data: [
      { day: "Mon", sent: 42, replies: 5 }, { day: "Tue", sent: 47, replies: 6 },
      { day: "Wed", sent: 38, replies: 4 }, { day: "Thu", sent: 51, replies: 7 },
      { day: "Fri", sent: 45, replies: 6 }, { day: "Sat", sent: 44, replies: 5 },
      { day: "Sun", sent: 45, replies: 5 },
    ]},
    { id: "30d", label: "30 days", data: [
      { day: "Week 1", sent: 180, replies: 22 }, { day: "Week 2", sent: 210, replies: 28 },
      { day: "Week 3", sent: 195, replies: 25 }, { day: "Week 4", sent: 235, replies: 32 },
    ]},
    { id: "90d", label: "90 days", data: [
      { day: "Month 1", sent: 780, replies: 95 }, { day: "Month 2", sent: 920, replies: 118 },
      { day: "Month 3", sent: 1050, replies: 142 },
    ]},
  ];

  const currentData = timeframes.find(t => t.id === selectedTimeframe)?.data || timeframes[0].data;
  const maxSent = Math.max(...currentData.map(d => d.sent));

  // Animate counters on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      stats.forEach((stat, index) => {
        let current = 0;
        const increment = stat.value / 50;
        const interval = setInterval(() => {
          current += increment;
          if (current >= stat.value) {
            current = stat.value;
            clearInterval(interval);
          }
          setAnimatedStats(prev => {
            const newStats = [...prev];
            newStats[index] = Math.floor(current);
            return newStats;
          });
        }, 20);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: isMobile ? "12px 16px" : "18px 20px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
          <IconHash s={14} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>analytics</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {timeframes.map(tf => (
            <button
              key={tf.id}
              onClick={() => setSelectedTimeframe(tf.id)}
              style={{
                padding: isMobile ? "3px 7px" : "4px 8px",
                borderRadius: 12,
                border: `1px solid ${selectedTimeframe === tf.id ? PURPLE : RULE}`,
                background: selectedTimeframe === tf.id ? PURPLE_PALE : "transparent",
                color: selectedTimeframe === tf.id ? PURPLE : INK_SOFT,
                fontSize: isMobile ? 10 : 11,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : 20 }}>
        {/* Hero Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(auto-fit, minmax(130px, 1fr))" : "repeat(auto-fit, minmax(200px, 1fr))", gap: isMobile ? 10 : 16, marginBottom: isMobile ? 20 : 32 }}>
          {stats.map((s, index) => (
            <div
              key={s.label}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: hoveredCard === index ? `linear-gradient(135deg, ${PAPER_WARM} 0%, #fff 100%)` : PAPER_WARM,
                borderRadius: 16,
                padding: isMobile ? "14px 10px" : "20px",
                textAlign: "center",
                cursor: "pointer",
                transform: hoveredCard === index ? "translateY(-4px)" : "translateY(0)",
                boxShadow: hoveredCard === index ? `0 8px 25px rgba(90, 99, 160, 0.15)` : "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                border: hoveredCard === index ? `1px solid ${s.color}40` : `1px solid ${RULE}`,
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Animated background pulse */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 50% 50%, ${s.color}15 0%, transparent 70%)`,
                opacity: hoveredCard === index ? 1 : 0,
                transition: "opacity 0.3s"
              }} />

              <div style={{ fontSize: isMobile ? 20 : 26, marginBottom: isMobile ? 4 : 8 }}>{s.icon}</div>
              <div style={{ fontSize: isMobile ? 10 : 12, color: INK_GHOST, marginBottom: isMobile ? 4 : 8, fontWeight: 500 }}>{s.label}</div>
              <div style={{
                fontSize: isMobile ? 26 : 34,
                fontWeight: 800,
                color: s.color,
                marginBottom: 6,
                fontVariantNumeric: "tabular-nums"
              }}>
                {animatedStats[index].toLocaleString()}
              </div>
              <div style={{
                fontSize: isMobile ? 10 : 12,
                color: GREEN,
                fontWeight: 600,
                background: "#e4f5ed",
                padding: isMobile ? "3px 6px" : "4px 8px",
                borderRadius: 12,
                display: "inline-block"
              }}>
                {s.change}
              </div>

              {/* Sparkle effect on hover */}
              {hoveredCard === index && (
                <div style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  fontSize: 17,
                  animation: "sparkle 1.5s ease-in-out infinite"
                }}>
                  ✨
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Interactive Chart Section */}
        <div style={{
          background: PAPER_WARM,
          borderRadius: 16,
          padding: isMobile ? 16 : 24,
          marginBottom: isMobile ? 16 : 24,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
            <div>
              <h3 style={{ fontSize: isMobile ? 14 : 17, fontWeight: 700, color: INK, margin: 0 }}>Activity Overview</h3>
              <p style={{ fontSize: isMobile ? 11 : 13, color: INK_SOFT, margin: 4 }}>Messages sent vs replies over time</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: PURPLE }} />
                <span style={{ fontSize: isMobile ? 10 : 12, color: INK_SOFT }}>Sent</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: GREEN }} />
                <span style={{ fontSize: isMobile ? 10 : 12, color: INK_SOFT }}>Replies</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 4 : 12, height: isMobile ? 140 : 200, padding: isMobile ? "0 4px" : "0 16px" }}>
            {currentData.map((d, index) => (
              <div
                key={d.day}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  transition: "transform 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <div style={{
                  position: "relative",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  alignItems: "center"
                }}>
                  {/* Reply bar */}
                  <div style={{
                    height: Math.max((d.replies / maxSent) * (isMobile ? 100 : 160), 4),
                    width: isMobile ? 14 : 24,
                    background: GREEN,
                    borderRadius: "4px 4px 0 0",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    animation: `slideUp 0.8s ease-out ${index * 0.1}s both`
                  }} />
                  {/* Sent bar */}
                  <div style={{
                    height: Math.max((d.sent / maxSent) * (isMobile ? 100 : 160), 4),
                    width: isMobile ? 18 : 32,
                    background: PURPLE,
                    borderRadius: "4px 4px 0 0",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    animation: `slideUp 0.8s ease-out ${index * 0.1 + 0.2}s both`,
                    position: "relative"
                  }}>
                    {/* Tooltip */}
                    <div style={{
                      position: "absolute",
                      top: -35,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: INK,
                      color: "#fff",
                      padding: "6px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      whiteSpace: "nowrap",
                      opacity: 0,
                      pointerEvents: "none",
                      transition: "opacity 0.2s",
                      zIndex: 10
                    }}>
                      {d.sent} sent, {d.replies} replies
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: isMobile ? 9 : 12, color: INK_SOFT, fontWeight: 500 }}>{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div style={{
          background: `linear-gradient(135deg, ${PAPER_WARM} 0%, #fff 100%)`,
          borderRadius: 16,
          padding: isMobile ? 16 : 24,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ fontSize: isMobile ? 14 : 17, fontWeight: 700, color: INK, margin: "0 0 16px 0" }}>Conversion Funnel</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
            {[
              { stage: "Messages Sent", count: 312, rate: "100%", color: PURPLE },
              { stage: "Replies", count: 38, rate: "12.2%", color: "#378add" },
              { stage: "Interested", count: 15, rate: "39.5%", color: AMBER },
              { stage: "Meetings Booked", count: 11, rate: "73.3%", color: GREEN },
            ].map((stage, index) => (
              <div key={stage.stage} style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 10 : 16,
                padding: isMobile ? 10 : 12,
                background: "#fff",
                borderRadius: 8,
                border: `1px solid ${RULE}`,
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}>
                <div style={{
                  width: isMobile ? 34 : 40,
                  height: isMobile ? 34 : 40,
                  borderRadius: 8,
                  background: stage.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? 12 : 15,
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0
                }}>
                  {stage.count}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, color: INK }}>{stage.stage}</div>
                  <div style={{ fontSize: isMobile ? 10 : 12, color: INK_SOFT }}>{stage.rate} conversion rate</div>
                </div>
                {!isMobile && (
                  <div style={{
                    width: 80,
                    height: 6,
                    background: RULE,
                    borderRadius: 3,
                    overflow: "hidden",
                    flexShrink: 0
                  }}>
                    <div style={{
                      width: `${stage.rate.replace('%', '')}%`,
                      height: "100%",
                      background: stage.color,
                      borderRadius: 3,
                      transition: "width 1s ease-out",
                      animation: `growWidth 1s ease-out ${index * 0.2}s both`
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: scaleY(0); transform-origin: bottom; }
          to { transform: scaleY(1); transform-origin: bottom; }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 0; transform: translateY(0); }
        }
        @keyframes growWidth {
          from { width: 0%; }
          to { width: var(--target-width); }
        }
      `}</style>
    </div>
  );
}

// ── For Founders View ──
function ForFoundersView({ onNav }) {
  const serif = "'Playfair Display', Georgia, 'Times New Roman', serif";
  const sans = "'DM Sans', sans-serif";
  const GREEN_PALE = "#e4f5ed";
  const AMBER_PALE = "#fdf2e3";
  const isMobile = useIsMobile();

  const h2Style = {
    fontFamily: serif,
    fontSize: isMobile ? 20 : 24, fontWeight: 700, color: INK,
    margin: "0 0 14px", lineHeight: 1.25,
  };
  const bodyText = {
    fontFamily: sans,
    fontSize: 14, color: INK_SOFT, lineHeight: 1.7, margin: "0 0 14px",
  };
  const divider = { borderTop: `1px solid ${RULE}`, margin: isMobile ? "28px 0" : "40px 0" };

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflowY: "auto", background: PAPER }}>
      {/* Channel header */}
      <div style={{ padding: "22px 24px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", gap: 6, background: "#fff", flexShrink: 0 }}>
        <IconHash s={14} />
        <span style={{ fontWeight: 600, fontSize: 16 }}>for-founders</span>
      </div>

      <div style={{ flex: 1 }}>
        {/* ── 1. COVER ── */}
        <div style={{ background: "#16102a", padding: isMobile ? "40px 20px 36px" : "56px 40px 52px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 auto 20px" }}>W</div>
          <h1 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 38, fontWeight: 700, color: "#fff", margin: "0 0 14px", lineHeight: 1.15 }}>HireWilliam</h1>
          <p style={{ fontFamily: sans, fontSize: isMobile ? 15 : 17, color: "rgba(255,255,255,0.7)", margin: "0 auto 24px", maxWidth: 440, lineHeight: 1.5 }}>Meet William. Your entire sales team.</p>
          <div style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center", gap: isMobile ? 10 : 20, background: "rgba(255,255,255,0.08)", borderRadius: 100, padding: isMobile ? "8px 16px" : "10px 24px" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>hirewilliam.com</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>$299/month</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Cancel anytime</span>
          </div>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: isMobile ? "0 16px 60px" : "0 32px 80px" }}>

          {/* ── 2. PULL QUOTE ── */}
          <div style={{ borderLeft: `4px solid ${PURPLE}`, background: PURPLE_PALE, borderRadius: "0 12px 12px 0", padding: isMobile ? "16px 18px" : "24px 28px", margin: isMobile ? "28px 0" : "40px 0" }}>
            <p style={{ fontFamily: serif, fontSize: isMobile ? 15 : 18, color: INK, lineHeight: 1.6, margin: 0 }}>
              The average startup spends{" "}
              <em style={{ color: PURPLE, fontStyle: "normal", fontWeight: 700 }}>$62,000 a year</em>
              {" "}on a junior sales rep who takes 3 months to ramp, calls in sick on Mondays, and quits before they're productive. You don't need to hire a sales team. You need to hire William.
            </p>
          </div>

          {/* ── 3. SOUND FAMILIAR ── */}
          <div style={divider} />
          <h2 style={h2Style}>Sound familiar?</h2>
          <p style={bodyText}>It's 11pm. You're writing cold outreach instead of building product. Your pipeline is empty. You've tried the tools - 47 settings, spam filters, a restricted LinkedIn account. <strong>The problem was never the tool. It's that you're a builder, not a salesperson.</strong> The sales industry wants to sell you another framework. Nobody wants to just do the work for you.</p>

          {/* ── 4. UNTIL NOW ── */}
          <div style={divider} />
          <h2 style={h2Style}>Until now</h2>
          <p style={bodyText}>Monday morning. Before coffee, you open your laptop: <em>"Morning. While you were asleep I sent 47 personalised messages. 6 founders replied. 2 want to book a call. I've put them in your Thursday slots."</em></p>
          <p style={bodyText}>Three qualified calls booked. Zero messages sent by you. That's William.</p>

          {/* ── 5. CHANNELS ── */}
          <div style={divider} />
          <h2 style={h2Style}>Where William works</h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, marginBottom: 8 }}>
            {[
              {
                icon: "📧", name: "Email",
                detail: "Cold outreach, follow-ups, reply handling. William manages sequences and adapts based on engagement signals.",
                limit: "Best channel for volume and deliverability.",
              },
              {
                icon: "💼", name: "LinkedIn",
                detail: "Connection requests with personalised notes, DMs based on prospect activity. William operates within platform limits to protect your account.",
                limit: "~20 connection requests/day to stay safe.",
              },
              {
                icon: "📱", name: "Instagram DM",
                detail: "Used selectively for founders who build in public or have active audiences. William identifies these cases and adjusts tone accordingly.",
                limit: "Only where it's genuinely appropriate.",
              },
            ].map(ch => (
              <div key={ch.name} style={{ background: "#fff", border: `1px solid ${RULE}`, borderRadius: 12, padding: "20px" }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{ch.icon}</div>
                <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 700, color: INK, marginBottom: 8 }}>{ch.name}</div>
                <div style={{ fontFamily: sans, fontSize: 13, color: INK_SOFT, lineHeight: 1.6, marginBottom: 10 }}>{ch.detail}</div>
                <div style={{ fontFamily: sans, fontSize: 12, color: INK_GHOST, fontStyle: "italic" }}>{ch.limit}</div>
              </div>
            ))}
          </div>

          {/* ── 6. DASHBOARD MOCKUP ── */}
          <div style={divider} />
          <h2 style={h2Style}>This is what you see every morning</h2>
          <p style={bodyText}>William lives inside a Slack-style interface you already know how to use. He updates you like a colleague, not a dashboard.</p>

          <div style={{ background: "#16102a", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 8 }}>
            <div style={{ padding: "10px 14px", background: "#120d22", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f" }} />
            </div>
            <div style={{ display: "flex", height: isMobile ? "auto" : 340, minHeight: isMobile ? 260 : undefined, overflow: "hidden" }}>
              {/* Sidebar */}
              <div style={{ width: isMobile ? 110 : 170, background: "#120d22", padding: "12px 0", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 12px 12px" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>W</div>
                  {!isMobile && <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>HireWilliam</span>}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", padding: "0 12px 6px" }}>Channels</div>
                {[
                  { name: "talk-to-william", active: true },
                  { name: "pipeline" },
                  { name: "outreach-log" },
                  { name: "hot-leads" },
                  { name: "meetings" },
                  { name: "analytics" },
                ].map(ch => (
                  <div key={ch.name} style={{ padding: "4px 12px", margin: "1px 6px", borderRadius: 4, background: ch.active ? "rgba(90,63,160,0.45)" : "transparent", color: ch.active ? "#fff" : "rgba(255,255,255,0.38)", fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ opacity: 0.5, fontSize: 9 }}>#</span> {ch.name}
                  </div>
                ))}
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", padding: "10px 12px 6px" }}>Direct Messages</div>
                <div style={{ padding: "4px 12px", margin: "1px 6px", borderRadius: 4, color: "rgba(255,255,255,0.38)", fontSize: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: "#fff" }}>W</div>
                  William
                </div>
              </div>
              {/* Chat area */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}># talk-to-william</div>
                <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12, overflowY: "hidden" }}>
                  {[
                    { who: "W", bg: PURPLE, name: "William", msg: "Morning ☀️  While you were asleep I sent 47 personalised messages across email and LinkedIn.", time: "7:01 AM" },
                    { who: "W", bg: PURPLE, name: "William", msg: "6 founders replied. 2 want to book a call - I've put them in your Thursday slots. Nothing left for you to do.", time: "7:02 AM" },
                    { who: "Y", bg: PAPER_WARM, name: "You", msg: "Who are the 2 meetings with?", time: "7:09 AM", right: true },
                    { who: "W", bg: PURPLE, name: "William", msg: "Alex Morin (Shipyard) - Thu 2pm. Nina Patel (FormFlow) - Thu 4pm. Both context notes in #meetings.", time: "7:09 AM" },
                  ].map((m, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: m.right ? "row-reverse" : "row" }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: m.right ? INK : "#fff", flexShrink: 0 }}>{m.who}</div>
                      <div style={{ maxWidth: "72%" }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3, flexDirection: m.right ? "row-reverse" : "row" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: m.right ? "rgba(255,255,255,0.5)" : PURPLE_LIGHT }}>{m.name}</span>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{m.time}</span>
                        </div>
                        <div style={{ background: m.right ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.05)", borderRadius: 8, padding: "7px 10px" }}>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.78)", margin: 0, lineHeight: 1.55 }}>{m.msg}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "8px 12px 12px" }}>
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 7, padding: "7px 12px", fontSize: 11, color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.07)" }}>Message #talk-to-william…</div>
                </div>
              </div>
              {/* Right stats panel */}
              {!isMobile && (
              <div style={{ width: 175, background: "#120d22", borderLeft: "1px solid rgba(255,255,255,0.06)", padding: "12px", flexShrink: 0, overflowY: "hidden" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>Overnight</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
                  {[
                    { label: "Sent", value: "47" },
                    { label: "Replies", value: "6" },
                    { label: "Meetings", value: "2" },
                    { label: "Hot leads", value: "4" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 7, padding: "7px 8px" }}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>Hot leads</div>
                {[
                  { name: "Alex Morin", note: "Replied" },
                  { name: "Priya Kumar", note: "Opened 3×" },
                  { name: "Leo Tanaka", note: "Replied" },
                  { name: "Jake Rivera", note: "Opened" },
                ].map(l => (
                  <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, background: "rgba(90,63,160,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: PURPLE_LIGHT, flexShrink: 0 }}>{l.name.split(" ").filter(n => n).map(n => n[0]).join("")}</div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{l.name}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{l.note}</div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>

          {/* ── 7. PIPELINE ── */}
          <div style={divider} />
          <h2 style={h2Style}>Your pipeline fills itself</h2>
          <p style={bodyText}>Every prospect moves through stages automatically. You always know who's new, who's engaged, who's ready to close.</p>

          <div style={{ background: "#fff", border: `1px solid ${RULE}`, borderRadius: 14, padding: "16px", overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
              {[
                { label: "New", count: 24, color: INK_GHOST, cards: [{ name: "Sara Chen", co: "Metrify", score: 22 }, { name: "Tom Okoro", co: "Stackbase", score: 18 }, { name: "Rachel Green", co: "TechFlow", score: 15 }] },
                { label: "Contacted", count: 15, color: "#378add", cards: [{ name: "Jake Rivera", co: "Launchpad", score: 45 }, { name: "Nina Patel", co: "FormFlow", score: 35 }, { name: "Marcus Chen", co: "BuildFlow", score: 55 }] },
                { label: "Interested", count: 8, color: AMBER, cards: [{ name: "Priya Kumar", co: "DataStack", score: 72 }, { name: "Leo Tanaka", co: "Kitemaker", score: 65 }, { name: "Sofia Rodriguez", co: "PayFlow", score: 78 }] },
                { label: "Meeting", count: 3, color: PURPLE, cards: [{ name: "Alex Morin", co: "Shipyard", score: 90 }] },
                { label: "Won", count: 2, color: GREEN, cards: [{ name: "Dan Fields", co: "Beacon", score: 100 }] },
              ].map(col => (
                <div key={col.label} style={{ flex: "0 0 152px", background: PAPER_WARM, borderRadius: 10, padding: "10px 10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: 0.7 }}>{col.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: INK_GHOST, background: "#fff", borderRadius: 10, padding: "1px 7px" }}>{col.count}</span>
                  </div>
                  {col.cards.map(c => (
                    <div key={c.name} style={{ background: "#fff", borderRadius: 8, padding: "9px 10px", marginBottom: 6, border: `1px solid ${RULE}` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: INK, marginBottom: 2 }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: INK_SOFT, marginBottom: 6 }}>{c.co}</div>
                      <div style={{ height: 4, borderRadius: 2, background: PAPER_WARM, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${c.score}%`, borderRadius: 2, background: col.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ── 8. OUTREACH EXAMPLES ── */}
          <div style={divider} />
          <h2 style={h2Style}>What William actually sends</h2>
          <p style={bodyText}>Every message is visible in your outreach log. Nothing goes out without you knowing. Here's real outreach from William:</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
            {[
              {
                name: "Alex Morin", co: "Shipyard", channel: "LinkedIn", channelColor: "#185fa5", channelBg: "#e6f1fb",
                research: "Referenced his post about hiring struggles",
                message: "Hey Alex, saw your post about struggling to hire your first SDR. What if you didn't have to? I help solo founders fill their pipeline without hiring. No calls, no contracts, you can see it working in 48 hours. Worth 15 mins?",
                status: "replied", statusColor: GREEN, statusBg: GREEN_PALE,
                reply: "This looks great, let's chat. Thursday work?",
              },
              {
                name: "Priya Kumar", co: "DataStack", channel: "Email", channelColor: INK_SOFT, channelBg: PAPER_WARM,
                research: "Referenced Product Hunt launch, 200+ upvotes",
                subject: "Saw your Product Hunt launch",
                message: "Hey Priya, congrats on the PH launch. 200+ upvotes is solid. Quick question: now that you've got product attention, who's doing outbound to convert that into pipeline? If the answer is \"nobody\" or \"me, badly\" - I might be able to help.",
                status: "opened ×3", statusColor: AMBER, statusBg: AMBER_PALE,
              },
              {
                name: "Leo Tanaka", co: "Kitemaker", channel: "Instagram", channelColor: "#c13584", channelBg: "#fce4ec",
                research: "Build-in-public founder - Instagram is his channel",
                message: "Hey Leo - love the build log. The journey from 0 to 200 users is exactly the kind of signal I look for. Question: who's helping you turn that audience into customers? If the answer is nobody, might be worth a quick chat.",
                status: "replied", statusColor: GREEN, statusBg: GREEN_PALE,
                reply: "Tell me more.",
              },
            ].map((ex, i) => (
              <div key={i} style={{ background: "#fff", border: `1px solid ${RULE}`, borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{ex.name}</span>
                    <span style={{ fontSize: 12, color: INK_SOFT }}> · {ex.co}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: ex.channelColor, background: ex.channelBg, borderRadius: 6, padding: "3px 9px" }}>{ex.channel}</span>
                </div>
                <div style={{ background: PAPER_WARM, borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: INK_SOFT, fontStyle: "italic" }}>🔍 {ex.research}</div>
                {ex.subject && <div style={{ fontSize: 11, fontWeight: 600, color: INK_MID, marginBottom: 6 }}>Subject: {ex.subject}</div>}
                <p style={{ fontSize: 12, color: INK, lineHeight: 1.65, margin: "0 0 10px", background: PAPER_WARM, borderRadius: 8, padding: "10px 12px" }}>{ex.message}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: ex.statusColor, background: ex.statusBg, borderRadius: 6, padding: "3px 9px" }}>{ex.status}</span>
                  {ex.reply && <p style={{ fontSize: 12, color: GREEN, margin: 0, fontStyle: "italic" }}>"{ex.reply}"</p>}
                </div>
              </div>
            ))}
          </div>

          <p style={bodyText}>William isn't sending templates. He referenced Alex's LinkedIn post. He mentioned Priya's Product Hunt upvote count. He chose Instagram for Leo because that's where Leo lives. Email would have been the wrong channel. Every message is specific to the person receiving it. William asks for your approval before anything sensitive goes out, and he gets sharper with every correction you make.</p>

          {/* ── 9. COST COMPARISON ── */}
          <div style={divider} />
          <h2 style={h2Style}>What you're really paying for sales right now</h2>
          {isMobile ? (
            /* Mobile: stacked layout */
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {/* SDR card */}
              <div style={{ background: "#fff", border: `1px solid ${RULE}`, borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: "20px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: RED, marginBottom: 4 }}>Junior SDR</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: RED, marginBottom: 16 }}>$5,200<span style={{ fontSize: 14, fontWeight: 600 }}>+/mo</span></div>
                {[
                  ["Base salary", "$3,500/mo"],
                  ["Benefits", "$600/mo"],
                  ["Tools & software", "$400/mo"],
                  ["Management overhead", "$500/mo"],
                  ["Recruitment cost", "$200/mo"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${RULE}`, fontSize: 12 }}>
                    <span style={{ color: INK_SOFT }}>{k}</span>
                    <span style={{ fontWeight: 600, color: INK }}>{v}</span>
                  </div>
                ))}
              </div>
              {/* VS divider */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0", background: PAPER_WARM, border: `1px solid ${RULE}`, borderTop: "none", borderBottom: "none" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK_GHOST }}>vs</div>
              </div>
              {/* William card */}
              <div style={{ background: PURPLE, border: `1px solid ${PURPLE}`, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, padding: "20px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>William</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>$299<span style={{ fontSize: 14, fontWeight: 600 }}>/mo</span></div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>$10/day for a full sales team</div>
                {[
                  ["Subscription", "$299/mo"],
                  ["Setup fee", "$0"],
                  ["Management overhead", "Minimal"],
                  ["Ramp time", "48 hours"],
                  ["Cancel anytime", "Yes"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.15)", fontSize: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.65)" }}>{k}</span>
                    <span style={{ fontWeight: 600, color: "#fff" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Desktop: side-by-side layout */
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0, alignItems: "stretch" }}>
              {/* SDR card */}
              <div style={{ background: "#fff", border: `1px solid ${RULE}`, borderTopLeftRadius: 12, borderBottomLeftRadius: 12, padding: "24px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: RED, marginBottom: 4 }}>Junior SDR</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: RED, marginBottom: 16 }}>$5,200<span style={{ fontSize: 14, fontWeight: 600 }}>+/mo</span></div>
                {[
                  ["Base salary", "$3,500/mo"],
                  ["Benefits", "$600/mo"],
                  ["Tools & software", "$400/mo"],
                  ["Management overhead", "$500/mo"],
                  ["Recruitment cost", "$200/mo"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${RULE}`, fontSize: 12 }}>
                    <span style={{ color: INK_SOFT }}>{k}</span>
                    <span style={{ fontWeight: 600, color: INK }}>{v}</span>
                  </div>
                ))}
              </div>
              {/* VS divider */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
                <div style={{ width: 1, height: 40, background: RULE }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: INK_GHOST, padding: "8px 0" }}>vs</div>
                <div style={{ width: 1, height: 40, background: RULE }} />
              </div>
              {/* William card */}
              <div style={{ background: PURPLE, border: `1px solid ${PURPLE}`, borderTopRightRadius: 12, borderBottomRightRadius: 12, padding: "24px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>William</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>$299<span style={{ fontSize: 14, fontWeight: 600 }}>/mo</span></div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>$10/day for a full sales team</div>
                {[
                  ["Subscription", "$299/mo"],
                  ["Setup fee", "$0"],
                  ["Management overhead", "Minimal"],
                  ["Ramp time", "48 hours"],
                  ["Cancel anytime", "Yes"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.15)", fontSize: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.65)" }}>{k}</span>
                    <span style={{ fontWeight: 600, color: "#fff" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 10. PRICING ── */}
          <div style={divider} />
          <h2 style={h2Style}>One price. Everything included.</h2>
          <div style={{ background: PURPLE, borderRadius: 16, padding: isMobile ? "28px 20px" : "36px 40px", textAlign: "center" }}>
            <div style={{ fontSize: isMobile ? 44 : 52, fontWeight: 800, color: "#fff", lineHeight: 1 }}>$299</div>
            <div style={{ fontFamily: sans, fontSize: 15, color: "rgba(255,255,255,0.65)", marginTop: 6, marginBottom: 20 }}>/month</div>
            <div style={{ fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 20 }}>Cancel anytime. No questions asked.</div>
            <div style={{ textAlign: "left", maxWidth: 480, margin: "0 auto" }}>
              <p style={{ fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: "0 0 12px" }}>Unlimited outreach across email, LinkedIn and Instagram. Personalised messages from real prospect research. Reply handling and follow-ups. Meeting booking into your calendar. Full pipeline and analytics. Human-in-the-loop approval controls. William learns your voice over time.</p>
              <p style={{ fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: 0 }}>No per-message fees. No setup costs. No annual contracts. No feature gates. No tiers. No upsells.</p>
            </div>
          </div>

          {/* ── 11. META PROOF ── */}
          <div style={divider} />
          <h2 style={h2Style}>The proof is in how this works</h2>
          <p style={bodyText}>There's a good chance William found you first. He researched your company, identified you as the right person to reach, and sent a message specific enough that you're now reading this. The outreach you received wasn't written by a marketing team or blasted from a template. It was written for you.</p>
          <p style={{ ...bodyText, fontWeight: 600, color: INK }}>That's exactly what he'll do for your prospects.</p>
          <p style={bodyText}>And he's not done. Right now, William has already identified prospects for founders in your industry. Visit hirewilliam.com and he'll find 5 real prospects for your specific business and draft outreach messages you can use today. Free. No signup. No credit card. Just tell him what you sell.</p>

          {/* ── 12. CTA ── */}
          <div style={divider} />
          <div style={{ background: INK, borderRadius: 16, padding: isMobile ? "28px 20px" : "40px 44px", textAlign: "center" }}>
            <h3 style={{ fontFamily: serif, fontSize: isMobile ? 20 : 26, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>While your competitors' SDR sleeps</h3>
            <p style={{ fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: "0 auto 14px", maxWidth: 520 }}>Your competitors' sales rep clocked off at 6pm. William didn't. He sent 23 messages while they were at dinner, followed up at 6am, and booked a call before their SDR had their morning coffee.</p>
            <p style={{ fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: "0 auto 14px", maxWidth: 520 }}>No onboarding. No sick days. No slow Mondays. No resignation letter. William is available every hour of every day, gets sharper every week, and costs less than a single day of a junior hire.</p>
            <p style={{ fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: "0 auto 24px", maxWidth: 520 }}>He's ready to start right now.</p>
            <button
              onClick={() => onNav("chat")}
              style={{ background: PURPLE, color: "#fff", border: "none", borderRadius: 10, padding: "14px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", touchAction: "manipulation" }}
            >hirewilliam.com</button>
          </div>

          {/* ── 13. FOUNDER FOOTER ── */}
          <div style={divider} />
          <h2 style={h2Style}>Built by a founder, for founders</h2>
          <div style={{ background: "#fff", border: `1px solid ${RULE}`, borderRadius: 14, padding: isMobile ? "20px" : "28px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: 18, alignItems: "flex-start" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0 }}>T</div>
            <div>
              <p style={{ fontFamily: sans, fontSize: 13, color: INK, lineHeight: 1.75, margin: "0 0 12px" }}><strong>I'm Terry Lee.</strong> I hated sales. I was spending 3 hours every night writing cold outreach instead of building product, and getting nowhere. Which founder doesn't know that feeling?</p>
              <p style={{ fontFamily: sans, fontSize: 13, color: INK, lineHeight: 1.75, margin: "0 0 12px" }}>So I built William because I needed him. He was my first sales rep. And once I saw what he could do, I realised every founder needs him too.</p>
              <p style={{ fontFamily: sans, fontSize: 13, color: INK, lineHeight: 1.75, margin: "0 0 12px" }}>Every number in this document, the reply rates, the pipeline stats, the outreach examples, comes from real results on real campaigns. Not forecasts.</p>
              <p style={{ fontFamily: sans, fontSize: 13, color: INK, lineHeight: 1.75, margin: 0 }}>If you want to talk before you sign up, email me directly: <strong>terrylee@hirewilliam.com</strong>. I read everything.</p>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 32, paddingBottom: 32 }}>
            <p style={{ fontFamily: sans, fontSize: 12, color: INK_GHOST }}>hirewilliam.com</p>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Right Panel (shown on chat view) ──
const RIGHT_PANEL_STATS = [{ l: "Sent", v: "47", c: "While you slept" }, { l: "Replies", v: "6", c: "12.7% rate" }, { l: "Meetings", v: "2", c: "Booked Thu" }, { l: "Hot leads", v: "4", c: "Need follow-up" }];

function RightPanel({ isMobile = false }) {
  const hot = MOCK_PROSPECTS.filter(p => p.score >= 45).sort((a, b) => b.score - a.score).slice(0, 4);
  const stats = RIGHT_PANEL_STATS;

  if (isMobile) {
    return (
      <div style={{ borderTop: `1px solid ${RULE}`, padding: "12px 16px 14px", fontSize: 12, background: PAPER, flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: INK_GHOST, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Overnight results</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 12 }}>
          {stats.map(s => (
            <div key={s.l} style={{ background: PAPER_WARM, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: INK_GHOST }}>{s.l}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{s.v}</div>
              <div style={{ fontSize: 9, color: GREEN, lineHeight: 1.2 }}>{s.c}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: INK_GHOST, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Hot leads</div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
          {hot.map(p => {
            const heat = p.score >= 80 ? "hot" : p.score >= 60 ? "warm" : "new";
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <Avatar initials={p.avatar} bg={heat === "hot" ? "#fcebeb" : heat === "warm" ? "#fdf2e3" : "#e6f1fb"} size={22} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: INK_GHOST, whiteSpace: "nowrap" }}>{p.lastAction}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: 210, borderLeft: `1px solid ${RULE}`, padding: "22px 14px 14px", fontSize: 12, background: PAPER, flexShrink: 0, overflowY: "auto" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: INK_GHOST, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Overnight results</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
        {stats.map(s => (
          <div key={s.l} style={{ background: PAPER_WARM, borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: INK_GHOST }}>{s.l}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: GREEN }}>{s.c}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, fontWeight: 600, color: INK_GHOST, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Hot leads</div>
      {hot.map(p => {
        const heat = p.score >= 80 ? "hot" : p.score >= 60 ? "warm" : "new";
        return (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0" }}>
            <Avatar initials={p.avatar} bg={heat === "hot" ? "#fcebeb" : heat === "warm" ? "#fdf2e3" : "#e6f1fb"} size={22} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
              <div style={{ fontSize: 10, color: INK_GHOST }}>{p.lastAction}</div>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const views = {
    chat: <ChatView />,
    pipeline: <PipelineView />,
    outreach: <OutreachView />,
    meetings: <MeetingsView />,
    analytics: <AnalyticsView />,
    founders: <ForFoundersView onNav={setPage} />,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", color: INK, background: "#fff", overflow: "hidden" }}>
      {/* Mobile top bar */}
      {isMobile && (
        <div style={{ display: "flex", alignItems: "center", padding: "0 16px", background: "#16102a", height: 52, flexShrink: 0, gap: 12 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.85)", cursor: "pointer", padding: "6px 4px", display: "flex", flexDirection: "column", gap: 4, touchAction: "manipulation" }}
          >
            <span style={{ display: "block", width: 20, height: 2, background: "currentColor", borderRadius: 2 }} />
            <span style={{ display: "block", width: 20, height: 2, background: "currentColor", borderRadius: 2 }} />
            <span style={{ display: "block", width: 20, height: 2, background: "currentColor", borderRadius: 2 }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>W</div>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>HireWilliam</span>
          </div>
        </div>
      )}

      {/* Main layout row */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Desktop sidebar (always visible) */}
        {!isMobile && <Sidebar active={page} onNav={setPage} />}

        {/* Mobile sidebar overlay */}
        {isMobile && sidebarOpen && (
          <div style={{ position: "absolute", inset: 0, zIndex: 200, display: "flex" }}>
            <Sidebar
              active={page}
              onNav={(p) => { setPage(p); setSidebarOpen(false); }}
              onClose={() => setSidebarOpen(false)}
            />
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ flex: 1, background: "rgba(0,0,0,0.45)" }}
            />
          </div>
        )}

        {/* Content area */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", flexDirection: isMobile && page === "chat" ? "column" : "row" }}>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
            {views[page]}
          </div>
          {page === "chat" && <RightPanel isMobile={isMobile} />}
        </div>
      </div>
    </div>
  );
}
