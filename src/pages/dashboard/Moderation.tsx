import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function Moderation() {
  const sections = [
    {
      title: 'Релизы',
      description: 'Модерация музыкальных релизов',
      icon: 'Disc',
      link: '/dashboard/moderation/releases',
    },
    {
      title: 'СмартЛинки',
      description: 'Модерация смартлинков',
      icon: 'Link',
      link: '/dashboard/moderation/smartlinks',
    },
    {
      title: 'Студия',
      description: 'Модерация промо, видео и аккаунтов',
      icon: 'Clapperboard',
      link: '/dashboard/moderation/studio',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Модерация</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link key={section.link} to={section.link}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <Icon name={section.icon} className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
