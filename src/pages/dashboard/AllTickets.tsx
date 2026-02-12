import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { ticketsAPI, Ticket } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AllTickets() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const response = await ticketsAPI.getAll();
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

  const handleSubmitResponse = async () => {
    if (!selectedTicket || !responseText) {
      toast({
        title: 'Ошибка',
        description: 'Введите ответ',
        variant: 'destructive',
      });
      return;
    }

    try {
      await ticketsAPI.update(selectedTicket.id, {
        status: 'closed',
        moderator_response: responseText,
      });
      toast({ title: 'Успешно', description: 'Ответ отправлен' });
      setIsDialogOpen(false);
      setSelectedTicket(null);
      setResponseText('');
      loadTickets();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить ответ',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = status === 'open' 
      ? { label: 'Открыт', variant: 'default' as const }
      : { label: 'Закрыт', variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-heading font-bold mb-6">Все тикеты</h1>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="MessageSquare" className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Нет тикетов</p>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg break-words">{ticket.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        От: {ticket.username || ticket.user_email} • {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap break-words">{ticket.message}</p>
                  </div>

                  {ticket.moderator_response && (
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Ответ модератора:</p>
                      <p className="text-sm whitespace-pre-wrap break-words">{ticket.moderator_response}</p>
                    </div>
                  )}

                  {ticket.status === 'open' && (
                    <Button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setIsDialogOpen(true);
                      }}
                      className="w-full sm:w-auto"
                    >
                      <Icon name="Send" className="mr-2 h-4 w-4" />
                      Ответить
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ответ на тикет</DialogTitle>
            <DialogDescription>
              {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="response">Ваш ответ *</Label>
              <Textarea
                id="response"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Введите ответ..."
                rows={6}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleSubmitResponse} className="w-full sm:w-auto">
                Отправить ответ
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
