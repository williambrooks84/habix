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

export type HabitFormProps = {
  categories: SimpleCategory[];
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