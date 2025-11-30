import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQSection() {
  // Put the 3 "hottest" questions at the top of the array
  const faqs = [
    {
      question: "Do my attendees need an account?",
      answer: "No. They just open the link, upload their photo, and download. Zero friction, maximum sharing.",
    },
    {
      question: "How quickly can I set up my first event?",
      answer:
        "Under 5 minutes! Upload your templates, set your event details, and share the link. Most organizers are live in less time than it takes to make coffee.",
    },
    {
      question: "Can I customize the visuals to match my branding?",
      answer:
        "Absolutely! Upload your own designs with your colors, logos, and messaging. Add your event's homepage URL and social media links for complete brand consistency.",
    },
    {
      question: "What types of events work best with meetme?",
      answer:
        "Any event where networking and social sharing matter: conferences, summits, festivals, corporate events, meetups, university events, and more. If your attendees have phones and social media, meetme amplifies your reach.",
    },
    {
      question: "How do I track engagement and performance?",
      answer:
        "Our real-time analytics dashboard shows views, uploads, downloads, and shares. See which templates perform best, identify peak engagement times, and track your event's viral reach.",
    },
    {
      question: "Do you store attendee photos?",
      answer:
        "No, photos stay in the browser and the downloaded image. We never store participant photos—complete privacy by design.",
    },
    {
      question: "What image formats do you support?",
      answer:
        "Square (1080×1080), Story (1080×1920), Landscape (1200×630), and Portrait (1080×1350)—all optimized for LinkedIn, Instagram, X, and other major platforms.",
    },
    {
      question: "Can I use meetme for multiple events?",
      answer:
        "Yes! The free plan includes 1 event. Pro plans (coming soon) support unlimited events with advanced features like custom branding and detailed analytics.",
    },
  ];

  const [showAll, setShowAll] = useState(false);

  const visibleFaqs = showAll ? faqs : faqs.slice(0, 3);
  const hiddenCount = faqs.length - visibleFaqs.length;

  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">Everything you need to know</p>
        </div>

        {/* Wrap in Card to keep it neat but keep original styling of items */}
        <Card className="bg-background/60 border-border/60 shadow-md shadow-black/20">
          <Accordion type="single" collapsible className="mb-6">
            {visibleFaqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`} className="border-border/50">
                <AccordionTrigger className="text-left hover:text-primary transition-colors">
                  <span className="font-semibold text-lg">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground pl-4">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Show all / fewer toggle */}
          <div className="flex justify-center pb-4">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="text-sm md:text-base px-4 py-2 rounded-full border border-border/60 hover:border-primary/60 hover:text-primary transition-colors"
            >
              {showAll
                ? "Show fewer questions"
                : hiddenCount > 0
                  ? `Show all ${hiddenCount + 3} questions`
                  : "Show all questions"}
            </button>
          </div>
        </Card>
      </div>
    </section>
  );
}
