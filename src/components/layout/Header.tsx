"use client";

import { Link } from "react-router-dom";
import { UserNav } from "./UserNav";
import { Button } from "@/components/ui/button";
import { Code, PlusCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { SearchDialog } from "../SearchDialog";
import { NotificationBell } from "./NotificationBell";

export function Header() {
    const { isAuthenticated, user } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-7xl flex h-16 items-center px-4 md:px-8">
                <div className="mr-4 flex items-center">
                    <Link to="/feed" className="mr-6 flex items-center space-x-2">
                        <Code className="h-6 w-6 text-primary" />
                        <span className="hidden font-bold sm:inline-block font-headline text-xl">
                            DevConnect
                        </span>
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
                    <SearchDialog />

                    {isAuthenticated && user && <NotificationBell />}

                    <nav className="flex items-center space-x-2">
                        {isAuthenticated && user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="default" size="sm" className="h-9 rounded-full px-4">
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Create</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuItem asChild>
                                        <Link to="/create">New Snippet</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/create">New Story</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/blogs">All Articles</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        <UserNav />
                    </nav>
                </div>
            </div>
        </header>
    );
}
