import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { releasesAPI, Release } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ViewRelease() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [release, setRelease] = useState<Release | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRelease = async () => {
      if (!id) return;
      
      try {
        const data = await releasesAPI.getById(parseInt(id));
        setRelease(data);
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить релиз',
          variant: 'destructive',
        });
        navigate('/dashboard/releases');
      } finally {
        setIsLoading(false);
      }
    };

    loadRelease();
  }, [id, navigate, toast]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      on_moderation: 'default',
      accepted: 'outline',
      rejected: 'destructive',
    };
    const labels: Record<string, string> = {
      draft: 'Черновик',
      on_moderation: 'На модерации',
      accepted: 'Принят',
      rejected: 'Отклонён',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!release) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Релиз не найден</h2>
        <Button onClick={() => navigate('/dashboard/releases')}>Вернуться к релизам</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/dashboard/releases">
            <Button variant="ghost" size="sm" className="mb-2">
              <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
              Назад к релизам
            </Button>
          </Link>
          <h1 className="text-3xl font-heading font-bold">{release.album_name}</h1>
          <p className="text-muted-foreground mt-1">{release.artists}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(release.status)}
          {release.status === 'draft' && (
            <Link to={`/dashboard/releases/edit/${release.id}`}>
              <Button size="sm">
                <Icon name="Edit" className="mr-2 h-4 w-4" />
                Редактировать
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Обложка</CardTitle>
          </CardHeader>
          <CardContent>
            {release.cover_url ? (
              <img src={release.cover_url} alt={release.album_name} className="w-full rounded-lg" />
            ) : (
              <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                <Icon name="Image" className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Информация о релизе</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Артисты</p>
              <p className="font-medium">{release.artists}</p>
            </div>
            {release.is_rerelease && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Переиздание</p>
                  <p className="font-medium">Да</p>
                </div>
                {release.upc && (
                  <div>
                    <p className="text-sm text-muted-foreground">UPC</p>
                    <p className="font-medium">{release.upc}</p>
                  </div>
                )}
                {release.old_release_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Старая дата релиза</p>
                    <p className="font-medium">{new Date(release.old_release_date).toLocaleDateString('ru-RU')}</p>
                  </div>
                )}
              </>
            )}
            {release.rejection_reason && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-semibold mb-1">Причина отклонения:</p>
                <p className="text-sm">{release.rejection_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Треклист ({release.tracks?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {release.tracks && release.tracks.length > 0 ? (
            <div className="space-y-4">
              {release.tracks.map((track, idx) => (
                <Card key={track.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{idx + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h4 className="font-semibold text-lg">{track.track_name}</h4>
                        <p className="text-sm text-muted-foreground">{track.artists}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {track.version && track.version !== 'Original' && (
                          <div>
                            <span className="text-muted-foreground">Версия:</span> <Badge variant="outline" className="ml-1">{track.version}</Badge>
                          </div>
                        )}
                        {track.isrc && (
                          <div>
                            <span className="text-muted-foreground">ISRC:</span> <span className="font-mono ml-1">{track.isrc}</span>
                          </div>
                        )}
                        {track.musicians && (
                          <div className="sm:col-span-2">
                            <span className="text-muted-foreground">Музыканты:</span> <span className="ml-1">{track.musicians}</span>
                          </div>
                        )}
                        {track.lyricists && (
                          <div className="sm:col-span-2">
                            <span className="text-muted-foreground">Авторы текста:</span> <span className="ml-1">{track.lyricists}</span>
                          </div>
                        )}
                        {track.tiktok_moment && (
                          <div>
                            <span className="text-muted-foreground">TikTok момент:</span> <span className="ml-1">{track.tiktok_moment}</span>
                          </div>
                        )}
                        {track.has_explicit && (
                          <div>
                            <Badge variant="destructive">Explicit</Badge>
                          </div>
                        )}
                        {track.has_lyrics && (
                          <div className="sm:col-span-2">
                            <span className="text-muted-foreground">Язык:</span> <span className="ml-1">{track.language || 'Не указан'}</span>
                          </div>
                        )}
                      </div>
                      {track.lyrics && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-primary hover:underline">Показать текст</summary>
                          <div className="mt-2 p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">{track.lyrics}</div>
                        </details>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Треки не добавлены</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
