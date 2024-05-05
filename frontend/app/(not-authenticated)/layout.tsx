import Navbar from "./Navbar"; 

export default function NonAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <Navbar></Navbar>
        {children}
    </>
  );
}
