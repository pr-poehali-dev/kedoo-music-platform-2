import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { ticketsAPI, Ticket } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Tickets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  useEffect(() => {
    loadTickets();
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await ticketsAPI.getAll(user.id);
      setTickets(response.tickets || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить тикеты',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await ticketsAPI.create(user.id, formData.subject, formData.message);
      toast({ title: 'Успешно', description: 'Тикет создан' });
      setIsDialogOpen(false);
      setFormData({ subject: '', message: '' });
      loadTickets();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать тикет',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-20">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold">Тикеты</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Создать тикет
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый тикет</DialogTitle>
              <DialogDescription>Опишите вашу проблему или вопрос</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Тема *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Краткое описание"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Сообщение *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Подробное описание проблемы..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full">Отправить</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="MessageSquare" className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Тикетов нет</p>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(ticket.created_at).toLocaleString('ru-RU')}
                    </CardDescription>
                  </div>
                  <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                    {ticket.status === 'open' ? 'Открыт' : 'Закрыт'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-1">Ваше сообщение:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.message}</p>
                </div>
                
                {ticket.moderator_response && (
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-1">Ответ модератора:</p>
                    <p className="text-sm whitespace-pre-wrap">{ticket.moderator_response}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
