import {categoryColors} from "@/app/[locale]/lib/categoryColors";
import {borderCategoryColors} from "@/app/[locale]/lib/borderCategoryColors";

type CategoryChipProps = {
    name: string;
    textToDisplay: string;
};

export default function CategoryChip({name, textToDisplay}: CategoryChipProps) {
    const color = categoryColors[name] || "black";
    const borderColor = borderCategoryColors[name];
    const iconSrc = "/icons/category.png";

    return (
        <span
            className={`inline-flex items-center gap-2 py-1 px-3 text-black rounded-full text-sm ${borderColor} border-2 bg-${color} bg-opacity-30 lowercase whitespace-nowrap`}
        >
            <img
                src={iconSrc}
                alt={textToDisplay}
                className="w-4 h-4"
                loading="lazy"
            />
            {textToDisplay}
        </span>
    );
}