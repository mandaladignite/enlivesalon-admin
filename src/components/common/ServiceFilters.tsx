"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, 
  X, 
  ChevronDown, 
  Search, 
  SlidersHorizontal,
  Sparkles,
  Home,
  Building2,
  Star,
  Clock,
  IndianRupee,
  Check
} from "lucide-react";

export interface ServiceFilterOptions {
  subCategory?: string;
  gender?: 'male' | 'female' | 'unisex';
  availability?: 'home' | 'salon' | 'both';
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: {
    min: number;
    max: number;
  };
  featured?: boolean;
  sortBy?: 'price' | 'duration' | 'name' | 'featured';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

interface ServiceFiltersProps {
  filters: ServiceFilterOptions;
  onFiltersChange: (filters: ServiceFilterOptions) => void;
  subCategories: string[];
  category: string;
  totalServices: number;
  className?: string;
}

// Reusable Dropdown Component
interface DropdownProps {
  label: string;
  value: string | undefined;
  options: { value: string; label: string; icon?: React.ReactNode }[];
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

const Dropdown = ({ label, value, options, onChange, placeholder = "Select option", className = "" }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => (prev + 1) % (options.length + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => prev <= 0 ? options.length : prev - 1);
        break;
      case 'Enter':
        event.preventDefault();
        if (focusedIndex === 0) {
          onChange(undefined);
          setIsOpen(false);
        } else if (focusedIndex > 0) {
          onChange(options[focusedIndex - 1].value);
          setIsOpen(false);
        }
        setFocusedIndex(-1);
        break;
    }
  };
  
