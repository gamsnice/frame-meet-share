import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Imprint() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-8">Imprint</h1>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-lg font-semibold text-muted-foreground mb-2">Name</h2>
            <p>Valentin Spörk</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-muted-foreground mb-2">Address</h2>
            <p>Ulmenstraße 16</p>
            <p>6063 Rum</p>
            <p>Austria</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-muted-foreground mb-2">Contact</h2>
            <p>
              Email:{" "}
              <a 
                href="mailto:valentin.spoerk@gmail.com" 
                className="text-primary hover:underline"
              >
                valentin.spoerk@gmail.com
              </a>
            </p>
            <p>
              Phone:{" "}
              <a 
                href="tel:+436644171931" 
                className="text-primary hover:underline"
              >
                +43 664 4171931
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-muted-foreground mb-2">Legal Form</h2>
            <p>Sole proprietor</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-muted-foreground mb-2">Platform</h2>
            <p>The offered tool is provided via vasy.dev</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-muted-foreground mb-2">Scope of Business</h2>
            <p>Services in automatic data processing and information technology</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-muted-foreground mb-2">Trade</h2>
            <p>Free trade (Austrian Trade Regulation Act - GewO)</p>
          </section>
        </div>
      </div>
    </div>
  );
}
