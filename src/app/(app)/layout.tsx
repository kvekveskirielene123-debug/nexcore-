export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add bottom padding on mobile so content isn't hidden behind the bottom tab bar.
  // md: removes it since the bottom bar is hidden on desktop.
  return <div className="pb-16 md:pb-0">{children}</div>;
}
