import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { smartlinksAPI, Smartlink } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function SmartLinks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [smartlinks, setSmartlinks] = useState<Smartlink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    release_name: '',
    artists: '',
    upc: '',
    cover_url: '',
  });

  useEffect(() => {
    loadSmartlinks();
  }, [user]);

  const loadSmartlinks = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await smartlinksAPI.getAll(user.id);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await smartlinksAPI.create({
        user_id: user.id,
        ...formData,
        status: 'on_moderation',
      });
      toast({ title: 'Успешно', description: 'Смартлинк отправлен на модерацию' });
      setIsDialogOpen(false);
      setFormData({ release_name: '', artists: '', upc: '', cover_url: '' });
      loadSmartlinks();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать смартлинк',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFormData({ ...formData, cover_url: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { label: 'Черновик', variant: 'secondary' },
      on_moderation: { label: 'На модерации', variant: 'default' },
      accepted: { label: 'Принят', variant: 'outline' },
      rejected: { label: 'Отклонён', variant: 'destructive' },
    };
    
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-20">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold">СмартСсылки</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Создать смартлинк
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый смартлинк</DialogTitle>
              <DialogDescription>Добавьте релиз для создания смартлинка</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="release_name">Название релиза *</Label>
                <Input
                  id="release_name"
                  value={formData.release_name}
                  onChange={(e) => setFormData({ ...formData, release_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artists">Исполнители *</Label>
                <Input
                  id="artists"
                  value={formData.artists}
                  onChange={(e) => setFormData({ ...formData, artists: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upc">UPC</Label>
                <Input
                  id="upc"
                  value={formData.upc}
                  onChange={(e) => setFormData({ ...formData, upc: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">Обложка (drag & drop)</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="cover" className="cursor-pointer">
                    {formData.cover_url ? (
                      <img src={formData.cover_url} alt="Cover" className="mx-auto max-h-40" />
                    ) : (
                      <>
                        <Icon name="Upload" className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Нажмите или перетащите файл</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Отправить на модерацию
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {smartlinks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="Link" className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Смартлинков нет</p>
            </CardContent>
          </Card>
        ) : (
          smartlinks.map((smartlink) => (
            <Card key={smartlink.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {smartlink.cover_url && (
                    <img src={smartlink.cover_url} alt={smartlink.release_name} className="w-20 h-20 rounded object-cover" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{smartlink.release_name}</h3>
                        <p className="text-sm text-muted-foreground">{smartlink.artists}</p>
                        {smartlink.upc && <p className="text-xs text-muted-foreground">UPC: {smartlink.upc}</p>}
                      </div>
                      {getStatusBadge(smartlink.status)}
                    </div>
                    
                    {smartlink.rejection_reason && (
                      <p className="text-sm text-destructive mb-2">Причина отклонения: {smartlink.rejection_reason}</p>
                    )}
                    
                    {smartlink.status === 'accepted' && smartlink.smartlink_url && (
                      <div className="mt-4">
                        <a
                          href={smartlink.smartlink_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          <Button size="sm">
                            <Icon name="ExternalLink" className="mr-2 h-4 w-4" />
                            Просмотреть смартлинк
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