  return (
    <div className={`relative dropdown-container ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold transition-colors flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon}
          <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <button
              onClick={() => {
                onChange(undefined);
                setIsOpen(false);
                setFocusedIndex(-1);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                !value ? 'bg-gold/10 text-gold' : 'text-gray-700'
              } ${focusedIndex === 0 ? 'bg-gray-100' : ''}`}
            >
              {!value && <Check className="w-4 h-4" />}
              <span>All {label.toLowerCase()}</span>
            </button>
            {options.map((option, index) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setFocusedIndex(-1);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                  value === option.value ? 'bg-gold/10 text-gold' : 'text-gray-700'
                } ${focusedIndex === index + 1 ? 'bg-gray-100' : ''}`}
              >
                {value === option.value && <Check className="w-4 h-4" />}
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ServiceFilters({
  filters,
  onFiltersChange,
  subCategories,
  category,
  totalServices,
  className = ""
}: ServiceFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  // Gender options based on category
  const getGenderOptions = () => {
    switch (category) {
      case 'hair':
        return [
          { value: 'male', label: 'Men\'s Hair', icon: '👨' },
          { value: 'female', label: 'Women\'s Hair', icon: '👩' },
          { value: 'unisex', label: 'Unisex', icon: '👥' }
        ];
      case 'nail':
        return [
          { value: 'female', label: 'Women\'s Nails', icon: '👩' },
          { value: 'unisex', label: 'Unisex', icon: '👥' }
        ];
      case 'body':
      case 'skin':
        return [
          { value: 'female', label: 'Women\'s', icon: '👩' },
          { value: 'unisex', label: 'Unisex', icon: '👥' }
        ];
      default:
        return [
          { value: 'unisex', label: 'Unisex', icon: '👥' }
        ];
    }
  };

  const genderOptions = getGenderOptions();

  const handleFilterChange = (key: keyof ServiceFilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleFilterChange('search', value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const clearFilters = () => {
    onFiltersChange({
      subCategory: undefined,
      gender: undefined,
      availability: undefined,
      priceRange: undefined,
      duration: undefined,
      featured: undefined,
      sortBy: 'featured',
      sortOrder: 'desc',
      search: ''
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.subCategory) count++;
    if (filters.gender) count++;
    if (filters.availability) count++;
    if (filters.priceRange) count++;
    if (filters.duration) count++;
    if (filters.featured) count++;
    if (filters.search) count++;
    return count;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}>
      {/* Filter Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold/10 rounded-lg">
              <SlidersHorizontal className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Filter Services</h3>
              <p className="text-sm text-gray-500">
                {totalServices} services available
                {hasActiveFilters && ` • ${getActiveFilterCount()} filter${getActiveFilterCount() > 1 ? 's' : ''} applied`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronDown 
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold transition-colors"
          />
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {filters.subCategory && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 text-gold text-sm rounded-full">
                <Sparkles className="w-3 h-3" />
                {filters.subCategory}
                <button
                  onClick={() => handleFilterChange('subCategory', undefined)}
                  className="hover:bg-gold/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.gender && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 text-gold text-sm rounded-full">
                {genderOptions.find(opt => opt.value === filters.gender)?.icon}
                {genderOptions.find(opt => opt.value === filters.gender)?.label}
                <button
                  onClick={() => handleFilterChange('gender', undefined)}
                  className="hover:bg-gold/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.availability && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 text-gold text-sm rounded-full">
                {filters.availability === 'home' ? <Home className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                {filters.availability === 'home' ? 'Home Service' : 'Salon Service'}
                <button
                  onClick={() => handleFilterChange('availability', undefined)}
                  className="hover:bg-gold/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.featured && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 text-gold text-sm rounded-full">
                <Star className="w-3 h-3" />
                Featured Only
                <button
                  onClick={() => handleFilterChange('featured', undefined)}
                  className="hover:bg-gold/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 text-gold text-sm rounded-full">
                <Search className="w-3 h-3" />
                "{filters.search}"
                <button
                  onClick={() => {
                    handleFilterChange('search', '');
                    setSearchQuery('');
                  }}
                  className="hover:bg-gold/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className=""
          >
            <div className="p-6 space-y-6">
              {/* Filter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Subcategory Filter */}
                <Dropdown
                  label="Service Type"
                  value={filters.subCategory}
                  options={[
                    ...subCategories.map(subCategory => ({
                      value: subCategory,
                      label: subCategory,
                      icon: <Sparkles className="w-4 h-4" />
                    }))
                  ]}
                  onChange={(value) => handleFilterChange('subCategory', value)}
                  placeholder="All service types"
                />

                {/* Gender Filter */}
                <Dropdown
                  label="Gender"
                  value={filters.gender}
                  options={genderOptions}
                  onChange={(value) => handleFilterChange('gender', value)}
                  placeholder="All genders"
                />

                {/* Availability Filter */}
                <Dropdown
                  label="Availability"
                  value={filters.availability}
                  options={[
                    { value: 'home', label: 'Home Service', icon: <Home className="w-4 h-4" /> },
                    { value: 'salon', label: 'Salon Service', icon: <Building2 className="w-4 h-4" /> }
                  ]}
                  onChange={(value) => handleFilterChange('availability', value)}
                  placeholder="All locations"
                />

                {/* Featured Filter */}
                <Dropdown
                  label="Special Services"
                  value={filters.featured ? 'featured' : undefined}
                  options={[
                    { value: 'featured', label: 'Featured Only', icon: <Star className="w-4 h-4" /> }
                  ]}
                  onChange={(value) => handleFilterChange('featured', value === 'featured' ? true : undefined)}
                  placeholder="All services"
                />
              </div>

              {/* Sort Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Dropdown
                  label="Sort By"
                  value={filters.sortBy}
                  options={[
                    { value: 'featured', label: 'Featured', icon: <Star className="w-4 h-4" /> },
                    { value: 'price', label: 'Price', icon: <IndianRupee className="w-4 h-4" /> },
                    { value: 'duration', label: 'Duration', icon: <Clock className="w-4 h-4" /> },
                    { value: 'name', label: 'Name (A-Z)', icon: <span className="w-4 h-4 text-center text-xs font-bold">A</span> }
                  ]}
                  onChange={(value) => handleFilterChange('sortBy', value || 'featured')}
                  placeholder="Sort by"
                />

                <Dropdown
                  label="Sort Order"
                  value={filters.sortOrder}
                  options={[
                    { value: 'asc', label: 'Ascending (↑)', icon: <span className="w-4 h-4 text-center text-xs">↑</span> },
                    { value: 'desc', label: 'Descending (↓)', icon: <span className="w-4 h-4 text-center text-xs">↓</span> }
                  ]}
                  onChange={(value) => handleFilterChange('sortOrder', value || 'desc')}
                  placeholder="Sort order"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
