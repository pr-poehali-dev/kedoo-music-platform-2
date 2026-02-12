import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: 'Релизы', href: '/dashboard/releases', icon: 'Disc' },
    { name: 'Создать релиз', href: '/dashboard/releases/new', icon: 'Plus' },
    { name: 'СмартСсылки', href: '/dashboard/smartlinks', icon: 'Link' },
    { name: 'Студия', href: '/dashboard/studio', icon: 'Clapperboard' },
    { name: 'Тикеты', href: '/dashboard/tickets', icon: 'MessageSquare' },
    { name: 'Кошелек', href: '/dashboard/wallet', icon: 'Wallet' },
    { name: 'Статистика', href: '/dashboard/stats', icon: 'BarChart3' },
  ];

  const moderatorNavigation = [
    { name: 'Модерация релизов', href: '/dashboard/moderation/releases', icon: 'CheckCircle' },
    { name: 'Модерация смартлинков', href: '/dashboard/moderation/smartlinks', icon: 'LinkIcon' },
    { name: 'Модерация студии', href: '/dashboard/moderation/studio', icon: 'Film' },
    { name: 'Все тикеты', href: '/dashboard/tickets/all', icon: 'Inbox' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (href: string) => location.pathname === href;

  const NavLinks = () => {
    const links = user?.role === 'moderator' ? moderatorNavigation : navigation;
    return (
      <>
        {links.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            <Icon name={item.icon} className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Icon name="Menu" className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Icon name="Radio" className="h-6 w-6 text-primary" />
                    <span className="font-heading font-bold">Radish</span>
                  </div>
                </div>
                <nav className="p-4 space-y-2">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>

            <Link to="/dashboard/releases" className="flex items-center gap-2">
              <Icon name="Radio" className="h-6 w-6 text-primary" />
              <h1 className="font-heading font-bold text-xl hidden sm:block">Radish</h1>
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Icon name="User" className="h-5 w-5" />
                <span className="hidden sm:inline">{user?.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold">{user?.username}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile" className="cursor-pointer">
                  <Icon name="Settings" className="mr-2 h-4 w-4" />
                  Профиль
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings" className="cursor-pointer">
                  <Icon name="Palette" className="mr-2 h-4 w-4" />
                  Настройки
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                <Icon name="LogOut" className="mr-2 h-4 w-4" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:block w-64 border-r border-border min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            <NavLinks />
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}