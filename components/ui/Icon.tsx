import React from 'react';
import {
  LucideIcon,
  Home,
  Package,
  Heart,
  User,
  Check,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Eye,
  EyeOff,
  Hourglass,
  Leaf,
  CalendarCheck,
  X,
  Plus,
  SlidersHorizontal,
  Archive,
} from 'lucide-react-native';
import { colors } from '../../theme/tokens';

export type IconName =
  | 'home'
  | 'inventory'
  | 'log'
  | 'empties'
  | 'wishlist'
  | 'you'
  | 'check'
  | 'alert'
  | 'info'
  | 'chevron-right'
  | 'chevron-down'
  | 'arrow-left'
  | 'eye'
  | 'eye-off'
  | 'cooling'
  | 'leaf'
  | 'routine'
  | 'close'
  | 'sliders';

const icons: Record<IconName, LucideIcon> = {
  home: Home,
  inventory: Package,
  log: Plus,
  empties: Archive,
  wishlist: Heart,
  you: User,
  check: Check,
  alert: AlertTriangle,
  info: Info,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  'arrow-left': ArrowLeft,
  eye: Eye,
  'eye-off': EyeOff,
  cooling: Hourglass, // the 14-day cooling-off idea, used on the "cut impulse buys" goal
  leaf: Leaf,
  routine: CalendarCheck,
  close: X,
  sliders: SlidersHorizontal,
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** DESIGN-TOKENS §4 allows 1.5–2pt line icons; 2 stays the default. */
  strokeWidth?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = colors['inactive-gray'],
  strokeWidth = 2,
  className = '',
}) => {
  const LucideIconComponent = icons[name];
  if (!LucideIconComponent) return null;

  return (
    <LucideIconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
};
