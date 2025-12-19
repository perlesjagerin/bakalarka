

interface CategoryStyle {
  gradient: string;
  emoji: string;
}

export const getCategoryStyle = (category: string): CategoryStyle => {
  const categoryMap: Record<string, CategoryStyle> = {
    'Hudba': {
      gradient: 'bg-gradient-to-br from-purple-500 to-pink-500',
      emoji: '🎵'
    },
    'Divadlo': {
      gradient: 'bg-gradient-to-br from-red-500 to-orange-500',
      emoji: '🎭'
    },
    'Film': {
      gradient: 'bg-gradient-to-br from-blue-500 to-indigo-500',
      emoji: '🎬'
    },
    'Sport': {
      gradient: 'bg-gradient-to-br from-green-500 to-teal-500',
      emoji: '⚽'
    },
    'Vzdělávání': {
      gradient: 'bg-gradient-to-br from-yellow-500 to-amber-500',
      emoji: '📚'
    },
    'Technologie': {
      gradient: 'bg-gradient-to-br from-cyan-500 to-blue-500',
      emoji: '💻'
    },
    'Networking': {
      gradient: 'bg-gradient-to-br from-indigo-500 to-purple-500',
      emoji: '🤝'
    },
    'Party': {
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-500',
      emoji: '🎉'
    },
    'Ostatní': {
      gradient: 'bg-gradient-to-br from-gray-500 to-slate-500',
      emoji: '📌'
    }
  };

  return categoryMap[category] || categoryMap['Ostatní'];
};
