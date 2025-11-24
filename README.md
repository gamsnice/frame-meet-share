# MeetMeFrame

**Branded "Meet me at..." social visuals for events**

MeetMeFrame is a complete web platform where event organizers create branded visual templates and attendees personalize them with their own photos to share on social media.

## 🎯 What is MeetMeFrame?

MeetMeFrame gives event organizers:
- **A backend** to create and manage event visuals
- **A unique URL** for each event (e.g., `/e/skinnovation-2026`)
- **Template frames** where attendees add their selfies
- **Analytics** to track engagement and downloads

Attendees get:
- **No signup required** - just open the link
- **Smart photo editor** with drag & zoom
- **Instant downloads** of personalized "Meet me at [Event]" visuals
- **Suggested captions** to copy and paste

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A modern browser

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 🎨 Key Features

### For Event Organizers

1. **Event Management**
   - Create events with custom branding (colors, logos)
   - Generate unique public URLs for each event
   - Set hero titles, subtitles, and helper text

2. **Template Creator**
   - Upload template PNGs for 4 social formats:
     - Square (1080x1080) - Instagram posts
     - Story (1080x1920) - Instagram/Facebook stories
     - Landscape (1200x630) - LinkedIn, Twitter
     - **Portrait (1080x1350)** - Instagram 4:5 posts
   - **Visual photo frame mapper** - drag & resize to define where participant photos appear
   - Add suggested captions for each template

3. **Analytics Dashboard**
   - Track page views, photo uploads, downloads
   - See conversion rates (views → downloads)
   - Compare template performance

### For Event Participants

1. **No-Signup Experience**
   - Open event link → choose template → upload selfie → download
   - Works on mobile and desktop

2. **Smart Image Editor**
   - Drag to position your photo in the frame
   - Zoom to adjust (1x-3x)
   - Live preview of final result
   - Touch support for mobile devices
   - Automatic constraints to keep frame filled

3. **Instant Sharing**
   - Download high-res PNG visuals
   - Copy pre-written captions
   - Ready to post on any social platform

## 🔐 Demo Account

Try it out immediately:

**Email:** `demo@meetmeframe.example`  
**Password:** `demo1234`

**Demo Event:** `/e/skinnovation-2026`

The demo account includes:
- SKInnovation 2026 event with full branding
- 4 working templates (Attendee-Square, Speaker-Story, Sponsor-Landscape, VIP-Portrait)
- Pre-configured photo frames and captions

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/              # Organizer dashboard components
│   │   ├── DashboardHome.tsx
│   │   ├── EventsList.tsx
│   │   ├── EventEditor.tsx
│   │   ├── TemplateManager.tsx
│   │   ├── PhotoFrameMapper.tsx  # Visual frame mapping tool
│   │   ├── EventAnalytics.tsx
│   │   └── AccountSettings.tsx
│   ├── participant/        # Attendee experience components
│   │   ├── TemplateSelector.tsx
│   │   ├── ImageEditor.tsx      # Smart drag/zoom editor
│   │   └── CaptionsPanel.tsx
│   └── ui/                 # Shadcn UI components
├── pages/
│   ├── Landing.tsx         # Public homepage
│   ├── EventParticipantPage.tsx  # Participant experience
│   └── admin/
│       ├── AdminLogin.tsx
│       ├── AdminRegister.tsx
│       └── AdminDashboard.tsx
├── lib/
│   ├── supabase.ts         # Database client
│   └── analytics.ts        # Event tracking
└── App.tsx                 # Main app & routing
```

## 🗄️ Database Schema

**Core Tables:**
- `users` - Organizer accounts
- `events` - Event details & branding
- `templates` - Visual templates with photo frame mapping
- `template_captions` - Suggested captions per template
- `event_stats_daily` - Analytics (views, uploads, downloads, caption copies)
- `contact_messages` - Landing page contact form

**Key Fields on Templates:**
- `photo_frame_x/y/width/height` - Normalized coordinates (0-1) for where participant photos appear
- `format` - square | story | landscape | portrait
- `type` - SPEAKER | ATTENDEE | SPONSOR | CUSTOM

## 🎨 Design System

**Color Palette:**
- Primary: `#2563EB` (Blue) - CTAs, highlights
- Secondary: `#F97316` (Orange) - Accents
- Dark backgrounds: `#020617`, `#0F172A`

**Typography:**
- System sans-serif (Inter, SF Pro)
- Scales: H1 (4xl-5xl), H2 (2xl-3xl), Body (sm-base)

**Animations:**
- fade-in, scale-in for page loads
- Smooth transitions (cubic-bezier)
- Hover effects on cards

## 🔒 Privacy & Security

**Participant Photos:**
- **Never stored on servers** - all processing is client-side in the browser
- Photos only exist in memory during editing
- Final visual is generated and downloaded locally

**Organizer Data:**
- Row-Level Security (RLS) policies on all tables
- Organizers can only access their own events and templates
- Template images stored in public Supabase storage bucket

**Analytics:**
- Only aggregate counts tracked (no IPs, no user IDs)
- Daily stats per event/template

## 📊 Analytics Events

The system tracks 4 event types:
- `view` - Page load of `/e/:slug`
- `upload` - Successful photo upload
- `download` - Final visual download
- `caption_copy` - Caption copied to clipboard

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS + Shadcn UI
- React Router (routing)
- Tanstack Query (data fetching)

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Auth (organizer authentication)
- Supabase Storage (template images, logos)
- Row-Level Security (RLS) policies

**Image Processing:**
- HTML5 Canvas API for compositing
- Client-side only (no server uploads)

## 🚢 Deployment

### Deploy to Lovable

1. Click **Share → Publish** in Lovable
2. Your app goes live instantly
3. Updates deploy automatically on code changes

### Environment Variables

Auto-configured by Lovable Cloud:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📖 Usage Guide

### Creating Your First Event

1. **Sign up/Login** at `/admin/register`
2. **Create Event** - Add name, dates, location, branding colors
3. **Add Templates**:
   - Upload your template PNG (with transparent area for photos)
   - Use the visual mapper to drag/resize the photo frame
   - Choose format (square/story/landscape/portrait)
   - Add suggested captions
4. **Share the Link** - Copy `/e/your-event-slug` and distribute to attendees
5. **Track Performance** - View analytics dashboard

### Participant Flow

1. Open event link (e.g., `/e/skinnovation-2026`)
2. Choose a template frame
3. Upload a selfie
4. Drag to position, zoom to adjust
5. Download the final "Meet me at [Event]" visual
6. Copy a caption
7. Share on social media

## 🤝 Contributing

This is a Lovable-generated project. To contribute:

1. Make changes via Lovable interface or local IDE
2. Test thoroughly (especially image editor on mobile)
3. Push changes - Lovable auto-syncs

## 📄 License

This project is private and proprietary.

## 🆘 Support

- **Lovable Docs:** https://docs.lovable.dev/
- **Community:** https://discord.com/channels/1119885301872070706/1280461670979993613

## 🎯 Roadmap Ideas

- [ ] Add more layout presets (A/B/C templates)
- [ ] Background removal for participant photos
- [ ] Bulk template upload
- [ ] Email export of final visuals
- [ ] QR code generation for event links
- [ ] Social media scheduling integration
- [ ] Multi-language support
- [ ] Custom fonts for templates
- [ ] Video template support

---

**Built with Lovable** - The AI-powered full-stack platform
