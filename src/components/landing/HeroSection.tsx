import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import exampleSkinnovation from "@/assets/example-skinnovation.webp";
import exampleNextConnect from "@/assets/example-nextconnect.png";
import exampleInnovateSummit from "@/assets/example-innovatesummit.png";
import TrustSignals from "./TrustSignals";

const examples = [
  { image: exampleSkinnovation },
  { image: exampleNextConnect },
  { image: exampleInnovateSummit },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [activeExample, setActiveExample] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExample((prev) => (prev + 1) % examples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-hero pt-20 md:pt-32">
      <div className="absolute inset-0 bg-gradient-glow opacity-50"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          {/* Left: Copy */}
          <div className="text-foreground">
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl animate-fade-in">
              Let Your Attendees Do Your{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent"> Event Marketing</span>
            </h1>
            <p
              className="mb-4 text-lg text-muted-foreground md:text-xl animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="font-semibold bg-gradient-accent bg-clip-text text-transparent">meetme</span> is your
              ultimate event marketing tool. Create stunning visuals, let your participants share them and with just a
              few clicks, your event reaches millions.
            </p>
            <div
              className="flex flex-col gap-4 sm:flex-row animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <Button
                size="lg"
                className="bg-gradient-accent text-primary-foreground hover:opacity-90 font-semibold shadow-glow animate-pulse-glow"
                onClick={() => navigate("/admin/register")}
              >
                🚀 Start Boosting Your Event's Reach
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-muted hover:border-primary/50 transition-colors"
                onClick={() =>
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See how it works
                <ChevronDown className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Right: Animated Example Images */}
          <div className="relative h-[300px] sm:h-[400px] md:h-[500px]" style={{ animationDelay: "0.3s" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              {examples.map((example, index) => {
                const positions: Record<number, string> = {
                  0: "translate-x-0 scale-100 z-30 opacity-100",
                  "-1": "-translate-x-32 translate-y-6 scale-90 z-20 opacity-70",
                  1: "translate-x-32 translate-y-6 scale-90 z-20 opacity-70",
                };

                let relative = index - activeExample;
                if (relative > 1) relative -= examples.length;
                if (relative < -1) relative += examples.length;

                const transformClass = positions[relative] || "opacity-0 scale-90";

                return (
                  <div
                    key={index}
                    className={`absolute transition-all duration-700 ease-[cubic-bezier(.25,.8,.25,1)] cursor-pointer ${transformClass}`}
                    onClick={() => setActiveExample(index)}
                  >
                    <img
                      src={example.image}
                      alt="meetme example"
                      className="rounded-2xl object-contain max-h-[260px] sm:max-h-[320px] md:max-h-[380px] transition-opacity duration-700"
                    />
                  </div>
                );
              })}
            </div>

            {/* Floating decoration circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-float-delayed" />
          </div>
        </div>
      </div>

      <TrustSignals />
    </section>
  );
}
