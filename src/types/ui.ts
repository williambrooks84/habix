export type LogosProps = {
	variant?: 1 | 2; 
	mode?: "auto" | "light" | "dark"; 
	className?: string;
	size?: number;
};

export type ButtonVariant = 'primary';
export type ButtonSize = 'normal';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
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
