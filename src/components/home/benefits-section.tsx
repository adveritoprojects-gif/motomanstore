import { Truck, ShieldCheck, Headphones, Leaf } from "lucide-react";
import { BENEFITS } from "@/lib/data";

const iconMap: Record<string, React.ElementType> = {
  truck: Truck,
  "shield-check": ShieldCheck,
  headphones: Headphones,
  leaf: Leaf,
};

export function BenefitsSection() {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-5 md:px-6">
        {/* Desktop: 4 columns */}
        <div className="hidden grid-cols-4 gap-6 md:grid">
          {BENEFITS.map((benefit) => {
            const Icon = iconMap[benefit.icon] || Truck;
            return (
              <div
                key={benefit.title}
                className="flex flex-col items-center rounded-lg border border-neutral-200 p-6 text-center transition-all duration-200 hover:shadow-sm"
              >
                <Icon className="mb-3 h-8 w-8 text-neutral-900" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="mb-1 text-sm font-bold text-neutral-950">
                  {benefit.title}
                </h3>
                <p className="text-xs text-neutral-500">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {/* Mobile: 2x2 grid */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {BENEFITS.map((benefit) => {
            const Icon = iconMap[benefit.icon] || Truck;
            return (
              <div
                key={benefit.title}
                className="flex flex-col items-center rounded-lg border border-neutral-200 p-4 text-center"
              >
                <Icon className="mb-2 h-7 w-7 text-neutral-900" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="mb-0.5 text-xs font-bold text-neutral-950">
                  {benefit.title}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
