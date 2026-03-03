import { useToast } from 'react-native-toast-notifications';

export const useAppToast = () => {
  const toast = useToast();

  return {
    success: (message = 'Guardado correctamente') =>
      toast.show(message, {
        type: 'success',
        duration: 2000,
        placement: 'bottom',
      }),
    error: (message = 'Ocurrió un error') =>
      toast.show(message, {
        type: 'danger',
        duration: 3000,
        placement: 'bottom',
      }),
    info: (message = 'Información') =>
      toast.show(message, {
        type: 'info',
        duration: 2500,
        placement: 'bottom',
      }),
    warning: (message = 'Advertencia') =>
      toast.show(message, {
        type: 'warning',
        duration: 2500,
        placement: 'bottom',
      }),
  };
};
