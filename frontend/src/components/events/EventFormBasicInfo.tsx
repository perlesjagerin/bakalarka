import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FileText, Image } from 'lucide-react';
import { EVENT_CATEGORIES } from '../../constants/categories';
import { EventFormData } from '../../types/eventForm';

interface EventFormBasicInfoProps {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  showStatus?: boolean;
}

export default function EventFormBasicInfo({ 
  register, 
  errors,
  showStatus = false 
}: EventFormBasicInfoProps) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Základní informace</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Název akce *
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            {...register('title')}
            type="text"
            placeholder="Např. Letní hudební festival"
            className={`input pl-10 ${errors.title ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Popis akce *
        </label>
        <textarea
          {...register('description')}
          rows={5}
          placeholder="Podrobný popis vaší akce..."
          className={`input ${errors.description ? 'border-red-500' : ''}`}
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Kategorie *
        </label>
        <select
          {...register('category')}
          className={`input ${errors.category ? 'border-red-500' : ''}`}
        >
          <option value="">Vyberte kategorii</option>
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      <div className={showStatus ? 'mb-4' : ''}>
        <label className="block text-gray-700 font-medium mb-2">
          URL obrázku
        </label>
        <div className="relative">
          <Image className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            {...register('imageUrl')}
            type="url"
            placeholder="https://example.com/image.jpg"
            className={`input pl-10 ${errors.imageUrl ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.imageUrl && (
          <p className="text-red-600 text-sm mt-1">{errors.imageUrl.message}</p>
        )}
      </div>

      {showStatus && (
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Status akce
          </label>
          <select
            {...register('status')}
            className="input"
          >
            <option value="DRAFT">Koncept</option>
            <option value="PUBLISHED">Publikováno</option>
            <option value="CANCELLED">Zrušeno</option>
            <option value="COMPLETED">Proběhlo</option>
          </select>
        </div>
      )}
    </div>
  );
}
