import { cn } from "@/lib/utils";

type SignupProgressProps = {
  currentStep: "category" | "plan" | "register";
};

const steps = [
  { id: "category", label: "Profil" },
  { id: "plan", label: "Forfait" },
  { id: "register", label: "Inscription" },
] as const;

export function SignupProgress({ currentStep }: SignupProgressProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isDone = index < currentIndex;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-xs font-bold",
                isActive && "bg-[#00BFA6] text-white",
                isDone && "bg-[#00BFA6]/20 text-[#00BFA6]",
                !isActive && !isDone && "bg-[#F5F7FA] text-muted-foreground"
              )}
            >
              {index + 1}
            </div>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                isActive ? "font-medium text-[#0B1D2A]" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span className="mx-1 hidden h-px w-6 bg-border sm:block" />
            )}
          </div>
        );
      })}
    </div>
  );
}
