import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { releasesAPI, Release } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ModerationReleases() {
  const { toast } = useToast();
  const [releases, setReleases] = useState<Release[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isrcInputs, setIsrcInputs] = useState<Record<number, string>>({});

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

  const handleAccept = async (release: Release) => {
    const updatedTracks = release.tracks?.map((track, idx) => ({
      ...track,
      isrc: isrcInputs[idx] || track.isrc,
    }));

    try {
      await releasesAPI.update(release.id, {
        status: 'accepted',
        tracks: updatedTracks,
      });
      toast({ title: 'Успешно', description: 'Релиз принят' });
      setSelectedRelease(null);
      loadReleases();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось принять релиз', variant: 'destructive' });
    }
  };

  const handleReject = async (release: Release) => {
    if (!rejectionReason.trim()) {
      toast({ title: 'Ошибка', description: 'Укажите причину отклонения', variant: 'destructive' });
      return;
    }

    try {
      await releasesAPI.update(release.id, {
        status: 'rejected',
        rejection_reason: rejectionReason,
      });
      toast({ title: 'Успешно', description: 'Релиз отклонён' });
      setIsDialogOpen(false);
      setRejectionReason('');
      setSelectedRelease(null);
      loadReleases();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отклонить релиз', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="text-center py-20">Загрузка...</div>;
  }

  return (
    <div>
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
                  {release.cover_url && (
                    <img src={release.cover_url} alt={release.album_name} className="w-24 h-24 rounded object-cover" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{release.album_name}</h3>
                    <p className="text-sm text-muted-foreground">{release.artists}</p>
                    {release.upc && <p className="text-xs text-muted-foreground mt-1">UPC: {release.upc}</p>}
                    
                    {release.tracks && release.tracks.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold mb-2">Треки ({release.tracks.length}):</p>
                        <div className="space-y-1">
                          {release.tracks.map((track, idx) => (
                            <p key={idx} className="text-sm">
                              {idx + 1}. {track.track_name} - {track.artists}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      {release.cover_url && (
                        <a href={release.cover_url} download>
                          <Button size="sm" variant="outline">
                            <Icon name="Download" className="mr-2 h-4 w-4" />
                            Скачать обложку
                          </Button>
                        </a>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setSelectedRelease(release)}>
                        <Icon name="Eye" className="mr-2 h-4 w-4" />
                        Просмотр
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => {
                        setSelectedRelease(release);
                        setIsDialogOpen(true);
                      }}>
                        <Icon name="X" className="mr-2 h-4 w-4" />
                        Отклонить
                      </Button>
                      <Button size="sm" onClick={() => setSelectedRelease(release)}>
                        <Icon name="Check" className="mr-2 h-4 w-4" />
                        Принять
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedRelease && !isDialogOpen && (
        <Dialog open={true} onOpenChange={() => setSelectedRelease(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Принятие релиза: {selectedRelease.album_name}</DialogTitle>
              <DialogDescription>Введите ISRC для каждого трека и UPC альбома</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="album-upc">UPC альбома</Label>
                <Input
                  id="album-upc"
                  defaultValue={selectedRelease.upc || ''}
                  placeholder="Введите UPC"
                />
              </div>

              {selectedRelease.tracks && selectedRelease.tracks.map((track, idx) => (
                <div key={idx} className="space-y-2">
                  <Label htmlFor={`isrc-${idx}`}>
                    ISRC для "{track.track_name}"
                  </Label>
                  <Input
                    id={`isrc-${idx}`}
                    defaultValue={track.isrc || ''}
                    onChange={(e) => setIsrcInputs({ ...isrcInputs, [idx]: e.target.value })}
                    placeholder="Введите ISRC"
                  />
                </div>
              ))}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedRelease(null)} className="flex-1">
                  Отмена
                </Button>
                <Button onClick={() => handleAccept(selectedRelease)} className="flex-1">
                  Принять релиз
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isDialogOpen && selectedRelease && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Отклонить релиз</DialogTitle>
              <DialogDescription>Укажите причину отклонения</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Причина отклонения..."
                rows={4}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setRejectionReason('');
                }} className="flex-1">
                  Отмена
                </Button>
                <Button variant="destructive" onClick={() => handleReject(selectedRelease)} className="flex-1">
                  Отклонить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
