import React, { ChangeEventHandler, FC, InputHTMLAttributes, useCallback } from 'react'
import { debounce } from 'lodash/fp';
import cn from 'classnames';
import RefreshIcon from '@heroicons/react/outline/RefreshIcon'
import classes from './SearchBar.module.scss';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  loading?: boolean
  onSearch?: (query: string) => Promise<any> | any
  minimumChars?: number
  searchDelay?: number
}

const SearchBar: FC<SearchBarProps> = ({
  loading,
  onSearch,
  minimumChars = 3,
  searchDelay = 500,
  className,
  onChange,
  ...props
}) => {

  const rawHandleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      onChange?.(event);
      if (event.target.value.length >= minimumChars) {
        onSearch?.(event.target.value);
      }
    },
    [onChange, onSearch, minimumChars],
  );

  const handleChange = useCallback(
    debounce(searchDelay, rawHandleChange),
    [searchDelay, rawHandleChange],
  );



  return (
    <div className="relative flex-1">
      <input
        type="search"
        className={cn(classes.searchInput, className)}
        onChange={handleChange}
        {...props}
      />
      <div
        className={cn(
          classes.loading,
          { 'opacity-0': !loading },
        )}
      >
        <RefreshIcon className="h-1/2 animate-spin" />
      </div>
    </div>
  )
}

export default SearchBar;