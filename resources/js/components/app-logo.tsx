import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            {/* 1. Background box diubah menjadi gradient agar lebih berwarna */}
            <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
                {/* 2. Logo icon menggunakan warna putih solid agar kontras dengan gradient */}
                <AppLogoIcon className="size-5 text-white" />
            </div>

            <div className="ml-3 grid flex-1 text-left">
                {/* 3. Teks SIADLAB dengan sentuhan warna dari tema */}
                <span className="truncate leading-tight font-black tracking-wider uppercase text-gray-900 dark:text-zinc-100">
                    SIAD<span className="text-cyan-600 dark:text-cyan-400">LAB</span>
                </span>
                {/* Tambahan sub-teks agar terlihat profesional (opsional) */}
                <span className="truncate text-[10px] font-medium text-gray-500 dark:text-zinc-500 leading-none">
                    Computer Science
                </span>
            </div>
        </>
    );
}