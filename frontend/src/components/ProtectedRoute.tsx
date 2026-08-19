export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  // Allow direct guest/open access without forcing sign-in redirect
  return <>{children}</>;
}
