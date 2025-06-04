import { Search, Compass } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { searchArticles, getRandomArticles } from "../services/wikipediaService";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from 'react-i18next'; // Import useTranslation
import LanguageSwitcher from './LanguageSwitcher';

const Navigation = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("q");
    if (query && location.pathname !== "/discover") {
      const decodedQuery = decodeURIComponent(query);
      setSearchValue(decodedQuery);
    }
  }, [searchParams, location.pathname]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", searchValue],
    queryFn: () => searchArticles(searchValue),
    enabled: searchValue.length > 0,
    gcTime: 1000 * 60 * 5,
    staleTime: 0,
  });

  const handleArticleSelect = (title: string, selectedArticle: any) => {
    setOpen(false);
    setSearchValue(title);
    toast({
      title: t('loadingArticles'), // Translate toast title
      description: t('loadingArticlesDesc', { title }), // Translate toast description
      duration: 2000,
    });
    
    const reorderedResults = [
      selectedArticle,
      ...(searchResults || []).filter(article => article.id !== selectedArticle.id)
    ];
    
    navigate(`/?q=${encodeURIComponent(title)}`, {
      state: { reorderedResults }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  };

  const handleRandomArticle = async () => {
    setSearchValue("");
    toast({
      title: t('loadingRandomArticle'), // Translate toast title
      description: t('findingSomethingInteresting'), // Translate toast description
      duration: 2000,
    });
    const randomArticles = await getRandomArticles(3);
    if (randomArticles.length > 0) {
      navigate(`/?q=${encodeURIComponent(randomArticles[0].title)}`, {
        state: { reorderedResults: randomArticles }
      });
    }
  };

  const handleDiscoverClick = () => {
    setSearchValue("");
    if (location.pathname === "/discover") {
      navigate("/");
    } else {
      navigate("/discover");
    }
  };

  const isDiscoverPage = location.pathname === "/discover";

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 ${
        isDiscoverPage 
          ? "bg-black" 
          : "bg-gradient-to-b from-black/50 to-transparent"
      }`}>
        <div 
          className="text-xl font-bold text-wikitok-red cursor-pointer"
          onClick={handleRandomArticle}
        >
          {t('wikTok')} {/* Translate WikTok */}
        </div>
        <div 
          className="flex items-center bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Search className="w-4 h-4 text-white/60 mr-2" />
          <span className="text-white/60 text-sm">
            {searchValue || t('searchArticles')} {/* Translate Search articles */}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Compass 
            className={`w-5 h-5 cursor-pointer transition-colors ${
              location.pathname === "/discover" ? "text-wikitok-red" : "text-white"
            }`}
            onClick={handleDiscoverClick}
          />
        </div>
      </div>

      <CommandDialog 
        open={open} 
        onOpenChange={handleOpenChange}
      >
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={t('searchArticlesPlaceholder')} // Translate placeholder
            value={searchValue}
            onValueChange={setSearchValue}
            className="border-none focus:ring-0"
          />
          <CommandList className="max-h-[80vh] overflow-y-auto">
            {isLoading && (
              <CommandEmpty>{t('searching')}</CommandEmpty> // Translate Searching...
            )}
            {!isLoading && !searchResults && searchValue.length > 0 && (
              <CommandEmpty>{t('noResultsFound')}</CommandEmpty> // Translate No results found.
            )}
            {!isLoading && !searchValue && (
              <CommandEmpty>{t('startTypingToSearch')}</CommandEmpty> // Translate Start typing to search
            )}
            {!isLoading && searchResults && searchResults.length === 0 && (
              <CommandEmpty>{t('noResultsFound')}</CommandEmpty> // Translate No results found.
            )}
            {!isLoading && searchResults && searchResults.length > 0 && (
              <CommandGroup heading={t('articles')}> {/* Translate Articles */}
                {searchResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleArticleSelect(result.title, result)}
                    className="flex items-center p-2 cursor-pointer hover:bg-accent rounded-lg"
                  >
                    <div className="flex items-center w-full gap-3">
                      {result.image && (
                        <img 
                          src={result.image} 
                          alt={result.title}
                          className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base">{result.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {result.content}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};

export default Navigation;