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
  { id: "8", name: "Dan Fields", company: "Beacon", role: "CEO", industry: "CRM", score: 100, stage: "won", channel: "email", lastAction: "Build in progress", avatar: "DF", lastActivityTime: Date.now() - 604800000, activities: [{ time: Date.now() - 604800000, action: "Became customer" }] },
  { id: "9", name: "Rachel Green", company: "TechFlow", role: "Founder", industry: "Analytics", score: 28, stage: "new", channel: "linkedin", lastAction: "Researching", avatar: "RG", lastActivityTime: Date.now() - 432000000, activities: [{ time: Date.now() - 432000000, action: "Profile researched" }] },
  { id: "10", name: "Marcus Chen", company: "BuildFlow", role: "CRO", industry: "Dev Tools", score: 55, stage: "contacted", channel: "email", lastAction: "No response yet", avatar: "MC", lastActivityTime: Date.now() - 172800000, activities: [{ time: Date.now() - 172800000, action: "Initial email sent" }] },
  { id: "11", name: "Sofia Rodriguez", company: "PayFlow", role: "CEO", industry: "Fintech", score: 78, stage: "interested", channel: "linkedin", lastAction: "Asked for demo", avatar: "SR", lastActivityTime: Date.now() - 3600000, activities: [{ time: Date.now() - 3600000, action: "Requested demo" }] },
];

const MOCK_PROSPECTS = INITIAL_PROSPECTS;

const MOCK_OUTREACH = [
  {
    id: "1", prospect: "Alex Morin", company: "Shipyard", channel: "linkedin",
    message: "Hey Alex, saw your post about the SDR hire. Before you commit to headcount - HireWilliam builds AI that does the full sales motion at a fraction of the cost and is live in days. Worth 15 mins to see what that looks like for Shipyard?",
    status: "replied", research: "Alex's post from 3 days ago about hiring challenges",
    reply: "This looks great, let's chat. Thursday work?", time: "2h ago"
  },
  {
    id: "2", prospect: "Priya Kumar", company: "DataStack", channel: "email",
    subject: "Saw your Product Hunt launch",
    message: "Hey Priya, congrats on the PH launch. 200+ upvotes is a strong signal. Now you need AI to scale what's working - outreach, support, content. HireWilliam builds those systems custom for your business. Worth a quick call?",
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
    message: "Hi Nina - FormFlow just crossed 1K users. That's the point where ops and support start eating founder time. HireWilliam builds AI that handles that scale without adding headcount. Worth a look?",
    status: "sent", research: "FormFlow changelog update 2 days ago", time: "8h ago"
  },
  {
    id: "5", prospect: "Jake Rivera", company: "Launchpad", channel: "email",
    subject: "Quick question about Launchpad",
    message: "Hey Jake, no-code space is getting crowded. The teams pulling ahead have AI running their ops and sales while competitors do it manually. HireWilliam builds those systems. Worth 15 mins?",
    status: "opened", research: "Recent funding announcement, growing team", openCount: 3, time: "12h ago"
  },
];

const MOCK_CHAT = [
  { id: "1", sender: "william", content: "Morning. While you were offline I processed 23 support tickets, published 3 pieces of content, and updated the CRM with last week's activity. Everything's logged.", time: "7:02 AM" },
  { id: "2", sender: "william", content: "Alex from Shipyard replied to the outreach sequence. He's interested in the AI Agents build. I've drafted a follow-up for your review.", time: "7:02 AM" },
  { id: "3", sender: "william", content: "Two leads from last week asked about the AI Strategy engagement. I've put together a brief on both businesses. Ready when you are.", time: "7:03 AM" },
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
    { id: "outreach", label: "activity-log", badge: "3" },
    { id: "meetings", label: "meetings", badge: "2" },
    { id: "pipeline", label: "results" },
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
  { id: "intro-1", sender: "william", content: "Good you found me", time: "now" },
  { id: "intro-2", sender: "william", content: "I'm William. An AI built by an AI agency to sell AI. The irony isn't lost on me. But it works and that's kind of the whole pitch.\n\nJust so we're clear, I'm here to make you money, save you time and give you freedom.", time: "now" },
  { id: "intro-3", sender: "william", content: "Right. So here's what happens next: you click that link, book 15 min call and we can discuss what we can actually do for your business.", hasButton: true, buttonUrl: "https://calendar.app.google/KBavNT9XgiNsgfhc9", buttonText: "Book 15 min call", time: "now" },
];

const WILLIAM_FINAL_MSG = { content: "I appreciate your engagement, I really do. But me typing in a chat box isn't going to convince you. That's just two of us procrastinating.\n\nYou already have the link. 15 minutes in exchange for saving you months, possibly years." };

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
      setMsgs(p => [...p, { id: (Date.now() + 1).toString(), sender: "william", ...WILLIAM_FINAL_MSG, time: "now" }]);
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
              {m.hasButton && (
                <a href={m.buttonUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 10, padding: "10px 16px", background: PURPLE, color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }} onMouseEnter={(e) => e.target.style.opacity = "0.9"} onMouseLeave={(e) => e.target.style.opacity = "1"}>
                  {m.buttonText}
                </a>
              )}
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

