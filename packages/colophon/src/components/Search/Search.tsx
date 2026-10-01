import { Search } from "lucide-react";
import { Button, Input, SearchField } from "react-aria-components";
export interface CphSearchProps {
  placeholder?: string;
  onSubmit?: (v: string) => void;
}
export function CphSearch({
  placeholder = "Search concepts, sources, people…",
  onSubmit,
}: CphSearchProps) {
  return (
    <SearchField aria-label="Search" className="cph-search" {...(onSubmit ? { onSubmit } : {})}>
      <Search size={16} aria-hidden="true" />
      <Input placeholder={placeholder} className="cph-search__input" />
      <Button className="cph-search__kbd" aria-label="Search shortcut">
        ⌘K
      </Button>
    </SearchField>
  );
}
