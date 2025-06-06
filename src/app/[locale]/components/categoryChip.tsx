import { categoryColors } from "@/app/[locale]/lib/categoryColors";

type CategoryChipProps = {
    name: string;
};

export default function CategoryChip({ name }: CategoryChipProps) {
    const color = categoryColors[name] || "border-gray-400";

    return (
        <span
            className={`inline-block px-3 text-black rounded-full  text-sm border-${color} border-2 bg-${color} bg-opacity-20 lowercase`}>
            {name}
        </span>
    );
}