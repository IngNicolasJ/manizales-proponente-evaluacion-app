
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScoringSelectProps {
  value: number;
  onChange: (value: number) => void;
  maxValue: number;
  placeholder?: string;
  disabled?: boolean;
  customOptions?: number[];
}

export const ScoringSelect: React.FC<ScoringSelectProps> = ({
  value,
  onChange,
  maxValue,
  placeholder = "Seleccionar puntaje",
  disabled = false,
  customOptions
}) => {
  const generateOptions = (max: number) => {
    if (customOptions) {
      return customOptions;
    }
    const options = [];
    for (let i = 0; i <= max * 100; i += 25) {
      const val = i / 100;
      if (val <= max) {
        options.push(val);
      }
    }
    return options;
  };

  const options = generateOptions(maxValue);

  return (
    <Select
      value={value.toString()}
      onValueChange={(val) => onChange(parseFloat(val))}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option.toString()}>
            {option.toFixed(2)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
