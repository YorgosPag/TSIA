
"use client";

import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { BookUser, LayoutDashboard, GanttChart, BarChart, FileText, Mail, List, Archive, Moon, Bell, Sun } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar collapsible="icon">
          <SidebarHeader className="p-4 h-16 flex items-center">
             <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-foreground">N</span>
                </Avatar>
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold">NESTOR</h2>
                    <span className="text-xs text-muted-foreground">eco</span>
                </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="#">
                  <BarChart />
                  Πίνακας Ελέγχου
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/projects">
                   <GanttChart />Λίστα Έργων
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton href="/">
                   <BookUser />Λίστα Επαφών
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton href="/reports">
                  <FileText />
                  Αποτυπώσεις
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarGroup>
                  <SidebarGroupLabel>ΔΙΑΧΕΙΡΙΣΗ</SidebarGroupLabel>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/custom-lists">
                      <List />Προσαρμοσμένες Λίστες
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="#">
                      <Archive />
                      Αρχείο Email
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarGroup>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <header className="flex h-16 items-center justify-between border-b bg-card px-6">
                <div className="flex items-center gap-4">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Αναζήτηση επαφής ή έργου..." className="pl-10 bg-background" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="sr-only">Toggle theme</span>
                  </Button>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-right">Νέστωρ Δοκιμαστικός</span>
                         <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-primary-foreground">N</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </header>
            {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
