import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            {/* Logo berdiri sendiri tanpa background box */}
            <div className="flex shrink-0 items-center justify-center -mr-4">
                <AppLogoIcon 
                    className="size-7 object-contain dark:invert" 
                />
            </div>

            <div className="ml-3 grid flex-1 text-left">
                {/* Teks SIADLAB */}
                <span className="truncate leading-tight font-black tracking-wider uppercase text-gray-900 dark:text-zinc-100">
                    SIAD<span className="text-cyan-600 dark:text-cyan-400">LAB</span>
                </span>
                {/* Sub-teks Computer Science */}
                <span className="truncate text-[10px] font-medium text-gray-500 dark:text-zinc-500 leading-none">
                    Computer Science
                </span>
            </div>
        </>
    );
}