import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'SUNVAX | Cold-chain intelligence', description: 'Solar-powered vaccine cold-chain monitoring platform by Cytobiz Innovation Labs.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
