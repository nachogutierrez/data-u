import AppNavbar from "@/components/navbar/AppNavbar"; 

export default function NonAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <AppNavbar/>
        {children}
    </>
  );
}
