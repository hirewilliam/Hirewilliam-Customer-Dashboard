# HireWilliam - Customer Dashboard

A modern AI-powered sales pipeline and customer engagement dashboard built with React. This dashboard showcases real-time customer data, outreach logs, meetings, and analytics for sales teams using HireWilliam.

## Features

- **Chat with William**: Real-time messaging interface with an AI sales assistant
- **Pipeline Management**: Kanban-style board showing prospects at different stages (New, Contacted, Interested, Meeting, Won)
- **Outreach Log**: Track all customer outreach across multiple channels (Email, LinkedIn, Instagram)
- **Hot Leads**: Priority-ranked leads by engagement score
- **Meetings**: Upcoming scheduled meetings with confirmation status
- **Analytics**: 7-day performance metrics with message sent/reply rates
- **Responsive Design**: Beautiful, professional UI with custom color palette

## Tech Stack

- **React 18**: UI framework
- **Vite**: Fast build tool and dev server
- **CSS-in-JS**: Inline styling for component styling

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts the development server at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Generates optimized production build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Deployment

This project is automatically deployed to GitHub Pages when you push to the main branch. The deployment workflow is configured in `.github/workflows/deploy.yml`.

Visit the live dashboard: https://hirewilliam.github.io/Hirewilliam-Customer-Dashboard/

## Project Structure

```
├── src/
│   ├── App.jsx          # Main application component
│   └── main.jsx         # React entry point
├── index.html           # HTML template
├── package.json         # Project dependencies
├── vite.config.js       # Vite configuration
└── .github/workflows/
    └── deploy.yml       # GitHub Actions deployment
```

## Features Walkthrough

### Chat View
Message William, your AI sales assistant. Predefined quick suggestions help you ask about:
- Daily results and overnight performance
- Prospect discovery
- Pipeline health check

### Pipeline View
View all prospects organized by sales stage with engagement scores and last activity.

### Outreach Log
Review all outreach messages sent across channels with response status and research notes.

### Hot Leads
Priority list of engaged prospects (score 50+) sorted by engagement heat.

### Meetings
Upcoming confirmed and pending meetings with time, duration, and confirmation status.

### Analytics
Track performance metrics:
- Total messages sent
- Reply rate
- Meetings booked
- Active pipeline prospects
- 7-day trend chart showing messages sent vs. replies received

## Design System

The dashboard uses a carefully crafted color palette:
- **Primary**: Purple (#5a3fa0)
- **Success**: Green (#1a8a5a)
- **Alert**: Red (#c93535)
- **Attention**: Amber (#b86a0a)
- **Typography**: DM Sans font family

## License

proprietary