import { Card, CardContent } from '@/components/ui/card';

export default function Stats() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-heading font-bold mb-6">Статистика</h1>

      <Card>
        <CardContent className="py-12 sm:py-20">
          <div className="text-center space-y-6">
            <img 
              src="https://cdn.poehali.dev/projects/66257d2a-e0bc-43e7-9cf7-ac56085a31b2/files/ccd2a6bc-3d68-4c5b-91de-e6be0d0ecdd7.jpg" 
              alt="Статистика" 
              className="mx-auto max-w-full sm:max-w-md rounded-lg"
            />
            <div>
              <h2 className="text-2xl font-bold mb-2">Статистика пока недоступна</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                После публикации ваших релизов здесь появятся данные о прослушиваниях, скачиваниях и доходах
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
