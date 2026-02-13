import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { releasesAPI, Release } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ModerationReleases() {
  const { toast } = useToast();
  const [releases, setReleases] = useState<Release[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'view' | 'accept' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isrcInputs, setIsrcInputs] = useState<Record<number, string>>({});
  const [upcInput, setUpcInput] = useState('');

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    try {
      setIsLoading(true);
      const response = await releasesAPI.getAll(undefined, 'on_moderation');
      setReleases(response.releases || []);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить релизы', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openRelease = async (release: Release, mode: 'view' | 'accept' | 'reject') => {
    try {
      const response = await releasesAPI.getById(release.id);
      const fullRelease = response.release || response;
      setSelectedRelease(fullRelease);
      setViewMode(mode);
      setUpcInput(fullRelease.upc || '');
      setIsrcInputs({});
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить данные', variant: 'destructive' });
    }
  };

  const handleAccept = async () => {
    if (!selectedRelease) return;

    const updatedTracks = selectedRelease.tracks?.map((track, idx) => ({
      ...track,
      isrc: isrcInputs[idx] || track.isrc,
    }));

    try {
      await releasesAPI.update(selectedRelease.id, {
        status: 'accepted',
        upc: upcInput || undefined,
        tracks: updatedTracks,
      });
      toast({ title: 'Успешно', description: 'Релиз принят' });
      closeDialog();
      loadReleases();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось принять релиз', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!selectedRelease || !rejectionReason.trim()) {
      toast({ title: 'Ошибка', description: 'Укажите причину отклонения', variant: 'destructive' });
      return;
    }

    try {
      await releasesAPI.update(selectedRelease.id, {
        status: 'rejected',
        rejection_reason: rejectionReason,
      });
      toast({ title: 'Успешно', description: 'Релиз отклонён' });
      closeDialog();
      loadReleases();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отклонить релиз', variant: 'destructive' });
    }
  };

  const closeDialog = () => {
    setSelectedRelease(null);
    setViewMode(null);
    setRejectionReason('');
    setIsrcInputs({});
    setUpcInput('');
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

  const tracks = selectedRelease?.tracks
    ? (Array.isArray(selectedRelease.tracks) ? selectedRelease.tracks : [])
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-heading font-bold mb-6">Модерация релизов</h1>

      <div className="space-y-4">
        {releases.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="Disc" className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Нет релизов на модерации</p>
            </CardContent>
          </Card>
        ) : (
          releases.map((release) => (
            <Card key={release.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {release.cover_url ? (
                    <img src={release.cover_url} alt={release.album_name} className="w-24 h-24 rounded object-cover" />
                  ) : (
                    <div className="w-24 h-24 bg-muted rounded flex items-center justify-center">
                      <Icon name="Image" className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{release.album_name}</h3>
                        <p className="text-sm text-muted-foreground">{release.artists}</p>
                        {release.release_date && (
                          <p className="text-xs text-muted-foreground mt-1">Дата релиза: {new Date(release.release_date).toLocaleDateString('ru-RU')}</p>
                        )}
                        {release.upc && <p className="text-xs text-muted-foreground">UPC: {release.upc}</p>}
                      </div>
                      <Badge>На модерации</Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => openRelease(release, 'view')}>
                        <Icon name="Eye" className="mr-2 h-4 w-4" />
                        Просмотр
                      </Button>
                      {release.cover_url && (
                        <Button size="sm" variant="outline" onClick={() => downloadFile(release.cover_url!, `cover-${release.album_name}.jpg`)}>
                          <Icon name="Download" className="mr-2 h-4 w-4" />
                          Обложка
                        </Button>
                      )}
                      <Button size="sm" onClick={() => openRelease(release, 'accept')}>
                        <Icon name="Check" className="mr-2 h-4 w-4" />
                        Принять
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => openRelease(release, 'reject')}>
                        <Icon name="X" className="mr-2 h-4 w-4" />
                        Отклонить
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={viewMode === 'view' && !!selectedRelease} onOpenChange={() => closeDialog()}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRelease?.album_name}</DialogTitle>
            <DialogDescription>{selectedRelease?.artists}</DialogDescription>
          </DialogHeader>

          {selectedRelease && (
            <div className="space-y-6">
              <div className="flex gap-4">
                {selectedRelease.cover_url && (
                  <div className="space-y-2">
                    <img src={selectedRelease.cover_url} alt="Cover" className="w-40 h-40 rounded object-cover" />
                    <Button size="sm" variant="outline" className="w-full" onClick={() => downloadFile(selectedRelease.cover_url!, 'cover.jpg')}>
                      <Icon name="Download" className="mr-2 h-4 w-4" />
                      Скачать
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  {selectedRelease.upc && <p className="text-sm"><span className="text-muted-foreground">UPC:</span> {selectedRelease.upc}</p>}
                  {selectedRelease.release_date && <p className="text-sm"><span className="text-muted-foreground">Дата релиза:</span> {new Date(selectedRelease.release_date).toLocaleDateString('ru-RU')}</p>}
                  {selectedRelease.is_rerelease && <p className="text-sm"><span className="text-muted-foreground">Переиздание:</span> Да</p>}
                  {selectedRelease.old_release_date && <p className="text-sm"><span className="text-muted-foreground">Старая дата:</span> {new Date(selectedRelease.old_release_date).toLocaleDateString('ru-RU')}</p>}
                  <p className="text-sm"><span className="text-muted-foreground">Создано:</span> {new Date(selectedRelease.created_at).toLocaleString('ru-RU')}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Треклист ({tracks.length})</h3>
                <div className="space-y-3">
                  {tracks.map((track, idx) => (
                    <Card key={idx} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium">{idx + 1}. {track.track_name}</p>
                          <p className="text-sm text-muted-foreground">{track.artists}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                            {track.version && track.version !== 'Original' && <span>Версия: {track.version}</span>}
                            {track.isrc && <span>ISRC: {track.isrc}</span>}
                            {track.musicians && <span>Музыканты: {track.musicians}</span>}
                            {track.lyricists && <span>Авторы: {track.lyricists}</span>}
                            {track.tiktok_moment && <span>TikTok: {track.tiktok_moment}</span>}
                            {track.has_explicit && <Badge variant="destructive" className="text-xs h-5">Explicit</Badge>}
                            {track.language && <span>Язык: {track.language}</span>}
                          </div>
                          {track.lyrics && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer">Текст</summary>
                              <p className="mt-1 text-xs whitespace-pre-wrap bg-muted p-2 rounded">{track.lyrics}</p>
                            </details>
                          )}
                        </div>
                        {track.audio_url && (
                          <Button size="sm" variant="outline" onClick={() => downloadFile(track.audio_url!, `${track.track_name}.wav`)}>
                            <Icon name="Download" className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => { setViewMode('accept'); }}>
                  <Icon name="Check" className="mr-2 h-4 w-4" />
                  Принять
                </Button>
                <Button variant="destructive" onClick={() => { setViewMode('reject'); }}>
                  <Icon name="X" className="mr-2 h-4 w-4" />
                  Отклонить
                </Button>
                <Button variant="outline" onClick={closeDialog}>Закрыть</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={viewMode === 'accept' && !!selectedRelease} onOpenChange={() => closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Принять: {selectedRelease?.album_name}</DialogTitle>
            <DialogDescription>Введите ISRC и UPC</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>UPC альбома</Label>
              <Input
                value={upcInput}
                onChange={(e) => setUpcInput(e.target.value)}
                placeholder="Введите UPC"
              />
            </div>

            {tracks.map((track, idx) => (
              <div key={idx} className="space-y-2">
                <Label>ISRC: "{track.track_name}"</Label>
                <Input
                  defaultValue={track.isrc || ''}
                  onChange={(e) => setIsrcInputs({ ...isrcInputs, [idx]: e.target.value })}
                  placeholder="Введите ISRC"
                />
              </div>
            ))}

            <div className="flex gap-2">
              <Button onClick={handleAccept} className="flex-1">Принять</Button>
              <Button variant="outline" onClick={closeDialog} className="flex-1">Отмена</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewMode === 'reject' && !!selectedRelease} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить: {selectedRelease?.album_name}</DialogTitle>
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
              <Button variant="outline" onClick={closeDialog} className="flex-1">Отмена</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
