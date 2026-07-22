import React from 'react';
import {
  LucideIcon,
  Home,
  Package,
  Sparkles,
  Heart,
  User,
  Check,
  AlertTriangle,
  Info,
  ChevronRight,
  X,
} from 'lucide-react-native';
import { colors } from '../../theme/tokens';

export type IconName =
  | 'home'
  | 'inventory'
  | 'progress'
  | 'wishlist'
  | 'you'
  | 'check'
  | 'alert'
  | 'info'
  | 'chevron-right'
  | 'close';

const icons: Record<IconName, LucideIcon> = {
  home: Home,
  inventory: Package,
  progress: Sparkles, // Use Sparkles instead of Trophy to better represent personal growth/depletion celebration
  wishlist: Heart,
  you: User,
  check: Check,
  alert: AlertTriangle,
  info: Info,
  'chevron-right': ChevronRight,
  close: X,
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = colors['inactive-gray'],
  className = '',
}) => {
  const LucideIconComponent = icons[name];
  if (!LucideIconComponent) return null;

  return <LucideIconComponent size={size} color={color} strokeWidth={2} className={className} />;
};
