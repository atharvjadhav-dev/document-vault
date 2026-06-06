import React from 'react';
import { getCategoryBadge } from '../../utils/helpers';

const CategoryBadge = ({ category, size = 'sm' }) => {
  const classes = getCategoryBadge(category);
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${padding} ${classes}`}>
      {category}
    </span>
  );
};

export default CategoryBadge;
