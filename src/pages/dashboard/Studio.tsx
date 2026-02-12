import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { studioAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Studio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);

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
    platform: 'yandex_music' as const,
    artist_description: '',
    latest_release_upc: '',
    upcoming_release_upc: '',
    artist_photo_url: '',
    artist_video_url: '',
    youtube_channel_url: '',
    youtube_artist_card_url: '',
    links: { vk: '', youtube: '', telegram: '', website: '', bandlink: '' },
  });

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await studioAPI.promo.create({ user_id: user.id, ...promoData });
      toast({ title: 'Успешно', description: 'Релиз отправлен на промо' });
      setPromoDialogOpen(false);
      setPromoData({
        upc: '',
        release_description: '',
        key_track_isrc: '',
        key_track_name: '',
        key_track_description: '',
        artists: '',
        smartlink_url: '',
      });
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

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Студия</h1>

      <Tabs defaultValue="promo" className="space-y-6">
        <TabsList>
          <TabsTrigger value="promo">Подать на промо</TabsTrigger>
          <TabsTrigger value="video">Добавить видео</TabsTrigger>
          <TabsTrigger value="platforms">Кабинеты на площадках</TabsTrigger>
        </TabsList>

        <TabsContent value="promo">
          <Card>
            <CardHeader>
              <CardTitle>Подать релиз на промо</CardTitle>
              <CardDescription>Отправьте релиз на промоушен</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Icon name="Send" className="mr-2 h-4 w-4" />
                    Подать релиз
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Промо релиза</DialogTitle>
                    <DialogDescription>Заполните информацию о релизе</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePromoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="promo-upc">UPC релиза *</Label>
                      <Input
                        id="promo-upc"
                        value={promoData.upc}
                        onChange={(e) => setPromoData({ ...promoData, upc: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="release-desc">Описание релиза</Label>
                      <Textarea
                        id="release-desc"
                        value={promoData.release_description}
                        onChange={(e) => setPromoData({ ...promoData, release_description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="track-isrc">ISRC ключевого трека</Label>
                      <Input
                        id="track-isrc"
                        value={promoData.key_track_isrc}
                        onChange={(e) => setPromoData({ ...promoData, key_track_isrc: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="track-name">Название ключевого трека</Label>
                      <Input
                        id="track-name"
                        value={promoData.key_track_name}
                        onChange={(e) => setPromoData({ ...promoData, key_track_name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="track-desc">Описание ключевого трека</Label>
                      <Textarea
                        id="track-desc"
                        value={promoData.key_track_description}
                        onChange={(e) => setPromoData({ ...promoData, key_track_description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="promo-artists">Имя исполнителей</Label>
                      <Input
                        id="promo-artists"
                        value={promoData.artists}
                        onChange={(e) => setPromoData({ ...promoData, artists: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smartlink">Ссылка на smartlink (необязательно)</Label>
                      <Input
                        id="smartlink"
                        value={promoData.smartlink_url}
                        onChange={(e) => setPromoData({ ...promoData, smartlink_url: e.target.value })}
                        placeholder="https://"
                      />
                    </div>

                    <Button type="submit" className="w-full">Отправить</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Добавить видео на площадки</CardTitle>
              <CardDescription>Загрузите видео для публикации</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Icon name="Video" className="mr-2 h-4 w-4" />
                    Добавить видео
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Новое видео</DialogTitle>
                    <DialogDescription>Заполните информацию о видео</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleVideoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="video-file">Импортировать видео</Label>
                      <Input
                        id="video-file"
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload((url) => setVideoData({ ...videoData, video_url: url }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="video-name">Название видео *</Label>
                      <Input
                        id="video-name"
                        value={videoData.video_name}
                        onChange={(e) => setVideoData({ ...videoData, video_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="video-artist">Исполнитель видео *</Label>
                      <Input
                        id="video-artist"
                        value={videoData.artist_name}
                        onChange={(e) => setVideoData({ ...videoData, artist_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="video-cover">Обложка видео</Label>
                      <Input
                        id="video-cover"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload((url) => setVideoData({ ...videoData, cover_url: url }))}
                      />
                    </div>

                    <Button type="submit" className="w-full">Отправить на модерацию</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms">
          <Card>
            <CardHeader>
              <CardTitle>Кабинеты на площадках</CardTitle>
              <CardDescription>Отправьте данные для создания кабинета артиста</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={platformDialogOpen} onOpenChange={setPlatformDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Icon name="Building" className="mr-2 h-4 w-4" />
                    Создать кабинет
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Кабинет артиста</DialogTitle>
                    <DialogDescription>Выберите площадку и заполните данные</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePlatformSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform">Площадка *</Label>
                      <Select
                        value={platformData.platform}
                        onValueChange={(v: typeof platformData.platform) => setPlatformData({ ...platformData, platform: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yandex_music">Яндекс Музыка</SelectItem>
                          <SelectItem value="vk_music">ВК Музыка</SelectItem>
                          <SelectItem value="spotify">Spotify</SelectItem>
                          <SelectItem value="apple_music">Apple Music</SelectItem>
                          <SelectItem value="youtube_music">YouTube Music</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {platformData.platform !== 'youtube_music' ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="artist-desc">Описание артиста</Label>
                          <Textarea
                            id="artist-desc"
                            value={platformData.artist_description}
                            onChange={(e) => setPlatformData({ ...platformData, artist_description: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="latest-upc">UPC последнего релиза</Label>
                            <Input
                              id="latest-upc"
                              value={platformData.latest_release_upc}
                              onChange={(e) => setPlatformData({ ...platformData, latest_release_upc: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="upcoming-upc">UPC предстоящего релиза</Label>
                            <Input
                              id="upcoming-upc"
                              value={platformData.upcoming_release_upc}
                              onChange={(e) => setPlatformData({ ...platformData, upcoming_release_upc: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="artist-photo">Фото артиста</Label>
                          <Input
                            id="artist-photo"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload((url) => setPlatformData({ ...platformData, artist_photo_url: url }))}
                          />
                        </div>

                        {platformData.platform === 'yandex_music' && (
                          <div className="space-y-2">
                            <Label htmlFor="artist-video">Видео артиста (вертикальное, до 15 сек)</Label>
                            <Input
                              id="artist-video"
                              type="file"
                              accept="video/*"
                              onChange={handleFileUpload((url) => setPlatformData({ ...platformData, artist_video_url: url }))}
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Ссылки артиста</Label>
                          <div className="space-y-2">
                            <Input
                              placeholder="VK"
                              value={platformData.links.vk}
                              onChange={(e) => setPlatformData({
                                ...platformData,
                                links: { ...platformData.links, vk: e.target.value }
                              })}
                            />
                            <Input
                              placeholder="YouTube"
                              value={platformData.links.youtube}
                              onChange={(e) => setPlatformData({
                                ...platformData,
                                links: { ...platformData.links, youtube: e.target.value }
                              })}
                            />
                            <Input
                              placeholder="Telegram"
                              value={platformData.links.telegram}
                              onChange={(e) => setPlatformData({
                                ...platformData,
                                links: { ...platformData.links, telegram: e.target.value }
                              })}
                            />
                            <Input
                              placeholder="Оф. сайт"
                              value={platformData.links.website}
                              onChange={(e) => setPlatformData({
                                ...platformData,
                                links: { ...platformData.links, website: e.target.value }
                              })}
                            />
                            <Input
                              placeholder="Bandlink"
                              value={platformData.links.bandlink}
                              onChange={(e) => setPlatformData({
                                ...platformData,
                                links: { ...platformData.links, bandlink: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="yt-upc">UPC релиза</Label>
                          <Input
                            id="yt-upc"
                            value={platformData.latest_release_upc}
                            onChange={(e) => setPlatformData({ ...platformData, latest_release_upc: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="yt-channel">Ссылка на канал</Label>
                          <Input
                            id="yt-channel"
                            value={platformData.youtube_channel_url}
                            onChange={(e) => setPlatformData({ ...platformData, youtube_channel_url: e.target.value })}
                            placeholder="https://youtube.com/..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="yt-artist">Ссылка на карточку артиста</Label>
                          <Input
                            id="yt-artist"
                            value={platformData.youtube_artist_card_url}
                            onChange={(e) => setPlatformData({ ...platformData, youtube_artist_card_url: e.target.value })}
                            placeholder="https://youtube.com/..."
                          />
                        </div>
                      </>
                    )}

                    <Button type="submit" className="w-full">Отправить на модерацию</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
