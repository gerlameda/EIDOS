export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary antialiased">
      {children}
    </div>
  );
}
