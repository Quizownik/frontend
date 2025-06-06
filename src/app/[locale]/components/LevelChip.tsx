import {levelColors} from "@/app/[locale]/lib/levelColors";
import {borderLevelColors} from "@/app/[locale]/lib/borderLevelColors";

type LevelChipProps = {
    name: string;
    textToDisplay: string;
};

export default function LevelChip({name, textToDisplay}: LevelChipProps) {
    const color = levelColors[name] || "black";
    const borderColor = borderLevelColors[name];
    const iconSrc = "/icons/level.png";

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