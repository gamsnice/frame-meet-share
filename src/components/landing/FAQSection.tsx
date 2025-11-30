import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQSection() {
  const faqs = [
    {
      question: "Do my attendees need an account?",
      answer: "No. They just open the link, upload their photo, and download. Zero friction, maximum sharing.",
    },
    {
      question: "How quickly can I set up my first event?",
      answer: "Under 5 minutes! Upload your templates, set your event details, and share the link.",
    },
    {
      question: "Can I customize the visuals to match my branding?",
      answer: "Absolutely! Upload your own designs with your colors, logos, and messaging.",
    },
    {
      question: "How do I track engagement and performance?",
      answer: "Our real-time analytics dashboard shows views, uploads, downloads, and shares.",
    },
    {
      question: "Do you store attendee photos?",
      answer:
        "No, photos stay in the browser and the downloaded image. We never store participant photos — privacy by design.",
    },
    {
      question: "What image formats do you support?",
      answer: "Square, Story, Landscape, and Portrait — all optimized for major platforms.",
    },
    {
      question: "Can I use meetme for multiple events?",
      answer: "Yes! The free plan includes 1 event. Pro plans (coming soon) support unlimited events.",
    },
  ];

  // Show only first 3 initially
  const [showAll, setShowAll] = useState(false);
  const visibleFaqs = showAll ? faqs : faqs.slice(0, 3);

  return (
    <section className="py-20 bg-gradient-card relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">Everything you need to know.</p>
        </div>

        <Card className="bg-background/60 border-border/60 shadow-md shadow-black/20 p-2 md:p-4">
          <Accordion type="single" collapsible>
            {visibleFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/40 px-2 md:px-4">
                <AccordionTrigger className="py-4 text-left hover:text-primary transition-colors font-semibold text-base md:text-lg">
                  {faq.question}
                </AccordionTrigger>

                <AccordionContent>
                  <p className="text-muted-foreground pb-4 text-sm md:text-base">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Toggle Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm md:text-base px-4 py-2 rounded-full border border-border/60 hover:border-primary/60 hover:text-primary transition-colors"
          >
            {showAll ? "Show fewer questions" : "Show all questions"}
          </button>
        </div>
      </div>
    </section>
  );
}
