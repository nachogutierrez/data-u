import LandingNavbar from "@/components/navbar/LandingNavbar"; 

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
