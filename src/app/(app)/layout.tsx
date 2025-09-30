'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, Stethoscope, Pill, PanelLeft, Shield, UserPlus } from 'lucide-react';

import { PatientProvider } from '@/contexts/patient-context';
import { cn } from '@/lib/utils';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { MediTrackLogo } from '@/components/icons';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { href: '/reception', label: 'Reception', icon: ClipboardList },
  { href: '/doctor', label: "Doctor's Queue", icon: Stethoscope },
  { href: '/medication-search', label: 'Medication Search', icon: Pill },
  { href: '/admin', label: 'Admin', icon: Shield },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  
  const sidebarContent = (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <PanelLeft />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <MediTrackLogo className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold font-headline">MediTrack</h1>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label }}
                >
                  <item.icon className="text-accent" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );

  return (
    <PatientProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">{sidebarContent}</Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-card px-4 sm:h-16 sm:px-6">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                 <Link href="/" className="flex items-center gap-2 md:hidden">
                    <MediTrackLogo className="h-6 w-6 text-primary" />
                    <h1 className="font-headline text-lg font-semibold">MediTrack</h1>
                 </Link>
              </div>
              <div className="flex-1">
                 {/* Can add a global search or other header items here */}
              </div>
            </header>
            <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </PatientProvider>
  );
}