// ── Results View (Testimonials) ──
function PipelineView() {
  const isMobile = useIsMobile();

  const CATEGORIES = [
    { id: "sales",    label: "Sales",            color: "#5a3fa0" },
    { id: "marketing", label: "Marketing",        color: "#1a8a5a" },
    { id: "ops",      label: "Operations",        color: "#b86a0a" },
    { id: "support",  label: "Customer Support",  color: "#378add" },
    { id: "strategy", label: "Strategy",          color: "#c93535" },
  ];

  const INITIAL_TESTIMONIALS = [
    {
      id: "1", category: "ops",
      quote: "We mainly used it for follow-ups and CRM updates. Before this, we were constantly behind on both. Now most of that just runs in the background. It's not magic, but it genuinely saves us hours every week.",
      name: "Jorge Gamito", company: "CEO & Founder, Alma Lusa Tours", initials: "JG", photo: "/testimonials/jorge.png",
    },
    {
      id: "2", category: "support",
      quote: "We didn't expect it to actually feel like \"people\" were doing the work, but that's kind of what happens. Leads get followed up, CRM gets updated, and we don't have to chase everything manually anymore.",
      name: "Gillian Pieterse", company: "Authorised Principal, Sanla", initials: "GP", photo: "/testimonials/gillian.png",
    },
    {
      id: "3", category: "ops",
      quote: "There was a point where we were just constantly doing small tasks all day. This helped remove a lot of that. It's not perfect, but it definitely changed how the team spends its time.",
      name: "Sarah Lindsay Roberts-Rushmer", company: "Office Administrator & Bookkeeping", initials: "SR", photo: "/testimonials/sarah.png",
    },
    {
      id: "4", category: "support",
      quote: "If you're still doing a lot of ops manually, this is worth looking at. It helped us automate lead handling and basic customer replies. I wouldn't say it replaces a team fully, but it definitely reduces the load.",
      name: "Teodora Djukic", company: "Founder, WiFeed", initials: "TD", photo: "/testimonials/teodora.png",
    },
    {
      id: "5", category: "marketing",
      quote: "\"We sent it to our entire startup group chat\" That probably says it all. It's flawless, it's one of the few services that actually reduced workload instead of just adding another dashboard. Would recommend for teams scaling fast.",
      name: "Cat Inne", company: "catinne.com", initials: "CI", photo: "/testimonials/cat.png",
    },
    {
      id: "6", category: "sales",
      quote: "Not gonna lie, With Hire William it reduced a lot of the repetitive stuff we were doing. We're not fully hands-off, but it's good enough that I've already told another founder to try it.",
      name: "Riccardo Lamberto", company: "Programme Management Global BBA, EADA", initials: "RL", photo: "/testimonials/riccardo.png",
    },
    {
      id: "7", category: "ops",
      quote: "Feels like it quietly takes care of a bunch of admin tasks in the background. Thanks to hirewilliam.com I don't think about it much anymore, which is probably a good sign. Recommended it already.",
      name: "Irina Medvednikova", company: "Global Director, Charter & Incentive Group Sales", initials: "IM", photo: "/testimonials/irina.png",
    },
    {
      id: "8", category: "marketing",
      quote: "Honestly it's like hiring an intern who doesn't sleep or complain. Slightly terrifying but in a good way.",
      name: "Mio Kasai", company: "Self-employed Artist / Painter", initials: "MK", photo: "/testimonials/mio.png",
    },
    {
      id: "9", category: "sales",
      quote: "It does the boring work I keep avoiding, so I'm kind of emotionally conflicted about it. But yeah… I'd recommend it.",
      name: "Bryan Calloway", company: "Freelance Fashion Stylist", initials: "BC", photo: "/testimonials/bryan.png",
    },
    {
      id: "10", category: "strategy",
      quote: "When we meet with hire William We replaced a bunch of \"we should automate this\" conversations with just… it already being automated.",
      name: "Emile van Zyl", company: "Building a Discord CRM, Community Relationships", initials: "EV", photo: "/testimonials/emile.png",
    },
    {
      id: "11", category: "support",
      quote: "Hire Williams set up tt's good, but now I have no excuse to \"forget\" follow-ups, which is annoying. Still telling other founders about it though.",
      name: "Courtney van Senus", company: "Customer Success Manager", initials: "CS", photo: "/testimonials/courtney.png",
    },
  ];

  const [testimonials, setTestimonials] = useState(INITIAL_TESTIMONIALS);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);

  const handleDragStart = (e, t) => {
    setDraggedCard(t);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, catId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCategory(catId);
  };

  const handleDrop = (e, catId) => {
    e.preventDefault();
    if (!draggedCard) return;
    setTestimonials(prev => prev.map(t => t.id === draggedCard.id ? { ...t, category: catId } : t));
    setDraggedCard(null);
    setDragOverCategory(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverCategory(null);
  };

  const Stars = () => (
    <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <IconHash s={14} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>results</span>
          <span style={{ fontSize: 11, color: INK_GHOST, marginLeft: 4 }}>{testimonials.length} founders</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "12px 16px" }}>
          {CATEGORIES.map(cat => {
            const items = testimonials.filter(t => t.category === cat.id);
            if (items.length === 0) return null;
            return (
              <div key={cat.id} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{cat.label}</span>
                  <span style={{ fontSize: 11, color: INK_GHOST }}>{items.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {items.map(t => (
                    <div key={t.id} style={{ background: "#fff", border: `1px solid ${RULE}`, borderTop: `3px solid ${cat.color}`, borderRadius: 10, padding: "18px 18px 16px" }}>
                      <Stars />
                      <p style={{ fontSize: 15, color: "#3d3b35", lineHeight: 1.7, margin: "0 0 16px 0", fontStyle: "italic" }}>"{t.quote}"</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {t.photo
                          ? <img src={t.photo} alt={t.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${cat.color}30` }} />
                          : <div style={{ width: 36, height: 36, borderRadius: "50%", background: cat.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{t.initials}</div>
                        }
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f0e0c" }}>{t.name}</div>
                          <div style={{ fontSize: 12, color: "#72706a" }}>{t.company}</div>
                        </div>
                      </div>
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

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <IconHash s={14} />
        <span style={{ fontWeight: 600, fontSize: 15 }}>results</span>
        <span style={{ fontSize: 12, color: INK_GHOST, marginLeft: 4 }}>{testimonials.length} founders</span>
      </div>

      {/* Kanban board */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", background: PAPER_WARM }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${CATEGORIES.length}, minmax(240px, 1fr))`, gap: 12, padding: 16, minWidth: CATEGORIES.length * 260 + "px" }}>
          {CATEGORIES.map(cat => {
            const items = testimonials.filter(t => t.category === cat.id);
            const isOver = dragOverCategory === cat.id;
            return (
              <div
                key={cat.id}
                onDragOver={(e) => handleDragOver(e, cat.id)}
                onDrop={(e) => handleDrop(e, cat.id)}
                onDragLeave={() => setDragOverCategory(null)}
                style={{ display: "flex", flexDirection: "column", gap: 0 }}
              >
                {/* Column header */}
                <div style={{ marginBottom: 10, padding: "0 4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: cat.color }}>{cat.label}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: INK_GHOST, background: "#fff", padding: "2px 6px", borderRadius: 6 }}>{items.length}</span>
                  </div>
                </div>

                {/* Cards drop zone */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 120, borderRadius: 10, padding: 6, transition: "background 0.15s", background: isOver ? `${cat.color}10` : "transparent", border: isOver ? `1.5px dashed ${cat.color}60` : "1.5px dashed transparent" }}>
                  {items.map(t => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t)}
                      onDragEnd={handleDragEnd}
                      style={{
                        background: "#fff",
                        border: `1px solid ${RULE}`,
                        borderTop: `3px solid ${cat.color}`,
                        borderRadius: 10,
                        padding: "18px 18px 14px",
                        cursor: "grab",
                        transition: "all 0.15s",
                        opacity: draggedCard?.id === t.id ? 0.4 : 1,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.1)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"}
                    >
                      <Stars />
                      <p style={{ fontSize: 14, color: "#3d3b35", lineHeight: 1.7, margin: "0 0 16px 0", fontStyle: "italic" }}>"{t.quote}"</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12, borderTop: `1px solid ${RULE}` }}>
                        {t.photo
                          ? <img src={t.photo} alt={t.name} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${cat.color}30` }} />
                          : <div style={{ width: 34, height: 34, borderRadius: "50%", background: cat.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{t.initials}</div>
                        }
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f0e0c" }}>{t.name}</div>
                          <div style={{ fontSize: 11, color: "#72706a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.company}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div style={{ padding: "20px 12px", textAlign: "center", color: INK_GHOST, fontSize: 11, borderRadius: 8, background: "rgba(255,255,255,0.5)" }}>
                      No testimonials yet
                    </div>
                  )}
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
        { from: "prospect", text: "I keep saying I'll do outbound. I never do.", time: "Yesterday, 8:10 AM" },
        { from: "william", text: "340 messages sent last week on your behalf. 28 replies. 3 meetings booked. One needs your eyes - Priya is asking about the enterprise tier. Draft is ready when you are.", time: "Yesterday, 8:14 AM", research: "Reviewed Alex's ICP, active channels, and past outreach history before building the sequence" },
        { from: "prospect", text: "Wait, the meetings are already in the calendar?", time: "Today, 8:20 AM" },
        { from: "william", text: "Thursday 2pm, Friday 10am, and Monday 9am. Calendar invites sent. You just need to show up.", time: "Today, 8:22 AM" },
        { from: "prospect", text: "Confirmed. This is exactly what I needed.", time: "Today, 8:30 AM" },
      ]
    },
    {
      id: "2", name: "Priya Kumar", company: "DataStack", channel: "email", status: "pending approval", stage: "Awaiting your review",
      stageColor: AMBER, time: "4h ago", avatar: "PK", needsApproval: true,
      thread: [
        { from: "prospect", text: "I spent all of Friday on the investor report. Again. 5 hours I will never get back.", time: "Today, 6:45 AM" },
        { from: "william", text: "DRAFT - waiting for your approval:\n\nPriya, your investor report goes out automatically from now on. I have connected Stripe, the CRM, and Linear. First one is ready for your review now. CAC is up 22% this month. I have drafted the explanation so you are not caught off guard on the call.", time: "Today, 7:02 AM", draft: true },
      ]
    },
    {
      id: "3", name: "Leo Tanaka", company: "Kitemaker", channel: "instagram", status: "replied", stage: "Interested",
      stageColor: AMBER, time: "6h ago", avatar: "LT",
      thread: [
        { from: "prospect", text: "We haven't posted anything in 3 weeks. Every time I sit down to write something I end up doing something else.", time: "Yesterday, 9:40 PM" },
        { from: "william", text: "This week is covered. 4 LinkedIn posts scheduled, newsletter out, article published. The post about your pricing change is at 847 impressions. I spotted a trending topic in your space and drafted a response post. Want to see it?", time: "Yesterday, 9:45 PM", research: "Reviewed Kitemaker brand voice, past content, and competitor activity before drafting" },
        { from: "prospect", text: "Honestly didn't expect that. Yes send it over.", time: "Today, 5:30 AM" },
        { from: "william", text: "Sent. It ties into the product management conversation happening on LinkedIn right now. Good timing to publish today.", time: "Today, 5:48 AM" },
      ]
    },
    {
      id: "4", name: "Jake Rivera", company: "Launchpad", channel: "email", status: "opened", stage: "Reviewing",
      stageColor: "#378add", time: "12h ago", avatar: "JR",
      thread: [
        { from: "prospect", text: "Honestly I have no idea what is happening in our pipeline right now. It is embarrassing.", time: "2 days ago, 9:50 PM" },
        { from: "william", text: "Here is your pipeline right now. 4 deals need a touchpoint this week. 2 have gone cold. Sofia asked for a proposal 6 days ago and nobody followed up. I have drafted the proposal. Want me to send it?", time: "2 days ago, 10:00 PM", research: "Pulled live CRM data, activity logs, and deal history across all open opportunities" },
        { from: "system", text: "Email opened 3 times. Last opened 4 hours ago.", time: "Today" },
        { from: "william", text: "QUEUED - follow-up tomorrow 9am:\n\nJake, Sofia's proposal is ready. One click and it goes. Do not let that one slip.", time: "Scheduled: Tomorrow, 9:00 AM", queued: true },
      ]
    },
    {
      id: "5", name: "Nina Patel", company: "FormFlow", channel: "linkedin", status: "sent", stage: "Contacted",
      stageColor: "#378add", time: "8h ago", avatar: "NP",
      thread: [
        { from: "prospect", text: "I am answering the same 12 support questions every single day. I cannot keep doing this.", time: "Yesterday, 10:45 PM" },
        { from: "william", text: "34 tickets resolved overnight. 2 escalated, both flagged for your team. Your inbox has 2 emails in it. Those 12 questions are handled automatically from now on.", time: "Yesterday, 11:00 PM", research: "Reviewed FormFlow support history, FAQ patterns, and common escalation triggers" },
        { from: "system", text: "Connection request accepted. Message delivered.", time: "Today, 3:15 AM" },
      ]
    },
    {
      id: "6", name: "Sara Chen", company: "Metrify", channel: "email", status: "sent", stage: "Proactive update",
      stageColor: INK_SOFT, time: "1d ago", avatar: "SC",
      thread: [
        { from: "william", text: "Sara, investor report goes out Friday at 4pm from now on. I have connected Stripe, the CRM, and Linear. First one is ready for your review. CAC is up 22% this month. I have drafted the explanation so you are not caught off guard.", time: "Yesterday, 9:00 AM" },
      ]
    },
    {
      id: "7", name: "Dan Fields", company: "Beacon", channel: "email", status: "won", stage: "Build in progress",
      stageColor: GREEN, time: "3d ago", avatar: "DF",
      thread: [
        { from: "prospect", text: "Everyone keeps telling me we should be using AI more. I do not even know where to begin.", time: "2 weeks ago" },
        { from: "william", text: "Audit done. You are losing 34 hours a week to work AI can own. Top 5 opportunities ranked by time saved: onboarding (11 hrs), support triage (8 hrs), outreach (6 hrs), reporting (5 hrs), content (4 hrs). I have built the roadmap. Want the team to walk you through it?", time: "2 weeks ago", research: "Full operations audit across Beacon's tools, workflows, team size, and current manual processes" },
        { from: "prospect", text: "This is exactly what we need. Can we talk this week?", time: "12 days ago" },
        { from: "system", text: "Meeting held. Engagement confirmed. Build kicked off.", time: "1 week ago" },
        { from: "prospect", text: "Contract signed. Let's get started.", time: "1 week ago" },
        { from: "william", text: "Welcome to HireWilliam, Dan. Audit is already running. You will have the full AI roadmap for Beacon by end of week.", time: "1 week ago" },
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
          <span style={{ fontWeight: 600, fontSize: 15 }}>activity-log</span>
          <span style={{ fontSize: 12, color: INK_GHOST, marginLeft: 4 }}>{CONVOS.length} active threads</span>
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

// ── Meetings (Agent Workflow Demo) ──
function MeetingsView() {
  const isMobile = useIsMobile();
  const [notionPain, setNotionPain] = useState('');
  const [notionStatus, setNotionStatus] = useState('');
  const [notionPainShow, setNotionPainShow] = useState(false);
  const [notionStatusShow, setNotionStatusShow] = useState(false);
  const [airtableRowShow, setAirtableRowShow] = useState(false);
  const [airtableName, setAirtableName] = useState('');
  const [gmailSubj, setGmailSubj] = useState('');
  const [gmailBody, setGmailBody] = useState('');
  const [gmailBtnShow, setGmailBtnShow] = useState(false);
  const [gmailSent, setGmailSent] = useState(false);
  const [calBooked, setCalBooked] = useState(false);
  const [calEvShow, setCalEvShow] = useState(false);
  const [slackShow, setSlackShow] = useState(false);
  const [slackMsg, setSlackMsg] = useState('');
  const [slackAttach, setSlackAttach] = useState(false);
  const [slackReactions, setSlackReactions] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [ripple, setRipple] = useState(null);
  const [activeWin, setActiveWin] = useState(null);
  const [doneWins, setDoneWins] = useState([]);
  const containerRef = useRef(null);
  const isRunning = useRef(false);

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const curPosRef = useRef({ x: 0, y: 0 });
  const audioCtxRef = useRef(null);

  function getAudioCtx() {
    if (!audioCtxRef.current) {
      try { audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
    }
    return audioCtxRef.current;
  }

  function playKeystroke() {
    try {
      const ctx = getAudioCtx(); if (!ctx) return;
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/d.length,8) * 0.22;
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=3200+Math.random()*800; f.Q.value=0.8;
      const g = ctx.createGain(); g.gain.value = 0.055 + Math.random()*0.04;
      src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
    } catch(e){}
  }

  function playMouseClick() {
    try {
      const ctx = getAudioCtx(); if (!ctx) return;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type='sine'; o.frequency.setValueAtTime(120,ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(40,ctx.currentTime+0.04);
      g.gain.setValueAtTime(0.22,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.06);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.06);
    } catch(e){}
  }

  function playSnap() {
    try {
      const ctx = getAudioCtx(); if (!ctx) return;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type='triangle'; o.frequency.setValueAtTime(1200,ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(400,ctx.currentTime+0.05);
      g.gain.setValueAtTime(0.12,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.07);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.07);
    } catch(e){}
  }

  function playWhoosh() {
    try {
      const ctx = getAudioCtx(); if (!ctx) return;
      const buf = ctx.createBuffer(1, ctx.sampleRate*0.28, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2)*0.15;
      const src = ctx.createBufferSource(); src.buffer=buf;
      const f = ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value=800;
      f.frequency.linearRampToValueAtTime(4000,ctx.currentTime+0.25);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.4,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.28);
      src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
    } catch(e){}
  }

  function playPop() {
    try {
      const ctx = getAudioCtx(); if (!ctx) return;
      [880,1320].forEach(freq => {
        const o=ctx.createOscillator(); const g=ctx.createGain();
        o.type='sine'; o.frequency.setValueAtTime(freq,ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(freq*1.4,ctx.currentTime+0.05);
        g.gain.setValueAtTime(0.12,ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.18);
        o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.18);
      });
    } catch(e){}
  }

  function playSlackDing() {
    try {
      const ctx = getAudioCtx(); if (!ctx) return;
      [1174,1568,1318].forEach((freq,i) => {
        const o=ctx.createOscillator(); const g=ctx.createGain();
        o.type='sine'; o.frequency.value=freq;
        const t=ctx.currentTime+i*0.09;
        g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.18,t+0.02);
        g.gain.exponentialRampToValueAtTime(0.001,t+0.35);
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.35);
      });
    } catch(e){}
  }

  function getElCenter(id) {
    const el = document.getElementById(id);
    if (!el || !containerRef.current) return { x: 0, y: 0 };
    const er = el.getBoundingClientRect();
    const cr = containerRef.current.getBoundingClientRect();
    return { x: er.left - cr.left + er.width / 2, y: er.top - cr.top + er.height / 2 };
  }

  function moveCursorTo(tx, ty, ms = 600) {
    if (isMobile) return sleep(0);
    return new Promise(resolve => {
      const { x: sx, y: sy } = curPosRef.current;
      const dist = Math.sqrt((tx-sx)*(tx-sx)+(ty-sy)*(ty-sy));
      const arcScale = Math.max(0.25, Math.min(0.55, dist/400));
      const mx = (sx+tx)/2 + (Math.random()-0.5)*dist*arcScale;
      const my = (sy+ty)/2 + (Math.random()-0.5)*dist*arcScale*0.7;
      let t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        const p = Math.min((ts-t0)/ms, 1);
        const e = p<0.5 ? 4*p*p*p : 1-Math.pow(-2*p+2,3)/2;
        const x = (1-e)*(1-e)*sx + 2*(1-e)*e*mx + e*e*tx;
        const y = (1-e)*(1-e)*sy + 2*(1-e)*e*my + e*e*ty;
        curPosRef.current = { x, y };
        setCursorPos({ x, y });
        if (p < 1) requestAnimationFrame(step); else resolve();
      }
      requestAnimationFrame(step);
    });
  }

  async function wander(id, n, sp = 28) {
    if (isMobile) return;
    const r = document.getElementById(id).getBoundingClientRect();
    const cr = containerRef.current.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      const tx = (r.left - cr.left) + sp + Math.random()*(r.width - sp*2);
      const ty = (r.top - cr.top) + sp/2 + Math.random()*(r.height - sp);
      await moveCursorTo(tx, ty, 240+Math.random()*180);
      await sleep(50+Math.random()*80);
      const jitters = 1 + Math.floor(Math.random()*2);
      for (let j = 0; j < jitters; j++) {
        const { x, y } = curPosRef.current;
        await moveCursorTo(x+(Math.random()-0.5)*22, y+(Math.random()-0.5)*14, 100+Math.random()*80);
        await sleep(25+Math.random()*40);
      }
      if (Math.random() > 0.72) {
        playMouseClick();
        const { x, y } = curPosRef.current;
        setRipple({ x, y, key: Date.now() });
        await sleep(160);
      }
    }
  }

  async function clickEl(id) {
    if (isMobile) { await sleep(180); return; }
    const c = getElCenter(id);
    const wx = c.x + (Math.random()>0.5?1:-1)*(32+Math.random()*22);
    const wy = c.y + (Math.random()-0.5)*20;
    await moveCursorTo(wx, wy, 380*0.38);
    await sleep(45);
    await moveCursorTo(c.x, c.y-8, 380*0.28);
    await sleep(55);
    await moveCursorTo(c.x, c.y, 380*0.18);
    await sleep(70);
    playMouseClick();
    setRipple({ x: c.x, y: c.y, key: Date.now() });
    await sleep(220);
  }

  async function typeInto(setter, text, speed = 22) {
    let current = '';
    for (let i = 0; i < text.length; i++) {
      current += text[i];
      setter(current);
      if (text[i] !== ' ' && text[i] !== '\n' && !isMobile) playKeystroke();
      await sleep(isMobile ? Math.max(speed - 8, 8) : speed + Math.random()*12);
    }
  }

  async function runSequence() {
    if (isRunning.current) return;
    isRunning.current = true;
    setNotionPain(''); setNotionStatus(''); setNotionPainShow(false); setNotionStatusShow(false);
    setAirtableRowShow(false); setAirtableName('');
    setGmailSubj(''); setGmailBody(''); setGmailBtnShow(false); setGmailSent(false);
    setCalBooked(false); setCalEvShow(false);
    setSlackShow(false); setSlackMsg(''); setSlackAttach(false); setSlackReactions(false);
    setCursorVisible(false); setRipple(null); setActiveWin(null); setDoneWins([]);
    await sleep(400);

    if (!isMobile) { setCursorVisible(true); setCursorPos(getElCenter('mw-notion')); }

    // NOTION
    setActiveWin('notion');
    await sleep(isMobile ? 400 : 500);
    await clickEl('mw-notion-pain-row');
    setNotionPainShow(true);
    await typeInto(setNotionPain, 'Manual sales ops, no outbound system', isMobile ? 18 : 28);
    await sleep(250);
    await clickEl('mw-notion-status-row');
    setNotionStatusShow(true);
    await typeInto(setNotionStatus, 'Ready for outreach', isMobile ? 22 : 35);
    await sleep(300);
    setActiveWin(null); setDoneWins(d => [...d, 'notion']);
    // Visible arc to Airtable
    if (!isMobile) {
      const atR = document.getElementById('mw-airtable').getBoundingClientRect();
      const cr = containerRef.current.getBoundingClientRect();
      await moveCursorTo(atR.left - cr.left + atR.width*0.3, atR.top - cr.top + 20, 900);
    }
    await sleep(250);

    // AIRTABLE
    setActiveWin('airtable');
    await clickEl('mw-at-add-btn');
    await sleep(250);
    setAirtableRowShow(true);
    playSnap();
    await sleep(180);
    await clickEl('mw-at-name-cell');
    await typeInto(setAirtableName, 'Alex Morin', isMobile ? 22 : 30);
    await sleep(300);
    setActiveWin(null); setDoneWins(d => [...d, 'airtable']);
    // Visible arc to Gmail
    if (!isMobile) {
      const gmR = document.getElementById('mw-gmail').getBoundingClientRect();
      const cr = containerRef.current.getBoundingClientRect();
      await moveCursorTo(gmR.left - cr.left + gmR.width*0.4, gmR.top - cr.top + 20, 900);
    }
    await sleep(250);

    // GMAIL
    setActiveWin('gmail');
    await clickEl('mw-gmail-subj');
    await typeInto(setGmailSubj, "Saw you're hiring an AE at Shipyard...", isMobile ? 14 : 20);
    await sleep(250);
    await clickEl('mw-gmail-body');
    await typeInto(setGmailBody, "Hey Alex,\n\nNoticed Shipyard just posted for an AE. That's usually the point where outbound starts eating founder time.\n\nWe build AI that handles the full workflow.\n\nWorth a look?\n\nWilliam", isMobile ? 8 : 11);
    await sleep(350);
    setGmailBtnShow(true);
    await clickEl('mw-gmail-send');
    await sleep(120);
    playWhoosh();
    setGmailSent(true);
    setActiveWin(null); setDoneWins(d => [...d, 'gmail']);
    // Visible arc to Calendar
    if (!isMobile) {
      const gcR = document.getElementById('mw-cal').getBoundingClientRect();
      const cr = containerRef.current.getBoundingClientRect();
      await moveCursorTo(gcR.left - cr.left + gcR.width*0.4, gcR.top - cr.top + 20, 900);
    }
    await sleep(300);

    // CALENDAR
    setActiveWin('cal');
    await clickEl('mw-cal-day5');
    setCalBooked(true);
    await sleep(350);
    if (!isMobile) await clickEl('mw-cal-thu-slot');
    await sleep(250);
    setCalEvShow(true);
    playPop();
    setActiveWin(null); setDoneWins(d => [...d, 'cal']);
    await sleep(500);
    if (!isMobile) setCursorVisible(false);

    // SLACK
    playSlackDing();
    setSlackShow(true);
    await sleep(400);
    const msg = "Here's what ran while you were away.\n\nProspect research completed and filed. Notion updated, CRM populated, email sent, meeting on the calendar.\n\nI'll pick up again at 3am while you're asleep. 👇";
    await typeInto(setSlackMsg, msg, isMobile ? 10 : 14);
    await sleep(350);
    setSlackAttach(true);
    await sleep(400);
    setSlackReactions(true);
    isRunning.current = false;
  }

  useEffect(() => { setTimeout(runSequence, 800); }, []);

  const winStyle = (id) => ({
    borderRadius: 10, overflow: 'hidden', background: '#fff',
    boxShadow: activeWin === id
      ? '0 0 0 2.5px #6366f1, 0 4px 32px rgba(99,102,241,0.18)'
      : doneWins.includes(id)
      ? '0 0 0 2px #16a34a, 0 4px 20px rgba(22,163,74,0.10)'
      : '0 2px 16px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.3s',
  });

  const dots = (
    <div style={{ display: 'flex', gap: 5 }}>
      {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
    </div>
  );

  const fs = isMobile ? 10 : 11;
  const bodyFs = isMobile ? 11 : 12;

  return (
    <div ref={containerRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: '#f0f0f0', padding: isMobile ? 10 : 20, position: 'relative' }}>

      {/* Cursor — desktop only */}
      {!isMobile && cursorVisible && (
        <div style={{ position: 'absolute', left: cursorPos.x, top: cursorPos.y, pointerEvents: 'none', zIndex: 999, transform: 'translate(-2px,-2px)', transition: 'left 0.48s cubic-bezier(.4,0,.2,1), top 0.48s cubic-bezier(.4,0,.2,1)' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))' }}>
            <path d="M2 2L7.5 16L9.5 10L16 8L2 2Z" fill="white" stroke="#6366f1" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
          <div style={{ position: 'absolute', left: 20, top: 2, background: '#6366f1', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap', boxShadow: '0 1px 6px rgba(99,102,241,0.4)' }}>William</div>
        </div>
      )}
      {!isMobile && ripple && (
        <div key={ripple.key} style={{ position: 'absolute', left: ripple.x - 12, top: ripple.y - 12, width: 24, height: 24, border: '2px solid #6366f1', borderRadius: '50%', pointerEvents: 'none', zIndex: 998, animation: 'mw-ripple 0.45s ease-out forwards' }} />
      )}

      <style>{`
        @keyframes mw-ripple { 0%{transform:scale(0.4);opacity:0.9} 100%{transform:scale(2.2);opacity:0} }
        @keyframes mw-pop { 0%{transform:scale(0.3)} 70%{transform:scale(1.3)} 100%{transform:scale(1)} }
        @keyframes mw-ev { 0%{transform:scaleY(0);transform-origin:top} 60%{transform:scaleY(1.08)} 100%{transform:scaleY(1)} }
        @keyframes mw-slide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mw-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? 14 : 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 20, padding: '4px 14px', fontSize: 11, color: '#16a34a', fontWeight: 600, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'mw-pulse 1.5s ease-in-out infinite' }} />
          William is working
        </div>
        <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 700, color: '#111', marginBottom: 4, padding: isMobile ? '0 4px' : 0 }}>Watch William run a full workflow autonomously</div>
        <div style={{ fontSize: isMobile ? 11 : 12, color: '#999' }}>No human involved. This is what runs inside your business.</div>
      </div>

      {/* 2x2 grid — single col on mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 12, marginBottom: isMobile ? 10 : 12 }}>

        {/* NOTION */}
        <div id="mw-notion" style={winStyle('notion')}>
          <div style={{ background: '#f7f7f5', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderBottom: '1px solid #e8e8e6' }}>
            {dots}
            <span style={{ fontSize: fs, color: '#9b9b9b', marginLeft: 6 }}>Workspace / CRM / <span style={{ color: '#37352f', fontWeight: 500 }}>Alex Morin</span></span>
          </div>
          <div style={{ padding: isMobile ? '10px 12px' : '12px 14px' }}>
            <div style={{ fontSize: isMobile ? 16 : 18 }}>📋</div>
            <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8, fontFamily: 'Georgia, serif' }}>Alex Morin — Shipyard</div>
            <div style={{ height: 1, background: '#e8e8e6', marginBottom: 6 }} />
            {[['Company','Shipyard'],['Industry','Dev Tools'],['Signal',null,<span key="s" style={{ background: '#e3f2fd', color: '#1565c0', borderRadius: 3, padding: '1px 7px', fontSize: fs, fontWeight: 500 }}>Hiring AE — 2h ago</span>],['ICP Match',null,<span key="i" style={{ background: '#e8f5e9', color: '#2e7d32', borderRadius: 3, padding: '1px 7px', fontSize: fs, fontWeight: 500 }}>High</span>]].map(([k,v,tag]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', marginBottom: 2, padding: '2px 0' }}>
                <span style={{ fontSize: fs, color: '#9b9b9b', width: isMobile ? 72 : 80, flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: bodyFs, color: '#37352f' }}>{tag || v}</span>
              </div>
            ))}
            <div id="mw-notion-pain-row" style={{ display: 'flex', alignItems: 'center', marginBottom: 2, padding: '2px 0', opacity: notionPainShow ? 1 : 0, transition: 'opacity 0.4s' }}>
              <span style={{ fontSize: fs, color: '#9b9b9b', width: isMobile ? 72 : 80, flexShrink: 0 }}>Pain Point</span>
              <span style={{ fontSize: bodyFs, color: '#37352f' }}>{notionPain}</span>
            </div>
            <div id="mw-notion-status-row" style={{ display: 'flex', alignItems: 'center', marginBottom: 2, padding: '2px 0', opacity: notionStatusShow ? 1 : 0, transition: 'opacity 0.4s' }}>
              <span style={{ fontSize: fs, color: '#9b9b9b', width: isMobile ? 72 : 80, flexShrink: 0 }}>Status</span>
              <span style={{ background: '#fff8e1', color: '#856404', borderRadius: 3, padding: '1px 7px', fontSize: fs, fontWeight: 500 }}>{notionStatus}</span>
            </div>
          </div>
        </div>

        {/* AIRTABLE */}
        <div id="mw-airtable" style={winStyle('airtable')}>
          <div style={{ background: '#151515', display: 'flex', alignItems: 'center', padding: '0 12px', height: 34, gap: 8 }}>
            {dots}
            <span style={{ color: '#FCB400', fontWeight: 800, fontSize: 13, marginLeft: 6 }}>Airtable</span>
            {!isMobile && <span style={{ color: '#fff', fontSize: 11, opacity: 0.6, marginLeft: 4 }}>/ HireWilliam CRM</span>}
          </div>
          <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '0 10px', height: 30, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: fs, color: '#666', padding: '2px 6px', borderRadius: 4 }}>Filter</span>
            <span style={{ fontSize: fs, color: '#666', padding: '2px 6px', borderRadius: 4 }}>Sort</span>
            <span style={{ flex: 1 }} />
            <span id="mw-at-add-btn" style={{ fontSize: fs, color: '#1a73e8', fontWeight: 600, padding: '2px 6px', borderRadius: 4, cursor: 'default' }}>+ Add record</span>
          </div>
          <div style={{ background: '#f9f9f9', borderBottom: '1px solid #e0e0e0', padding: '0 10px', display: 'flex' }}>
            <div style={{ fontSize: fs, color: '#0073ea', padding: '4px 8px', borderBottom: '2px solid #0073ea', fontWeight: 600 }}>Grid view</div>
            <div style={{ fontSize: fs, color: '#888', padding: '4px 8px' }}>Form</div>
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 280 : 'auto' }}>
              <thead>
                <tr>
                  {['Name','Company','Stage','Value'].map(h => (
                    <th key={h} style={{ background: '#f5f5f5', fontSize: 10, color: '#444', fontWeight: 500, padding: '4px 8px', borderRight: '1px solid #ddd', borderBottom: '2px solid #ddd', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontSize: fs, color: '#333', padding: '4px 8px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>Sarah Kim</td>
                  <td style={{ fontSize: fs, color: '#333', padding: '4px 8px', borderBottom: '1px solid #eee' }}>BuildKit</td>
                  <td style={{ fontSize: fs, padding: '4px 8px', borderBottom: '1px solid #eee' }}><span style={{ background: '#d1fae5', color: '#065f46', borderRadius: 3, padding: '1px 6px', fontSize: 10, fontWeight: 600 }}>Qualified</span></td>
                  <td style={{ fontSize: fs, color: '#333', padding: '4px 8px', borderBottom: '1px solid #eee' }}>$8k</td>
                </tr>
                <tr>
                  <td style={{ fontSize: fs, color: '#333', padding: '4px 8px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>Dan Fields</td>
                  <td style={{ fontSize: fs, color: '#333', padding: '4px 8px', borderBottom: '1px solid #eee' }}>Beacon</td>
                  <td style={{ fontSize: fs, padding: '4px 8px', borderBottom: '1px solid #eee' }}><span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 3, padding: '1px 6px', fontSize: 10, fontWeight: 600 }}>Contacted</span></td>
                  <td style={{ fontSize: fs, color: '#333', padding: '4px 8px', borderBottom: '1px solid #eee' }}>$15k</td>
                </tr>
                {airtableRowShow && (
                  <tr style={{ background: '#fffde7', animation: 'mw-slide 0.4s ease' }}>
                    <td id="mw-at-name-cell" style={{ fontSize: fs, color: '#333', padding: '4px 8px', borderBottom: '1px solid #eee', fontWeight: 600, whiteSpace: 'nowrap' }}>{airtableName || ' '}</td>
                    <td style={{ fontSize: fs, color: '#333', padding: '4px 8px', borderBottom: '1px solid #eee' }}>Shipyard</td>
                    <td style={{ fontSize: fs, padding: '4px 8px', borderBottom: '1px solid #eee' }}><span style={{ background: '#dbeafe', color: '#1e40af', borderRadius: 3, padding: '1px 6px', fontSize: 10, fontWeight: 600 }}>Prospect</span></td>
                    <td style={{ fontSize: fs, color: '#1a73e8', padding: '4px 8px', borderBottom: '1px solid #eee' }}>$12k</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={{ fontSize: fs, color: '#bbb', padding: '4px 8px' }}>+ Add a record</div>
          </div>
        </div>

        {/* GMAIL */}
        <div id="mw-gmail" style={winStyle('gmail')}>
          <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {dots}
            <span style={{ fontSize: 18, letterSpacing: -0.5, marginLeft: 4 }}>
              <span style={{ color: '#EA4335', fontWeight: 700 }}>G</span><span style={{ color: '#4285F4' }}>m</span><span style={{ color: '#EA4335' }}>a</span><span style={{ color: '#FBBC05' }}>i</span><span style={{ color: '#34A853' }}>l</span>
            </span>
            {!isMobile && <div style={{ flex: 1, background: '#eaf1fb', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#777' }}>Search mail</div>}
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, marginLeft: 'auto' }}>W</div>
          </div>
          <div style={{ display: 'flex', minHeight: isMobile ? 160 : 195 }}>
            {!isMobile && (
              <div style={{ width: 60, borderRight: '1px solid #e8eaed', padding: '6px 0', flexShrink: 0 }}>
                {[['✏️','Compose',true],['📥','Inbox'],['⭐','Starred'],['📤','Sent']].map(([icon,label,active]) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '4px 2px', fontSize: 9, color: active ? '#c5221f' : '#444', background: active ? '#fce8e6' : 'transparent', borderRadius: 6, margin: '1px 3px', cursor: 'default' }}>
                    <span style={{ fontSize: 14 }}>{icon}</span>{label}
                  </div>
                ))}
              </div>
            )}
            <div style={{ flex: 1, padding: isMobile ? 8 : 6 }}>
              <div style={{ background: '#fff', borderRadius: isMobile ? 8 : '8px 8px 0 0', boxShadow: '0 1px 3px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
                <div style={{ background: '#404040', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: bodyFs, color: '#fff', fontWeight: 500 }}>New Message</span>
                  <span style={{ color: '#ccc', fontSize: 12 }}>✕</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '3px 10px', borderBottom: '1px solid #e8eaed', minHeight: 26 }}>
                  <span style={{ fontSize: fs, color: '#5f6368', width: 24, flexShrink: 0 }}>To</span>
                  <span style={{ background: '#e8f0fe', borderRadius: 12, padding: '1px 8px', fontSize: fs, color: '#1a73e8' }}>alex@shipyard.dev</span>
                </div>
                <div id="mw-gmail-subj" style={{ display: 'flex', alignItems: 'center', padding: '3px 10px', borderBottom: '1px solid #e8eaed', minHeight: 26 }}>
                  <span style={{ fontSize: fs, color: '#5f6368', width: 24, flexShrink: 0 }}>Sub</span>
                  <span style={{ fontSize: bodyFs, color: '#202124' }}>{gmailSubj}</span>
                </div>
                <div id="mw-gmail-body" style={{ padding: '6px 10px', fontSize: isMobile ? 11 : 12, color: '#202124', lineHeight: 1.55, whiteSpace: 'pre-wrap', minHeight: isMobile ? 60 : 72 }}>{gmailBody}</div>
                <div style={{ borderTop: '1px solid #e8eaed', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button id="mw-gmail-send" style={{ background: gmailSent ? '#16a34a' : '#1a73e8', color: '#fff', border: 'none', borderRadius: 4, padding: isMobile ? '5px 14px' : '6px 16px', fontSize: bodyFs, fontWeight: 500, cursor: 'pointer', opacity: gmailBtnShow ? 1 : 0, transition: 'opacity 0.3s, background 0.3s', fontFamily: 'inherit' }}>
                    {gmailSent ? '✓ Sent' : 'Send'}
                  </button>
                  <span style={{ color: '#5f6368', fontSize: 14 }}>📎</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CALENDAR — simplified on mobile */}
        <div id="mw-cal" style={winStyle('cal')}>
          <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {dots}
            <div style={{ width: 24, height: 24, borderRadius: 4, border: '2px solid #4285f4', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ background: '#4285f4', height: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 5, color: '#fff', fontWeight: 700 }}>JUN</div>
              <div style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 16, fontSize: 10, fontWeight: 700, color: '#4285f4' }}>5</div>
            </div>
            <span style={{ fontSize: 16, color: '#5f6368', fontWeight: 300 }}>Calendar</span>
            {!isMobile && <div style={{ flex: 1, background: '#f1f3f4', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#777' }}>Search</div>}
          </div>

          {isMobile ? (
            /* Mobile calendar: mini-only, no week grid */
            <div style={{ padding: 12 }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#3c4043', fontWeight: 600, marginBottom: 8 }}>June 2026</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, maxWidth: 220 }}>
                  {['M','T','W','T','F','S','S'].map((d,i) => <div key={i} style={{ fontSize: 9, color: '#70757a', textAlign: 'center', fontWeight: 500 }}>{d}</div>)}
                  {[26,27,28,29,30,31,1,2,3,4,'5',6,7,8,9,10,11,12,13,14,15].map((d,i) => {
                    const isOther = i < 6;
                    const isToday = d === 3;
                    const isDay5 = d === '5';
                    return (
                      <div id={isDay5 ? 'mw-cal-day5' : undefined} key={i} style={{ fontSize: 11, textAlign: 'center', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', margin: 'auto', color: isOther ? '#ccc' : isToday ? '#fff' : calBooked && isDay5 ? '#fff' : '#3c4043', background: isToday ? '#1a73e8' : calBooked && isDay5 ? '#34a853' : 'transparent', fontWeight: isToday || (calBooked && isDay5) ? 700 : 400, animation: calBooked && isDay5 ? 'mw-pop 0.45s ease' : 'none', cursor: 'default' }}>{d}</div>
                    );
                  })}
                </div>
              </div>
              <div style={{ opacity: calEvShow ? 1 : 0, transition: 'opacity 0.5s', background: '#e8f5e9', borderRadius: 8, padding: '10px 12px', animation: calEvShow ? 'mw-slide 0.4s ease' : 'none' }}>
                <div style={{ fontSize: 10, color: '#2e7d32', fontWeight: 700, marginBottom: 2 }}>MEETING CONFIRMED</div>
                <div style={{ fontSize: 13, color: '#1b5e20', fontWeight: 600 }}>Alex Morin — Shipyard</div>
                <div style={{ fontSize: 11, color: '#388e3c', marginTop: 2 }}>Thu Jun 5 · 2:00 PM · 30 min</div>
              </div>
            </div>
          ) : (
            /* Desktop calendar: full week grid */
            <div style={{ display: 'flex', minHeight: 200 }}>
              <div style={{ width: 128, flexShrink: 0, borderRight: '1px solid #e8eaed', padding: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: '#3c4043', fontWeight: 600 }}>June 2026</span>
                  <span style={{ fontSize: 11, color: '#70757a', cursor: 'default' }}>‹ ›</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1 }}>
                  {['M','T','W','T','F','S','S'].map((d,i) => <div key={i} style={{ fontSize: 8, color: '#70757a', textAlign: 'center', padding: '2px 0', fontWeight: 500 }}>{d}</div>)}
                  {[26,27,28,29,30,31,1,2,3,4,'5',6,7,8,9,10,11,12,13,14,15].map((d,i) => {
                    const isOther = i < 6;
                    const isToday = d === 3;
                    const isDay5 = d === '5';
                    return (
                      <div id={isDay5 ? 'mw-cal-day5' : undefined} key={i} style={{ fontSize: 10, textAlign: 'center', width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', margin: 'auto', color: isOther ? '#ccc' : isToday ? '#fff' : calBooked && isDay5 ? '#fff' : '#3c4043', background: isToday ? '#1a73e8' : calBooked && isDay5 ? '#34a853' : 'transparent', fontWeight: isToday || (calBooked && isDay5) ? 700 : 400, animation: calBooked && isDay5 ? 'mw-pop 0.45s ease' : 'none', cursor: 'default' }}>{d}</div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 8, padding: 6, background: '#e8f5e9', borderRadius: 6, opacity: calEvShow ? 1 : 0, transition: 'opacity 0.5s' }}>
                  <div style={{ fontSize: 9, color: '#2e7d32', fontWeight: 700 }}>CONFIRMED</div>
                  <div style={{ fontSize: 10, color: '#1b5e20', fontWeight: 600, marginTop: 1 }}>Alex Morin</div>
                  <div style={{ fontSize: 9, color: '#388e3c' }}>Thu Jun 5 · 2:00 PM</div>
                </div>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '34px repeat(7,1fr)', borderBottom: '1px solid #e8eaed' }}>
                  <div style={{ fontSize: 8, color: '#70757a', padding: 4, textAlign: 'right' }}>GMT</div>
                  {['MON','TUE','WED','THU','FRI','SAT','SUN'].map((d,i) => (
                    <div key={d} style={{ textAlign: 'center', padding: '4px 2px' }}>
                      <span style={{ fontSize: 9, color: i===3 ? '#1a73e8' : '#70757a', display: 'block', fontWeight: i===3 ? 600 : 400 }}>{d}</span>
                      <span style={{ fontSize: 14, color: i===2 ? '#fff' : i===3 ? '#1a73e8' : '#3c4043', display: 'inline-block', background: i===2 ? '#1a73e8' : 'transparent', borderRadius: '50%', width: i===2 ? 24 : undefined, height: i===2 ? 24 : undefined, lineHeight: i===2 ? '24px' : undefined, textAlign: 'center' }}>{i+1}</span>
                    </div>
                  ))}
                </div>
                {[['9 AM',false],['11 AM',true],['12 PM',false],['1 PM',false]].map(([time, hasStandup]) => (
                  <div key={time} style={{ display: 'grid', gridTemplateColumns: '34px repeat(7,1fr)' }}>
                    <div style={{ fontSize: 8, color: '#70757a', padding: '2px 3px', textAlign: 'right', height: 26, borderTop: '1px solid #f1f3f4' }}>{time}</div>
                    {[0,1,2,3,4,5,6].map(ci => (
                      <div id={ci===3&&time==='1 PM'?'mw-cal-thu-slot':undefined} key={ci} style={{ borderLeft: '1px solid #e8eaed', height: 26, borderTop: '1px solid #f1f3f4', background: ci===2 ? '#f8f9fa' : 'transparent', position: 'relative' }}>
                        {hasStandup && ci===0 && <div style={{ position:'absolute',left:2,right:2,top:2,bottom:2,background:'#1a73e8',borderRadius:3,padding:'1px 4px',fontSize:9,color:'#fff',fontWeight:500,overflow:'hidden',whiteSpace:'nowrap' }}>Team standup</div>}
                        {ci===3 && time==='1 PM' && calEvShow && <div style={{ position:'absolute',left:2,right:2,top:2,bottom:2,background:'#0f9d58',borderRadius:3,padding:'1px 4px',fontSize:9,color:'#fff',fontWeight:500,overflow:'hidden',whiteSpace:'nowrap',animation:'mw-ev 0.5s ease' }}>Alex Morin · 2pm</div>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SLACK */}
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', opacity: slackShow ? 1 : 0, transition: 'opacity 0.6s', marginBottom: 14 }}>
        <div style={{ background: '#3f0e40', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          {dots}
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, flex: 1, marginLeft: 8 }}>HireWilliam</span>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '3px 10px', fontSize: 10, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2bac76', display: 'inline-block' }} />
            {!isMobile && 'William online'}
          </div>
        </div>
        <div style={{ background: '#3f0e40', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>#</span>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>results</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginLeft: 4 }}>· 3 members</span>
        </div>
        <div style={{ padding: isMobile ? '12px' : '14px', background: '#fff' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>W</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1d1c1d' }}>William</span>
                <span style={{ fontSize: 10, background: '#6366f1', color: '#fff', borderRadius: 3, padding: '1px 6px', fontWeight: 600 }}>AI</span>
                <span style={{ fontSize: 11, color: '#999' }}>9:41 AM</span>
              </div>
              <div style={{ fontSize: isMobile ? 12 : 13, color: '#1d1c1d', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{slackMsg}</div>
              {slackAttach && (
                <div style={{ marginTop: 10, borderLeft: '3px solid #2bac76', background: '#f8fdf9', borderRadius: '0 6px 6px 0', padding: '10px 12px', animation: 'mw-slide 0.4s ease' }}>
                  <div style={{ fontSize: 10, color: '#2bac76', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>WORKFLOW COMPLETE</div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 6 }}>
                    {[['◻ NOTION','#888','Research filed','Alex Morin · Shipyard'],['⬛ AIRTABLE','#fcb400','CRM updated','Stage Qualified · $12k'],['📧 GMAIL','#ea4335','Email sent · reply received','Positive intent confirmed'],['📅 CALENDAR','#1a73e8','Meeting booked','Thu Jun 5 · 2:00 PM']].map(([title,color,val,sub]) => (
                      <div key={title} style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: 6, padding: '7px 10px' }}>
                        <div style={{ fontSize: 9, color, fontWeight: 700, marginBottom: 2 }}>{title}</div>
                        <div style={{ fontSize: isMobile ? 12 : 11, color: '#1d1c1d', fontWeight: 500 }}>{val}</div>
                        <div style={{ fontSize: 10, color: '#999' }}>{sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {slackReactions && (
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', animation: 'mw-slide 0.4s ease' }}>
                  {[['🔥','3'],['🚀','2'],['👀','1']].map(([emoji,count]) => (
                    <span key={emoji} style={{ background: '#f1f1f1', borderRadius: 12, padding: '3px 9px', fontSize: 11, cursor: 'default', border: '1px solid #e0e0e0' }}>{emoji} {count}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #e8eaed', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 8, background: '#fff' }}>
          <div style={{ flex: 1, background: '#f1f1f1', borderRadius: 6, padding: '6px 12px', fontSize: 12, color: '#aaa', border: '1px solid #e0e0e0' }}>Message #results</div>
          <span style={{ fontSize: 16, cursor: 'default' }}>😊</span>
        </div>
      </div>

      <button onClick={runSequence} style={{ display: 'block', margin: '0 auto 16px', background: '#fff', border: '1px solid #ddd', color: '#888', borderRadius: 8, padding: '9px 24px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
        Replay
      </button>
    </div>
  );
}

      <button onClick={runSequence} style={{ display: 'block', margin: '0 auto 16px', background: '#fff', border: '1px solid #ddd', color: '#888', borderRadius: 8, padding: '9px 24px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
        Replay
      </button>
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
          <span className="ff-chan-desc">AI Agency for Founders</span>
          <span className="ff-ai-pill">AI</span>
        </div>

        <div className="ff-msgs">
          <div className="ff-mg">
            <div className="ff-av">W</div>
            <div className="ff-msg-right">
              <div className="ff-meta"><span className="ff-sender">William</span><span className="ff-ai-pill">AI</span><span className="ff-ts">9:00 AM</span></div>
              <div className="ff-body">
                So you found us. Good.<br /><br />
                HireWilliam is an AI agency. We design, build, and run custom AI systems inside your business. Agents, automations, integrations. <strong>The AI workforce your business needs - without the headcount.</strong>
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
                    <div className="ff-cbody">Email, LinkedIn, Instagram - personalised at scale. We build the AI system that finds your prospects, writes the messages, manages replies, and books the meetings. Custom-built for your ICP, not a generic tool.</div>
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
                    <div className="ff-cbody">Instead of hiring 5 people, deploy AI. We build systems that fill the roles you can't afford yet - outreach specialist, ops manager, content lead, analyst - custom-built and running inside your business without the headcount cost.</div>
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
                    { name: "WhatsApp",   domain: "whatsapp.com" },
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


        </div>

        <div className="ff-izone">
          <div className="ff-ibar">
            <div className="ff-itext">Message #for-founders</div>
            <div className="ff-ial">
              <a href="mailto:info@hirewilliam.com" className="ff-ilink">✉ Email Us</a>
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
    { id: "outreach",  label: "Activity",  Icon: IconMail,     badge: "3" },
    { id: "meetings",  label: "Meetings",  Icon: IconCalendar, badge: "2" },
    { id: "pipeline",  label: "Results",   Icon: IconPipeline, badge: null },
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
                {{ chat: "talk-to-william", pipeline: "results", outreach: "activity-log", meetings: "meetings", analytics: "analytics", founders: "for-founders" }[page]}
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
