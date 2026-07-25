import { useEffect, useState } from 'react';

export function useColumnCount(): number {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const mdQuery = window.matchMedia('(min-width: 768px)');
    const lgQuery = window.matchMedia('(min-width: 1024px)');

    const update = () => {
      if (lgQuery.matches) setColumns(3);
      else if (mdQuery.matches) setColumns(2);
      else setColumns(1);
    };

    update();
    mdQuery.addEventListener('change', update);
    lgQuery.addEventListener('change', update);
    return () => {
      mdQuery.removeEventListener('change', update);
      lgQuery.removeEventListener('change', update);
    };
  }, []);

  return columns;
}
