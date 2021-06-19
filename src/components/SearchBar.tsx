import React, { ChangeEventHandler, FC, InputHTMLAttributes } from 'react'
import cn from 'classnames';
import classes from './SearchBar.module.scss';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  loading?: boolean
  onSearch?: (query: string) => Promise<any> | any
}

const SearchBar: FC<SearchBarProps> = ({ className, onSearch, onChange, ...props }) => {

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange?.(event);
    onSearch?.(event.target.value);
  }

  return (
    <input
      type="search"
      className={cn(classes.searchInput, className)}
      onChange={handleChange}
      {...props}
    />
  )
}

export default SearchBar;