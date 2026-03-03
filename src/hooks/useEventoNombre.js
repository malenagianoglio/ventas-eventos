import { useState, useEffect } from 'react';
import { getEventById } from '../../database';

export function useEventoNombre(eventId) {
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    if (!eventId) {
      setNombre('');
      return;
    }
    
    (async () => {
      try {
        const evento = await getEventById(eventId);
        setNombre(evento?.name ?? '');
      } catch {
        setNombre('');
      }
    })();
  }, [eventId]);

  return nombre;
}
