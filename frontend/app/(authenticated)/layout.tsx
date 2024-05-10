import AppNavbar from "./AppNavbar"; 

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
