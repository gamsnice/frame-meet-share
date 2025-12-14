import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  BookOpen,
  Lightbulb,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Calendar,
  Palette,
  Image,
  Link2,
  Share2,
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  Clock,
  Megaphone,
  PartyPopper,
  Building2,
  Camera,
  FolderOpen,
  Eye,
  Upload,
  Download,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type GuideTab = "quickstart" | "detailed" | "usecases" | "analytics" | "protips";

const tabs: { id: GuideTab; label: string; icon: React.ReactNode }[] = [
  { id: "quickstart", label: "Quick Start", icon: <Rocket className="h-4 w-4" /> },
  { id: "detailed", label: "Detailed Guide", icon: <BookOpen className="h-4 w-4" /> },
  { id: "usecases", label: "Use Cases", icon: <Lightbulb className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "protips", label: "Pro Tips", icon: <Sparkles className="h-4 w-4" /> },
];

function StepCard({ step, title, description, icon }: { step: number; title: string; description: string; icon: React.ReactNode }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-accent" />
      <CardContent className="pt-6 pl-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-white font-bold">
            {step}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {icon}
              <h3 className="font-semibold text-lg">{title}</h3>
            </div>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExpandableSection({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <button className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {icon}
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </div>
              {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </CardHeader>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function UseCaseCard({ icon, title, description, examples }: { icon: React.ReactNode; title: string; description: string; examples: string[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center text-white mb-3">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {examples.map((example, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{example}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function MetricExplainer({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function QuickStartContent() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-4">5 Minutes Setup</Badge>
        <h2 className="text-2xl font-bold mb-2">Get Started in 5 Simple Steps</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Launch your event's social media campaign in just minutes. Follow these steps to create your first branded visual experience.
        </p>
      </div>
      
      <div className="grid gap-4">
        <StepCard
          step={1}
          title="Create Your Event"
          description="Go to Events → Create New Event. Enter your event name, date, location, and a catchy headline that will appear on your participant page."
          icon={<Calendar className="h-5 w-5 text-primary" />}
        />
        <StepCard
          step={2}
          title="Customize Branding"
          description="Upload your logo, favicon, and set your brand colors. This ensures all visuals match your event's identity perfectly."
          icon={<Palette className="h-5 w-5 text-primary" />}
        />
        <StepCard
          step={3}
          title="Upload Templates"
          description="Create at least one template for each format you need (Square for Instagram feed, Story for Instagram/LinkedIn stories). Use transparent PNGs with a cutout for the photo area."
          icon={<Image className="h-5 w-5 text-primary" />}
        />
        <StepCard
          step={4}
          title="Share Your Link"
          description="Copy your unique event link and share it everywhere: email signatures, registration confirmations, social media, event websites, and printed materials."
          icon={<Share2 className="h-5 w-5 text-primary" />}
        />
        <StepCard
          step={5}
          title="Track Performance"
          description="Monitor your analytics dashboard to see views, uploads, and downloads. Use this data to optimize your promotion strategy."
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <h3 className="font-semibold text-lg">Pro Tip</h3>
          </div>
          <p className="text-muted-foreground">
            Start promoting your meetme link at least 2 weeks before the event. The earlier participants create their visuals, the more organic reach you'll get from their social shares!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailedGuideContent() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Complete Feature Guide</h2>
        <p className="text-muted-foreground">
          Deep dive into every feature meetme offers. Click on each section to expand and learn more.
        </p>
      </div>

      <ExpandableSection title="Event Setup" icon={<Calendar className="h-5 w-5" />} defaultOpen>
        <div className="space-y-4">
          <p className="text-muted-foreground">When creating an event, you'll configure these essential fields:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 rounded-lg bg-muted/30">
              <h5 className="font-medium mb-1">Event Name</h5>
              <p className="text-sm text-muted-foreground">Internal name for your reference (shown in admin only)</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <h5 className="font-medium mb-1">Event Slug</h5>
              <p className="text-sm text-muted-foreground">URL-friendly identifier (e.g., "startup-summit-2024")</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <h5 className="font-medium mb-1">Hero Title</h5>
              <p className="text-sm text-muted-foreground">Main headline shown to participants (e.g., "Meet me at Startup Summit!")</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <h5 className="font-medium mb-1">Hero Subtitle</h5>
              <p className="text-sm text-muted-foreground">Supporting text below the title</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <h5 className="font-medium mb-1">Helper Text</h5>
              <p className="text-sm text-muted-foreground">Instructions for participants on what to do</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <h5 className="font-medium mb-1">Date & Location</h5>
              <p className="text-sm text-muted-foreground">Event details for context</p>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Template Formats" icon={<Image className="h-5 w-5" />}>
        <div className="space-y-4">
          <p className="text-muted-foreground">meetme supports four visual formats, each optimized for different social platforms:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="bg-muted/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 border-2 border-primary rounded" />
                  <h5 className="font-semibold">Square (1080×1080)</h5>
                </div>
                <p className="text-sm text-muted-foreground">Perfect for Instagram feed, LinkedIn posts, and Twitter</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-9 border-2 border-primary rounded" />
                  <h5 className="font-semibold">Story (1080×1920)</h5>
                </div>
                <p className="text-sm text-muted-foreground">Optimized for Instagram Stories, LinkedIn Stories, TikTok</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-8 border-2 border-primary rounded" />
                  <h5 className="font-semibold">Portrait (1080×1350)</h5>
                </div>
                <p className="text-sm text-muted-foreground">Ideal for Instagram carousels and Pinterest</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-6 border-2 border-primary rounded" />
                  <h5 className="font-semibold">Landscape (1200×630)</h5>
                </div>
                <p className="text-sm text-muted-foreground">Great for LinkedIn articles, Facebook, and Twitter cards</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Template Creation Tips" icon={<Palette className="h-5 w-5" />}>
        <div className="space-y-4">
          <p className="text-muted-foreground">Creating effective templates is key to a great participant experience:</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-medium">Use transparent PNG files</h5>
                <p className="text-sm text-muted-foreground">The photo area should be transparent so participant photos show through</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-medium">Design around a clear photo zone</h5>
                <p className="text-sm text-muted-foreground">Leave enough space for faces - avoid placing important elements near edges</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-medium">Include your branding</h5>
                <p className="text-sm text-muted-foreground">Add your logo, event name, hashtags, and dates to maximize brand visibility</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-medium">Create multiple template types</h5>
                <p className="text-sm text-muted-foreground">Offer options like "Speaker", "Attendee", "Sponsor" so everyone finds their fit</p>
              </div>
            </li>
          </ul>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Branding Assets" icon={<Building2 className="h-5 w-5" />}>
        <div className="space-y-4">
          <p className="text-muted-foreground">Customize the participant page with your brand identity:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/30">
              <h5 className="font-medium mb-2">Main Logo</h5>
              <p className="text-sm text-muted-foreground">Displayed in the participant page header. Use a horizontal format for best results.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <h5 className="font-medium mb-2">Secondary Logo (Optional)</h5>
              <p className="text-sm text-muted-foreground">Perfect for co-branding with partners or sponsors.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <h5 className="font-medium mb-2">Favicon</h5>
              <p className="text-sm text-muted-foreground">Small icon that appears in the browser tab. Use a square format.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <h5 className="font-medium mb-2">Brand Colors</h5>
              <p className="text-sm text-muted-foreground">Set primary, secondary, and text colors to match your brand palette.</p>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Placeholder Images" icon={<Camera className="h-5 w-5" />}>
        <div className="space-y-4">
          <p className="text-muted-foreground">Placeholder images show what the final visual will look like before participants upload their photo:</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-medium">What they do</h5>
                <p className="text-sm text-muted-foreground">Participants see a completed example visual, making it clearer what they're creating</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-medium">Placeholder Library</h5>
                <p className="text-sm text-muted-foreground">Upload placeholder images once and reuse them across multiple templates</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-medium">Best practice</h5>
                <p className="text-sm text-muted-foreground">Use diverse, professional headshots that represent your audience</p>
              </div>
            </li>
          </ul>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Caption Ideas" icon={<MessageSquare className="h-5 w-5" />}>
        <div className="space-y-4">
          <p className="text-muted-foreground">Pre-written captions help participants share their visuals with compelling copy:</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-medium">Add multiple options</h5>
                <p className="text-sm text-muted-foreground">Provide 3-5 caption variations so participants can choose what fits their style</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-medium">Include hashtags</h5>
                <p className="text-sm text-muted-foreground">Add your event hashtag to track social mentions</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-medium">Make them shareable</h5>
                <p className="text-sm text-muted-foreground">Write captions that participants would actually want to post</p>
              </div>
            </li>
          </ul>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Social Media Links" icon={<Link2 className="h-5 w-5" />}>
        <div className="space-y-4">
          <p className="text-muted-foreground">Connect your event's social presence:</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="p-3 rounded-lg bg-muted/30 text-center">
              <h5 className="font-medium">Homepage URL</h5>
              <p className="text-sm text-muted-foreground">Link to your event website</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 text-center">
              <h5 className="font-medium">Instagram</h5>
              <p className="text-sm text-muted-foreground">Your Instagram profile</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 text-center">
              <h5 className="font-medium">LinkedIn</h5>
              <p className="text-sm text-muted-foreground">Your LinkedIn page</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">These links appear as icons in the participant page header for easy access.</p>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Photo Folder Button (Optional)" icon={<FolderOpen className="h-5 w-5" />}>
        <div className="space-y-4">
          <Badge variant="outline" className="mb-2">Optional Feature</Badge>
          <p className="text-muted-foreground">Add a button linking to external photo galleries or folders:</p>
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <h5 className="font-medium mb-2">Perfect for:</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                After-event highlight photo galleries
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Google Drive or Dropbox photo folders
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Professional photography albums
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Flickr or SmugMug galleries
              </li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure the button text, URL, and background color in Event Settings → Branding. The button appears below the hero section on the participant page.
          </p>
        </div>
      </ExpandableSection>
    </div>
  );
}

function UseCasesContent() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Marketing Use Cases</h2>
        <p className="text-muted-foreground">
          Discover powerful ways to use meetme for your event marketing strategy.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <UseCaseCard
          icon={<Megaphone className="h-6 w-6" />}
          title="Pre-Event Promotion"
          description="Build anticipation and drive registrations before your event."
          examples={[
            "Speaker spotlight visuals for social announcements",
            "Early-bird registration incentive graphics",
            "Countdown visuals with participant photos",
            "Influencer partnership promotional content",
          ]}
        />
        
        <UseCaseCard
          icon={<PartyPopper className="h-6 w-6" />}
          title="During Event"
          description="Maximize engagement while your event is happening."
          examples={[
            "Live networking visuals at the event",
            "Photo booth alternative with branded frames",
            "Session-specific templates (workshops, keynotes)",
            "Real-time social sharing competitions",
          ]}
        />
        
        <UseCaseCard
          icon={<Camera className="h-6 w-6" />}
          title="Post-Event Highlights"
          description="Extend your event's reach after it ends."
          examples={[
            "Thank you visuals for attendees",
            "Best moments photo frame with event photos",
            "Testimonial templates with attendee quotes",
            "Save-the-date for next year's event",
          ]}
        />
        
        <UseCaseCard
          icon={<Building2 className="h-6 w-6" />}
          title="Partner & Sponsor"
          description="Showcase your partners and sponsors."
          examples={[
            "Sponsor spotlight templates",
            "Partner co-branded visuals",
            "Exhibitor promotional frames",
            "VIP and premium tier recognition",
          ]}
        />
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Template Type Ideas
          </CardTitle>
          <CardDescription>Create different template types for different audiences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["Attendee", "Speaker", "Sponsor", "Partner", "Investor", "Startup", "Corporate", "Volunteer", "VIP", "Press", "Alumni", "First-Timer"].map((type) => (
              <Badge key={type} variant="secondary" className="text-sm">
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-6 w-6 text-primary" />
            <h3 className="font-semibold text-lg">Real Impact</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            When attendees share their personalized visuals, they become ambassadors for your event. Each share exposes your brand to their entire network—often reaching audiences you couldn't access through traditional marketing.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">10x</p>
              <p className="text-sm text-muted-foreground">Social Reach</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">5 min</p>
              <p className="text-sm text-muted-foreground">Setup Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">Free</p>
              <p className="text-sm text-muted-foreground">Marketing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsContent() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Understanding Your Analytics</h2>
        <p className="text-muted-foreground">
          Learn how to read and use your analytics data to optimize your event marketing.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Metrics Explained</CardTitle>
          <CardDescription>What each metric means and why it matters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MetricExplainer
            icon={<Eye className="h-5 w-5 text-white" />}
            title="Views"
            description="Number of times participants opened a template. High views indicate good reach and interest in your event."
            color="bg-[hsl(175,70%,45%)]"
          />
          <MetricExplainer
            icon={<Upload className="h-5 w-5 text-white" />}
            title="Uploads"
            description="Number of photos participants uploaded. Measures active engagement—people who started creating their visual."
            color="bg-[hsl(55,85%,45%)]"
          />
          <MetricExplainer
            icon={<Download className="h-5 w-5 text-white" />}
            title="Downloads"
            description="Number of completed visuals downloaded. This is your conversion goal—visuals ready to be shared on social media."
            color="bg-[hsl(28,95%,50%)]"
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your conversion rate is calculated as Downloads ÷ Views. This tells you how effectively your page turns visitors into sharers.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Below 10%</span>
                <Badge variant="destructive">Needs improvement</Badge>
              </div>
              <div className="flex justify-between">
                <span>10-25%</span>
                <Badge variant="secondary">Average</Badge>
              </div>
              <div className="flex justify-between">
                <span>25-40%</span>
                <Badge variant="default">Good</Badge>
              </div>
              <div className="flex justify-between">
                <span>Above 40%</span>
                <Badge className="bg-primary/20 text-primary">Excellent</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Peak Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The hourly heatmap shows when participants are most active. Use this to time your promotional pushes.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                Post reminders during peak engagement hours
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                Schedule email campaigns before peak times
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                Identify timezone patterns for global events
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Performance</CardTitle>
          <CardDescription>Compare how different templates perform</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The template performance table shows metrics for each template. Use this to understand:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-medium">Which templates are most popular</h5>
                <p className="text-sm text-muted-foreground">High views and downloads indicate winning designs</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-medium">Which template types resonate</h5>
                <p className="text-sm text-muted-foreground">Compare "Speaker" vs "Attendee" performance</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-medium">Format preferences</h5>
                <p className="text-sm text-muted-foreground">See if Square or Story format gets more engagement</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ProTipsContent() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Pro Tips & Best Practices</h2>
        <p className="text-muted-foreground">
          Expert advice to maximize your meetme campaign effectiveness.
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Template Design Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium">Keep the photo area prominent</h5>
                  <p className="text-sm text-muted-foreground">At least 40-50% of the template should be the photo zone. People want to see themselves!</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium">Use high contrast colors</h5>
                  <p className="text-sm text-muted-foreground">Ensure your branding elements are visible against various photo backgrounds</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium">Include a clear call-to-action</h5>
                  <p className="text-sm text-muted-foreground">Add your hashtag, event date, or website directly on the template</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium">Test on mobile</h5>
                  <p className="text-sm text-muted-foreground">Most users will view on mobile—ensure text is readable at smaller sizes</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Caption Writing Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium">Write in first person</h5>
                  <p className="text-sm text-muted-foreground">"I'm speaking at..." feels more authentic than "Join us at..."</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium">Include excitement</h5>
                  <p className="text-sm text-muted-foreground">Emojis and enthusiasm are contagious—make sharing feel fun!</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium">Add networking CTAs</h5>
                  <p className="text-sm text-muted-foreground">"Let's connect!" or "Who else is going?" encourages engagement</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium">Keep hashtags minimal</h5>
                  <p className="text-sm text-muted-foreground">1-3 relevant hashtags perform better than hashtag overload</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Timing & Promotion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium">Start 2-4 weeks before</h5>
                  <p className="text-sm text-muted-foreground">Give attendees time to create and share visuals before the event</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium">Add to confirmation emails</h5>
                  <p className="text-sm text-muted-foreground">Include the meetme link in registration confirmations</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium">Feature early adopters</h5>
                  <p className="text-sm text-muted-foreground">Reshare early participant visuals to encourage others</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium">Send reminder emails</h5>
                  <p className="text-sm text-muted-foreground">A week before and day-of reminders boost participation</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              The Ultimate Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Lead by example.</strong> Have your team, speakers, and partners create and share their visuals first. When people see others participating, they're much more likely to join in. Social proof is your most powerful marketing tool!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Guide() {
  const [activeTab, setActiveTab] = useState<GuideTab>("quickstart");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Guide</h1>
        <p className="text-muted-foreground">
          Everything you need to know to create successful event marketing campaigns with meetme.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted/30 rounded-xl">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg transition-all ${
              activeTab === tab.id 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "hover:bg-muted"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "quickstart" && <QuickStartContent />}
        {activeTab === "detailed" && <DetailedGuideContent />}
        {activeTab === "usecases" && <UseCasesContent />}
        {activeTab === "analytics" && <AnalyticsContent />}
        {activeTab === "protips" && <ProTipsContent />}
      </div>
    </div>
  );
}
