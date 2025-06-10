import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {logout} from "@/app/[locale]/actions/auth";

export function useAuthGuard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const locale = window.location.pathname.split('/')[1] || 'pl';
        fetch(`/${locale}/api/me`)
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    logout();
                } else if (res.ok) {
                    setAuthorized(true);
                }
            })
            .finally(() => setLoading(false));
    }, [router]);

    return { loading, authorized };
}