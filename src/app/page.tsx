'use client';

import Link from 'next/link';
import Image from 'next/image';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { MediTrackLogo } from '@/components/icons';

export default function WebHomepage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background sticky top-0 z-50 border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <MediTrackLogo className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-semibold font-headline">MediTrack</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button asChild>
            <Link href="/login">
              Login
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="relative w-full h-[calc(100vh-3.5rem)]">
          <div className="absolute inset-0">
             <Image
                src="/doctor3.jpg"
                alt="A team of medical professionals"
                fill
                className="object-cover"
                data-ai-hint="hospital team"
              />
          </div>
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 container px-4 md:px-6 z-20">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-white">
                 Your Clinic is MediTrack
                </h1>
                <p className="max-w-[600px] text-gray-200 md:text-xl">
                  An intelligent hospital management system designed to optimize patient flow and improve clinical decision-making.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/login">
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col sm:flex-row py-6 w-full shrink-0 items-center justify-center px-4 md:px-6 border-t gap-4">
        <p className="text-xs text-muted-foreground">&copy; 2024 MediTrack. All rights reserved.</p>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
