import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Radio" className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-heading font-bold">Radish</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm hover:text-primary transition-colors">О сервисе</a>
            <a href="#contact" className="text-sm hover:text-primary transition-colors">Контакты</a>
            <Link to="/auth">
              <Button variant="default">Вход / Регистрация</Button>
            </Link>
          </nav>
          <Link to="/auth" className="md:hidden">
            <Button size="sm">Войти</Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-6xl font-heading font-bold">
              Распространяйте вашу музыку
              <span className="text-primary block mt-2">на все платформы</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Загружайте треки, распространяйте на Spotify, Apple Music, Yandex Music и другие стриминговые сервисы
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  <Icon name="Music" className="mr-2 h-5 w-5" />
                  Начать бесплатно
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Узнать больше
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="container mx-auto px-4 py-20">
          <h3 className="text-3xl font-heading font-bold text-center mb-12">Возможности платформы</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg border border-border">
              <Icon name="Upload" className="h-12 w-12 text-primary mb-4" />
              <h4 className="text-xl font-heading font-semibold mb-2">Загрузка релизов</h4>
              <p className="text-muted-foreground">Простая загрузка альбомов и треков с подробной информацией</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <Icon name="Globe" className="h-12 w-12 text-primary mb-4" />
              <h4 className="text-xl font-heading font-semibold mb-2">Дистрибуция</h4>
              <p className="text-muted-foreground">Распространение на популярные стриминговые платформы</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <Icon name="BarChart3" className="h-12 w-12 text-primary mb-4" />
              <h4 className="text-xl font-heading font-semibold mb-2">Статистика</h4>
              <p className="text-muted-foreground">Отслеживайте прослушивания и аналитику ваших релизов</p>
            </div>
          </div>
        </section>

        <section id="contact" className="container mx-auto px-4 py-20 text-center">
          <h3 className="text-3xl font-heading font-bold mb-4">Остались вопросы?</h3>
          <p className="text-muted-foreground mb-6">Свяжитесь с нами по электронной почте</p>
          <a href="mailto:olprodlabel@gmail.com" className="text-primary hover:underline text-lg">
            olprodlabel@gmail.com
          </a>
        </section>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Radio" className="h-6 w-6 text-primary" />
              <span className="font-heading font-semibold">Radish</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Политика конфиденциальности</a>
              <a href="#" className="hover:text-primary transition-colors">Условия использования</a>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            © {new Date().getFullYear()} Radish. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}
