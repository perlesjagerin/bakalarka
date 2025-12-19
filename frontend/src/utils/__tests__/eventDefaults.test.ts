import { describe, it, expect } from 'vitest';
import { getCategoryStyle } from '../eventDefaults';

describe('eventDefaults utilities', () => {
  describe('getCategoryStyle', () => {
    it('should return correct style for "Hudba" category', () => {
      const style = getCategoryStyle('Hudba');
      
      expect(style.gradient).toBe('bg-gradient-to-br from-purple-500 to-pink-500');
      expect(style.emoji).toBe('🎵');
    });

    it('should return correct style for "Divadlo" category', () => {
      const style = getCategoryStyle('Divadlo');
      
      expect(style.gradient).toBe('bg-gradient-to-br from-red-500 to-orange-500');
      expect(style.emoji).toBe('🎭');
    });

    it('should return correct style for "Film" category', () => {
      const style = getCategoryStyle('Film');
      
      expect(style.gradient).toBe('bg-gradient-to-br from-blue-500 to-indigo-500');
      expect(style.emoji).toBe('🎬');
    });

    it('should return correct style for "Sport" category', () => {
      const style = getCategoryStyle('Sport');
      
      expect(style.gradient).toBe('bg-gradient-to-br from-green-500 to-teal-500');
      expect(style.emoji).toBe('⚽');
    });

    it('should return correct style for "Vzdělávání" category', () => {
      const style = getCategoryStyle('Vzdělávání');
      
      expect(style.gradient).toBe('bg-gradient-to-br from-yellow-500 to-amber-500');
      expect(style.emoji).toBe('📚');
    });

    it('should return correct style for "Technologie" category', () => {
      const style = getCategoryStyle('Technologie');
      
      expect(style.gradient).toBe('bg-gradient-to-br from-cyan-500 to-blue-500');
      expect(style.emoji).toBe('💻');
    });

    it('should return correct style for "Networking" category', () => {
      const style = getCategoryStyle('Networking');
      
      expect(style.gradient).toBe('bg-gradient-to-br from-indigo-500 to-purple-500');
      expect(style.emoji).toBe('🤝');
    });

    it('should return correct style for "Party" category', () => {
      const style = getCategoryStyle('Party');
      
      expect(style.gradient).toBe('bg-gradient-to-br from-pink-500 to-rose-500');
      expect(style.emoji).toBe('🎉');
    });

    it('should return correct style for "Ostatní" category', () => {
      const style = getCategoryStyle('Ostatní');
      
      expect(style.gradient).toBe('bg-gradient-to-br from-gray-500 to-slate-500');
      expect(style.emoji).toBe('📌');
    });

    it('should return "Ostatní" style for unknown category', () => {
      const style = getCategoryStyle('UnknownCategory');
      
      expect(style.gradient).toBe('bg-gradient-to-br from-gray-500 to-slate-500');
      expect(style.emoji).toBe('📌');
    });

    it('should return "Ostatní" style for empty string', () => {
      const style = getCategoryStyle('');
      
      expect(style.gradient).toBe('bg-gradient-to-br from-gray-500 to-slate-500');
      expect(style.emoji).toBe('📌');
    });

    it('should be case-sensitive', () => {
      const style = getCategoryStyle('hudba'); // lowercase
      
      // Should return "Ostatní" style because it's case-sensitive
      expect(style.gradient).toBe('bg-gradient-to-br from-gray-500 to-slate-500');
      expect(style.emoji).toBe('📌');
    });

    it('should handle category with extra spaces', () => {
      const style = getCategoryStyle('Hudba ');
      
      // Should return "Ostatní" style because of extra space
      expect(style.gradient).toBe('bg-gradient-to-br from-gray-500 to-slate-500');
      expect(style.emoji).toBe('📌');
    });

    it('should return object with correct structure', () => {
      const style = getCategoryStyle('Hudba');
      
      expect(style).toHaveProperty('gradient');
      expect(style).toHaveProperty('emoji');
      expect(typeof style.gradient).toBe('string');
      expect(typeof style.emoji).toBe('string');
    });

    it('should return consistent results for same category', () => {
      const style1 = getCategoryStyle('Sport');
      const style2 = getCategoryStyle('Sport');
      
      expect(style1).toEqual(style2);
    });

    it('should handle all categories without throwing', () => {
      const categories = [
        'Hudba',
        'Divadlo',
        'Film',
        'Sport',
        'Vzdělávání',
        'Technologie',
        'Networking',
        'Party',
        'Ostatní',
      ];

      expect(() => {
        categories.forEach(category => getCategoryStyle(category));
      }).not.toThrow();
    });
  });
});
