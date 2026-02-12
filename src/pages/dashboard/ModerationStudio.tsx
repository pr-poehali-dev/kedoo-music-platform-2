import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { studioAPI, PromoRelease, Video, PlatformAccount } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ModerationStudio() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('promo');
  const [isLoading, setIsLoading] = useState(true);
  
  const [promos, setPromos] = useState<PromoRelease[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [platforms, setPlatforms] = useState<PlatformAccount[]>([]);

  const [selectedItem, setSelectedItem] = useState<PromoRelease | Video | PlatformAccount | null>(null);
  const [itemType, setItemType] = useState<'promo' | 'video' | 'platform' | null>(null);
  const [action, setAction] = useState<'accept' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [promosRes, videosRes, platformsRes] = await Promise.all([
        studioAPI.promo.getAll(undefined, 'on_moderation'),
        studioAPI.video.getAll(undefined, 'on_moderation'),
        studioAPI.platform.getAll(undefined, 'on_moderation'),
      ]);
      setPromos(promosRes.promo_releases || []);
      setVideos(videosRes.videos || []);
      setPlatforms(platformsRes.platform_accounts || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!selectedItem || !itemType) return;

    try {
      const api = itemType === 'promo' ? studioAPI.promo : itemType === 'video' ? studioAPI.video : studioAPI.platform;
      await api.update(selectedItem.id, { status: 'accepted' });
      toast({ title: 'Успешно', description: 'Заявка принята' });
      resetDialog();
      loadData();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось принять заявку',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !itemType || !rejectionReason) {
      toast({
        title: 'Ошибка',
        description: 'Укажите причину отклонения',
        variant: 'destructive',
      });
      return;
    }

    try {
      const api = itemType === 'promo' ? studioAPI.promo : itemType === 'video' ? studioAPI.video : studioAPI.platform;
      await api.update(selectedItem.id, {
        status: 'rejected',
        rejection_reason: rejectionReason,
      });
      toast({ title: 'Успешно', description: 'Заявка отклонена' });
      resetDialog();
      loadData();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отклонить заявку',
        variant: 'destructive',
      });
    }
  };

  const resetDialog = () => {
    setAction(null);
    setSelectedItem(null);
    setItemType(null);
    setRejectionReason('');
  };

  const PromoCard = ({ promo }: { promo: PromoRelease }) => (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg break-words">{promo.release_name || 'Без названия'}</h3>
              <p className="text-sm text-muted-foreground">UPC: {promo.upc}</p>
              {promo.key_track_isrc && <p className="text-sm text-muted-foreground">ISRC: {promo.key_track_isrc}</p>}
            </div>
            <Badge>На модерации</Badge>
          </div>
          
          {promo.vk_description && (
            <div>
              <p className="text-sm font-medium">Описание для VK:</p>
              <p className="text-sm text-muted-foreground mt-1 break-words">{promo.vk_description}</p>
            </div>
          )}
          
          {promo.youtube_description && (
            <div>
              <p className="text-sm font-medium">Описание для YouTube:</p>
              <p className="text-sm text-muted-foreground mt-1 break-words">{promo.youtube_description}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => {
              setSelectedItem(promo);
              setItemType('promo');
              setAction('accept');
            }} className="w-full sm:w-auto">
              <Icon name="Check" className="mr-2 h-4 w-4" />
              Принять
            </Button>
            <Button variant="destructive" onClick={() => {
              setSelectedItem(promo);
              setItemType('promo');
              setAction('reject');
            }} className="w-full sm:w-auto">
              <Icon name="X" className="mr-2 h-4 w-4" />
              Отклонить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const VideoCard = ({ video }: { video: Video }) => (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg break-words">{video.name}</h3>
              <p className="text-muted-foreground break-words">{video.artist}</p>
            </div>
            <Badge>На модерации</Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => {
              setSelectedItem(video);
              setItemType('video');
              setAction('accept');
            }} className="w-full sm:w-auto">
              <Icon name="Check" className="mr-2 h-4 w-4" />
              Принять
            </Button>
            <Button variant="destructive" onClick={() => {
              setSelectedItem(video);
              setItemType('video');
              setAction('reject');
            }} className="w-full sm:w-auto">
              <Icon name="X" className="mr-2 h-4 w-4" />
              Отклонить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PlatformCard = ({ platform }: { platform: PlatformAccount }) => (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg break-words">{platform.platform_name}</h3>
              <p className="text-sm text-muted-foreground break-words">Артист: {platform.artist_name}</p>
            </div>
            <Badge>На модерации</Badge>
          </div>

          {platform.links && typeof platform.links === 'object' && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Ссылки:</p>
              {Object.entries(platform.links).map(([key, value]) => (
                value && (
                  <p key={key} className="text-sm text-muted-foreground break-all">
                    {key}: {value as string}
                  </p>
                )
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => {
              setSelectedItem(platform);
              setItemType('platform');
              setAction('accept');
            }} className="w-full sm:w-auto">
              <Icon name="Check" className="mr-2 h-4 w-4" />
              Принять
            </Button>
            <Button variant="destructive" onClick={() => {
              setSelectedItem(platform);
              setItemType('platform');
              setAction('reject');
            }} className="w-full sm:w-auto">
              <Icon name="X" className="mr-2 h-4 w-4" />
              Отклонить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-heading font-bold mb-6">Модерация студии</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="promo">Промо ({promos.length})</TabsTrigger>
          <TabsTrigger value="video">Видео ({videos.length})</TabsTrigger>
          <TabsTrigger value="platform">Платформы ({platforms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="promo" className="space-y-4 mt-6">
          {promos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon name="Megaphone" className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Нет заявок на промо</p>
              </CardContent>
            </Card>
          ) : (
            promos.map((promo) => <PromoCard key={promo.id} promo={promo} />)
          )}
        </TabsContent>

        <TabsContent value="video" className="space-y-4 mt-6">
          {videos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon name="Video" className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Нет видео на модерации</p>
              </CardContent>
            </Card>
          ) : (
            videos.map((video) => <VideoCard key={video.id} video={video} />)
          )}
        </TabsContent>

        <TabsContent value="platform" className="space-y-4 mt-6">
          {platforms.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon name="Globe" className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Нет аккаунтов на модерации</p>
              </CardContent>
            </Card>
          ) : (
            platforms.map((platform) => <PlatformCard key={platform.id} platform={platform} />)
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={action === 'accept'} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Принять заявку</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите принять эту заявку?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleAccept} className="w-full sm:w-auto">
              Принять
            </Button>
            <Button variant="outline" onClick={resetDialog} className="w-full sm:w-auto">
              Отмена
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={action === 'reject'} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить заявку</DialogTitle>
            <DialogDescription>
              Укажите причину отклонения
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
              <Button variant="outline" onClick={resetDialog} className="w-full sm:w-auto">
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}