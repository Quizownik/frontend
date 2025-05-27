import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthGuard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const locale = window.location.pathname.split('/')[1] || 'pl';
        fetch(`/${locale}/api/me`)
            .then(res => {
                if (res.status === 401) {
                    router.replace('/login');
                } else if (res.ok) {
                    setAuthorized(true);
                }
            })
            .finally(() => setLoading(false));
    }, [router]);

    return { loading, authorized };
}