# Setup William AI Integration

William is now fully integrated with Claude AI and responds dynamically with his actual personality and sales strategies.

## Getting Started (2 minutes)

### Step 1: Get Your Free Claude API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up with email (takes 30 seconds)
3. Go to **API Keys** section
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)

### Step 2: Add the Key to Your Project

1. In your project root, create a file called `.env.local`
2. Paste this:
   ```
   VITE_CLAUDE_API_KEY=sk-ant-your_key_here_replace_this
   ```
3. Replace `sk-ant-your_key_here_replace_this` with your actual key
4. **Do NOT commit this file** (it's in .gitignore automatically)

### Step 3: Restart Your Dev Server

If the dev server is running:
1. Press `Ctrl+C` to stop it
2. Run `npm run dev` again
3. Open http://localhost:5173/Hirewilliam-Customer-Dashboard/

### Step 4: Talk to William

Start a conversation in the chat. William will now respond with:
- ✅ His actual personality
- ✅ Sales strategies from the system prompt
- ✅ Dynamic, contextual responses
- ✅ Closing techniques
- ✅ Objection handling
- ✅ Real-time reasoning

---

## How It Works

**When you send a message:**
1. Your message is added to the chat
2. The entire conversation history is sent to Claude API
3. William's system prompt guides Claude to respond as William
4. Response appears in the chat (usually 1-2 seconds)

**William's behavior:**
- Reads your psychological profile from how you communicate
- Identifies your dominant motivation (money, ideology, pressure, ego)
- Tailors his approach specifically to you
- Works toward a close using his proven techniques
- Never breaks character

---

## Troubleshooting

**"I'm having trouble connecting" message?**
- Check that `.env.local` exists in your project root
- Verify the API key is correct (starts with `sk-ant-`)
- Make sure the dev server was restarted after adding the key
- Check browser console (F12) for error details

**API key not working?**
- Go back to https://console.anthropic.com/ and create a new key
- Make sure you're using the full key (copy the entire thing)

**Want to test without API key?**
- Edit `src/claudeApi.js` and add mock responses
- Or use the fallback message to verify the integration is set up

---

## Costs

Claude API pricing is **very affordable** for chat:
- ~$0.003 per message (depending on conversation length)
- Most demo conversations: $0.01-$0.05 total
- You can set monthly spending limits in the Anthropic console

---

## Next Steps

Once William is live:
1. Test different conversation styles
2. Watch how he adapts to your approach
3. Try objections and see his reframes
4. Experience the closing techniques from his system prompt

William is now your sales demo. Every conversation shows exactly how he'd work for your clients.
