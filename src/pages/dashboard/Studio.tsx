import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { studioAPI, PromoRelease, Video, PlatformAccount } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  on_moderation: { label: 'На модерации', variant: 'default' },
  accepted: { label: 'Принято', variant: 'outline' },
  rejected: { label: 'Отклонено', variant: 'destructive' },
};

export default function Studio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);

  const [promos, setPromos] = useState<PromoRelease[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [platforms, setPlatforms] = useState<PlatformAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [promoData, setPromoData] = useState({
    upc: '',
    release_description: '',
    key_track_isrc: '',
    key_track_name: '',
    key_track_description: '',
    artists: '',
    smartlink_url: '',
  });

  const [videoData, setVideoData] = useState({
    video_name: '',
    artist_name: '',
    video_url: '',
    cover_url: '',
  });

  const [platformData, setPlatformData] = useState({
    platform: 'yandex_music' as string,
    artist_description: '',
    latest_release_upc: '',
    upcoming_release_upc: '',
    artist_photo_url: '',
    artist_video_url: '',
    youtube_channel_url: '',
    youtube_artist_card_url: '',
    links: { vk: '', youtube: '', telegram: '', website: '', bandlink: '' },
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const [promosRes, videosRes, platformsRes] = await Promise.all([
        studioAPI.promo.getAll(user.id),
        studioAPI.video.getAll(user.id),
        studioAPI.platform.getAll(user.id),
      ]);
      setPromos(promosRes.promos || []);
      setVideos(videosRes.videos || []);
      setPlatforms(platformsRes.platforms || []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await studioAPI.promo.create({ user_id: user.id, ...promoData });
      toast({ title: 'Успешно', description: 'Релиз отправлен на промо' });
      setPromoDialogOpen(false);
      setPromoData({ upc: '', release_description: '', key_track_isrc: '', key_track_name: '', key_track_description: '', artists: '', smartlink_url: '' });
      loadData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отправить', variant: 'destructive' });
    }
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await studioAPI.video.create({ user_id: user.id, ...videoData });
      toast({ title: 'Успешно', description: 'Видео отправлено на модерацию' });
      setVideoDialogOpen(false);
      setVideoData({ video_name: '', artist_name: '', video_url: '', cover_url: '' });
      loadData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отправить', variant: 'destructive' });
    }
  };

  const handlePlatformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await studioAPI.platform.create({ user_id: user.id, ...platformData });
      toast({ title: 'Успешно', description: 'Данные отправлены на модерацию' });
      setPlatformDialogOpen(false);
      loadData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отправить', variant: 'destructive' });
    }
  };

  const handleFileUpload = (callback: (url: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusLabels[status] || statusLabels.on_moderation;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Студия</h1>

      <Tabs defaultValue="promo" className="space-y-6">
        <TabsList>
          <TabsTrigger value="promo">Промо</TabsTrigger>
          <TabsTrigger value="video">Видео</TabsTrigger>
          <TabsTrigger value="platforms">Кабинеты</TabsTrigger>
        </TabsList>

        <TabsContent value="promo">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Подать релиз на промо</CardTitle>
                  <CardDescription>Отправьте релиз на промоушен</CardDescription>
                </div>
                <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Icon name="Send" className="mr-2 h-4 w-4" />Подать релиз</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Промо релиза</DialogTitle>
                      <DialogDescription>Заполните информацию о релизе</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePromoSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>UPC релиза *</Label>
                        <Input value={promoData.upc} onChange={(e) => setPromoData({ ...promoData, upc: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Описание релиза</Label>
                        <Textarea value={promoData.release_description} onChange={(e) => setPromoData({ ...promoData, release_description: e.target.value })} rows={3} />
                      </div>
                      <div className="space-y-2">
                        <Label>ISRC ключевого трека</Label>
                        <Input value={promoData.key_track_isrc} onChange={(e) => setPromoData({ ...promoData, key_track_isrc: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Название ключевого трека</Label>
                        <Input value={promoData.key_track_name} onChange={(e) => setPromoData({ ...promoData, key_track_name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Описание ключевого трека</Label>
                        <Textarea value={promoData.key_track_description} onChange={(e) => setPromoData({ ...promoData, key_track_description: e.target.value })} rows={3} />
                      </div>
                      <div className="space-y-2">
                        <Label>Имя исполнителей</Label>
                        <Input value={promoData.artists} onChange={(e) => setPromoData({ ...promoData, artists: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Ссылка на smartlink</Label>
                        <Input value={promoData.smartlink_url} onChange={(e) => setPromoData({ ...promoData, smartlink_url: e.target.value })} placeholder="https://" />
                      </div>
                      <Button type="submit" className="w-full">Отправить</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8"><Icon name="Loader2" className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
              ) : promos.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Вы ещё не подавали релизы на промо</p>
              ) : (
                <div className="space-y-3">
                  {promos.map((promo) => (
                    <Card key={promo.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">UPC: {promo.upc}</p>
                          {promo.artists && <p className="text-sm text-muted-foreground">{promo.artists}</p>}
                          {promo.key_track_name && <p className="text-xs text-muted-foreground">Трек: {promo.key_track_name}</p>}
                          <p className="text-xs text-muted-foreground mt-1">{new Date(promo.created_at).toLocaleDateString('ru-RU')}</p>
                          {promo.rejection_reason && <p className="text-xs text-destructive mt-1">Причина: {promo.rejection_reason}</p>}
                        </div>
                        {getStatusBadge(promo.status)}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Добавить видео</CardTitle>
                  <CardDescription>Отправьте видео на модерацию</CardDescription>
                </div>
                <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Icon name="Video" className="mr-2 h-4 w-4" />Добавить видео</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Добавить видео</DialogTitle>
                      <DialogDescription>Заполните данные о видео</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleVideoSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Название видео *</Label>
                        <Input value={videoData.video_name} onChange={(e) => setVideoData({ ...videoData, video_name: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Имя артиста *</Label>
                        <Input value={videoData.artist_name} onChange={(e) => setVideoData({ ...videoData, artist_name: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Ссылка на видео</Label>
                        <Input value={videoData.video_url} onChange={(e) => setVideoData({ ...videoData, video_url: e.target.value })} placeholder="https://" />
                      </div>
                      <div className="space-y-2">
                        <Label>Обложка</Label>
                        <Input type="file" accept="image/*" onChange={handleFileUpload((url) => setVideoData({ ...videoData, cover_url: url }))} />
                        {videoData.cover_url && <img src={videoData.cover_url} alt="Cover" className="w-24 h-24 rounded object-cover mt-2" />}
                      </div>
                      <Button type="submit" className="w-full">Отправить</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8"><Icon name="Loader2" className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
              ) : videos.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Вы ещё не добавляли видео</p>
              ) : (
                <div className="space-y-3">
                  {videos.map((video) => (
                    <Card key={video.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-3">
                          {video.cover_url && <img src={video.cover_url} alt="" className="w-16 h-16 rounded object-cover" />}
                          <div>
                            <p className="font-medium">{video.video_name}</p>
                            <p className="text-sm text-muted-foreground">{video.artist_name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(video.created_at).toLocaleDateString('ru-RU')}</p>
                            {video.rejection_reason && <p className="text-xs text-destructive mt-1">Причина: {video.rejection_reason}</p>}
                          </div>
                        </div>
                        {getStatusBadge(video.status)}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Кабинеты на площадках</CardTitle>
                  <CardDescription>Подайте заявку на кабинет артиста</CardDescription>
                </div>
                <Dialog open={platformDialogOpen} onOpenChange={setPlatformDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Icon name="Store" className="mr-2 h-4 w-4" />Подать заявку</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Кабинет на площадке</DialogTitle>
                      <DialogDescription>Заполните данные для кабинета артиста</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePlatformSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Площадка *</Label>
                        <Select value={platformData.platform} onValueChange={(v) => setPlatformData({ ...platformData, platform: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yandex_music">Яндекс Музыка</SelectItem>
                            <SelectItem value="vk_music">VK Музыка</SelectItem>
                            <SelectItem value="spotify">Spotify</SelectItem>
                            <SelectItem value="apple_music">Apple Music</SelectItem>
                            <SelectItem value="youtube_music">YouTube Music</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Описание артиста</Label>
                        <Textarea value={platformData.artist_description} onChange={(e) => setPlatformData({ ...platformData, artist_description: e.target.value })} rows={3} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>UPC последнего релиза</Label>
                          <Input value={platformData.latest_release_upc} onChange={(e) => setPlatformData({ ...platformData, latest_release_upc: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>UPC предстоящего релиза</Label>
                          <Input value={platformData.upcoming_release_upc} onChange={(e) => setPlatformData({ ...platformData, upcoming_release_upc: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Фото артиста</Label>
                        <Input type="file" accept="image/*" onChange={handleFileUpload((url) => setPlatformData({ ...platformData, artist_photo_url: url }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>URL видео артиста</Label>
                        <Input value={platformData.artist_video_url} onChange={(e) => setPlatformData({ ...platformData, artist_video_url: e.target.value })} placeholder="https://" />
                      </div>
                      <div className="space-y-2">
                        <Label>URL YouTube канала</Label>
                        <Input value={platformData.youtube_channel_url} onChange={(e) => setPlatformData({ ...platformData, youtube_channel_url: e.target.value })} placeholder="https://" />
                      </div>
                      <div className="space-y-2">
                        <Label>URL карточки артиста YouTube</Label>
                        <Input value={platformData.youtube_artist_card_url} onChange={(e) => setPlatformData({ ...platformData, youtube_artist_card_url: e.target.value })} placeholder="https://" />
                      </div>
                      <div className="space-y-3">
                        <Label>Ссылки на соцсети</Label>
                        {Object.entries(platformData.links).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <Label className="text-xs capitalize">{key}</Label>
                            <Input
                              value={value}
                              onChange={(e) => setPlatformData({
                                ...platformData,
                                links: { ...platformData.links, [key]: e.target.value }
                              })}
                              placeholder={`https://`}
                            />
                          </div>
                        ))}
                      </div>
                      <Button type="submit" className="w-full">Отправить</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8"><Icon name="Loader2" className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
              ) : platforms.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Вы ещё не подавали заявки на кабинеты</p>
              ) : (
                <div className="space-y-3">
                  {platforms.map((platform) => (
                    <Card key={platform.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{platform.platform}</p>
                          {platform.artist_description && <p className="text-sm text-muted-foreground line-clamp-2">{platform.artist_description}</p>}
                          <p className="text-xs text-muted-foreground mt-1">{new Date(platform.created_at).toLocaleDateString('ru-RU')}</p>
                          {platform.rejection_reason && <p className="text-xs text-destructive mt-1">Причина: {platform.rejection_reason}</p>}
                        </div>
                        {getStatusBadge(platform.status)}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
