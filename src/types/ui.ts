import type { FrequencyType, FrequencyConfig } from '@/app/types';

export type LogosProps = {
  variant?: 1 | 2;
  mode?: "auto" | "light" | "dark";
  className?: string;
  size?: number;
};

export type ButtonVariant = 'primary' | 'primaryOutline' | 'transparent';
export type ButtonSize = 'small' | 'normal' | 'paddingless' | 'icon' | 'nav';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  href?: string;
}

export type FormInputProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  icon?: React.ReactNode;
  className?: string;
};

//Menu
export type MenuOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export type MenuItemProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
};

export type HomeConnectedProps = {
  userName: string;
};

//Categories
export type CategoryItem = {
  id: number | string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  selected?: boolean;
};

export type CategoryProps = {
  items?: CategoryItem[];
  categories?: SimpleCategory[];
  onSelect?: (id: number | string) => void;
  className?: string;
  selectedId?: number | string | null;
  id?: string;
};


export type SimpleCategory = {
  id: number;
  name: string
};

//Habit

export type Habit = {
  id?: number | string;
  name: string;
  color?: string | null;
  categoryId?: number | null;
  motivation?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  frequencyType?: string | null;
  frequencyConfig?: any | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HabitFormProps = {
  categories: SimpleCategory[];
  habit?: Habit | null;
};

export type FormUIProps = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export type FormLabelProps = {
  id?: string;
  label: string;
};

export type HabitListItem = {
  id: number | string;
  name: string;
  Icon?: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  motivation?: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  frequencyType?: string | null;
  color?: string | null;
  onClick?: (id: number | string) => void;
};

export type HabitProps = {
  items: HabitListItem[];
  className?: string;
};

export type DatePickerProps = {
  startDate?: string | null;
  endDate?: string | null;
  onChange: (payload: { startDate: string | null; endDate: string | null }) => void;
  label?: string;
  allowRange?: boolean;
  minDate?: Date;
  maxDate?: Date;
};

type FrequencyValue = { type: FrequencyType; config?: FrequencyConfig };

export type FrequencySelectProps = {
  value: FrequencyValue;
  onChange: (v: FrequencyValue) => void;
  className?: string;
  periodStart?: string | null;
  periodEnd?: string | null;
};

export type ListOverlayProps = {
  item: any | null;
  onClose: () => void;
  onDelete: (id: string | number) => void;
};

export type ListDetailProps = {
  title: string;
  children: React.ReactNode;
};

export type DeleteModalProps = {
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  pendingDeleteId?: string | number | null;
  deletingIds?: Array<string | number>;
};

//Chart

export type ChartTooltipContentProps = {
  active?: boolean;
  payload?: any[];
  label?: any;
  className?: string;
  nameKey?: string;
  valueFormatter?: (value: any, name: any) => React.ReactNode;
  labelFormatter?: (label: string) => React.ReactNode;
};


//Loading

export type LoadingSpinProps = {
  size?: number;
  className?: string;
  "aria-label"?: string;
};

//Streak

export type StreakChartProps = {
  completedDays: string[];
  periodStart?: string | null;
  periodEnd?: string | null;
  frequencyType?: string | null;
  frequencyConfig?: any;
};

//Recommendation

export type RecommendationListDetailProps = {
  id: number;
  title: string;
  content: string;
}

export type RecommendationProps = {
  items: RecommendationListDetailProps[];
  className?: string;
};


//Toast

export type ToastProps = {
  title: string;
  message: string;
};

export interface ToastModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export type BadgeToast = { id: string; title: string; message?: string; type: 'badge' }
export type RecommendationToast = { id: string; title: string; message: string; type: 'recommendation'; onClose: () => void; onClick: () => void }
export type Toast = BadgeToast | RecommendationToast

//Profile

export interface PointsContextType {
  pointsVersion: number;
  refreshPoints: () => void;
}

//Backoffice 

export interface BlockedUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type AnyHabit = Record<string, any>

type AdminTab = "users" | "habits"

export type AdminToggleProps = {
    value: AdminTab
  onChange: (v: AdminTab) => void
}