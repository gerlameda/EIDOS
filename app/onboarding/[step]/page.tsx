import { redirect } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";

export default async function OnboardingStepPage({
  params,
}: Readonly<{
  params: Promise<{ step: string }>;
}>) {
  const { step: raw } = await params;
  const step = Number.parseInt(raw, 10);
  if (!Number.isFinite(step) || step < 1 || step > 8) {
    redirect("/onboarding/1");
  }
  return <OnboardingShell step={step} />;
}
