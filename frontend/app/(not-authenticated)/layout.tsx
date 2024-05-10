import LandingNavbar from "./LandingNavbar"; 

export default function NonAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <LandingNavbar />
        {children}
    </>
  );
}
