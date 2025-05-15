import {colorClasses} from "@/app/[locale]/lib/colorClasses";
import {Link} from '@/i18n/navigation';

export default function QuizCategoryButton({color, emoji, label}: { color: string; emoji: string; label: string; }) {
    return (
        <Link
            href={`/${emoji}/${label}`}
            passHref
            className={`px-6 py-3 rounded-xl text-lg shadow-lg transition text-black ${colorClasses[color] || "bg-gray-500"}`}
        >
            {emoji} {label}
        </Link>
    );
}