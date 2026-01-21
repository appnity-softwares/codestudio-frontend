
import * as React from "react"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TagInputProps {
    placeholder?: string
    tags: string[]
    setTags: (tags: string[]) => void
    className?: string
    suggestions?: string[]
}

export function TagInput({
    placeholder,
    tags = [],
    setTags,
    className,
    suggestions = []
}: TagInputProps) {
    const [inputValue, setInputValue] = React.useState("")

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            addTag(inputValue)
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1)
        }
    }

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim().toLowerCase()
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag])
            setInputValue("")
        }
    }

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index))
    }

    return (
        <div className={cn("space-y-3", className)}>
            <div
                className={cn(
                    "flex flex-wrap gap-2 p-2 min-h-[44px] bg-black/20 border border-white/10 rounded-md focus-within:ring-1 focus-within:ring-primary transition-all",
                    className
                )}
            >
                {tags.map((tag, index) => (
                    <Badge
                        key={`${tag}-${index}`}
                        variant="secondary"
                        className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors py-1 px-2"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="hover:text-destructive focus:outline-none"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => addTag(inputValue)}
                    placeholder={tags.length === 0 ? placeholder : ""}
                    className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] placeholder:text-muted-foreground"
                />
            </div>

            {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Suggestions:</span>
                    {suggestions
                        .filter((s) => !tags.includes(s.toLowerCase()))
                        .slice(0, 6)
                        .map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => addTag(suggestion)}
                                className="text-[10px] bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/10 px-2 py-0.5 rounded transition-all flex items-center gap-1"
                            >
                                <Plus className="h-2 w-2" />
                                {suggestion}
                            </button>
                        ))}
                </div>
            )}
        </div>
    )
}
