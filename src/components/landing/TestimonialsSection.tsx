import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "meetme helped us generate 500+ social shares in the first week. The setup took literally 10 minutes.",
      name: "Sarah Chen",
      role: "Event Marketing Lead",
      event: "TechSummit 2024",
      avatar: "SC",
    },
    {
      quote:
        "We saved over $5,000 in marketing costs and reached 10x more people than traditional campaigns.",
      name: "Marcus Johnson",
      role: "Community Manager",
      event: "StartupWeek Berlin",
      avatar: "MJ",
    },
    {
      quote:
        "The analytics dashboard showed us exactly which visuals performed best. Game-changer for our strategy.",
      name: "Elena Rodriguez",
      role: "Brand Director",
      event: "Innovation Forum",
      avatar: "ER",
    },
  ];

  const successMetrics = [
    { icon: "📈", stat: "300%", label: "Average engagement increase" },
    { icon: "🔄", stat: "500+", label: "Shares in first week" },
    { icon: "⏱️", stat: "10 min", label: "Average setup time" },
  ];

  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, testimonials.length]);

  const next = () => setActive((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const handleTouchStart = (e: any) => {
    setTouchStartX(e.touches[0].clientX);
    setIsHovered(true);
  };

  const handleTouchEnd = (e: any) => {
    if (touchStartX === null) {
      setIsHovered(false);
      return;
    }
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 50) {
      deltaX < 0 ? next() : prev();
    }
    setTouchStartX(null);
    setIsHovered(false);
  };

  const current = testimonials[active];

  return (
    <section className="py-20 bg-gradient-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZp]()
