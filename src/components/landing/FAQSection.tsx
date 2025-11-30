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
        "Any event where networking and social sharing matter: conferences, summits, festivals, corporate events, meetups, university events, and more.",
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
      answer: "Square (1080×1080), Story (1080×1920), Landscape (1200×630), and Portrait (1080×1350).",
      category: "Branding",
    },
    {
      question: "Can I use meetme for multiple events?",
      answer:
        "Yes! The free plan includes 1 event. Pro plans (coming soon) support unlimited events with additional features.",
      category: "Plans",
    },
  ];

  const categories = ["All", "Setup", "Branding", "Analytics", "Privacy", "Plans", "Use cases"] as const;

  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");
  const [showAll, setShowAll] = useState(false);

  const filteredFaqs = activeCategory === "All" ? faqs : faqs.filter((faq) => faq.category === activeCategory);

  const visibleFaqs = showAll ? filteredFaqs : filteredFaqs.slice(0, 3);
  const hiddenCount = Math.max(filteredFaqs.length - visibleFaqs.length, 0);

  return (
    <section className="py-20 bg-gradient-card relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Frequently Asked <span className="bg-gradient-accent bg-clip-text text-transparent">Questions</span></h2>
          <p className="text-lg text-muted-foreground">Everything you need to know</p>
        </div>

        {/* Category filter chips */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
                setShowAll(false); // reset to hottest 3 when switching category
              }}
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

        {/* FAQ Accordion */}
        <Card className="bg-background/60 border-border/60 shadow-md shadow-black/20">
          <Accordion type="single" collapsible className="divide-y divide-border/40">
            {visibleFaqs.map((faq, index) => (
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

          {/* Show all / fewer toggle */}
          {filteredFaqs.length > 3 && (
            <div className="flex justify-center pb-4 pt-2">
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="text-sm md:text-base px-4 py-2 rounded-full border border-border/60 hover:border-primary/60 hover:text-primary transition-colors"
              >
                {showAll
                  ? "Show fewer questions"
                  : hiddenCount > 0
                    ? `Show all ${filteredFaqs.length} questions`
                    : "Show all questions"}
              </button>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
