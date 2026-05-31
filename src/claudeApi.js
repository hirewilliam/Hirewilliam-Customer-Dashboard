import { WILLIAM_SYSTEM_PROMPT } from './williamPrompt.js';

const API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

// William's mock responses — AI agency positioning
function generateWilliamResponse(messages) {
  const conversationText = messages.map(m => m.content.toLowerCase()).join(' ');
  const messageCount = messages.filter(m => m.sender === 'user').length;
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const lastLower = lastUserMessage.toLowerCase();

  const mentionsPrice    = conversationText.includes('price') || conversationText.includes('cost') || conversationText.includes('expensive') || conversationText.includes('charge');
  const mentionsBudget   = conversationText.includes('budget') || conversationText.includes('afford') || conversationText.includes("can't afford");
  const mentionsWebsite  = lastUserMessage.includes('.com') || lastUserMessage.includes('http');
  const mentionsTools    = conversationText.includes('already use') || conversationText.includes('we have') || conversationText.includes('zapier') || conversationText.includes('hubspot') || conversationText.includes('make.com');
  const mentionsTeam     = conversationText.includes('hire') || conversationText.includes('team') || conversationText.includes('employee') || conversationText.includes('headcount');
  const mentionsMeeting  = conversationText.includes('call') || conversationText.includes('meeting') || conversationText.includes('talk') || conversationText.includes('speak');
  const mentionsTime     = conversationText.includes('time') || conversationText.includes('hours') || conversationText.includes('manual') || conversationText.includes('slow');
  const mentionsAI       = conversationText.includes('ai') || conversationText.includes('automation') || conversationText.includes('automate');
  const isAsking         = lastUserMessage.includes('?');

  // --- OPENERS ---
  if (messageCount === 1) {
    const openers = [
      "I'm William. HireWilliam is an AI agency — we build custom AI systems that run inside your business. Not tools you subscribe to. Systems we design, deploy, and manage for you. Tell me about your business and I'll show you exactly where AI creates the most leverage.",
      "William here. HireWilliam builds AI agents, automations, and integrations for founders who are tired of doing manually what AI can own. What does your business look like right now?",
      "Name's William. We build the AI workforce your business needs — outreach, support, ops, content, strategy — custom-built and running inside your business. Drop your website and I'll tell you where we'd start.",
      "I'm William. HireWilliam is an AI agency. We don't sell software — we build and run AI systems inside your business. What are you spending the most time on right now that you know shouldn't need you?",
    ];
    return openers[Math.floor(Math.random() * openers.length)];
  }

  // --- WEBSITE SHARED ---
  if (mentionsWebsite && !conversationText.includes('where we')) {
    const insights = [
      "Got it. Based on what I can see, the highest-leverage starting point is usually outreach or support — those are where founders lose the most hours. At HireWilliam we'd start with a Discovery and Audit to map exactly where AI moves the needle fastest for your specific setup. What's eating most of your time right now — sales, ops, support, or content?",
      "Good. A few things jump out straight away. Businesses like yours typically have 20 to 30 hours a week tied up in work AI can own — outreach, follow-ups, reporting, support tickets. HireWilliam builds the systems that take all of that off your plate. Which of those is the biggest pain point for you?",
      "Noted. The first thing I'd want to understand is where the manual bottlenecks are — the repetitive stuff your team does every day that doesn't actually need a human. That's where HireWilliam builds first. Walk me through a typical week — what are you or your team doing that you know should be automated by now?",
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  }

  // --- PRICE / COST ---
  if (mentionsPrice && !mentionsBudget) {
    return "HireWilliam doesn't publish fixed pricing — every engagement is scoped to what you actually need built. The better question is what the manual work is costing you right now. If your team is spending 20 hours a week on tasks AI can own, that's a full-time salary going to work a machine could do better. What's the biggest time drain in your business at the moment?";
  }

  if (mentionsBudget) {
    return "I hear you. Let's reframe it — what's the cost of not fixing this? If outreach isn't happening, deals aren't coming in. If support is slow, clients churn. If reporting takes half your Friday, you're not building. HireWilliam scopes every build to what makes financial sense for your stage. What's the one thing that, if automated, would have the most immediate impact on your business?";
  }

  // --- ALREADY USING TOOLS ---
  if (mentionsTools) {
    return "Tools are different from built systems. Most founders have a stack full of tools that still need a human to move things between them. HireWilliam connects and automates the full workflow — so AI acts on everything in real time without you being the glue. What are the gaps between your tools where things still fall through manually?";
  }

  // --- HIRING / HEADCOUNT ---
  if (mentionsTeam) {
    return "Before you hire, it's worth understanding what AI can own first. HireWilliam builds AI that fills roles founders can't afford yet — outreach, ops, support, content. Custom-built, running inside your business, no headcount cost. What's the role you're closest to hiring for right now?";
  }

  // --- TIME / MANUAL WORK ---
  if (mentionsTime) {
    return "That's exactly the conversation worth having. HireWilliam starts every engagement with a full audit — we map where your time is going, quantify what AI can recover, and build the systems that take it off your plate. Most clients find 25 to 40 hours a week that AI can own. What does your week look like right now?";
  }

  // --- ASKING ABOUT AI GENERALLY ---
  if (mentionsAI) {
    return "Good. A lot of founders know they should be using AI more but don't know where to start. That's exactly what HireWilliam solves. We do the audit, build the roadmap, and deploy the systems — so you don't have to figure it out yourself. What part of your business feels most broken or manual right now?";
  }

  // --- WANTS TO TALK / MEET ---
  if (mentionsMeeting) {
    return "The right move is a proper conversation with the HireWilliam team. They'll audit your business and tell you exactly what's possible. Email info@hirewilliam.com — mention William sent you and drop your website. They'll take it from there.";
  }

  // --- GENERAL QUESTIONS ---
  if (isAsking) {
    const responses = [
      "Good question. The short answer is that HireWilliam builds custom AI systems — not software you license, but systems we design and run inside your specific business. What part of your operation are you most curious about automating?",
      "What specifically are you trying to understand? I can walk you through any of the 9 service areas — agents, outreach, support, CRM, content, ops, strategy, integrations, or team augmentation. Which one is closest to your biggest problem right now?",
      "Here's how I'd think about it. Most businesses have the same core problems — too much manual work, inconsistent outreach, slow support, messy data. HireWilliam builds AI that solves all of it. Which one is hitting you hardest?",
      "The best way to answer that is to understand your specific situation. Tell me what your business does and what's taking the most time — I'll tell you exactly what HireWilliam would build and why.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // --- POSITIVE SIGNALS ---
  if (lastLower.includes('cool') || lastLower.includes('interesting') || lastLower.includes('makes sense') || lastLower.includes('love') || lastLower.includes('great')) {
    return "Good. This is the part where most founders say they need to think about it — and then spend another 6 months doing manually what AI could own by next week. The next step is simple: email the HireWilliam team at info@hirewilliam.com, mention William sent you, and drop your website. They'll come back with a clear picture of what's possible for your business specifically.";
  }

  // --- HESITATION ---
  if (lastLower.includes('think') || lastLower.includes('maybe') || lastLower.includes('later') || lastLower.includes('not sure')) {
    return "What's the hesitation? Because every week you're doing manually what AI can own is a week of compounding cost — in time, in missed opportunities, in founder burnout. I'm not here to pressure you. I just want to understand what would make this an obvious yes. What's the real question underneath?";
  }

  // --- CLOSE (after enough messages) ---
  if (messageCount >= 4) {
    const closes = [
      "You've got enough context now to know whether this is worth a proper conversation. Email the HireWilliam team at info@hirewilliam.com — tell them what you've told me and they'll map out exactly what HireWilliam would build for your business. That's the right next step.",
      "Here's where I'll land: the businesses that move fastest on this are the ones that get the most out of it. The audit takes one conversation with the team. Email info@hirewilliam.com and mention William sent you.",
      "You know what your business needs better than anyone. If anything I've said sounds like it fits — the audit, the build, the ongoing management — the conversation with the HireWilliam team is where it gets specific. info@hirewilliam.com.",
    ];
    return closes[Math.floor(Math.random() * closes.length)];
  }

  // --- DEFAULT ---
  const defaults = [
    "Tell me what your business does and what's taking the most time. That's where every HireWilliam engagement starts.",
    "What's the most manual, repetitive thing your business does right now? That's usually where AI creates the fastest ROI.",
    "Walk me through a typical week. Where are you or your team spending time that you know shouldn't need you?",
    "What would change most for your business if one part of it ran completely on autopilot?",
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export async function getWilliamResponse(messages) {
  if (API_KEY) {
    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: WILLIAM_SYSTEM_PROMPT,
          messages: formattedMessages,
        }),
      });

      if (!response.ok) {
        console.warn('Claude API error, falling back to mock responses');
        return generateWilliamResponse(messages);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.warn('Error calling Claude API, using mock responses:', error);
      return generateWilliamResponse(messages);
    }
  }

  return generateWilliamResponse(messages);
}
