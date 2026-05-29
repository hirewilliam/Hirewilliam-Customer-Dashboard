import { useState, useEffect, useRef } from "react";
import { getWilliamResponse } from "./claudeApi.js";
import { saveQuizSubmission } from "./firebase.js";

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
function IconChat({ s = 20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function IconMail({ s = 20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function IconCalendar({ s = 20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IconPipeline({ s = 20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="7" width="5" height="14" rx="1"/><rect x="17" y="11" width="5" height="10" rx="1"/></svg>;
}
function IconChart({ s = 20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
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
  const isMobile = useIsMobile();
  const channels = [
    { id: "founders", label: "for-founders", lock: true },
    { id: "chat", label: "talk-to-william", dot: true },
    { id: "outreach", label: "outreach-log", badge: "3" },
    { id: "meetings", label: "meetings", badge: "2" },
    { id: "pipeline", label: "pipeline" },
    { id: "analytics", label: "analytics" },
  ];

  return (
    <div style={{ width: 220, maxWidth: "80vw", background: "#16102a", padding: "20px 12px 14px", color: "rgba(255,255,255,0.45)", fontSize: 14, display: "flex", flexDirection: "column", height: "100%", flexShrink: 0 }}>
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
        <div key={ch.id} onClick={() => onNav(ch.id)} style={{ padding: isMobile ? "8px 10px" : "5px 10px", minHeight: isMobile ? 44 : undefined, borderRadius: 5, marginBottom: 1, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, background: active === ch.id ? "rgba(90,63,160,0.35)" : "transparent", color: active === ch.id ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 13, transition: "all 0.15s", boxSizing: "border-box" }}>
          {ch.lock ? <IconLock s={11} /> : <IconHash s={11} />}
          {ch.label}
          {ch.badge && <span style={{ marginLeft: "auto", fontSize: 10, background: RED, color: "#fff", padding: "1px 5px", borderRadius: 8, fontWeight: 600 }}>{ch.badge}</span>}
        </div>
      ))}
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", padding: "16px 8px 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Direct messages</div>
      <div onClick={() => onNav("chat")} style={{ padding: isMobile ? "8px 10px" : "5px 10px", minHeight: isMobile ? 44 : undefined, borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: active === "chat" ? "rgba(90,63,160,0.35)" : "transparent", color: active === "chat" ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 13, boxSizing: "border-box" }}>
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
const WILLIAM_INTRO_MESSAGES = [
  { id: "intro-1", sender: "william", content: "So You found me. Good", time: "now" },
  { id: "intro-2", sender: "william", content: "I'm William. The AI your business runs on. While you were reading this, I was already mapping your workflows, identifying your bottlenecks, and figuring out exactly where AI makes you the most money the fastest.", time: "now" },
  { id: "intro-4", sender: "william", content: "Message Terry Lee the founder at terrylee@hirewilliam.com\nTell her I sent you and you want in.", time: "now" },
  { id: "intro-5", sender: "william", content: "Fair warning, she's going to sound very calm and in control. That's because I've already done everything. You'll think she's a genius. She is. I'm just also there. Always.", time: "now" },
];

const WILLIAM_FINAL_MSG = `Look, I could sit here and chat all day but that's not what I was built for. I was built to fill your calendar with people who want to buy what you're selling. And I'm almost ready to prove it.

I'm not live yet. Message Terry Lee (terrylee@hirewilliam.com) 
I promise she will get you all set`;

function ChatView() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [chatLocked, setChatLocked] = useState(false);
  const [introPlaying, setIntroPlaying] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  useEffect(() => {
    let cancelled = false;
    async function playIntro() {
      await new Promise(r => setTimeout(r, 600));
      for (const msg of WILLIAM_INTRO_MESSAGES) {
        if (cancelled) return;
        const typingDelay = Math.min(Math.max(msg.content.length * 22, 900), 2800);
        setTyping(true);
        await new Promise(r => setTimeout(r, typingDelay));
        if (cancelled) return;
        setTyping(false);
        setMsgs(p => [...p, msg]);
        await new Promise(r => setTimeout(r, 450));
      }
      if (!cancelled) setIntroPlaying(false);
    }
    playIntro();
    return () => { cancelled = true; };
  }, []);

  function send() {
    const text = input.trim();
    if (!text || chatLocked || introPlaying) return;
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
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 14, padding: isMobile ? "8px 16px" : "22px 24px", borderBottom: `1px solid ${RULE}`, flexShrink: 0, minHeight: isMobile ? 60 : 84, boxSizing: "border-box" }}>
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

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: isMobile ? "12px 14px" : "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
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
            onChange={e => { if (!chatLocked && !introPlaying) setInput(e.target.value); }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={introPlaying ? "William is typing..." : chatLocked ? "Chat ended" : "Message William..."}
            rows={1}
            disabled={chatLocked || introPlaying}
            style={{ flex: 1, resize: "none", borderRadius: 10, border: `1px solid ${RULE}`, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", background: (chatLocked || introPlaying) ? RULE : PAPER, color: (chatLocked || introPlaying) ? INK_GHOST : INK, cursor: (chatLocked || introPlaying) ? "not-allowed" : "text" }}
          />
          <button onClick={send} disabled={!input.trim() || chatLocked || introPlaying} style={{ width: 40, height: 40, borderRadius: 10, background: (input.trim() && !chatLocked && !introPlaying) ? PURPLE : RULE, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: (input.trim() && !chatLocked && !introPlaying) ? "pointer" : "default", color: "#fff", transition: "all 0.15s" }}>
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
  const [expandedCardId, setExpandedCardId] = useState(null);
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

        {/* Compact Filters — channel + time + score */}
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
            value={filter.time || ""}
            onChange={(e) => setFilter({ ...filter, time: e.target.value || null })}
            style={{ fontSize: 12, padding: "4px 6px", borderRadius: 6, border: `1px solid ${RULE}`, background: "#fff", cursor: "pointer" }}
          >
            <option value="">All time</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
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

        {/* Vertical list grouped by stage — all 6 stages always shown */}
        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "12px 16px" }}>
          {stages.map(st => {
            const items = filteredProspects.filter(p => p.stage === st.id);
            const conversionRate = getConversionRate(st.id);
            const prevStage = stages[stages.findIndex(s => s.id === st.id) - 1];
            return (
              <div key={st.id} style={{ marginBottom: 20 }}>
                {/* Stage header: dot + label + count + conversion rate + description */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 28 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: st.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: st.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{st.label}</span>
                    <span style={{ fontSize: 11, color: INK_GHOST }}>{items.length}</span>
                  </div>
                  {conversionRate !== null && prevStage && (
                    <div style={{ fontSize: 10, color: INK_GHOST, marginLeft: 16, marginTop: 2 }}>
                      {conversionRate}% converted from {prevStage.label}
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: INK_GHOST, fontStyle: "italic", marginLeft: 16, marginTop: 1 }}>{st.desc}</div>
                </div>

                {items.length === 0 ? (
                  <div style={{ padding: "12px 16px", background: PAPER_WARM, borderRadius: 8, fontSize: 12, color: INK_GHOST, textAlign: "center" }}>No prospects</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.map(p => {
                      const stale = isStale(p.lastActivityTime);
                      const recentMove = Date.now() - p.lastActivityTime < 3600000;
                      const isExpanded = expandedCardId === p.id;
                      return (
                        <div key={p.id}>
                          <div
                            onClick={() => setExpandedCardId(isExpanded ? null : p.id)}
                            style={{
                              background: stale ? "rgba(255,255,255,0.5)" : "#fff",
                              border: recentMove ? `2px solid ${GREEN}` : `1px solid ${RULE}`,
                              borderRadius: 10,
                              padding: "14px 16px",
                              opacity: stale ? 0.7 : 1,
                              cursor: "pointer",
                              boxShadow: recentMove ? `0 0 8px ${GREEN}40` : "none",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{p.name}</div>
                                <div style={{ fontSize: 11, color: INK_SOFT }}>{p.company} · {p.role}</div>
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: p.score >= 80 ? GREEN : p.score >= 50 ? AMBER : INK_GHOST, marginLeft: 8, flexShrink: 0 }}>{p.score}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                              <Badge text={p.channel} color={p.channel} />
                            </div>
                            <div style={{ fontSize: 11, color: INK_SOFT, lineHeight: 1.4, marginBottom: 6 }}>{p.lastAction}</div>
                            {/* "Moved X ago" timeline dot */}
                            <div style={{ fontSize: 9, display: "flex", alignItems: "center", gap: 4, color: INK_GHOST }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: recentMove ? GREEN : st.color, display: "inline-block" }} />
                              Moved {timeAgo(p.lastActivityTime)}
                            </div>
                          </div>

                          {/* Inline stage-move row (tap-to-expand) */}
                          {isExpanded && (
                            <div style={{ background: PAPER_WARM, border: `1px solid ${RULE}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "10px 12px" }}>
                              <div style={{ fontSize: 10, color: INK_GHOST, marginBottom: 8 }}>Move to stage:</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {stages.filter(s => s.id !== st.id).map(s => (
                                  <button
                                    key={s.id}
                                    onClick={() => {
                                      setProspects(prev => prev.map(prospect =>
                                        prospect.id === p.id
                                          ? { ...prospect, stage: s.id, lastActivityTime: Date.now(), activities: [...(prospect.activities || []), { time: Date.now(), action: "Manually moved" }] }
                                          : prospect
                                      ));
                                      setExpandedCardId(null);
                                    }}
                                    style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 6, border: `1px solid ${s.color}`, background: "#fff", color: s.color, cursor: "pointer" }}
                                  >
                                    {s.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
        { from: "prospect", text: "Hey, thanks! We're actually struggling with exactly this. How does this work?", time: "Today, 6:45 AM" },
        { from: "william", text: "DRAFT - waiting for your approval:\n\nGreat question, Priya. Short version: I handle the full outbound motion - finding the right people, writing personalised outreach, managing replies, booking meetings. Want me to show you what I'd do for DataStack specifically? I can find 5 prospects and draft outreach right now, no commitment.", time: "Today, 7:02 AM", draft: true },
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

  function ChannelBadge({ channel, compact = false }) {
    const c = { linkedin: { bg: "#e6f1fb", color: "#185fa5", label: "LinkedIn", icon: "in" }, email: { bg: PAPER_WARM, color: INK_SOFT, label: "Email", icon: "✉" }, instagram: { bg: PURPLE_PALE, color: PURPLE, label: "Instagram", icon: "ig" } };
    const ch = c[channel] || c.email;
    if (compact) {
      return (
        <span aria-label={ch.label} style={{ fontSize: 9, fontWeight: 700, background: ch.bg, color: ch.color, padding: "2px 5px", borderRadius: 4, flexShrink: 0, letterSpacing: 0.2 }}>
          {ch.icon}
        </span>
      );
    }
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
            display: "flex", alignItems: "center", gap: 12, padding: isMobile ? "12px 16px" : "14px 20px", cursor: "pointer",
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
            {isMobile && <ChannelBadge channel={convo.channel} compact />}
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
            {isMobile && (
              <button style={{ marginTop: 8, width: "100%", padding: "8px 14px", borderRadius: 8, background: "transparent", color: INK_SOFT, border: `1px solid ${RULE}`, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>I'll handle this one</button>
            )}
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

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        {filtered.map(c => <ConvoRow key={c.id} convo={c} />)}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: INK_GHOST, fontSize: 14 }}>No conversations match this filter.</div>
        )}
      </div>
    </div>
  );
}

// ── MEETINGS SECTION — YEAR 3030 ──────────────────────────────────────────

// Neural particle field
function NeuralCanvas() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ particles: [], mouse: { x: -9999, y: -9999 }, raf: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const state = stateRef.current;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const COLORS = ["#8b5cf6", "#22d3ee", "#a78bfa", "#06b6d4", "#c4b5fd", "#67e8f9", "#ffffff"];
    state.particles = Array.from({ length: 95 }, () => {
      const r = Math.random() * 2.0 + 0.4;
      return {
        x: Math.random() * (canvas.width || 500),
        y: Math.random() * (canvas.height || 700),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r, baseR: r,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.012 + Math.random() * 0.022,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.65 + 0.2,
      };
    });

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const src = e.touches ? e.touches[0] : e;
      state.mouse = { x: src.clientX - rect.left, y: src.clientY - rect.top };
    };
    const onLeave = () => { state.mouse = { x: -9999, y: -9999 }; };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onMove, { passive: true });
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("touchend", onLeave);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { particles, mouse } = state;

      particles.forEach(p => {
        p.phase += p.phaseSpeed;
        p.r = Math.max(0.1, p.baseR + Math.sin(p.phase) * 0.7);
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 0) {
          const f = (140 - dist) / 140;
          p.vx -= (dx / dist) * f * 1.8;
          p.vy -= (dy / dist) * f * 1.8;
        }
        p.vx *= 0.963; p.vy *= 0.963;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > canvas.width) { p.x = canvas.width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy *= -1; }

        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 105) {
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, a.color);
            grad.addColorStop(1, b.color);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = grad;
            ctx.globalAlpha = (1 - d / 105) * 0.22;
            ctx.lineWidth = 0.7;
            ctx.shadowBlur = 4;
            ctx.shadowColor = "#8b5cf6";
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
          }
        }
      }
      state.raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(state.raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("touchend", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />;
}

// Rotating radar with sweep + blips
function RadarCanvas() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const angleRef = useRef(0);
  const SIZE = typeof window !== "undefined" && window.innerWidth < 480 ? 86 : 110;
  const blips = [
    { angle: 42,  dist: 0.62, color: "#22d3ee" },
    { angle: 155, dist: 0.72, color: "#fbbf24" },
    { angle: 248, dist: 0.52, color: "#22d3ee" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = SIZE / 2, cy = SIZE / 2, r = SIZE / 2 - 3;

    const draw = () => {
      angleRef.current = (angleRef.current + 1.1) % 360;
      const sweep = (angleRef.current - 90) * Math.PI / 180;
      ctx.clearRect(0, 0, SIZE, SIZE);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = "#04010d";
      ctx.fillRect(0, 0, SIZE, SIZE);

      [0.33, 0.66, 1].forEach(s => {
        ctx.beginPath();
        ctx.arc(cx, cy, r * s, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(34,211,238,0.07)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
      ctx.strokeStyle = "rgba(34,211,238,0.04)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      const trail = 70 * Math.PI / 180;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, "rgba(34,211,238,0.0)");
      grad.addColorStop(0.5, "rgba(34,211,238,0.05)");
      grad.addColorStop(1, "rgba(34,211,238,0.14)");
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, sweep - trail, sweep);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(sweep), cy + r * Math.sin(sweep));
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 7;
      ctx.shadowColor = "#22d3ee";
      ctx.stroke();
      ctx.shadowBlur = 0;

      blips.forEach(b => {
        const br = (b.angle - 90) * Math.PI / 180;
        const bx = cx + b.dist * r * Math.cos(br);
        const by = cy + b.dist * r * Math.sin(br);
        const diff = ((angleRef.current - b.angle + 360) % 360);
        const fade = diff < 55 ? 1 - diff / 55 : 0.28;
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.globalAlpha = 0.35 + fade * 0.65;
        ctx.shadowBlur = 8 + fade * 14;
        ctx.shadowColor = b.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        if (fade > 0.45) {
          ctx.beginPath();
          ctx.arc(bx, by, 3.5 + 3.5 * fade, 0, Math.PI * 2);
          ctx.strokeStyle = b.color;
          ctx.globalAlpha = (fade - 0.45) * 0.5;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });

      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(34,211,238,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={canvasRef} width={SIZE} height={SIZE} style={{ display: "block", borderRadius: "50%", flexShrink: 0 }} />;
}

// Sliding heartbeat line
function HeartbeatLine() {
  return (
    <div style={{ width: "100%", overflow: "hidden", height: 22, position: "relative" }}>
      <svg width="100%" height="22" viewBox="0 0 260 22" preserveAspectRatio="none" style={{ display: "block" }}>
        <line x1="0" y1="11" x2="260" y2="11" stroke="rgba(34,211,238,0.1)" strokeWidth="1" />
      </svg>
      <svg style={{ position: "absolute", top: 0, left: 0, animation: "hb-slide 3.4s linear infinite", overflow: "visible" }} width="80" height="22" viewBox="0 0 80 22">
        <polyline points="0,11 18,11 26,3 34,19 42,11 80,11" fill="none" stroke="#22d3ee" strokeWidth="1.5" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
      </svg>
    </div>
  );
}

// SVG waveform week selector
function WaveformRail({ days, meetingsByDay, selectedDay, onSelect }) {
  const ELP = "#8b5cf6", ELC = "#22d3ee", DIM = "#b0ada4";
  const isMob = typeof window !== "undefined" && window.innerWidth < 480;
  const DW = isMob ? 32 : 38, BW = isMob ? 11 : 13, H = isMob ? 34 : 40, MAX = isMob ? 22 : 28;
  const W = days.length * DW;
  return (
    <svg viewBox={`0 0 ${W} ${H + 16}`} width="100%" height={H + 16} style={{ display: "block" }}>
      {days.map((d, i) => {
        const cnt = meetingsByDay[d].length;
        const bh = cnt > 0 ? Math.max(10, (cnt / 3) * MAX) : 3;
        const x = i * DW + (DW - BW) / 2;
        const y = H - bh;
        const active = selectedDay === d;
        const hasM = cnt > 0;
        const col = active ? ELC : hasM ? ELP : "rgba(139,92,246,0.12)";
        return (
          <g key={d} onClick={() => hasM && onSelect(active ? null : d)} style={{ cursor: hasM ? "pointer" : "default" }}>
            <rect x={x} y={H - 3} width={BW} height={3} rx={1.5} fill="rgba(139,92,246,0.08)" />
            <rect x={x} y={y} width={BW} height={bh} rx={3} fill={col}
              opacity={active ? 1 : hasM ? 0.6 : 1}
              style={{ filter: active ? `drop-shadow(0 0 6px ${ELC})` : hasM ? `drop-shadow(0 0 3px ${ELP})` : "none" }}
            />
            {active && <line x1={x + BW / 2} y1={0} x2={x + BW / 2} y2={H - 3} stroke={ELC} strokeWidth="1" strokeDasharray="3,3" opacity="0.35" />}
            {hasM && !active && <circle cx={x + BW / 2} cy={y - 5} r={2} fill={ELP} style={{ animation: `sf-blink 2s ease-in-out infinite`, animationDelay: `${i * 0.28}s` }} />}
            <text x={x + BW / 2} y={H + 13} textAnchor="middle" fill={active ? ELC : hasM ? "#3d3b35" : DIM} fontSize="7" fontWeight="800" letterSpacing="0.07em" style={{ fontFamily: "inherit" }}>
              {d.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Typewriter system log — types each entry character by character
function TypewriterLog({ entries, okColor }) {
  const [revealed, setRevealed] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => { setRevealed(0); setChars(0); }, [entries]);

  useEffect(() => {
    if (revealed >= entries.length) return;
    const entry = entries[revealed];
    if (chars < entry.log.length) {
      const t = setTimeout(() => setChars(c => c + 1), 15);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setRevealed(r => r + 1); setChars(0); }, 150);
    return () => clearTimeout(t);
  }, [revealed, chars, entries]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {entries.map((e, i) => {
        if (i > revealed) return null;
        const isLast = i === entries.length - 1;
        const text = i < revealed ? e.log : e.log.slice(0, chars);
        const cursor = i === revealed && chars < e.log.length;
        return (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: isLast ? okColor : "#72706a", minWidth: 36, flexShrink: 0, fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em", paddingTop: 1 }}>{e.t}</span>
            <span style={{ fontSize: 13, color: isLast ? okColor : "#3d3b35", fontWeight: isLast ? 700 : 400, lineHeight: 1.45, textShadow: isLast ? `0 0 12px ${okColor}66` : "none" }}>
              {text}{cursor && <span style={{ animation: "sf-blink 0.55s step-end infinite", color: "#22d3ee" }}>_</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Meetings ──
function MeetingsView() {
  const isMobile = useIsMobile();
  const [expanded, setExpanded]   = useState(null);
  const [count, setCount]         = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const SF   = "#faf9f6";
  const CARD = "#ffffff";
  const ELP  = "#8b5cf6";
  const ELC  = "#22d3ee";
  const ELG  = "#10b981";
  const ELA  = "#fbbf24";
  const TX   = "#0f0e0c";
  const DIM  = "#72706a";
  const BR   = "#ddd9d0";

  const chCol = ch => ({ LinkedIn: "#3b82f6", Email: ELG, Instagram: "#ec4899" }[ch] || ELP);
  const chLbl = ch => ({ LinkedIn: "LI", Email: "EM", Instagram: "IG" }[ch] || "--");

  const meetings = [
    {
      id: "1", prospect: "Alex Morin", company: "Shipyard", avatar: "AM",
      time: "Thu 2:00 PM", day: "Thu", status: "confirmed",
      channel: "LinkedIn", freq: "LI-7749", value: "$12k",
      trail: [
        { t: "06:14", log: "Prospect identified — LinkedIn AE hiring signal" },
        { t: "06:15", log: "Message constructed, referenced job post" },
        { t: "06:15", log: "Dispatched via LinkedIn DM" },
        { t: "09:33", log: "Reply received — positive intent" },
        { t: "09:34", log: "Calendar link dispatched" },
        { t: "09:41", log: "SIGNAL LOCKED — Thu 2:00 PM" },
      ],
    },
    {
      id: "2", prospect: "Sarah Kim", company: "BuildKit", avatar: "SK",
      time: "Thu 4:30 PM", day: "Thu", status: "pending",
      channel: "Email", freq: "EM-3312", value: "$8k",
      trail: [
        { t: "05:02", log: "Prospect identified — Product Hunt launch" },
        { t: "05:03", log: "Cold email constructed, launch day referenced" },
        { t: "05:03", log: "Dispatched via email" },
        { t: "07:55", log: "Reply received — info requested" },
        { t: "07:55", log: "Follow-up sent with calendar link" },
        { t: "—",     log: "AWAITING CONFIRMATION" },
      ],
    },
    {
      id: "3", prospect: "Dan Fields", company: "Beacon", avatar: "DF",
      time: "Fri 10:00 AM", day: "Fri", status: "confirmed",
      channel: "Instagram", freq: "IG-5501", value: "$15k",
      trail: [
        { t: "04:11", log: "Prospect identified — Instagram build post" },
        { t: "04:12", log: "DM constructed, post content referenced" },
        { t: "04:12", log: "Dispatched via Instagram DM" },
        { t: "05:08", log: "Reply received in 57 min — strong interest" },
        { t: "05:09", log: "Calendar link dispatched" },
        { t: "05:22", log: "SIGNAL LOCKED — Fri 10:00 AM" },
      ],
    },
  ];

  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const meetingsByDay = days.reduce((a, d) => { a[d] = meetings.filter(m => m.day === d); return a; }, {});
  const visible = selectedDay ? meetings.filter(m => m.day === selectedDay) : meetings;

  useEffect(() => {
    let i = 0;
    const go = () => { i++; setCount(i); if (i < meetings.length) setTimeout(go, 300); };
    setTimeout(go, 900);
  }, []);

  const tilts = [0, 0, 0];

  return (
    <div style={{ flex:1, minHeight:0, display:"flex", flexDirection:"column", background:SF, overflow:"hidden", position:"relative" }}>
      <style>{`
        @keyframes sf-scan    { 0%{top:-1px;opacity:0} 5%{opacity:.8} 95%{opacity:.35} 100%{top:100%;opacity:0} }
        @keyframes sf-live    { 0%,100%{opacity:1;transform:scale(1);box-shadow:0 0 0 0 rgba(16,185,129,.8)} 60%{opacity:.6;transform:scale(.75);box-shadow:0 0 0 7px rgba(16,185,129,0)} }
        @keyframes sf-blink   { 0%,49%,100%{opacity:1} 50%,99%{opacity:.18} }
        @keyframes sf-conf    { 0%,100%{box-shadow:0 0 0 1px rgba(139,92,246,.28),0 4px 22px rgba(139,92,246,.07)} 50%{box-shadow:0 0 0 1px rgba(139,92,246,.58),0 4px 32px rgba(139,92,246,.18)} }
        @keyframes sf-pend    { 0%,100%{box-shadow:0 0 0 1px rgba(251,191,36,.22),0 4px 18px rgba(251,191,36,.06)} 50%{box-shadow:0 0 0 1px rgba(251,191,36,.52),0 4px 26px rgba(251,191,36,.14)} }
        @keyframes sf-open    { 0%,100%{box-shadow:0 0 0 1px rgba(34,211,238,.55),0 8px 40px rgba(34,211,238,.16),0 0 70px rgba(139,92,246,.09)} 50%{box-shadow:0 0 0 1px rgba(34,211,238,.9),0 8px 55px rgba(34,211,238,.28),0 0 90px rgba(139,92,246,.13)} }
        @keyframes sf-enter   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sf-bar     { 0%{left:-45%} 100%{left:110%} }
        @keyframes hb-slide   { from{transform:translateX(-90px)} to{transform:translateX(calc(100vw + 90px))} }
        @keyframes count-glow { 0%,100%{text-shadow:0 0 22px rgba(139,92,246,.55),0 0 44px rgba(139,92,246,.28)} 50%{text-shadow:0 0 32px rgba(139,92,246,.9),0 0 64px rgba(139,92,246,.45),0 0 90px rgba(34,211,238,.18)} }
        @keyframes sf-orbit-cw  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)} }
        @keyframes sf-orbit-ccw { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
      `}</style>

      {/* Full-section particle field */}
      <NeuralCanvas />

      {/* Single clean scan line */}
      <div style={{ position:"absolute", left:0, right:0, height:"1px", zIndex:2, pointerEvents:"none", background:`linear-gradient(90deg,transparent,${ELP},${ELC},transparent)`, animation:"sf-scan 12s linear infinite" }} />

      {/* ── The Bridge ── */}
      <div style={{ position:"relative", zIndex:4, flexShrink:0, padding: isMobile ? "18px 16px 14px" : "22px 24px 16px", borderBottom:`1px solid ${BR}`, backdropFilter:"blur(18px)", background:"rgba(250,249,246,0.97)" }}>
        <div style={{ display:"flex", alignItems:"center", gap: isMobile ? 16 : 22 }}>

          {/* Radar */}
          <div style={{ position:"relative", flexShrink:0 }}>
            <RadarCanvas />
            <div style={{ position:"absolute", bottom:-3, right:-3, width:20, height:20, borderRadius:"50%", background:ELP, border:`2px solid ${SF}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, color:"#fff" }}>
              {meetings.filter(m => m.status === "confirmed").length}
            </div>
          </div>

          {/* Info panel */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:ELG, flexShrink:0, animation:"sf-live 2s ease-in-out infinite" }} />
              <span style={{ fontSize: isMobile ? 9 : 8, letterSpacing:"0.16em", color:ELC, fontWeight:700, textTransform:"uppercase" }}>Neural Link Active · William AI</span>
            </div>

            <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:5 }}>
              <span style={{ fontSize: isMobile ? 40 : 50, fontWeight:900, color:TX, lineHeight:1, fontVariantNumeric:"tabular-nums", animation:"count-glow 3.2s ease-in-out infinite" }}>{count}</span>
              <span style={{ fontSize:11, color:DIM, lineHeight:1.4 }}>signals<br/>locked</span>
            </div>

            <div style={{ fontSize:12, color:DIM, marginBottom:10, fontWeight:400 }}>
              William locked {meetings.length} signals this week.
            </div>

            <HeartbeatLine />

            <div style={{ display:"flex", gap:isMobile ? 8 : 16, marginTop:10, flexWrap:"wrap" }}>
              {[{l:"IN PROGRESS",v:"2",c:ELA},{l:"NEXT CALL",v:"4h 22m",c:ELG},{l:"PIPELINE",v:"$35k",c:ELC}].map(({l,v,c}) => (
                <div key={l} style={{ minWidth: isMobile ? 60 : "auto" }}>
                  <div style={{ fontSize: isMobile ? 8 : 7, letterSpacing:"0.1em", color:DIM, fontWeight:700 }}>{l}</div>
                  <div style={{ fontSize: isMobile ? 13 : 12, fontWeight:800, color:c, marginTop:2, textShadow:`0 0 10px ${c}55` }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Waveform Week Rail ── */}
      <div style={{ position:"relative", zIndex:4, padding: isMobile ? "10px 16px 2px" : "10px 24px 2px", borderBottom:`1px solid ${BR}`, flexShrink:0, backdropFilter:"blur(12px)", background:"rgba(250,249,246,0.97)" }}>
        <WaveformRail days={days} meetingsByDay={meetingsByDay} selectedDay={selectedDay} onSelect={setSelectedDay} />
      </div>

      {/* ── Signal File Cards ── */}
      <div style={{ position:"relative", zIndex:4, flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding: isMobile ? "12px" : "16px 20px", display:"flex", flexDirection:"column", gap:11 }}>
        {visible.map((m, i) => {
          const isOpen = expanded === m.id;
          const ok     = m.status === "confirmed";
          const ch     = chCol(m.channel);
          const hov    = hoveredCard === m.id && !isMobile;
          const tilt   = (!isMobile && !isOpen) ? (tilts[i] ?? 0) : 0;
          const okCol  = ok ? ELG : ELA;

          return (
            <div key={m.id} style={{ position:"relative", animation:`sf-enter 0.36s ease ${i * 95}ms both` }}>
              {/* Hover ghost reflection */}
              {hov && !isOpen && (
                <div style={{ position:"absolute", inset:0, borderRadius:14, background:ch, opacity:0.06, transform:"translateY(9px) scale(0.96)", filter:"blur(18px)", zIndex:-1, pointerEvents:"none" }} />
              )}
              <div
                onClick={() => setExpanded(isOpen ? null : m.id)}
                onMouseEnter={() => setHoveredCard(m.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  borderRadius:12, cursor:"pointer",
                  background:CARD, backdropFilter:"blur(26px)",
                  borderLeft:`3px solid ${ch}`,
                  boxShadow: `inset 4px 0 18px ${ch}18`,
                  transition:"transform 0.22s ease, box-shadow 0.22s ease",
                  transform: isOpen ? "translateY(-2px)" : hov ? "translateY(-4px)" : "none",
                  animation: isOpen ? "sf-open 2.6s ease-in-out infinite" : ok ? "sf-conf 3.8s ease-in-out infinite" : "sf-pend 3.8s ease-in-out infinite",
                }}
              >
                {/* Card face */}
                <div style={{ display:"flex", alignItems:"center", gap:13, padding: isMobile ? "14px 14px" : "16px 18px" }}>
                  {/* Spinning ring avatar */}
                  <div style={{ position:"relative", width:44, height:44, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:`1.5px dashed ${ch}`, opacity:0.45, animation:"sf-orbit-cw 9s linear infinite" }} />
                    <div style={{ position:"absolute", inset:5, borderRadius:"50%", border:`1px solid ${ch}22`, animation:"sf-orbit-ccw 14s linear infinite" }} />
                    <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${ch}28,${ch}0c)`, border:`1px solid ${ch}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:ch, letterSpacing:"0.04em" }}>
                      {m.avatar}
                    </div>
                  </div>

                  {/* Name + freq */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize: isMobile ? 14 : 15, fontWeight:700, color:TX, letterSpacing:"0.01em" }}>{m.prospect}</div>
                    <div style={{ fontSize: isMobile ? 11 : 10, color:DIM, letterSpacing:"0.04em", marginTop:3 }}>
                      {m.company} &nbsp;·&nbsp; <span style={{ color:ch }}>{m.freq}</span>
                    </div>
                  </div>

                  {/* Time block — departure board style */}
                  <div style={{ textAlign:"right", flexShrink:0, marginRight:4 }}>
                    <div style={{ fontSize:7, letterSpacing:"0.14em", color:DIM, fontWeight:700, marginBottom:2 }}>{m.time.split(" ")[0].toUpperCase()}</div>
                    <div style={{ fontSize: isMobile ? 15 : 18, fontWeight:900, color:TX, fontVariantNumeric:"tabular-nums", lineHeight:1 }}>
                      {m.time.split(" ").slice(1).join(" ")}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:4, marginTop:4, flexWrap:"wrap" }}>
                      <span style={{ fontSize:8, fontWeight:900, background:ch, color:"#fff", borderRadius:3, padding:"2px 5px", letterSpacing:"0.05em" }}>{chLbl(m.channel)}</span>
                      <span style={{ fontSize: isMobile ? 8 : 9, fontWeight:800, letterSpacing:"0.07em", color:okCol, animation:!ok?"sf-blink 1.8s ease-in-out infinite":"none", textShadow:`0 0 8px ${okCol}` }}>
                        {ok ? "CONFIRMED" : "PENDING"}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize:10, color:DIM }}>{isOpen ? "▲" : "▼"}</span>
                </div>

                {/* Expanded typewriter log */}
                {isOpen && (
                  <div style={{ borderTop:`1px solid #ddd9d0`, padding: isMobile ? "12px 14px 16px" : "14px 18px 18px" }}>
                    <div style={{ position:"relative", height:1, background:"rgba(34,211,238,0.07)", overflow:"hidden", marginBottom:13, borderRadius:1 }}>
                      <div style={{ position:"absolute", top:0, bottom:0, width:"40%", background:`linear-gradient(90deg,transparent,${ELC},transparent)`, animation:"sf-bar 2s linear infinite" }} />
                    </div>
                    <div style={{ fontSize:8, letterSpacing:"0.2em", color:ELC, fontWeight:700, marginBottom:12, textTransform:"uppercase" }}>
                      ▸ System Log — {m.prospect} / {m.company}
                    </div>
                    <TypewriterLog key={m.id} entries={m.trail} okColor={okCol} />
                    <div style={{ marginTop:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:9, letterSpacing:"0.12em", color:DIM }}>EST. DEAL VALUE</span>
                      <span style={{ fontSize:16, fontWeight:900, color:ELG, textShadow:`0 0 18px ${ELG}` }}>{m.value}</span>
                    </div>
                    <div style={{ marginTop:11, display:"flex", gap:8 }}>
                      <button style={{ flex:1, padding:"10px 0", borderRadius:8, cursor:"pointer", border:`1px solid ${ELP}55`, background:`${ELP}12`, fontSize:10, fontWeight:800, color:ELP, fontFamily:"inherit", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                        View Convo
                      </button>
                      <button style={{ flex:1, padding:"10px 0", borderRadius:8, cursor:"pointer", border:`1px solid ${ELC}66`, background:`${ELC}10`, fontSize:10, fontWeight:800, color:ELC, fontFamily:"inherit", letterSpacing:"0.1em", textTransform:"uppercase", boxShadow:`0 0 14px ${ELC}25` }}>
                        Prep Brief
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:9, paddingTop:60 }}>
            <div style={{ fontSize:8, letterSpacing:"0.22em", color:`${ELP}55`, animation:"sf-blink 1.8s ease-in-out infinite" }}>NO SIGNAL DETECTED</div>
            <div style={{ fontSize:13, color:DIM }}>No meetings on {selectedDay}</div>
            <div style={{ fontSize:9, color:`${ELC}44`, letterSpacing:"0.1em" }}>William is scanning...</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Analytics (AI Readiness Quiz) ──
const QUIZ_QUESTIONS = [
  {
    id: "outreach", icon: "📡", tag: "Sales & outreach",
    text: "How are you doing outbound right now?",
    options: [
      { k: "A", t: "I'm still doing it all myself - finding leads, writing every message, praying something lands", s: 5 },
      { k: "B", t: "I have a tool, but I still spend hours every week babysitting it", s: 3 },
      { k: "C", t: "It's mostly automated, but if I stop watching it, I'm scared it'll stall", s: 1 },
      { k: "D", t: "I'm not really doing outbound yet - I just hope referrals keep coming", s: 4 },
    ]
  },
  {
    id: "support", icon: "💬", tag: "Customer support",
    text: "When customers have questions, what happens?",
    options: [
      { k: "A", t: "They usually end up in my inbox and I play \"human help desk\"", s: 5 },
      { k: "B", t: "A team member answers, but it's slow and a bit of a lottery", s: 4 },
      { k: "C", t: "We use templates, but a human still sends everything by hand", s: 3 },
      { k: "D", t: "Most common questions are answered automatically… and I still get pulled in when things get messy", s: 1 },
    ]
  },
  {
    id: "ops", icon: "⚡", tag: "Operations & admin",
    text: "How much manual admin is happening day‑to‑day?",
    options: [
      { k: "A", t: "A lot - copy‑pasting between tools, updating sheets, pulling reports, all the glamorous founder work", s: 5 },
      { k: "B", t: "Some things are automated, but there's still way too much busywork", s: 3 },
      { k: "C", t: "Most repetitive stuff runs on autopilot… as long as volume doesn't spike", s: 1 },
      { k: "D", t: "I do almost everything myself and pretend it's fine", s: 5 },
    ]
  },
  {
    id: "content", icon: "✍️", tag: "Content & marketing",
    text: "How consistently are you publishing content?",
    options: [
      { k: "A", t: "Randomly - whenever I remember or feel guilty", s: 5 },
      { k: "B", t: "A couple times a month, on a good month", s: 4 },
      { k: "C", t: "A few times a week, as long as nothing explodes", s: 3 },
      { k: "D", t: "We show up almost every day, but it still eats more time than I'd like", s: 1 },
    ]
  },
  {
    id: "crm", icon: "📊", tag: "CRM & pipeline",
    text: "How true is this: \"I trust my pipeline data\"?",
    options: [
      { k: "A", t: "Not at all - it's mostly in my head, Slack, and random notes", s: 5 },
      { k: "B", t: "Sort of - the CRM exists, but it's usually lying to me", s: 4 },
      { k: "C", t: "Mostly - we try to keep it clean, but it drifts fast", s: 3 },
      { k: "D", t: "It mostly stays updated automatically, but I still double‑check before big decisions", s: 1 },
    ]
  },
  {
    id: "capacity", icon: "👥", tag: "Team & capacity",
    text: "If you needed to double output next month, what's your move?",
    options: [
      { k: "A", t: "Hire someone full‑time and hope we onboard fast enough", s: 4 },
      { k: "B", t: "Bring in a freelancer or VA and pray they \"just get it\"", s: 3 },
      { k: "C", t: "Add another software tool to the pile", s: 2 },
      { k: "D", t: "Spin up an AI agent to handle the extra load - but I'd still watch it closely", s: 1 },
    ]
  },
  {
    id: "fire", icon: "🚨", tag: "Founders on fire",
    text: "How close do you feel to something important slipping through the cracks?",
    options: [
      { k: "A", t: "It already has - I just put out fires and apologize", s: 5 },
      { k: "B", t: "Very close - I'm juggling too much and dropping things", s: 4 },
      { k: "C", t: "Sometimes, but I usually catch most things at the last second", s: 3 },
      { k: "D", t: "I feel mostly on top of things, but only because I'm constantly watching for dropped balls", s: 2 },
    ]
  },
  {
    id: "stack", icon: "🔗", tag: "Tools & integrations",
    text: "How well do your tools talk to each other?",
    options: [
      { k: "A", t: "They don't - I move data between them manually like it's 1998", s: 5 },
      { k: "B", t: "Some connect, some don't - I'm the human API in the middle", s: 3 },
      { k: "C", t: "Most are connected, but not fully automated, so I still nudge things along", s: 2 },
      { k: "D", t: "Most tools are integrated and data flows on its own… until something changes or breaks", s: 1 },
    ]
  },
];

function AnalyticsView() {
  const [screen, setScreen] = useState("start"); // "start" | "quiz" | "results"
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [animatedScore, setAnimatedScore] = useState(0);
  const [ringOffset, setRingOffset] = useState(201);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const isMobile = useIsMobile();

  const AUBERGINE = "#3f0f40";
  const DANGER = "#b3261e";
  const GOLD = "#ecb22e";
  const Q_GREEN = "#2bac76";

  const scrollRef = useRef(null);

  const scrollTop = () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startQuiz = () => {
    setCurrentIndex(0);
    setAnswers({});
    setScreen("quiz");
    scrollTop();
  };

  const selectOption = (idx) => {
    const q = QUIZ_QUESTIONS[currentIndex];
    setAnswers(prev => ({ ...prev, [q.id]: idx }));
  };

  const goBack = () => {
    if (currentIndex === 0) return;
    setCurrentIndex(i => i - 1);
    scrollTop();
  };

  const goNext = () => {
    const q = QUIZ_QUESTIONS[currentIndex];
    if (answers[q.id] === undefined) return;
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex(i => i + 1);
      scrollTop();
    } else {
      setScreen("results");
      scrollTop();
    }
  };

  // Animate score ring when results appear
  useEffect(() => {
    if (screen !== "results") return;
    const total = QUIZ_QUESTIONS.reduce((sum, q) => {
      const idx = answers[q.id];
      return sum + (idx !== undefined ? q.options[idx].s : 3);
    }, 0);
    const maxScore = 40;
    const circumference = 201;
    const targetOffset = circumference - (total / maxScore) * circumference;
    let n = 0;
    const iv = setInterval(() => {
      n = Math.min(n + 1, total);
      setAnimatedScore(n);
      if (n >= total) clearInterval(iv);
    }, 40);
    setTimeout(() => setRingOffset(targetOffset), 80);
    return () => clearInterval(iv);
  }, [screen]);

  const getResults = () => {
    const total = QUIZ_QUESTIONS.reduce((sum, q) => {
      const idx = answers[q.id];
      return sum + (idx !== undefined ? q.options[idx].s : 3);
    }, 0);
    let intro, headline, desc;
    if (total <= 15) {
      intro = "Right now, you're holding your business together with sheer effort. 🔥 If you keep running like this, something important will eventually slip.";
      headline = "You are the bottleneck.";
      desc = "Your business is bleeding 20+ hours a week on work an AI agent could own. That's deals delayed, projects stalled, and burnout creeping in - not months from now, but already.";
    } else if (total <= 24) {
      intro = "Things work - but there are cracks. ⚠️ You're getting results, but only by sacrificing evenings and weekends.";
      headline = "Cracks in the system.";
      desc = "The areas flagged above are where small issues can quietly turn into dropped balls and missed opportunities. Fixing them now with the right AI agent keeps you ahead of that curve.";
    } else {
      intro = "You're still one spike away from overload.";
      headline = "You're one spike away from breaking.";
      desc = "These \"small\" gaps turn into lost deals and late nights the moment volume jumps — install an agent before you feel it.";
    }
    return { total, intro, headline, desc };
  };

  const handleSubmit = async () => {
    if (!email) return;
    try {
      await saveQuizSubmission({ email, answers, score: computedTotal });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to save submission:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setAnswers({});
    setAnimatedScore(0);
    setRingOffset(201);
    setEmail("");
    setSubmitted(false);
    setScreen("start");
    scrollTop();
  };

  const pct = Math.round((currentIndex / QUIZ_QUESTIONS.length) * 100);
  const q = QUIZ_QUESTIONS[currentIndex];
  const selected = answers[q?.id];
  const computedTotal = QUIZ_QUESTIONS.reduce((sum, qq) => {
    const idx = answers[qq.id];
    return sum + (idx !== undefined ? qq.options[idx].s : 3);
  }, 0);
  const { total, intro, headline, desc } = screen === "results" ? getResults() : {};

  // Shared container style
  const wrap = {
    flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
    fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };
  const scroll = {
    flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch",
    padding: isMobile ? 16 : 24,
    background: "radial-gradient(circle at top, #faf5ff 0, #f7f6f2 55%)",
  };
  const card = {
    background: "#fff", borderRadius: 12, border: "1px solid #e3e1dc",
    boxShadow: "0 4px 16px rgba(15,14,13,0.06)", padding: isMobile ? "18px 16px" : 24,
    marginBottom: 16,
  };

  return (
    <div style={wrap}>
      {/* Header bar */}
      <div style={{ padding: isMobile ? "12px 16px" : "18px 20px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <IconHash s={14} />
        <span style={{ fontWeight: 600, fontSize: 15 }}>analytics</span>
      </div>

      <div ref={scrollRef} style={scroll}>
        <div style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}>

          {/* ── START ── */}
          {screen === "start" && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: isMobile ? "1.4rem" : "1.6rem", fontWeight: 800, lineHeight: 1.25, marginBottom: 12, color: "#1d1c1d" }}>STRESS TEST</h1>
                <p style={{ fontSize: "0.98rem", color: "#616061", lineHeight: 1.6 }}>
                  Answer a few honest questions about how you run things. I'll show you where you're closest to breaking - and send your free AI agent to your inbox.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                  {["⏱ 1 minute", "🎯 8 questions", "🎁 Free AI agent"].map(chip => (
                    <span key={chip} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 9999, background: "#fff", border: "1px solid #ececec", fontSize: "0.82rem", color: "#616061" }}>{chip}</span>
                  ))}
                </div>
              </div>
              <div style={card}>
                <p style={{ fontSize: "0.95rem", color: "#616061", lineHeight: 1.6, marginBottom: 12 }}>
                  I'm William, the AI inside HireWilliam. In about a minute, this quiz will show you what's really on fire behind the scenes.
                </p>
                <ul style={{ margin: "0 0 16px 1.1rem", fontSize: "0.9rem", color: "#616061", lineHeight: 1.6 }}>
                  <li style={{ marginBottom: 4 }}>Where you're quietly leaking hours every week</li>
                  <li style={{ marginBottom: 4 }}>What's most likely to slip through the cracks next</li>
                  <li style={{ marginBottom: 4 }}>How to claim your free AI agent at the end</li>
                </ul>
                <p style={{ fontSize: "0.9rem", color: "#616061", marginBottom: 20 }}>
                  8 questions. No fluff. At the end, you'll see your risk map and a simple way to get your <strong>free AI agent</strong> sent to your inbox.
                </p>
                <button onClick={startQuiz} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: AUBERGINE, color: "#fff", fontWeight: 700, padding: "12px 24px", borderRadius: 6, fontSize: "0.95rem", border: "none", cursor: "pointer" }}>
                  START
                </button>
              </div>
            </>
          )}

          {/* ── QUIZ ── */}
          {screen === "quiz" && (
            <>
              {/* Progress */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8", padding: "12px 20px", marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#616061" }}>
                  <span>Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}</span>
                  <span>{pct}%</span>
                </div>
                <div style={{ height: 4, background: "#eee9e0", borderRadius: 9999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: DANGER, borderRadius: 9999, transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)" }} />
                </div>
              </div>

              {/* Question card */}
              <div style={{ ...card, animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 700, color: AUBERGINE, background: "#f3e8fb", padding: "2px 10px", borderRadius: 9999, marginBottom: 12 }}>
                  {q.icon} {q.tag}
                </div>
                <div style={{ fontSize: isMobile ? "0.98rem" : "1rem", fontWeight: 700, marginBottom: 16, color: "#1d1c1d" }}>{q.text}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options.map((opt, i) => (
                    <button
                      key={opt.k}
                      onClick={() => selectOption(i)}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px",
                        borderRadius: 10, border: selected === i ? `2px solid ${AUBERGINE}` : "1px solid #e8e8e8",
                        background: selected === i ? "#f1e6f7" : "#fff",
                        boxShadow: selected === i ? `0 0 0 1px ${AUBERGINE} inset` : "none",
                        fontSize: "0.92rem", lineHeight: 1.5, color: "#1d1c1d",
                        cursor: "pointer", textAlign: "left", transition: "all 0.1s",
                      }}
                    >
                      <span style={{
                        flexShrink: 0, width: 22, height: 22, borderRadius: 9999,
                        border: selected === i ? `none` : "1px solid #e8e8e8",
                        background: selected === i ? AUBERGINE : "#f5f5f5",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.72rem", fontWeight: 700,
                        color: selected === i ? "#fff" : "#616061", marginTop: 2,
                      }}>{opt.k}</span>
                      <span>{opt.t}</span>
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #e8e8e8" }}>
                  <button onClick={goBack} disabled={currentIndex === 0} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "#616061", padding: "6px 12px", borderRadius: 6, border: "none", background: "transparent", cursor: currentIndex === 0 ? "not-allowed" : "pointer", opacity: currentIndex === 0 ? 0.4 : 1 }}>← Back</button>
                  <button onClick={goNext} disabled={selected === undefined} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: selected === undefined ? "#ccc" : AUBERGINE, color: "#fff", fontWeight: 700, padding: "6px 16px", borderRadius: 6, fontSize: "0.85rem", border: "none", cursor: selected === undefined ? "not-allowed" : "pointer" }}>
                    {currentIndex === QUIZ_QUESTIONS.length - 1 ? "See my results →" : "Next →"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── RESULTS ── */}
          {screen === "results" && (
            <div style={card}>
              <p style={{ fontSize: "0.95rem", color: "#616061", lineHeight: 1.6, marginBottom: 16 }}>{intro}</p>

              {/* Score ring */}
              <div style={{ display: "flex", gap: 20, alignItems: "center", borderRadius: 12, border: "1px solid #e8e8e8", background: "#fff", padding: isMobile ? "18px 16px" : "20px 24px", marginBottom: 16, flexWrap: isMobile ? "wrap" : "nowrap" }}>
                <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                  <svg viewBox="0 0 80 80" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#e8e8e8" strokeWidth="7" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke={DANGER} strokeWidth="7" strokeLinecap="round" strokeDasharray="201" strokeDashoffset={ringOffset} style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 900 }}>{animatedScore}</div>
                    <div style={{ fontSize: "0.7rem", color: "#616061" }}>/ 40</div>
                  </div>
                </div>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: 900, marginBottom: 4, color: "#1d1c1d" }}>{headline}</h2>
                  <p style={{ fontSize: "0.9rem", color: "#616061", lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>

              {/* Breakdown */}
              <div style={{ borderRadius: 12, border: "1px solid #e8e8e8", background: "#fff", padding: isMobile ? "18px 16px" : "20px 24px", marginBottom: 16 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#616061", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #e8e8e8" }}>Your results by area</div>
                {QUIZ_QUESTIONS.map((q) => {
                  const idx = answers[q.id];
                  const s = idx !== undefined ? q.options[idx].s : 3;
                  const isHot = s >= 3;
                  return (
                    <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #e8e8e8", fontSize: "0.9rem" }}>
                      <span style={{ width: 22, textAlign: "center" }}>{q.icon}</span>
                      <span style={{ flex: 1, color: "#616061" }}>{q.tag}</span>
                      <span style={{
                        padding: "2px 10px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 700,
                        background: isHot ? "#ffe3e0" : "#fff4ce",
                        color: isHot ? DANGER : "#8f5c00",
                      }}>
                        {isHot ? "🔥 System at breaking point" : "⚠️ Escalating failure risk"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <div style={{ borderRadius: 12, background: AUBERGINE, padding: isMobile ? "18px 16px" : "20px 24px", marginBottom: 16, color: "#fff" }}>
                <h3 style={{ fontSize: "1.02rem", fontWeight: 900, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>🎁 Get your free AI agent</h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 16, color: "rgba(255,255,255,0.82)" }}>
                  Based on your answers, I'll send you a free AI agent built around where your system is under the most strain. Just drop your best email and it will be sent to you.
                </p>
                {!submitted ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span>📧</span>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={{ flex: 1, padding: "10px 12px", borderRadius: 9999, border: "none", minWidth: 0, fontSize: "0.92rem" }}
                      />
                    </div>
                    <button onClick={handleSubmit} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: AUBERGINE, fontWeight: 900, padding: "10px 20px", borderRadius: 9999, fontSize: "0.95rem", border: "none", cursor: "pointer", alignSelf: "flex-start" }}>
                      Get my free AI agent →
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>✅ Request received. Get ready for more freedom, more leverage, and fewer "why am I doing this myself?" moments.</p>
                )}
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", marginTop: 12 }}>We will reach out to have your new AI agent installed as soon as possible.</div>
              </div>

              <button onClick={resetQuiz} style={{ fontSize: "0.82rem", color: "#616061", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>↺ Retake the quiz</button>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── For Founders View ──
function ForFoundersView({ onNav }) {
  return (
    <div className="ff-root" style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", background: "#ffffff" }}>
      <style>{`
        .ff-root { font-family: 'Lato', sans-serif; font-size: 15px; line-height: 1.46668; color: #1d1c1d; }
        .ff-root .ff-main { background: #ffffff; display: flex; flex-direction: column; }
        .ff-root .ff-chanbar { height: 49px; padding: 0 20px; background: #ffffff; border-bottom: 1px solid #dddddd; display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .ff-root .ff-chan-hash { color: #616061; font-size: 18px; font-weight: 300; line-height: 1; }
        .ff-root .ff-chan-name { font-weight: 900; font-size: 15px; color: #1d1c1d; }
        .ff-root .ff-chan-sep { width: 1px; height: 16px; background: #dddddd; }
        .ff-root .ff-chan-desc { font-size: 13px; color: #616061; }
        .ff-root .ff-ai-pill { background: rgba(18,100,163,.08); border: 1px solid rgba(18,100,163,.2); color: #1264a3; font-size: 10px; font-family: 'IBM Plex Mono', monospace; padding: 1px 6px; border-radius: 3px; font-weight: 700; letter-spacing: .03em; }
        .ff-root .ff-msgs { padding: 20px 20px 0; display: flex; flex-direction: column; background: #ffffff; }
        .ff-root .ff-ddiv { display: flex; align-items: center; gap: 12px; padding: 16px 0 8px; }
        .ff-root .ff-dline { flex: 1; height: 1px; background: #dddddd; }
        .ff-root .ff-dtxt { font-size: 12px; font-weight: 700; color: #616061; background: #ffffff; padding: 0 8px; border: 1px solid #dddddd; border-radius: 24px; letter-spacing: .01em; white-space: nowrap; }
        .ff-root .ff-mg { display: flex; gap: 10px; padding: 4px 8px; border-radius: 6px; margin-bottom: 1px; transition: background .1s; animation: ff-fu .35s ease both; }
        .ff-root .ff-mg:hover { background: #f2f2f2; }
        @keyframes ff-fu { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .ff-root .ff-av { width: 36px; height: 36px; background: linear-gradient(135deg, #4a154b, #1264a3); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; color: #fff; flex-shrink: 0; margin-top: 3px; }
        .ff-root .ff-av-t { background: linear-gradient(135deg, #d97706, #e01e5a); }
        .ff-root .ff-msg-right { flex: 1; min-width: 0; }
        .ff-root .ff-meta { display: flex; align-items: baseline; gap: 6px; margin-bottom: 2px; flex-wrap: wrap; }
        .ff-root .ff-sender { font-weight: 900; font-size: 15px; color: #1d1c1d; line-height: 1.2; }
        .ff-root .ff-sender-founder { color: #7c2d7c; }
        .ff-root .ff-ts { font-size: 11.5px; color: #868686; font-weight: 400; }
        .ff-root .ff-body { font-size: 15px; line-height: 1.46668; color: #1d1c1d; }
        .ff-root .ff-body strong { font-weight: 700; color: #1d1c1d; }
        .ff-root .ff-body a { color: #1264a3; text-decoration: none; }
        .ff-root .ff-body a:hover { text-decoration: underline; }
        .ff-root .ff-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
        .ff-root .ff-card { background: #ffffff; border: 1px solid #dddddd; border-radius: 4px; padding: 12px; transition: box-shadow .15s, border-color .15s; cursor: default; }
        .ff-root .ff-card:hover { border-color: #b3b3b3; box-shadow: 0 1px 4px rgba(0,0,0,.1); }
        .ff-root .ff-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .ff-root .ff-cico { font-size: 18px; }
        .ff-root .ff-ctag { font-size: 9px; font-family: 'IBM Plex Mono', monospace; letter-spacing: .05em; padding: 2px 6px; border-radius: 3px; font-weight: 700; text-transform: uppercase; }
        .ff-root .ff-tb { background: rgba(18,100,163,.08); color: #1264a3; border: 1px solid rgba(18,100,163,.2); }
        .ff-root .ff-tp { background: #f3e8f3; color: #611f69; border: 1px solid rgba(74,21,75,.2); }
        .ff-root .ff-tg { background: rgba(0,122,90,.08); color: #007a5a; border: 1px solid rgba(0,122,90,.2); }
        .ff-root .ff-ty { background: rgba(217,119,6,.08); color: #d97706; border: 1px solid rgba(217,119,6,.2); }
        .ff-root .ff-tr2 { background: rgba(224,30,90,.08); color: #c0143c; border: 1px solid rgba(224,30,90,.2); }
        .ff-root .ff-ctitle { font-weight: 900; font-size: 13px; color: #1d1c1d; margin-bottom: 4px; }
        .ff-root .ff-cbody { font-size: 12px; color: #616061; line-height: 1.5; }
        .ff-root .ff-pflow { display: flex; flex-direction: column; margin-top: 10px; gap: 0; }
        .ff-root .ff-pstep { display: flex; gap: 12px; padding-bottom: 14px; }
        .ff-root .ff-pstep:last-child { padding-bottom: 0; }
        .ff-root .ff-psl { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
        .ff-root .ff-psn { width: 24px; height: 24px; border-radius: 50%; background: #3f0e40; display: flex; align-items: center; justify-content: center; font-size: 11px; font-family: 'IBM Plex Mono', monospace; color: #fff; font-weight: 700; }
        .ff-root .ff-psl-line { width: 1px; flex: 1; background: #dddddd; margin-top: 4px; }
        .ff-root .ff-pstep:last-child .ff-psl-line { display: none; }
        .ff-root .ff-psc { padding-top: 2px; }
        .ff-root .ff-pst { font-size: 14px; font-weight: 700; color: #1d1c1d; margin-bottom: 2px; }
        .ff-root .ff-psd { font-size: 13px; color: #616061; line-height: 1.5; }
        .ff-root .ff-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .ff-root .ff-logo-tag { display: inline-flex; flex-direction: column; align-items: center; gap: 4px; background: #ffffff; border: 1px solid #dddddd; border-radius: 6px; padding: 8px 10px; min-width: 60px; transition: all .12s; cursor: default; }
        .ff-root .ff-logo-tag:hover { border-color: #b3b3b3; box-shadow: 0 1px 5px rgba(0,0,0,.1); background: #fafafa; }
        .ff-root .ff-logo-tag img { width: 24px; height: 24px; object-fit: contain; display: block; }
        .ff-root .ff-logo-tag .ff-lname { font-size: 9px; color: #616061; font-family: 'IBM Plex Mono', monospace; text-align: center; line-height: 1.2; white-space: nowrap; }
        .ff-root .ff-tag { background: #f2f2f2; border: 1px solid #dddddd; border-radius: 3px; padding: 3px 9px; font-size: 12px; font-family: 'IBM Plex Mono', monospace; color: #616061; letter-spacing: .02em; transition: all .12s; cursor: default; }
        .ff-root .ff-tag:hover { border-color: #4a154b; color: #4a154b; background: #f3e8f3; }
        .ff-root .ff-izone { padding: 12px 20px 20px; background: #ffffff; flex-shrink: 0; }
        .ff-root .ff-ibar { border: 1px solid #dddddd; border-radius: 4px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; background: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.04); flex-wrap: wrap; }
        .ff-root .ff-itext { flex: 1; font-size: 14px; color: #868686; min-width: 180px; }
        .ff-root .ff-ial { display: flex; gap: 12px; flex-wrap: wrap; }
        .ff-root .ff-ilink { color: #1264a3; font-size: 13px; font-weight: 700; text-decoration: none; transition: color .12s; }
        .ff-root .ff-ilink:hover { color: #3f0e40; text-decoration: underline; }
        @media (max-width: 720px) { .ff-root .ff-grid3 { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .ff-root .ff-grid3 { grid-template-columns: 1fr; } }
      `}</style>

      <main className="ff-main">
        <div className="ff-chanbar">
          <span className="ff-chan-hash">#</span>
          <span className="ff-chan-name">for-founders</span>
          <span className="ff-chan-sep" />
          <span className="ff-chan-desc">Your AI workforce</span>
          <span className="ff-ai-pill">AI</span>
        </div>

        <div className="ff-msgs">
          <div className="ff-mg">
            <div className="ff-av">W</div>
            <div className="ff-msg-right">
              <div className="ff-meta"><span className="ff-sender">William</span><span className="ff-ai-pill">AI</span><span className="ff-ts">9:00 AM</span></div>
              <div className="ff-body">
                So you found me. Good.<br /><br />
                Make Money? Save Time? Stay Unstoppable? All of the above? <strong>That's what we're here for.</strong>
              </div>
            </div>
          </div>

          <div className="ff-ddiv"><div className="ff-dline" /><div className="ff-dtxt">how it works</div><div className="ff-dline" /></div>

          <div className="ff-mg">
            <div className="ff-av">W</div>
            <div className="ff-msg-right">
              <div className="ff-meta"><span className="ff-sender">William</span><span className="ff-ai-pill">AI</span><span className="ff-ts">9:01 AM</span></div>
              <div className="ff-body">
                Three steps between you and a business that runs itself.
                <div className="ff-pflow">
                  <div className="ff-pstep">
                    <div className="ff-psl"><div className="ff-psn">1</div><div className="ff-psl-line" /></div>
                    <div className="ff-psc">
                      <div className="ff-pst">Discovery & Audit</div>
                      <div className="ff-psd">We map your current stack, identify bottlenecks, and pinpoint exactly where AI delivers the fastest ROI for your specific business.</div>
                    </div>
                  </div>
                  <div className="ff-pstep">
                    <div className="ff-psl"><div className="ff-psn">2</div><div className="ff-psl-line" /></div>
                    <div className="ff-psc">
                      <div className="ff-pst">Build & Deploy</div>
                      <div className="ff-psd">Custom agents, automations, and integrations scoped to your business. Live in days - not months. We handle the full build from prompt architecture to production.</div>
                    </div>
                  </div>
                  <div className="ff-pstep">
                    <div className="ff-psl"><div className="ff-psn">3</div><div className="ff-psl-line" /></div>
                    <div className="ff-psc">
                      <div className="ff-pst">Run, Optimise & Scale</div>
                      <div className="ff-psd">William keeps working around the clock. We monitor performance, tune outputs, and expand capabilities as your business grows - so the ROI compounds over time.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ff-ddiv"><div className="ff-dline" /><div className="ff-dtxt">9 things we do for founders</div><div className="ff-dline" /></div>

          <div className="ff-mg">
            <div className="ff-av">W</div>
            <div className="ff-msg-right">
              <div className="ff-meta"><span className="ff-sender">William</span><span className="ff-ai-pill">AI</span><span className="ff-ts">9:02 AM</span></div>
              <div className="ff-body">
                This is what gets deployed inside your business:
                <div className="ff-grid3">
                  <div className="ff-card">
                    <div className="ff-card-top"><span className="ff-cico">🤖</span><span className="ff-ctag ff-tp">AGENTS</span></div>
                    <div className="ff-ctitle">AI Agents & Autonomous Workflows</div>
                    <div className="ff-cbody">Custom-built digital employees that execute multi-step tasks without human sign-off. They monitor queues, make decisions, and complete work end-to-end - from lead research to ticket resolution.</div>
                  </div>
                  <div className="ff-card">
                    <div className="ff-card-top"><span className="ff-cico">📡</span><span className="ff-ctag ff-tb">OUTREACH</span></div>
                    <div className="ff-ctitle">Sales & Outreach Automation</div>
                    <div className="ff-cbody">Email, LinkedIn, Instagram - personalised at scale. William finds your prospects, writes the messages, manages replies, and books the meetings. Your pipeline fills while you sleep.</div>
                  </div>
                  <div className="ff-card">
                    <div className="ff-card-top"><span className="ff-cico">💬</span><span className="ff-ctag ff-tg">SUPPORT</span></div>
                    <div className="ff-ctitle">AI-Powered Customer Support</div>
                    <div className="ff-cbody">Handle inbound queries across every channel automatically. Auto-tagging, smart routing, instant responses, escalation logic - 83% of tickets resolved without a human touching them.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ff-mg">
            <div className="ff-av">W</div>
            <div className="ff-msg-right">
              <div className="ff-meta"><span className="ff-sender">William</span><span className="ff-ai-pill">AI</span><span className="ff-ts">9:03 AM</span></div>
              <div className="ff-body">
                The ones that turn your revenue engine up a gear:
                <div className="ff-grid3">
                  <div className="ff-card">
                    <div className="ff-card-top"><span className="ff-cico">📊</span><span className="ff-ctag ff-ty">CRM</span></div>
                    <div className="ff-ctitle">CRM & Revenue Intelligence</div>
                    <div className="ff-cbody">AI embedded in your revenue stack - tracking every contact, activity, and signal. Know which deals are moving, which accounts are at risk, and exactly where to focus next.</div>
                  </div>
                  <div className="ff-card">
                    <div className="ff-card-top"><span className="ff-cico">🧠</span><span className="ff-ctag ff-tp">STRATEGY</span></div>
                    <div className="ff-ctitle">AI Strategy & Roadmapping</div>
                    <div className="ff-cbody">We audit your business, map where AI creates real leverage, and build a prioritised roadmap. No fluff - just a clear plan for what to automate first and why it moves the needle.</div>
                  </div>
                  <div className="ff-card">
                    <div className="ff-card-top"><span className="ff-cico">⚡</span><span className="ff-ctag ff-tg">AUTOMATION</span></div>
                    <div className="ff-ctitle">Workflow & Process Automation</div>
                    <div className="ff-cbody">Every repetitive task your team does manually - tagging, reporting, data entry, follow-ups, scheduling - handed to William. Your ops run on autopilot so your team focuses on what matters.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ff-mg">
            <div className="ff-av">W</div>
            <div className="ff-msg-right">
              <div className="ff-meta"><span className="ff-sender">William</span><span className="ff-ai-pill">AI</span><span className="ff-ts">9:04 AM</span></div>
              <div className="ff-body">
                And honestly? This is where most businesses leave the biggest money on the table:
                <div className="ff-grid3">
                  <div className="ff-card">
                    <div className="ff-card-top"><span className="ff-cico">✍️</span><span className="ff-ctag ff-tb">CONTENT</span></div>
                    <div className="ff-ctitle">AI Content & Marketing Engine</div>
                    <div className="ff-cbody">Blog posts, social copy, email sequences, ad creative - produced at scale and on-brand. William runs your content pipeline so you show up everywhere without burning out your team.</div>
                  </div>
                  <div className="ff-card">
                    <div className="ff-card-top"><span className="ff-cico">🔗</span><span className="ff-ctag ff-ty">STACK</span></div>
                    <div className="ff-ctitle">Integrations & Stack Connectivity</div>
                    <div className="ff-cbody">Your tools don't talk to each other - William fixes that. We wire together your CRM, inbox, data sources, and automation layers so AI can act on everything in real time.</div>
                  </div>
                  <div className="ff-card">
                    <div className="ff-card-top"><span className="ff-cico">👥</span><span className="ff-ctag ff-tr2">TEAM</span></div>
                    <div className="ff-ctitle">AI Hiring & Team Augmentation</div>
                    <div className="ff-cbody">Instead of hiring 5 people, deploy William. We build AI that fills the roles you can't afford yet - SDR, ops manager, content lead, analyst - without the headcount cost.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ff-ddiv"><div className="ff-dline" /><div className="ff-dtxt">what we connect to</div><div className="ff-dline" /></div>

          <div className="ff-mg">
            <div className="ff-av">W</div>
            <div className="ff-msg-right">
              <div className="ff-meta"><span className="ff-sender">William</span><span className="ff-ai-pill">AI</span><span className="ff-ts">9:05 AM</span></div>
              <div className="ff-body">
                Already using tools you love? Good. I work with all of them.
                <div className="ff-tags">
                  {[
                    { name: "HubSpot",    domain: "hubspot.com" },
                    { name: "Salesforce", domain: "salesforce.com" },
                    { name: "Pipedrive",  domain: "pipedrive.com" },
                    { name: "LinkedIn",   domain: "linkedin.com" },
                    { name: "Gmail",      domain: "gmail.com" },
                    { name: "Outlook",    domain: "outlook.com" },
                    { name: "Slack",      domain: "slack.com" },
                    { name: "Notion",     domain: "notion.so" },
                    { name: "Airtable",   domain: "airtable.com" },
                    { name: "Zapier",     domain: "zapier.com" },
                    { name: "Make",       domain: "make.com" },
                    { name: "n8n",        domain: "n8n.io" },
                    { name: "Shopify",    domain: "shopify.com" },
                    { name: "Stripe",     domain: "stripe.com" },
                    { name: "WhatsApp",   domain: "web.whatsapp.com" },
                    { name: "Instagram",  domain: "instagram.com" },
                    { name: "Google Ads", domain: "ads.google.com" },
                    { name: "Meta Ads",   domain: "meta.com" },
                    { name: "Intercom",   domain: "intercom.com" },
                    { name: "Zendesk",    domain: "zendesk.com" },
                  ].map(({ name, domain }) => (
                    <span key={domain} className="ff-logo-tag" title={name}>
                      <img src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`} alt={name} width="24" height="24" />
                      <span className="ff-lname">{name}</span>
                    </span>
                  ))}
                  <span className="ff-logo-tag" title="Any API">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#616061" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                    <span className="ff-lname">Any API</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="ff-mg" style={{ marginTop: 6 }}>
            <div className="ff-av ff-av-t">T</div>
            <div className="ff-msg-right">
              <div className="ff-meta">
                <span className="ff-sender ff-sender-founder">Terry Lee</span>
                <span style={{ fontSize: 12, color: "#868686", fontWeight: 400 }}>Founder, HireWilliam</span>
                <span className="ff-ts">9:06 AM</span>
              </div>
              <div className="ff-body">
                Genuine question - why are you still doing manually what AI can do in 3 seconds? We need to talk.<br /><br />
                Message me at <a href="mailto:terrylee@hirewilliam.com">terrylee@hirewilliam.com</a> - William does all the work, but I still check my emails.
              </div>
            </div>
          </div>
        </div>

        <div className="ff-izone">
          <div className="ff-ibar">
            <div className="ff-itext">Message #for-founders</div>
            <div className="ff-ial">
              <a href="mailto:terrylee@hirewilliam.com" className="ff-ilink">✉ Email Terry</a>
              <a href="https://hirewilliam.com" className="ff-ilink">↗ hirewilliam.com</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


// ── Right Panel (shown on chat view) ──
function RightPanel({ isMobile = false }) {
  if (isMobile) {
    return null;
  }

  return (
    <div style={{ width: 210, borderLeft: `1px solid ${RULE}`, padding: "22px 14px 14px", fontSize: 12, background: PAPER, flexShrink: 0, overflowY: "auto" }}>
      <div className="founders-kit">
        <p className="founders-kit-heading">Founders Survival Kit</p>
      </div>
    </div>
  );
}

// ── Mobile Bottom Navigation ──
function MobileBottomNav({ active, onNav }) {
  const navItems = [
    { id: "chat",      label: "William",   Icon: IconChat,     badge: null },
    { id: "outreach",  label: "Outreach",  Icon: IconMail,     badge: "3" },
    { id: "meetings",  label: "Meetings",  Icon: IconCalendar, badge: "2" },
    { id: "pipeline",  label: "Pipeline",  Icon: IconPipeline, badge: null },
    { id: "analytics", label: "Analytics", Icon: IconChart,    badge: null },
    { id: "founders",  label: "Founders",  Icon: IconLock,     badge: null },
  ];

  return (
    <div style={{
      display: "flex",
      background: "#16102a",
      borderTop: "1px solid rgba(255,255,255,0.1)",
      flexShrink: 0,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      zIndex: 100,
    }}>
      {navItems.map(({ id, label, Icon, badge }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onNav(id)}
            aria-label={label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              height: 58,
              background: "none",
              border: "none",
              cursor: "pointer",
              position: "relative",
              color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
              touchAction: "manipulation",
              padding: "6px 2px",
              minWidth: 0,
              transition: "color 0.15s",
            }}
          >
            {/* Active top indicator bar */}
            {isActive && (
              <div style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 28,
                height: 2,
                borderRadius: "0 0 2px 2px",
                background: PURPLE_LIGHT,
              }} />
            )}
            {/* Icon with badge */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Icon s={20} />
              {badge && (
                <span style={{
                  position: "absolute",
                  top: -5,
                  right: -7,
                  fontSize: 9,
                  fontWeight: 700,
                  background: RED,
                  color: "#fff",
                  padding: "1px 4px",
                  borderRadius: 8,
                  lineHeight: 1.4,
                  pointerEvents: "none",
                }}>
                  {badge}
                </span>
              )}
            </div>
            {/* Label */}
            <span style={{
              fontSize: 9,
              fontWeight: isActive ? 700 : 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              lineHeight: 1.2,
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [page, setPage] = useState("founders");
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "'DM Sans', system-ui, sans-serif", color: INK, background: "#fff", overflow: "hidden" }}>
      {/* Mobile top bar */}
      {isMobile && (
        <div style={{ display: "flex", alignItems: "center", padding: "0 16px", background: "#16102a", height: 52, flexShrink: 0, gap: 12 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.85)", cursor: "pointer", padding: "10px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, touchAction: "manipulation", minWidth: 44, minHeight: 44 }}
          >
            <span style={{ display: "block", width: 20, height: 2, background: "currentColor", borderRadius: 2 }} />
            <span style={{ display: "block", width: 20, height: 2, background: "currentColor", borderRadius: 2 }} />
            <span style={{ display: "block", width: 20, height: 2, background: "currentColor", borderRadius: 2 }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>W</div>
            <div>
              <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>HireWilliam</span>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.2 }}>
                {{ chat: "talk-to-william", pipeline: "pipeline", outreach: "outreach-log", meetings: "meetings", analytics: "analytics", founders: "for-founders" }[page]}
              </div>
            </div>
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
              role="button"
              aria-label="Close menu"
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

      {/* Mobile bottom navigation — always visible channel selector */}
      {isMobile && <MobileBottomNav active={page} onNav={setPage} />}
    </div>
  );
}
