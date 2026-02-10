import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

type Page = 'home' | 'auth' | 'dashboard';
type AuthMode = 'login' | 'register' | 'reset';
type DashboardSection = 'releases' | 'tickets' | 'wallet' | 'stats' | 'profile' | 'settings';

interface Release {
  id: string;
  title: string;
  artist: string;
  status: 'draft' | 'moderation' | 'approved' | 'rejected';
  genre: string;
  coverUrl?: string;
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: string;
}

export default function Index() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [dashboardSection, setDashboardSection] = useState<DashboardSection>('releases');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [releases, setReleases] = useState<Release[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [releaseStep, setReleaseStep] = useState(1);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const navItems = [
    { id: 'releases', label: 'Релизы', icon: 'Disc3' },
    { id: 'tickets', label: 'Тикеты', icon: 'MessageSquare' },
    { id: 'wallet', label: 'Кошелёк', icon: 'Wallet' },
    { id: 'stats', label: 'Статистика', icon: 'BarChart3' },
    { id: 'profile', label: 'Профиль', icon: 'User' },
    { id: 'settings', label: 'Настройки', icon: 'Settings' },
  ] as const;

  if (currentPage === 'home') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm fixed w-full z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Music" className="text-primary-foreground" size={24} />
              </div>
              <h1 className="text-2xl font-heading font-bold">Radish</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm hover:text-primary transition-colors">Главная</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">О сервисе</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Контакты</a>
              <Button onClick={() => setCurrentPage('auth')} className="bg-primary hover:bg-primary/90">
                Войти
              </Button>
            </nav>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Icon name="Menu" size={24} />
            </Button>
          </div>
        </header>

        <main className="pt-20">
          <section className="container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center animate-fade-in">
              <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Дистрибуция музыки нового поколения
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Загружайте треки, распространяйте на все стриминговые платформы и управляйте релизами в одном месте
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => setCurrentPage('auth')} className="bg-primary hover:bg-primary/90 text-lg px-8">
                  Начать сейчас
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Узнать больше
                </Button>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-20">
            <div className="grid md:grid-cols-3 gap-6">
              {([
                { icon: 'Upload', title: 'Загрузка', desc: 'Загружайте треки в высоком качестве за минуты' },
                { icon: 'Share2', title: 'Распространение', desc: 'Выводите музыку на все популярные платформы' },
                { icon: 'Shield', title: 'Модерация', desc: 'Профессиональная проверка перед публикацией' },
              ] as const).map((feature, idx) => (
                <Card key={idx} className="p-6 hover:border-primary/50 transition-all animate-scale-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon name={feature.icon} className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t border-border bg-card/30 py-12 mt-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Music" className="text-primary-foreground" size={18} />
                </div>
                <span className="font-heading font-semibold">Radish</span>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <a href="mailto:olprodlabel@gmail.com" className="hover:text-primary transition-colors">
                  olprodlabel@gmail.com
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (currentPage === 'auth') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 animate-scale-in">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Music" className="text-primary-foreground" size={24} />
            </div>
            <h1 className="text-2xl font-heading font-bold">Radish</h1>
          </div>

          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as AuthMode)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
              <TabsTrigger value="reset">Сброс</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                  </Button>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleLogin}>
                Войти
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div>
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" placeholder="your@email.com" />
              </div>
              <div>
                <Label htmlFor="username">Имя пользователя</Label>
                <Input id="username" placeholder="username" />
              </div>
              <div>
                <Label htmlFor="reg-password">Пароль</Label>
                <div className="relative">
                  <Input id="reg-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                  </Button>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleLogin}>
                Зарегистрироваться
              </Button>
            </TabsContent>

            <TabsContent value="reset" className="space-y-4">
              <div>
                <Label htmlFor="reset-email">Email</Label>
                <Input id="reset-email" type="email" placeholder="your@email.com" />
              </div>
              <div>
                <Label htmlFor="new-password">Новый пароль</Label>
                <div className="relative">
                  <Input id="new-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                  </Button>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Сбросить пароль
              </Button>
            </TabsContent>
          </Tabs>

          <Button variant="ghost" className="w-full mt-4" onClick={() => setCurrentPage('home')}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад на главную
          </Button>
        </Card>
      </div>
    );
  }

  if (currentPage === 'dashboard') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm fixed w-full z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)} className="md:hidden">
                <Icon name="Menu" size={24} />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Music" className="text-primary-foreground" size={18} />
                </div>
                <h1 className="text-xl font-heading font-bold">Radish</h1>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Icon name="Bell" size={20} />
            </Button>
          </div>
        </header>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Music" className="text-primary-foreground" size={18} />
                </div>
                Меню
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-8 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={dashboardSection === item.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setDashboardSection(item.id as DashboardSection);
                    setMenuOpen(false);
                  }}
                >
                  <Icon name={item.icon} size={18} className="mr-3" />
                  {item.label}
                </Button>
              ))}
              <Separator className="my-4" />
              <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => {
                setIsLoggedIn(false);
                setCurrentPage('home');
              }}>
                <Icon name="LogOut" size={18} className="mr-3" />
                Выход
              </Button>
            </nav>
          </SheetContent>
        </Sheet>

        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex gap-6">
            <aside className="hidden md:block w-64 shrink-0">
              <Card className="p-4 sticky top-24">
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={dashboardSection === item.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setDashboardSection(item.id as DashboardSection)}
                    >
                      <Icon name={item.icon} size={18} className="mr-3" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
                <Separator className="my-4" />
                <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => {
                  setIsLoggedIn(false);
                  setCurrentPage('home');
                }}>
                  <Icon name="LogOut" size={18} className="mr-3" />
                  Выход
                </Button>
              </Card>
            </aside>

            <main className="flex-1">
              {dashboardSection === 'releases' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-heading font-bold">Релизы</h2>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Создать релиз
                    </Button>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <Button variant="outline" size="sm">Все</Button>
                    <Button variant="ghost" size="sm">Черновики</Button>
                    <Button variant="ghost" size="sm">На модерации</Button>
                    <Button variant="ghost" size="sm">Одобрены</Button>
                    <Button variant="ghost" size="sm">Отклонены</Button>
                  </div>

                  {releases.length === 0 ? (
                    <Card className="p-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <Icon name="Disc3" size={32} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-heading font-semibold mb-2">Нет релизов</h3>
                      <p className="text-muted-foreground mb-6">Создайте свой первый релиз и начните распространять музыку</p>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Icon name="Plus" size={18} className="mr-2" />
                        Создать первый релиз
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {releases.map((release) => (
                        <Card key={release.id} className="p-4 hover:border-primary/50 transition-all">
                          <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                            <Icon name="Music" size={48} className="text-muted-foreground" />
                          </div>
                          <h4 className="font-semibold mb-1">{release.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{release.artist}</p>
                          <Badge variant={release.status === 'approved' ? 'default' : 'secondary'}>
                            {release.status}
                          </Badge>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {dashboardSection === 'tickets' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-heading font-bold">Тикеты</h2>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Создать тикет
                    </Button>
                  </div>

                  {tickets.length === 0 ? (
                    <Card className="p-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <Icon name="MessageSquare" size={32} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-heading font-semibold mb-2">Нет тикетов</h3>
                      <p className="text-muted-foreground mb-6">Создайте тикет для связи с поддержкой</p>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Icon name="Plus" size={18} className="mr-2" />
                        Создать тикет
                      </Button>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {tickets.map((ticket) => (
                        <Card key={ticket.id} className="p-4 hover:border-primary/50 transition-all cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{ticket.subject}</h4>
                            <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                              {ticket.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{ticket.createdAt}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {dashboardSection === 'wallet' && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-3xl font-heading font-bold">Кошелёк</h2>
                  <Card className="p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                      <Icon name="Wallet" size={40} className="text-primary" />
                    </div>
                    <h3 className="text-4xl font-heading font-bold mb-2">0.00 ₽</h3>
                    <p className="text-muted-foreground mb-6">Текущий баланс</p>
                    <Button className="bg-primary hover:bg-primary/90">
                      Вывести средства
                    </Button>
                  </Card>
                </div>
              )}

              {dashboardSection === 'stats' && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-3xl font-heading font-bold">Статистика</h2>
                  <Card className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                      <Icon name="BarChart3" size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold mb-2">Статистика пока недоступна</h3>
                    <p className="text-muted-foreground">Загрузите релизы, чтобы увидеть статистику прослушиваний</p>
                  </Card>
                </div>
              )}

              {dashboardSection === 'profile' && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-3xl font-heading font-bold">Профиль</h2>
                  <Card className="p-6 space-y-4">
                    <div>
                      <Label htmlFor="profile-email">Email</Label>
                      <Input id="profile-email" type="email" placeholder="your@email.com" />
                    </div>
                    <div>
                      <Label htmlFor="change-password">Изменить пароль</Label>
                      <Input id="change-password" type="password" placeholder="Новый пароль" />
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">
                      Сохранить изменения
                    </Button>
                  </Card>
                </div>
              )}

              {dashboardSection === 'settings' && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-3xl font-heading font-bold">Настройки</h2>
                  <Card className="p-6 space-y-4">
                    <div>
                      <Label htmlFor="theme">Тема оформления</Label>
                      <Select>
                        <SelectTrigger id="theme">
                          <SelectValue placeholder="Выберите тему" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">Тёмная (по умолчанию)</SelectItem>
                          <SelectItem value="green">Зелёная</SelectItem>
                          <SelectItem value="blue">Синяя</SelectItem>
                          <SelectItem value="purple">Фиолетовая</SelectItem>
                          <SelectItem value="red">Красная</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }

  return null;
}