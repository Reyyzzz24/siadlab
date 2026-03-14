import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';
import { motion } from 'framer-motion';
import AppLogoIcon from '@/components/app-logo-icon';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-zinc-950">
            <Head title="Forgot password" />

            <div className="flex w-full">
                <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-16 lg:flex">
                    {/* LAYER 1: GAMBAR DENGAN ANIMASI ZOOM-IN */}
                    <motion.div
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="absolute inset-0 z-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/auth.jpg')" }}
                    />

                    {/* LAYER 2: OVERLAY HITAM */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 z-10 bg-black dark:bg-black/70"
                    ></motion.div>

                    {/* LAYER 3: KONTEN TEKS */}
                    <div className="relative z-20 mx-auto mt-auto mb-auto flex h-full max-w-lg flex-col justify-center text-center">
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="space-y-6"
                        >
                            <motion.h3
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                                className="text-3xl font-bold text-yellow-400"
                            >
                                RESET PASSWORD
                            </motion.h3>

                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.9, duration: 0.8 }}
                                className="text-5xl font-extrabold leading-tight text-white"
                            >
                                Jangan Khawatir, Kami Siap Membantu.
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.1, duration: 0.8 }}
                                className="text-lg text-gray-200"
                            >
                                Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
                            </motion.p>
                        </motion.div>
                    </div>
                </div>

                {/* SISI KANAN: FORM FORGOT PASSWORD */}
                <div className="flex w-full items-center justify-center bg-white p-8 dark:bg-zinc-900 sm:p-16 lg:w-1/2 lg:p-24">
                    <div className="w-full max-w-md">
                        {/* Logo & Brand */}
                        <div className="mb-10">
                            <a href="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white">
                               <AppLogoIcon className="h-8 w-auto" />
                                <span>SIADLAB</span>
                            </a>
                        </div>

                        <h2 className="mb-6 text-5xl font-extrabold text-gray-900 dark:text-zinc-100">
                            Forgot Password?
                            <div className="mt-2 h-1.5 w-12 bg-yellow-400"></div>
                        </h2>

                        <p className="mb-10 text-gray-600 dark:text-zinc-400">
                            Masukkan email yang terdaftar untuk menerima instruksi reset password.
                        </p>

                        {status && (
                            <div className="mb-6 rounded-xl bg-green-50 p-4 text-center text-sm font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                {status}
                            </div>
                        )}

                        <Form {...email.form()} className="space-y-6">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            autoComplete="off"
                                            autoFocus
                                            required
                                            placeholder="nama@example.com"
                                            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-yellow-500 focus:ring-yellow-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-yellow-400"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="flex w-full justify-center rounded-xl px-4 py-4 text-lg transition duration-150 ease-in-out"
                                        variant="yellow"
                                        disabled={processing}
                                    >
                                        {processing && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
                                        Send Reset Link
                                    </Button>
                                </>
                            )}
                        </Form>

                        <div className="mt-8 text-center text-sm text-gray-600 dark:text-zinc-400">
                            Or, return to{' '}
                            <TextLink href={login()} className="font-bold text-yellow-600 underline hover:text-yellow-700 dark:text-yellow-500 dark:hover:text-yellow-400">
                                log in
                            </TextLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}