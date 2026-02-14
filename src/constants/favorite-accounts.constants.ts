export type FavoriteType = 'local' | 'sinpe' | 'wallets';

export const FAVORITE_TYPE_LABELS: Record<FavoriteType, string> = {
  local: 'Local',
  sinpe: 'SINPE',
  wallets: 'SINPE Movil',
};

export const FAVORITE_TEXTS = {
  PAGE_TITLE: 'Cuentas Favoritas',
  ADD_BUTTON: '+ Agregar',
  SEARCH_PLACEHOLDER: 'Buscar favoritos',
  EMPTY_LIST: 'No hay cuentas favoritas registradas',
  EMPTY_SEARCH: 'No se encontraron resultados',

  CREATE_LOCAL_TITLE: 'Nueva Cuenta Local',
  CREATE_SINPE_TITLE: 'Nueva Cuenta SINPE',
  CREATE_WALLET_TITLE: 'Nuevo SINPE Movil',

  EDIT_LOCAL_TITLE: 'Editar Cuenta Local',
  EDIT_SINPE_TITLE: 'Editar Cuenta SINPE',
  EDIT_WALLET_TITLE: 'Editar SINPE Movil',

  STEP_SEARCH: 'Buscar Cuenta',
  STEP_DATA: 'Datos',

  SEARCH_IBAN_LABEL: 'Numero IBAN',
  SEARCH_IBAN_PLACEHOLDER: 'Ingrese el IBAN (CR...)',
  SEARCH_PHONE_LABEL: 'Numero de Telefono',
  SEARCH_PHONE_PLACEHOLDER: 'Ingrese el numero (8 digitos)',
  SEARCH_BUTTON: 'Buscar',

  FIELD_ALIAS: 'Alias',
  FIELD_EMAIL: 'Correo Electronico',
  FIELD_PHONE: 'Telefono',
  FIELD_MAX_AMOUNT: 'Monto Maximo',

  SAVE_BUTTON: 'Guardar',
  CANCEL_BUTTON: 'Cancelar',
  NEXT_BUTTON: 'Siguiente',
  BACK_BUTTON: 'Anterior',

  DELETE_TITLE: 'Eliminar Favorita',
  DELETE_CONFIRM: 'Esta seguro que desea eliminar esta cuenta favorita?',
  DELETE_BUTTON: 'Eliminar',

  SUCCESS_CREATE: 'Cuenta favorita creada exitosamente',
  SUCCESS_UPDATE: 'Cuenta favorita actualizada exitosamente',
  SUCCESS_DELETE: 'Cuenta favorita eliminada exitosamente',
} as const;
