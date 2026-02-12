import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function Wallet() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-heading font-bold">Кошелёк</h1>

      <Card>
        <CardHeader>
          <CardTitle>Баланс</CardTitle>
          <CardDescription>Ваш текущий баланс</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-4xl sm:text-5xl font-bold">0 ₽</p>
              <p className="text-sm text-muted-foreground mt-2">Доступно для вывода</p>
            </div>
            <Button size="lg" disabled>
              <Icon name="ArrowUpRight" className="mr-2 h-5 w-5" />
              Вывести средства
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>История транзакций</CardTitle>
          <CardDescription>Все ваши операции</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Icon name="Wallet" className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Транзакций пока нет</p>
            <p className="text-sm text-muted-foreground mt-2">
              Здесь будут отображаться все пополнения и выводы средств
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b">
            <span className="text-muted-foreground">Минимальная сумма вывода</span>
            <span className="font-semibold mt-1 sm:mt-0">1000 ₽</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b">
            <span className="text-muted-foreground">Срок вывода</span>
            <span className="font-semibold mt-1 sm:mt-0">1-3 рабочих дня</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3">
            <span className="text-muted-foreground">Комиссия платформы</span>
            <span className="font-semibold mt-1 sm:mt-0">0%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
