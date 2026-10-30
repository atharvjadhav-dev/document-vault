import React from 'react';
import { getCategoryBadge } from '../../utils/helpers';

const CategoryBadge = ({ category, size = 'sm' }) => {
  const classes = getCategoryBadge(category);
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded-md font-mono font-semibold tracking-tight ${padding} ${classes}`}>
      {category}
    </span>
  );
};

export default CategoryBadge;
