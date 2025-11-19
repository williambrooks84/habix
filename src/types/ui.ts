export type LogosProps = {
	variant?: 1 | 2; 
	mode?: "auto" | "light" | "dark"; 
	className?: string;
	size?: number;
};

export type ButtonVariant = 'primary' | 'transparent';
export type ButtonSize = 'small' | 'normal' | 'paddingless';

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