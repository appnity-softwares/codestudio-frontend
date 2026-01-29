import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { messagesAPI } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface MentionUser {
    id: string;
    username: string;
    image?: string;
}

interface MentionAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onMention?: (user: MentionUser) => void;
    className?: string;
}

/**
 * MentionAutocomplete - @mention autocomplete for chat input
 * 
 * Features:
 * - Triggers on @ character
 * - Searches contacts by username
 * - Keyboard navigation (up/down/enter/escape)
 * - Inserts @username into input
 */
export function MentionAutocomplete({
    value,
    onChange,
    onMention,
    className,
}: MentionAutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentionStart, setMentionStart] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch contacts for autocomplete
    const { data: contactsData } = useQuery({
        queryKey: ['contacts'],
        queryFn: () => messagesAPI.getContacts(),
        staleTime: 60000, // Cache for 1 minute
    });

    const contacts: MentionUser[] = (contactsData?.contacts || []).map((c: any) => ({
        id: c.id || c.ID,
        username: c.username || c.Username,
        image: c.image || c.Image,
    }));

    // Filter contacts by query
    const filteredContacts = query
        ? contacts.filter(c => c.username.toLowerCase().includes(query.toLowerCase()))
        : contacts;

    // Detect @ trigger
    useEffect(() => {
        const lastAtIndex = value.lastIndexOf('@');
        if (lastAtIndex >= 0) {
            const textAfterAt = value.slice(lastAtIndex + 1);
            // Check if we're in the middle of typing a mention (no space after @)
            if (!textAfterAt.includes(' ')) {
                setMentionStart(lastAtIndex);
                setQuery(textAfterAt);
                setIsOpen(true);
                setSelectedIndex(0);
                return;
            }
        }
        setIsOpen(false);
        setQuery('');
        setMentionStart(-1);
    }, [value]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isOpen || filteredContacts.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredContacts.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredContacts.length - 1
                );
                break;
            case 'Enter':
            case 'Tab':
                e.preventDefault();
                selectUser(filteredContacts[selectedIndex]);
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    }, [isOpen, filteredContacts, selectedIndex]);

    // Insert selected user
    const selectUser = (user: MentionUser) => {
        if (mentionStart < 0) return;

        const before = value.slice(0, mentionStart);
        const after = value.slice(mentionStart + query.length + 1); // +1 for @
        const newValue = `${before}@${user.username} ${after}`;

        onChange(newValue);
        setIsOpen(false);
        onMention?.(user);

        // Focus input and move cursor
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    return (
        <div className={cn("relative", className)}>
            {/* Autocomplete Dropdown */}
            {isOpen && filteredContacts.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-[200px] overflow-y-auto z-50">
                    {filteredContacts.slice(0, 5).map((user, index) => (
                        <button
                            key={user.id}
                            onClick={() => selectUser(user)}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors",
                                index === selectedIndex
                                    ? "bg-accent text-accent-foreground"
                                    : "hover:bg-muted"
                            )}
                        >
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={user.image} />
                                <AvatarFallback className="text-xs">
                                    {user.username[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                                @{user.username}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Hidden input ref for focus management */}
            <input
                ref={inputRef}
                type="hidden"
                onKeyDown={handleKeyDown}
            />
        </div>
    );
}

/**
 * Hook to handle mention detection in text input
 */
export function useMentionInput() {
    const [mentionedUsers, setMentionedUsers] = useState<MentionUser[]>([]);

    const addMention = (user: MentionUser) => {
        setMentionedUsers(prev => {
            if (prev.some(u => u.id === user.id)) return prev;
            return [...prev, user];
        });
    };

    const clearMentions = () => {
        setMentionedUsers([]);
    };

    // Extract mention IDs for API
    const getMentionIds = () => mentionedUsers.map(u => u.id);

    return {
        mentionedUsers,
        addMention,
        clearMentions,
        getMentionIds,
    };
}
