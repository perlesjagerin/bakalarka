import { getCategoryStyle } from '../../utils/eventDefaults';

interface EventHeroProps {
  imageUrl?: string;
  title: string;
  category: string;
  imageError: boolean;
  onImageError: () => void;
}

export default function EventHero({ 
  imageUrl, 
  title, 
  category, 
  imageError, 
  onImageError 
}: EventHeroProps) {
  const categoryStyle = getCategoryStyle(category);

  return (
    <div className="rounded-lg overflow-hidden mb-8 shadow-lg">
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-96 object-cover"
          onError={onImageError}
        />
      ) : (
        <div className={`w-full h-96 ${categoryStyle.gradient} flex items-center justify-center`}>
          <span className="text-9xl" role="img" aria-label={category}>
            {categoryStyle.emoji}
          </span>
        </div>
      )}
    </div>
  );
}
