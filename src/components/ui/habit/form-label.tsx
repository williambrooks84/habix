import { FormLabelProps } from "@/types/ui";

export default function FormLabel({ id, label }: FormLabelProps) {    
    return (
        <label htmlFor={id} className="text-base font-medium leading-none">
            {label}
        </label>
    );
}
