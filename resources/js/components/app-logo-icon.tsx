import { BookOpen } from 'lucide-react';
import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    // Kita menggunakan spread props agar class, style, atau ukuran 
    // yang dikirim dari parent tetap berfungsi
    return (
        <BookOpen 
            {...(props as any)} 
            // Default size jika tidak ditentukan di parent
            size={props.width || 32} 
        />
    );
}