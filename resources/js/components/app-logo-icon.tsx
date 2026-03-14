// resources/js/Components/app-logo-icon.tsx
import { ImgHTMLAttributes } from 'react';

interface AppLogoIconProps extends ImgHTMLAttributes<HTMLImageElement> {
    forceInvert?: boolean; // Properti baru untuk memaksa logo jadi putih (invert)
}

export default function AppLogoIcon({ forceInvert, className, ...props }: AppLogoIconProps) {
    return (
        <img 
            {...props} 
            src="/images/logo.png" 
            alt="SIADLAB Logo"
            width={props.width || 32} 
            className={`object-contain transition-all duration-300 ${className || ''} ${
                forceInvert ? 'invert' : 'dark:invert invert-0'
            }`}
        />
    );
}