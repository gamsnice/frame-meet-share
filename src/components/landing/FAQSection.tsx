import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQSection() {
  const faqs = [
    {
      question: "Do my attendees need an account?",
      answer: "No. They just open the link, upload their photo, and download. Zero friction, maximum sharing.",
      category: "Setup",
    },
    {
      question: "How quickly can I set up my first event?",
      answer:
        "Under 5 minutes! Upload your templates, set your event details, and share the link. Most organizers are live in less time than it takes to make coffee.",
      category: "Setup",
    },
    {
      question: "Can I customize the visuals to match my branding?",
      answer:
        "Absolutely! Upload your own designs with your colors, logos, and messaging. Add your event's homepage URL and social media links for complete brand consistency.",
      category: "Branding",
    },
    {
      question: "What types of events work best with meetme?",
      answer:
        "Any event where networking and social sharing matter: conferences, summits, festivals, corporate events, meetups, university events, and more. If your attendees have phones and social media, meetme amplifies your reach.",
      category: "Use cases",
    },
    {
      question: "How do I track engagement and performance?",
      answer:
        "Our real-time analytics dashboard shows views, uploads, downloads, and shares. See which templates perform best, identify peak engagement times, and track your event's viral reach.",
      category: "Analytics",
    },
    {
      question: "Do you store attendee photos?",
      answer:
        "No, photos stay in the browser and the downloaded image. We never store participant photos—complete privacy by design.",
      category: "Privacy",
    },
    {
      question: "What image formats do you support?",
      answer:
        "Square (1080×1080), Story (1080×1920), Landscape (1200×630), and Portrait (1080×1350)—all optimized for LinkedIn, Instagram, X, and other major platforms.",
      category: "Branding",
    },
    {
      question: "Can I use meetme for multiple events?",
      answer:
        "Yes! The free plan includes 1 event. Pro plans (coming soon) support unlimited events with advanced features like custom branding and detailed analytics.",
      category: "Plans",
    },
  ];

  const useCases = [
    {
      icon: "🎤",
      title: "Conferences & Summits",
      description:
        "Create branded visuals for speakers, sponsors, and attendees. Track which sessions generate the most social buzz.",
    },
    {
      icon: "🎪",
      title: "Festivals & Concerts",
      description:
        "Let festival-goers share their excitement with custom frames. Turn every attendee into a walking billboard for your event.",
    },
    {
      icon: "🏢",
      title: "Corporate Events",
      description:
        "Professional templates for company events, product launches, and team gatherings. Maintain brand consistency across all shared content.",
    },
    {
      icon: "🤝",
      title: "Networking Meetups",
      description:
        "Help attendees connect before, during, and after events. Branded visuals make your community instantly recognizable.",
    },
    {
      icon: "🎓",
      title: "University Events",
      description:
        "Campus events, career fairs, and student organizations. Cost-effective marketing that students actually want to share.",
    },
    {
      icon: "💼",
      title: "Trade Shows",
      description:
        "Stand out on the show floor. Branded visuals help exhibitors and visitors amplify your event's presence.",
    },
  ];

  const categories = ["All", "Setup", "Branding", "Analytics", "Privacy", "Plans", "Use cases"] as const;

  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");

  const filteredFaqs = activeCategory === "All" ? faqs : faqs.filter((faq) => faq.category === activeCategory);

  return (
    <section className="py-20 bg-gradient-card relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">Everything you need to know before launching your next event</p>
        </div>

        {/* Category filter chips */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm border transition-all
                ${
                  activeCategory === cat
                    ? "bg-primary/20 border-primary/60 text-primary-foreground"
                    : "bg-background/40 border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[2fr,1.3fr] lg:items-start">
          {/* FAQ Accordion */}
          <Card className="bg-background/60 border-border/60 shadow-md shadow-black/20">
            <Accordion type="single" collapsible className="divide-y divide-border/40">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={`${faq.question}-${index}`}
                  value={`item-${index}`}
                  className="border-none px-4 md:px-6"
                >
                  <AccordionTrigger className="py-4 text-left hover:text-primary transition-colors [&[data-state=open]]:text-primary">
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-semibold text-base md:text-lg">{faq.question}</span>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">{faq.category}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground pb-4 md:pb-5 text-sm md:text-base">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          {/* Use Cases / Side column */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Where meetme works especially well</h3>
            <p className="text-sm text-muted-foreground mb-2">
              A few examples of events that already see 3–10x more reach with attendee-generated visuals:
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {useCases.map((useCase, index) => (
                <Card
                  key={index}
                  className="p-4 bg-background/60 border-border/60 hover:border-primary/60 hover:shadow-glow transition-all duration-200 flex gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-lg">
                    {useCase.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-1">{useCase.title}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{useCase.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
