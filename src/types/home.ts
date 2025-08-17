import { CryptoCurrency } from './crypto';

export interface SortOption {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  key: string;
  label: string;
  value: string | number | boolean | { min: number; max: number };
}

export interface FilterSortBarProps {
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filters: FilterOption[]) => void;
  currentSort: SortOption;
  currentFilters: FilterOption[];
  isVisible?: boolean;
  onAnimationComplete?: () => void;
}

export interface EmptyStateProps {
  searchQuery: string;  
  isSearching: boolean;
  onRetry: () => void;
}

export interface HomeListItemProps {
  crypto: CryptoCurrency;
  onPress?: (crypto: CryptoCurrency) => void;
}

export interface EndMessageProps {
  hasSearchQuery: boolean;
  isFiltering: boolean;
  isFetchingNextPage: boolean;
  displayListLength: number;
  hasNextPage: boolean;
}
