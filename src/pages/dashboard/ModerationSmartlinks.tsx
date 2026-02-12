import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { smartlinksAPI, Smartlink } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ModerationSmartlinks() {
  const { toast } = useToast();
  const [smartlinks, setSmartlinks] = useState<Smartlink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSmartlink, setSelectedSmartlink] = useState<Smartlink | null>(null);
  const [action, setAction] = useState<'accept' | 'reject' | null>(null);
  const [smartlinkUrl, setSmartlinkUrl] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadSmartlinks();
  }, []);

  const loadSmartlinks = async () => {
    try {
      setIsLoading(true);
      const response = await smartlinksAPI.getAll(undefined, 'on_moderation');
      setSmartlinks(response.smartlinks || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить смартлинки',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!selectedSmartlink || !smartlinkUrl) {
      toast({
        title: 'Ошибка',
        description: 'Введите URL смартлинка',
        variant: 'destructive',
      });
      return;
    }

    try {
      await smartlinksAPI.update(selectedSmartlink.id, {
        status: 'accepted',
        smartlink_url: smartlinkUrl,
      });
      toast({ title: 'Успешно', description: 'Смартлинк принят' });
      setAction(null);
      setSelectedSmartlink(null);
      setSmartlinkUrl('');
      loadSmartlinks();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось принять смартлинк',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedSmartlink || !rejectionReason) {
      toast({
        title: 'Ошибка',
        description: 'Укажите причину отклонения',
        variant: 'destructive',
      });
      return;
    }

    try {
      await smartlinksAPI.update(selectedSmartlink.id, {
        status: 'rejected',
        rejection_reason: rejectionReason,
      });
      toast({ title: 'Успешно', description: 'Смартлинк отклонён' });
      setAction(null);
      setSelectedSmartlink(null);
      setRejectionReason('');
      loadSmartlinks();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отклонить смартлинк',
        variant: 'destructive',
      });
    }
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
      <h1 className="text-3xl font-heading font-bold mb-6">Модерация смартлинков</h1>

      <div className="space-y-4">
        {smartlinks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="Link" className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Нет смартлинков на модерации</p>
            </CardContent>
          </Card>
        ) : (
          smartlinks.map((smartlink) => (
            <Card key={smartlink.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-shrink-0">
                    {smartlink.cover_url ? (
                      <img 
                        src={smartlink.cover_url} 
                        alt={smartlink.release_name} 
                        className="w-32 h-32 rounded object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-muted rounded flex items-center justify-center">
                        <Icon name="Image" className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{smartlink.release_name}</h3>
                        <p className="text-muted-foreground">{smartlink.artists}</p>
                        {smartlink.upc && (
                          <p className="text-sm text-muted-foreground mt-1">UPC: {smartlink.upc}</p>
                        )}
                      </div>
                      <Badge>На модерации</Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <Button
                        onClick={() => {
                          setSelectedSmartlink(smartlink);
                          setAction('accept');
                        }}
                        className="w-full sm:w-auto"
                      >
                        <Icon name="Check" className="mr-2 h-4 w-4" />
                        Принять
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setSelectedSmartlink(smartlink);
                          setAction('reject');
                        }}
                        className="w-full sm:w-auto"
                      >
                        <Icon name="X" className="mr-2 h-4 w-4" />
                        Отклонить
                      </Button>
                      {smartlink.cover_url && (
                        <a href={smartlink.cover_url} download target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full sm:w-auto">
                            <Icon name="Download" className="mr-2 h-4 w-4" />
                            Скачать обложку
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={action === 'accept'} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Принять смартлинк</DialogTitle>
            <DialogDescription>
              Введите URL смартлинка для релиза "{selectedSmartlink?.release_name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smartlink_url">URL смартлинка *</Label>
              <Input
                id="smartlink_url"
                value={smartlinkUrl}
                onChange={(e) => setSmartlinkUrl(e.target.value)}
                placeholder="https://example.com/link"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleAccept} className="w-full sm:w-auto">
                Принять
              </Button>
              <Button variant="outline" onClick={() => setAction(null)} className="w-full sm:w-auto">
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={action === 'reject'} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить смартлинк</DialogTitle>
            <DialogDescription>
              Укажите причину отклонения для "{selectedSmartlink?.release_name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection_reason">Причина отклонения *</Label>
              <Textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Опишите причину..."
                rows={4}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="destructive" onClick={handleReject} className="w-full sm:w-auto">
                Отклонить
              </Button>
              <Button variant="outline" onClick={() => setAction(null)} className="w-full sm:w-auto">
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
