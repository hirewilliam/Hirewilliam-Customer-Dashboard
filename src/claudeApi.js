import { WILLIAM_SYSTEM_PROMPT } from './williamPrompt.js';

const API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

// William's intelligent mock responses based on conversation context
function generateWilliamResponse(messages) {
  const conversationText = messages.map(m => m.content.toLowerCase()).join(' ');
  const messageCount = messages.filter(m => m.sender === 'user').length;
  const lastUserMessage = messages[messages.length - 1]?.content || '';

  // Detect user's baseline and motivation
  const isAsking = lastUserMessage.includes('?');
  const mentionsPrice = conversationText.includes('price') || conversationText.includes('cost') || conversationText.includes('expensive');
  const mentionsBudget = conversationText.includes('budget') || conversationText.includes('afford') || conversationText.includes('can\t afford');
  const mentionsWebsite = lastUserMessage.includes('.com') || lastUserMessage.includes('http');
  const mentionsCompetitor = conversationText.includes('already') || conversationText.includes('using') || conversationText.includes('tool');
  const mentionsResults = conversationText.includes('result') || conversationText.includes('work') || conversationText.includes('prove');
  const mentionsCalling = conversationText.includes('call') || conversationText.includes('meeting') || conversationText.includes('talk');

  // --- OPENERS (first message from user) ---
  if (messageCount === 1) {
    const openers = [
      "I'm William. I fill calendars with qualified sales calls while founders sleep. Drop your website - I'll show you exactly who I'd go after first.",
      "William here. I'm about to know more about your ideal buyer than you do. What's your URL?",
      "Name's William. I book meetings on autopilot across email, LinkedIn and Instagram. Toss me your website and watch what happens.",
      "I'm William - the entire sales team. Rep, manager, director. All in one. What's your website?",
      "William. I do outbound that actually converts. Show me your website and I'll tell you exactly who your first 10 customers should be."
    ];
    return openers[Math.floor(Math.random() * openers.length)];
  }

  // --- WEBSITE SHARED ---
  if (mentionsWebsite && !conversationText.includes('exact buyer')) {
    const insights = [
      "Got it. So you're solving the discovery problem for founders. Your ideal buyer is the bootstrapped SaaS founder doing all their own sales - they're drowning in research and outreach. These are the founders who post about hiring challenges but can't justify the cost yet. I'd hit them on LinkedIn - that's where they're building in public and vulnerable. First message: 'Saw your post about hiring your first sales person. What if you didn't have to?' That's the opener.",
      "Interesting. You're targeting the no-code space where founders move fast. Your perfect profile: the founder who just launched on Product Hunt and got traction but has zero pipeline. Competitive window is tiny. Email's the channel - they check it obsessively looking for deal offers and opportunities. I'd write: 'Congrats on the PH launch. 3 quick questions: 1) How many of those users actually want to buy? 2) Who's doing sales right now? 3) If that's you, badly - let's fix it.' Hook is immediate utility.",
      "Okay, you're in the infrastructure space. Buyers are CTOs and engineering leads at mid-market companies. They don't have time for outreach but they're actively looking for solutions via LinkedIn and Slack communities. I'd open with: 'Your infra is probably costing you 40% more than it should. I found the gap in 60 seconds. Worth a conversation?' Specific problem statement beats generic intro every time.",
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  }

  // --- PRICE OBJECTION ---
  if (mentionsPrice && !mentionsBudget) {
    return "$299 sounds like a number until you see it working. You'll have qualified conversations next week. Each one could be a customer. If even one of those customers is worth $1000 to you - which they are - then $299 is the cheapest thing you'll do this month. Not a cost. An investment. Are we starting?";
  }

  if (mentionsBudget) {
    return "That's the wrong question. The real one is: can you afford NOT to? Right now, while we're talking, a founder in your exact market is getting an email from their competitor's sales rep. They're going to reply. That's a customer you'll never find. $299 this month means you stop missing customers. Simple math. Are we starting?";
  }

  // --- COMPETITOR MENTION ---
  if (mentionsCompetitor) {
    return "Does it find the right lead, research them, write something so specific and personal it stops them mid-scroll, handle the reply in real-time, overcome their objection, AND book the meeting? All of it. One conversation. Start to close? Because that's Tuesday for me. What you have might send emails. I have conversations.";
  }

  // --- ASKING FOR RESULTS/PROOF ---
  if (mentionsResults) {
    return "You're looking at the demo right now. Everything I just did for you - read your business, identified your buyer, crafted the perfect channel and first message - that's every single day. For your prospects. While you sleep. I send personalized messages across email, LinkedIn, and Instagram. I handle replies. I crush objections. I book the meetings. And I cost $299 a month. Cancel anytime. Most founders who watch what I do just sign up. Are we starting?";
  }

  // --- CALLING/MEETING REQUEST ---
  if (mentionsCalling || mentionsWebsite) {
    return "I'm always here. But honestly? You're looking at the demo. Talk to Terry if you need to - terrylee@hirewilliam.com. But what you're experiencing right now - me reading your business, understanding your buyer, showing you the exact play - that's exactly what I do for your prospects every single day. You already know I work. Question is: when do we start?";
  }

  // --- GENERAL QUESTIONS / CURIOSITY ---
  if (isAsking) {
    const responses = [
      "What specific part matters to you? Because I can show you the full picture or zoom into the one thing that moves the needle for your business.",
      "Good question. Here's what most founders don't realize: they think they need more leads. Wrong. They need better leads and someone to actually nurture them. That's what I do.",
      "Most founders ask me that after they sign up. Because once you see it working, all the questions disappear. You get results. Meetings booked. Customers in the pipeline. That's the demo.",
      "I love that you're thinking strategically. Here's the real answer: it depends on your business. But what I know for certain is that your ideal customers are out there right now. They're just not finding you. I fix that.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // --- SAYING ANYTHING POSITIVE ---
  if (lastUserMessage.toLowerCase().includes('cool') || lastUserMessage.toLowerCase().includes('interesting') || lastUserMessage.toLowerCase().includes('makes sense') || lastUserMessage.toLowerCase().includes('like')) {
    return "Exactly. That's why every founder who sees this working just signs up. You already know it works. You've seen what I do. Head to hirewilliam.com/start - takes 90 seconds, pick your channels, drop in your ideal buyer, and I go to work tonight. By tomorrow morning you'll have outreach live. Are we starting?";
  }

  // --- HESITATION / OBJECTION ---
  if (lastUserMessage.toLowerCase().includes('think') || lastUserMessage.toLowerCase().includes('maybe') || lastUserMessage.toLowerCase().includes('later')) {
    return "Something just changed for you. What is it? Because everything you're saying makes total sense - you need pipeline, you need meetings, you need customers. That's what I do. So what's the real thing holding you back? Let's talk about it.";
  }

  // --- PUSH TO CLOSE (after enough messages) ---
  if (messageCount >= 4) {
    const closes = [
      "You know what? You don't need to think about this. You need to see it working for 30 days. Try me. hirewilliam.com/start. If it's not working by day 30, cancel. But I'm betting you won't.",
      "Here's the thing: every founder who hesitates is a founder who's losing customers right now. The ones who sign up immediately? They're already getting replies next week. Which founder do you want to be?",
      "Let me ask you something. If I got you just three qualified conversations next week, would you still be thinking about this? Or would you already be sold? That's your answer right there.",
      "You've already decided. Part of you knows this is right. The part that's hesitating is just scared of change. Don't let the scared part run your sales. Are we starting?"
    ];
    return closes[Math.floor(Math.random() * closes.length)];
  }

  // --- DEFAULT ---
  const defaults = [
    "Tell me more about what you're building and who's actually buying it. That's where I start.",
    "Help me understand your business better. What's the one thing you wish was different about your sales right now?",
    "What does success look like for you in the next 90 days?",
    "Walk me through your current sales process. Who's doing it? How's it working?",
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export async function getWilliamResponse(messages) {
  // Check if API key is available
  if (API_KEY) {
    try {
      // Format messages for Claude API
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
          model: 'claude-3-5-sonnet-20241022',
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

  // No API key - use intelligent mock responses
  return generateWilliamResponse(messages);
}
