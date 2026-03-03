import * as React from "react"
import { cn } from "../../lib/utils"

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue'> {
    value?: number[]
    defaultValue?: number[]
    max?: number
    step?: number
    onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, value, defaultValue, max = 100, step = 1, onValueChange, ...props }, ref) => {

        // Handle array-based values for compatibility with usage
        const currentValue = Array.isArray(value) ? value[0] : (Array.isArray(defaultValue) ? defaultValue[0] : 0)

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newVal = Number(e.target.value)
            if (onValueChange) {
                onValueChange([newVal])
            }
        }

        return (
            <input
                type="range"
                className={cn(
                    "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary",
                    className
                )}
                style={{
                    backgroundSize: `${(currentValue / max) * 100}% 100%`
                }}
                ref={ref}
                value={currentValue}
                max={max}
                step={step}
                onChange={handleChange}
                {...props}
            />
        )
    }
)
Slider.displayName = "Slider"

export { Slider }

