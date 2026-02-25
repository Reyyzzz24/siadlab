import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { User as UserIcon } from 'lucide-react'; // Tambahkan ikon user

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    // Logika untuk menentukan URL foto profil
    const profileImageUrl = user.profile_photo_path 
        ? `/storage/${user.profile_photo_path}` 
        : user.avatar; // Tetap simpan user.avatar sebagai cadangan jika ada

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={profileImageUrl} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {/* Menampilkan inisial, jika kosong tampilkan ikon User */}
                    {getInitials(user.name) || <UserIcon className="size-4" />}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}