import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { releasesAPI, Release, Track } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function EditRelease() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(1);

  const [albumData, setAlbumData] = useState({
    album_name: '',
    artists: [''],
    is_rerelease: false,
    upc: '',
    old_release_date: '',
    cover_url: '',
  });

  const [tracks, setTracks] = useState<Partial<Track>[]>([]);

  useEffect(() => {
    const loadRelease = async () => {
      if (!id) return;
      
      try {
        const data: Release = await releasesAPI.getById(parseInt(id));

        setAlbumData({
          album_name: data.album_name,
          artists: data.artists.split(', '),
          is_rerelease: data.is_rerelease,
          upc: data.upc || '',
          old_release_date: data.old_release_date || '',
          cover_url: data.cover_url || '',
        });

        if (data.tracks && data.tracks.length > 0) {
          setTracks(data.tracks);
        } else {
          setTracks([{
            track_name: '',
            artists: '',
            version: 'Original',
            musicians: '',
            lyricists: '',
            tiktok_moment: '',
            has_explicit: false,
            has_lyrics: false,
            language: '',
            lyrics: '',
          }]);
        }
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

  const addArtist = () => {
    setAlbumData({ ...albumData, artists: [...albumData.artists, ''] });
  };

  const updateArtist = (index: number, value: string) => {
    const newArtists = [...albumData.artists];
    newArtists[index] = value;
    setAlbumData({ ...albumData, artists: newArtists });
  };

  const removeArtist = (index: number) => {
    const newArtists = albumData.artists.filter((_, i) => i !== index);
    setAlbumData({ ...albumData, artists: newArtists });
  };

  const addTrack = () => {
    setTracks([
      ...tracks,
      {
        track_name: '',
        artists: '',
        version: 'Original',
        musicians: '',
        lyricists: '',
        tiktok_moment: '',
        has_explicit: false,
        has_lyrics: false,
        language: '',
        lyrics: '',
      },
    ]);
  };

  const updateTrack = (index: number, field: keyof Track, value: string | boolean) => {
    const newTracks = [...tracks];
    newTracks[index] = { ...newTracks[index], [field]: value };
    setTracks(newTracks);
  };

  const removeTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (saveAsDraft = false) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const releaseData = {
        album_name: albumData.album_name,
        artists: albumData.artists.filter(a => a).join(', '),
        is_rerelease: albumData.is_rerelease,
        upc: albumData.upc || undefined,
        old_release_date: albumData.old_release_date || undefined,
        cover_url: albumData.cover_url || undefined,
        status: saveAsDraft ? 'draft' : 'on_moderation',
        tracks: tracks.map((t, idx) => ({ ...t, track_order: idx + 1 })),
      };

      await releasesAPI.update(parseInt(id), releaseData);
      toast({
        title: 'Успешно',
        description: saveAsDraft ? 'Изменения сохранены' : 'Релиз отправлен на модерацию',
      });
      navigate('/dashboard/releases');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить релиз',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold mb-2">Редактирование релиза</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={step >= 1 ? 'text-primary' : ''}>1. Альбом</span>
          <Icon name="ChevronRight" className="h-4 w-4" />
          <span className={step >= 2 ? 'text-primary' : ''}>2. Треклист</span>
          <Icon name="ChevronRight" className="h-4 w-4" />
          <span className={step >= 3 ? 'text-primary' : ''}>3. Предпросмотр</span>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Информация об альбоме</CardTitle>
            <CardDescription>Укажите основные данные о релизе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="album_name">Название альбома *</Label>
              <Input
                id="album_name"
                value={albumData.album_name}
                onChange={(e) => setAlbumData({ ...albumData, album_name: e.target.value })}
                placeholder="Введите название"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Артисты альбома *</Label>
              {albumData.artists.map((artist, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={artist}
                    onChange={(e) => updateArtist(idx, e.target.value)}
                    placeholder="Имя артиста"
                    required
                  />
                  {idx > 0 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeArtist(idx)}>
                      <Icon name="X" className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addArtist}>
                <Icon name="Plus" className="mr-2 h-4 w-4" />
                Добавить артиста
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Был ли релиз опубликован ранее?</Label>
              <RadioGroup
                value={albumData.is_rerelease ? 'yes' : 'no'}
                onValueChange={(v) => setAlbumData({ ...albumData, is_rerelease: v === 'yes' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">Нет</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Да</Label>
                </div>
              </RadioGroup>
            </div>

            {albumData.is_rerelease && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="upc">UPC</Label>
                  <Input
                    id="upc"
                    value={albumData.upc}
                    onChange={(e) => setAlbumData({ ...albumData, upc: e.target.value })}
                    placeholder="Введите UPC код"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="old_date">Старая дата релиза</Label>
                  <Input
                    id="old_date"
                    type="date"
                    value={albumData.old_release_date}
                    onChange={(e) => setAlbumData({ ...albumData, old_release_date: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="cover">Обложка (3000×3000 пикселей)</Label>
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setAlbumData({ ...albumData, cover_url: reader.result as string });
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!albumData.album_name || !albumData.artists[0]}>
                Далее
                <Icon name="ChevronRight" className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Треклист</CardTitle>
            <CardDescription>Редактируйте треки в релизе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {tracks.map((track, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Трек {idx + 1}</h3>
                  {tracks.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeTrack(idx)}>
                      <Icon name="Trash2" className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Название трека *</Label>
                      <Input
                        value={track.track_name}
                        onChange={(e) => updateTrack(idx, 'track_name', e.target.value)}
                        placeholder="Название"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Артисты трека *</Label>
                      <Input
                        value={track.artists}
                        onChange={(e) => updateTrack(idx, 'artists', e.target.value)}
                        placeholder="Имена артистов"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Код ISRC</Label>
                      <Input
                        value={track.isrc || ''}
                        onChange={(e) => updateTrack(idx, 'isrc', e.target.value)}
                        placeholder="ISRC"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Версия трека</Label>
                      <Select value={track.version} onValueChange={(v) => updateTrack(idx, 'version', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Original">Original</SelectItem>
                          <SelectItem value="Cover">Cover</SelectItem>
                          <SelectItem value="Remix">Remix</SelectItem>
                          <SelectItem value="Clean">Clean</SelectItem>
                          <SelectItem value="Speed Up">Speed Up</SelectItem>
                          <SelectItem value="Slowed">Slowed</SelectItem>
                          <SelectItem value="Extended">Extended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ФИО музыкантов</Label>
                      <Input
                        value={track.musicians || ''}
                        onChange={(e) => updateTrack(idx, 'musicians', e.target.value)}
                        placeholder="Через запятую"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ФИО авторов текста</Label>
                      <Input
                        value={track.lyricists || ''}
                        onChange={(e) => updateTrack(idx, 'lyricists', e.target.value)}
                        placeholder="Через запятую"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Moment TikTok (00:00)</Label>
                    <Input
                      value={track.tiktok_moment || ''}
                      onChange={(e) => updateTrack(idx, 'tiktok_moment', e.target.value)}
                      placeholder="00:00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Есть ли ненормативная лексика?</Label>
                    <RadioGroup
                      value={track.has_explicit ? 'yes' : 'no'}
                      onValueChange={(v) => updateTrack(idx, 'has_explicit', v === 'yes')}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`explicit-no-${idx}`} />
                        <Label htmlFor={`explicit-no-${idx}`}>Нет</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`explicit-yes-${idx}`} />
                        <Label htmlFor={`explicit-yes-${idx}`}>Да</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Есть ли в треке слова?</Label>
                    <RadioGroup
                      value={track.has_lyrics ? 'yes' : 'no'}
                      onValueChange={(v) => updateTrack(idx, 'has_lyrics', v === 'yes')}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`lyrics-no-${idx}`} />
                        <Label htmlFor={`lyrics-no-${idx}`}>Нет</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`lyrics-yes-${idx}`} />
                        <Label htmlFor={`lyrics-yes-${idx}`}>Да</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {track.has_lyrics && (
                    <>
                      <div className="space-y-2">
                        <Label>Язык песни</Label>
                        <Input
                          value={track.language || ''}
                          onChange={(e) => updateTrack(idx, 'language', e.target.value)}
                          placeholder="Русский, English..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Текст песни</Label>
                        <Textarea
                          value={track.lyrics || ''}
                          onChange={(e) => updateTrack(idx, 'lyrics', e.target.value)}
                          placeholder="Введите текст..."
                          rows={6}
                        />
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ))}

            <Button type="button" variant="outline" onClick={addTrack} className="w-full">
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Добавить трек
            </Button>

            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <Icon name="ChevronLeft" className="mr-2 h-4 w-4" />
                Назад
              </Button>
              <Button onClick={() => setStep(3)}>
                Далее
                <Icon name="ChevronRight" className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Предпросмотр</CardTitle>
            <CardDescription>Проверьте данные перед сохранением</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Альбом</h3>
              <p>Название: {albumData.album_name}</p>
              <p>Артисты: {albumData.artists.filter(a => a).join(', ')}</p>
              {albumData.is_rerelease && (
                <>
                  <p>UPC: {albumData.upc}</p>
                  <p>Дата: {albumData.old_release_date}</p>
                </>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Треки ({tracks.length})</h3>
              {tracks.map((track, idx) => (
                <p key={idx}>
                  {idx + 1}. {track.track_name} - {track.artists}
                </p>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <Icon name="ChevronLeft" className="mr-2 h-4 w-4" />
                Назад
              </Button>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSaving}>
                  Сохранить черновик
                </Button>
                <Button onClick={() => handleSubmit(false)} disabled={isSaving}>
                  {isSaving ? 'Отправка...' : 'Отправить на модерацию'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}