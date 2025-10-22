"use client";

import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { 
  Scissors, 
  Heart, 
  Clock, 
  Star, 
  Calendar, 
  Home, 
  Building2,
  Sparkles,
  Zap,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  Tag,
  Award,
  Timer
} from "lucide-react";
import OptimizedImage, { ServiceImage } from "@/components/common/OptimizedImage";

interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
  category: string;
  subCategory: string;
  icon: string;
  photo?: string;
  tags: string[];
  isFeatured: boolean;
  availableAtHome: boolean;
  availableAtSalon: boolean;
  discount?: {
    percentage: number;
    isActive: boolean;
    validFrom?: string;
    validUntil?: string;
  };
}

interface EnhancedServiceCardProps {
  service: Service;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onBook: (service: Service) => void;
  category: string;
  className?: string;
}

const EnhancedServiceCard = memo(({ 
  service, 
  index, 
  isSelected, 
  onSelect, 
  onBook,
  category,
  className = ""
}: EnhancedServiceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }, []);

  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  }, []);

  const calculateDiscountedPrice = useCallback((service: Service) => {
    if (!service.discount || !service.discount.isActive || service.discount.percentage === 0) {
      return service.price;
    }

    const now = new Date();
    if (service.discount.validFrom && now < new Date(service.discount.validFrom)) {
      return service.price;
    }
    if (service.discount.validUntil && now > new Date(service.discount.validUntil)) {
      return service.price;
    }

    const discountAmount = (service.price * service.discount.percentage) / 100;
    return Math.max(0, service.price - discountAmount);
  }, []);

  const isDiscountActive = useCallback((service: Service) => {
    if (!service.discount || !service.discount.isActive || service.discount.percentage === 0) {
      return false;
    }

    const now = new Date();
    if (service.discount.validFrom && now < new Date(service.discount.validFrom)) {
      return false;
    }
    if (service.discount.validUntil && now > new Date(service.discount.validUntil)) {
      return false;
    }

    return true;
  }, []);

  const getCategoryIcon = () => {
    switch (category) {
      case 'hair':
        return <Scissors className="w-6 h-6" />;
      case 'body':
        return <Heart className="w-6 h-6" />;
      case 'skin':
        return <Zap className="w-6 h-6" />;
      case 'nail':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Scissors className="w-6 h-6" />;
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'hair':
        return 'yellow';
      case 'body':
        return 'green';
      case 'skin':
        return 'orange';
      case 'nail':
        return 'pink';
      default:
        return 'yellow';
    }
  };

  const categoryColor = getCategoryColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden ${className} ${
        isSelected ? `border-${categoryColor}-500 ring-2 ring-${categoryColor}-200` : ''
      }`}
    >
      {/* Service Image/Icon Header */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {service.photo ? (
          <ServiceImage
            src={service.photo}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`w-20 h-20 bg-${categoryColor}-100 rounded-2xl flex items-center justify-center`}>
              {getCategoryIcon()}
            </div>
          </div>
        )}
        
        {/* Featured Badge */}
        {service.isFeatured && (
          <div className="absolute top-4 left-4">
            <div className="bg-gold text-black px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          </div>
        )}

        {/* Discount Badge */}
        {isDiscountActive(service) && (
          <div className="absolute top-4 right-4">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              {service.discount?.percentage}% OFF
            </div>
          </div>
        )}

        {/* Subcategory Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
            {service.subCategory}
          </div>
        </div>
      </div>

      {/* Service Content */}
      <div className="p-6">
        {/* Service Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-gold transition-colors">
              {service.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {service.description}
            </p>
          </div>
        </div>

        {/* Service Details */}
        <div className="space-y-3 mb-4">
          {/* Duration */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Timer className="w-4 h-4 text-gray-400" />
            <span>{formatDuration(service.duration)}</span>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-4 text-sm">
            {service.availableAtHome && (
              <div className="flex items-center gap-1 text-green-600">
                <Home className="w-4 h-4" />
                <span>Home Service</span>
              </div>
            )}
            {service.availableAtSalon && (
              <div className="flex items-center gap-1 text-blue-600">
                <Building2 className="w-4 h-4" />
                <span>Salon Service</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {service.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {service.tags.slice(0, 3).map((tag, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {service.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{service.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isDiscountActive(service) ? (
              <div className="space-y-1">
                <div className="text-gray-400 text-sm line-through">
                  {formatPrice(service.price)}
                </div>
                <div className={`text-${categoryColor}-600 font-bold text-xl`}>
                  {formatPrice(calculateDiscountedPrice(service))}
                </div>
              </div>
            ) : (
              <div className={`text-${categoryColor}-600 font-bold text-xl`}>
                {formatPrice(service.price)}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100 pt-4 space-y-3"
          >
            {/* Full Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Service Details</h4>
              <p className="text-sm text-gray-600">{service.description}</p>
            </div>

            {/* All Tags */}
            {service.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Service Features</h4>
                <div className="flex flex-wrap gap-1">
                  {service.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Service Benefits */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">What's Included</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gold rounded-full"></div>
                  Professional consultation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gold rounded-full"></div>
                  Premium quality products
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gold rounded-full"></div>
                  Expert service delivery
                </li>
                {service.availableAtHome && (
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gold rounded-full"></div>
                    Home service available
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSelect(service._id)}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
              isSelected
                ? `bg-${categoryColor}-500 text-white hover:bg-${categoryColor}-600`
                : `border-2 border-${categoryColor}-500 text-${categoryColor}-600 hover:bg-${categoryColor}-500 hover:text-white`
            }`}
          >
            {isSelected ? 'Selected' : 'Select Service'}
          </button>
          
          {isSelected && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => {
                e.stopPropagation();
                onBook(service);
              }}
              className={`bg-gold hover:bg-gold-dark text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
            >
              <Calendar className="w-4 h-4" />
              Book Now
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

EnhancedServiceCard.displayName = 'EnhancedServiceCard';

export default EnhancedServiceCard;
