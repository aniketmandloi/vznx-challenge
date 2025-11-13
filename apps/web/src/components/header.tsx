"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, Home, LayoutDashboard, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { to: "/" as const, label: "Home", icon: Home },
    { to: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { to: "/dashboard/team" as const, label: "Team", icon: Users },
  ] as const;

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {links.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          href={to}
          onClick={() => mobile && setIsOpen(false)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive(to)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
            mobile && "w-full justify-start"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              V
            </div>
            <span className="hidden font-bold text-lg sm:inline-block">
              VZNX Challenge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLinks />
          </nav>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-2 px-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                    V
                  </div>
                  <span className="font-bold text-lg">VZNX Challenge</span>
                </div>
                <nav className="flex flex-col gap-1">
                  <NavLinks mobile />
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
