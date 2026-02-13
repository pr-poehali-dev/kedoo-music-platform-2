import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { releasesAPI, Release } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Releases() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadReleases();
  }, [user]);

  const loadReleases = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await releasesAPI.getAll(user.id);
      setReleases(response.releases || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить релизы',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRelease = async (releaseId: number) => {
    if (!confirm('Удалить релиз?')) return;
    
    try {
      await releasesAPI.update(releaseId, { status: 'draft' });
      toast({ title: 'Успешно', description: 'Релиз удалён' });
      loadReleases();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить релиз',
        variant: 'destructive',
      });
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

  const filterReleases = (status?: string) => {
    if (!status || status === 'all') return releases;
    return releases.filter(r => r.status === status);
  };

  const ReleaseCard = ({ release }: { release: Release }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {release.cover_url && (
            <img src={release.cover_url} alt={release.album_name} className="w-20 h-20 rounded object-cover" />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{release.album_name}</h3>
                <p className="text-sm text-muted-foreground">{release.artists}</p>
              </div>
              {getStatusBadge(release.status)}
            </div>
            
            {release.rejection_reason && (
              <p className="text-sm text-destructive mb-2">Причина отклонения: {release.rejection_reason}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Link to={`/dashboard/releases/view/${release.id}`}>
                <Button size="sm" variant="outline">
                  <Icon name="Eye" className="mr-2 h-4 w-4" />
                  Просмотр
                </Button>
              </Link>
              
              {(release.status === 'draft' || release.status === 'rejected') && (
                <Link to={`/dashboard/releases/edit/${release.id}`}>
                  <Button size="sm" variant="outline">
                    <Icon name="Edit" className="mr-2 h-4 w-4" />
                    Редактировать
                  </Button>
                </Link>
              )}
              
              {release.status === 'on_moderation' && (
                <Button size="sm" variant="outline" onClick={() => handleDeleteRelease(release.id)}>
                  <Icon name="X" className="mr-2 h-4 w-4" />
                  Снять с модерации
                </Button>
              )}
              
              <Button size="sm" variant="ghost" onClick={() => handleDeleteRelease(release.id)}>
                <Icon name="Trash2" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="text-center py-20">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold">Мои релизы</h1>
        <Link to="/dashboard/releases/new">
          <Button>
            <Icon name="Plus" className="mr-2 h-4 w-4" />
            Создать релиз
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Все ({releases.length})</TabsTrigger>
          <TabsTrigger value="draft">Черновики ({filterReleases('draft').length})</TabsTrigger>
          <TabsTrigger value="on_moderation">На модерации ({filterReleases('on_moderation').length})</TabsTrigger>
          <TabsTrigger value="accepted">Приняты ({filterReleases('accepted').length})</TabsTrigger>
          <TabsTrigger value="rejected">Отклонены ({filterReleases('rejected').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filterReleases(activeTab === 'all' ? undefined : activeTab).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon name="Disc" className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Релизов нет</p>
              </CardContent>
            </Card>
          ) : (
            filterReleases(activeTab === 'all' ? undefined : activeTab).map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}