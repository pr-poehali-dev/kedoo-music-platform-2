import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  const [action, setAction] = useState<'view' | 'accept' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [promosRes, videosRes, platformsRes] = await Promise.all([
        studioAPI.promo.getAll(undefined, 'on_moderation'),
        studioAPI.video.getAll(undefined, 'on_moderation'),
        studioAPI.platform.getAll(undefined, 'on_moderation'),
      ]);
      setPromos(promosRes.promos || []);
      setVideos(videosRes.videos || []);
      setPlatforms(platformsRes.platforms || []);
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
      toast({ title: 'Ошибка', description: 'Не удалось принять заявку', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !itemType || !rejectionReason) {
      toast({ title: 'Ошибка', description: 'Укажите причину отклонения', variant: 'destructive' });
      return;
    }

    try {
      const api = itemType === 'promo' ? studioAPI.promo : itemType === 'video' ? studioAPI.video : studioAPI.platform;
      await api.update(selectedItem.id, { status: 'rejected', rejection_reason: rejectionReason });
      toast({ title: 'Успешно', description: 'Заявка отклонена' });
      resetDialog();
      loadData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отклонить заявку', variant: 'destructive' });
    }
  };

  const resetDialog = () => {
    setAction(null);
    setSelectedItem(null);
    setItemType(null);
    setRejectionReason('');
  };

  const openItem = (item: PromoRelease | Video | PlatformAccount, type: 'promo' | 'video' | 'platform', act: 'view' | 'accept' | 'reject') => {
    setSelectedItem(item);
    setItemType(type);
    setAction(act);
  };

  const downloadFile = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const PromoCard = ({ promo }: { promo: PromoRelease }) => (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">Промо-релиз</h3>
              <p className="text-sm text-muted-foreground">UPC: {promo.upc}</p>
              {promo.artists && <p className="text-sm text-muted-foreground">Артист: {promo.artists}</p>}
              {promo.key_track_name && <p className="text-sm text-muted-foreground">Ключевой трек: {promo.key_track_name}</p>}
            </div>
            <Badge>На модерации</Badge>
          </div>

          {promo.release_description && (
            <div className="bg-muted p-3 rounded text-sm">
              <p className="font-medium text-xs text-muted-foreground mb-1">Описание релиза:</p>
              <p className="whitespace-pre-wrap">{promo.release_description}</p>
            </div>
          )}

          {promo.key_track_description && (
            <div className="bg-muted p-3 rounded text-sm">
              <p className="font-medium text-xs text-muted-foreground mb-1">Описание ключевого трека:</p>
              <p className="whitespace-pre-wrap">{promo.key_track_description}</p>
            </div>
          )}

          {promo.key_track_isrc && <p className="text-xs text-muted-foreground">ISRC: {promo.key_track_isrc}</p>}
          {promo.smartlink_url && (
            <a href={promo.smartlink_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
              Smartlink: {promo.smartlink_url}
            </a>
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => openItem(promo, 'promo', 'accept')}>
              <Icon name="Check" className="mr-2 h-4 w-4" />
              Принять
            </Button>
            <Button size="sm" variant="destructive" onClick={() => openItem(promo, 'promo', 'reject')}>
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
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">{video.video_name}</h3>
              <p className="text-muted-foreground">{video.artist_name}</p>
            </div>
            <Badge>На модерации</Badge>
          </div>

          {video.cover_url && (
            <img src={video.cover_url} alt={video.video_name} className="w-32 h-32 rounded object-cover" />
          )}

          {video.video_url && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Видео:</p>
              <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                {video.video_url}
              </a>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {video.video_url && (
              <Button size="sm" variant="outline" onClick={() => downloadFile(video.video_url!, `${video.video_name}`)}>
                <Icon name="Download" className="mr-2 h-4 w-4" />
                Скачать видео
              </Button>
            )}
            <Button size="sm" onClick={() => openItem(video, 'video', 'accept')}>
              <Icon name="Check" className="mr-2 h-4 w-4" />
              Принять
            </Button>
            <Button size="sm" variant="destructive" onClick={() => openItem(video, 'video', 'reject')}>
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
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">{platform.platform}</h3>
              {platform.artist_description && <p className="text-sm text-muted-foreground">{platform.artist_description}</p>}
            </div>
            <Badge>На модерации</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {platform.latest_release_upc && (
              <p><span className="text-muted-foreground">Последний UPC:</span> {platform.latest_release_upc}</p>
            )}
            {platform.upcoming_release_upc && (
              <p><span className="text-muted-foreground">Предстоящий UPC:</span> {platform.upcoming_release_upc}</p>
            )}
            {platform.youtube_channel_url && (
              <p className="sm:col-span-2 break-all">
                <span className="text-muted-foreground">YouTube канал:</span>{' '}
                <a href={platform.youtube_channel_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {platform.youtube_channel_url}
                </a>
              </p>
            )}
            {platform.youtube_artist_card_url && (
              <p className="sm:col-span-2 break-all">
                <span className="text-muted-foreground">Карточка артиста:</span>{' '}
                <a href={platform.youtube_artist_card_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {platform.youtube_artist_card_url}
                </a>
              </p>
            )}
          </div>

          {platform.links && typeof platform.links === 'object' && Object.keys(platform.links).length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Ссылки:</p>
              {Object.entries(platform.links).map(([key, value]) => (
                value && (
                  <p key={key} className="text-sm break-all">
                    <span className="text-muted-foreground">{key}:</span>{' '}
                    <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {value as string}
                    </a>
                  </p>
                )
              ))}
            </div>
          )}

          {platform.artist_photo_url && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Фото артиста:</p>
              <img src={platform.artist_photo_url} alt="Artist" className="w-24 h-24 rounded object-cover" />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => openItem(platform, 'platform', 'accept')}>
              <Icon name="Check" className="mr-2 h-4 w-4" />
              Принять
            </Button>
            <Button size="sm" variant="destructive" onClick={() => openItem(platform, 'platform', 'reject')}>
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
        <TabsList>
          <TabsTrigger value="promo">Промо ({promos.length})</TabsTrigger>
          <TabsTrigger value="video">Видео ({videos.length})</TabsTrigger>
          <TabsTrigger value="platform">Кабинеты ({platforms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="promo" className="space-y-4 mt-6">
          {promos.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Нет промо на модерации</p></CardContent></Card>
          ) : (
            promos.map((promo) => <PromoCard key={promo.id} promo={promo} />)
          )}
        </TabsContent>

        <TabsContent value="video" className="space-y-4 mt-6">
          {videos.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Нет видео на модерации</p></CardContent></Card>
          ) : (
            videos.map((video) => <VideoCard key={video.id} video={video} />)
          )}
        </TabsContent>

        <TabsContent value="platform" className="space-y-4 mt-6">
          {platforms.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Нет кабинетов на модерации</p></CardContent></Card>
          ) : (
            platforms.map((platform) => <PlatformCard key={platform.id} platform={platform} />)
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={action === 'accept'} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Принять заявку</DialogTitle>
            <DialogDescription>Подтвердите принятие</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button onClick={handleAccept} className="flex-1">Принять</Button>
            <Button variant="outline" onClick={resetDialog} className="flex-1">Отмена</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={action === 'reject'} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить заявку</DialogTitle>
            <DialogDescription>Укажите причину</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Причина отклонения..."
              rows={4}
            />
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleReject} className="flex-1">Отклонить</Button>
              <Button variant="outline" onClick={resetDialog} className="flex-1">Отмена</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
