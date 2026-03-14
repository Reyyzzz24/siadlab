import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { motion } from 'framer-motion';
import AppLogoIcon from '@/components/app-logo-icon';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-zinc-950">
            <Head title="Log in" />

            <div className="flex w-full">
                {/* SISI KIRI: GAMBAR LATAR (Hidden on Mobile) */}
                <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-16 lg:flex">
                    {/* GAMBAR LATAR DENGAN ANIMASI ZOOM-IN */}
                    <motion.div
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="absolute inset-0 z-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/auth.jpg')" }}
                    />

                    {/* Overlay Hitam Transparan */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 z-10 bg-black dark:bg-black/70"
                    ></motion.div>

                    {/* KONTEN TEKS */}
                    <div className="relative z-20 mx-auto mt-auto mb-auto flex h-full max-w-lg flex-col justify-center text-center">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="space-y-6"
                        >
                            <motion.h3
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                                className="text-3xl font-bold text-yellow-400"
                            >
                                SELAMAT DATANG
                            </motion.h3>

                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.9, duration: 0.8 }}
                                className="text-5xl font-extrabold leading-tight text-white"
                            >
                                Sistem Administrasi Laboratorium & TU Terintegrasi
                            </motion.h2>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.1, duration: 0.8 }}
                                className="text-lg text-gray-200"
                            >
                                Akses mudah untuk pengelolaan peminjaman, inventaris, dan kegiatan akademik.
                            </motion.p>
                        </motion.div>
                    </div>
                </div>

                {/* SISI KANAN: FORM LOGIN */}
                <div className="flex w-full items-center justify-center bg-white p-8 dark:bg-zinc-900 sm:p-16 lg:w-1/2 lg:p-24">
                    <div className="w-full max-w-md">
                        {/* Logo & Brand */}
                        <div className="mb-12">
                            <a href="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white">
                                <AppLogoIcon className="h-8 w-auto" />
                                <span>SIADLAB</span>
                            </a>
                        </div>

                        <h2 className="mb-12 text-5xl font-extrabold text-gray-900 dark:text-zinc-100">
                            Log in
                            <div className="mt-2 h-1.5 w-12 bg-yellow-400"></div>
                        </h2>

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="space-y-6"
                            onSubmit={() => console.log('Login form submit triggered')}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-5">
                                        {/* Email Field */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Email address</Label>
                                            <div className="relative">
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    placeholder="Masukkan email Anda"
                                                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-yellow-500 focus:ring-yellow-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-yellow-400"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-400">@</span>
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>

                                        {/* Password Field */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                autoComplete="current-password"
                                                placeholder="Masukkan password Anda"
                                                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-yellow-500 focus:ring-yellow-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-yellow-400"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center">
                                                <Checkbox id="remember" name="remember" className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 dark:border-zinc-700 dark:bg-zinc-800" />
                                                <Label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-zinc-400">Remember me</Label>
                                            </div>

                                            {canResetPassword && (
                                                <TextLink href={request()} className="text-sm font-semibold text-yellow-600 transition-colors hover:text-yellow-700 dark:text-yellow-500 dark:hover:text-yellow-400">
                                                    Forgot Password?
                                                </TextLink>
                                            )}
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                className="flex w-full justify-center rounded-xl px-4 py-4 text-lg transition duration-150 ease-in-out"
                                                variant="yellow"
                                                disabled={!!processing}
                                                onClick={() => console.log('Sign in clicked')}
                                            >
                                                {processing && <Spinner className="mr-2" />}
                                                Sign in
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="mt-8 text-center text-sm text-gray-700 dark:text-zinc-400">
                                        Don't have an account?{' '}
                                        <TextLink href={register()} className="font-semibold text-yellow-600 underline transition-colors hover:text-yellow-700 dark:text-yellow-500 dark:hover:text-yellow-400">
                                            Sign up
                                        </TextLink>
                                    </p>
                                </>
                            )}
                        </Form>

                        {status && (
                            <div className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
                                {status}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}