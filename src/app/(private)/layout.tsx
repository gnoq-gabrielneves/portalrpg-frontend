import { PrivateAppShell } from "@/shared/components/PrivateAppShell";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PrivateAppShell>{children}</PrivateAppShell>;
}
