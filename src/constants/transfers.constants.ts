export const TRANSFER_LOCAL_FORM_TEXT = {
  sourceAccount: {
    label: 'Seleccione la cuenta a debitar:',
    placeholder: {
      loading: 'Cargando cuentas...',
      select: 'Click para seleccionar la cuenta',
    },
  },
  destinationType: {
    label: 'Tipo de cuenta destino:',
    options: {
      favorites: 'Favoritos',
      manual: 'Digitada',
      own: 'Propia',
    },
  },
  destinationFavorites: {
    label: 'Seleccione la cuenta destino:',
    placeholder: {
      loading: 'Cargando favoritos...',
      select: 'Click para seleccionar la cuenta favorita',
    },
    recipientLabel: 'Destinatario',
    recipientPlaceholder: 'Seleccione una cuenta favorita',
    emptyMessage: {
      noFavorites: 'No tienes cuentas favoritas locales. Puedes agregar una desde el menú de Cuentas Favoritas.',
      noMatchingCurrency: (currency: string) => 
        `No tienes cuentas favoritas en ${currency === 'USD' ? 'dólares' : 'colones'}. Selecciona una cuenta origen en ${currency === 'USD' ? 'dólares' : 'colones'} para ver las cuentas favoritas disponibles.`,
      selectSource: 'Selecciona una cuenta origen para ver las cuentas favoritas disponibles.',
    },
  },
  destinationManual: {
    label: 'Ingrese el número de cuenta destino:',
    placeholder: 'CRXX XXXX XXXX XXXX XXXX XXXX',
    recipientLabel: 'Destinatario',
    recipientPlaceholder: 'Ingrese el IBAN completo para validar',
    validating: 'Validando cuenta...',
    completeIban: 'Complete el IBAN (22 caracteres) para validar la cuenta',
  },
  destinationOwn: {
    label: 'Seleccione la cuenta destino:',
    placeholder: 'Click para seleccionar tu cuenta',
    recipientLabel: 'Destinatario',
    recipientPlaceholder: 'Seleccione su cuenta',
  },
  amount: {
    label: 'Monto',
    placeholder: '0.00',
    exceedsBalance: 'El monto excede el saldo disponible',
  },
  email: {
    label: 'Email del destinatario',
    placeholder: 'correo@ejemplo.com',
    helperText: 'Si proporcionas un email, se enviará una notificación al destinatario sobre esta transferencia',
  },
  description: {
    label: 'Descripción',
    required: '*',
    placeholder: 'Ingrese una descripción',
  },
  submit: {
    sending: 'Enviando...',
    send: 'Enviar',
  },
} as const;

export const TRANSFER_SINPE_FORM_TEXT = {
  flowType: {
    label: 'Tipo de transferencia:',
    options: {
      send: 'Enviar fondos',
      receive: 'Traer fondos',
    },
  },
  sourceAccount: {
    label: {
      receive: 'Seleccione la cuenta a acreditar:',
      send: 'Seleccione la cuenta a debitar:',
    },
    placeholder: {
      loading: 'Cargando cuentas...',
      select: 'Click para seleccionar la cuenta',
    },
  },
  destinationType: {
    label: {
      receive: 'Cuenta origen del débito:',
      send: 'Tipo de cuenta destino:',
    },
    options: {
      favorites: 'Favoritos',
      manual: 'Digitada',
    },
  },
  destinationFavorites: {
    label: 'Seleccione la cuenta destino:',
    placeholder: {
      loading: 'Cargando favoritos SINPE...',
      select: 'Click para seleccionar cuenta SINPE',
    },
    recipientLabel: 'Destinatario',
    recipientPlaceholder: 'Seleccione una cuenta favorita',
    emptyMessage: {
      noFavorites: 'No tienes cuentas favoritas SINPE. Puedes agregar una desde el menú de Cuentas Favoritas.',
      noMatchingCurrency: (currency: string) => 
        `No tienes cuentas favoritas SINPE en ${currency === 'USD' ? 'dólares' : 'colones'}.`,
    },
  },
  destinationManual: {
    label: {
      receive: 'Ingrese el IBAN de la cuenta a debitar:',
      send: 'Ingrese el IBAN del banco destino:',
    },
    placeholder: 'CRXX XXXX XXXX XXXX XXXX XXXX',
    recipientLabel: 'Destinatario',
    recipientPlaceholder: 'Ingrese el IBAN completo para validar',
    validating: 'Validando cuenta SINPE...',
    completeIban: 'Complete el IBAN (22 caracteres) para validar la cuenta',
  },
  amount: {
    label: 'Monto',
    placeholder: '0.00',
    exceedsBalance: 'El monto excede el saldo disponible',
  },
  email: {
    label: {
      receive: 'Email de notificación',
      send: 'Email del destinatario',
    },
    placeholder: 'correo@ejemplo.com',
    helperText: {
      receive: 'Si proporcionas un email, recibirás una notificación del débito',
      send: 'Si proporcionas un email, se enviará una notificación al destinatario',
    },
  },
  description: {
    label: 'Descripción',
    required: '*',
    placeholder: 'Ingrese una descripción',
  },
  executionType: {
    label: 'Ejecutar como:',
    options: {
      immediate: 'Tiempo real',
      deferred: 'Diferido',
    },
  },
  submit: {
    sending: {
      receive: 'Solicitando...',
      send: 'Enviando...',
    },
    receive: 'Solicitar débito',
    send: {
      immediate: 'Enviar tiempo real',
      deferred: 'Enviar diferido',
    },
  },
} as const;

export const TRANSFER_SINPE_MOVIL_FORM_TEXT = {
  sourceAccount: {
    label: 'Seleccione la cuenta a debitar:',
    placeholder: {
      loading: 'Cargando cuentas...',
      select: 'Click para seleccionar la cuenta',
    },
  },
  destinationType: {
    label: 'Tipo de cuenta destino:',
    options: {
      favorites: 'Favoritos',
      manual: 'Digitado',
    },
  },
  destinationFavorites: {
    label: 'Seleccione la cuenta destino:',
    placeholder: {
      loading: 'Cargando favoritas SINPE Móvil...',
      select: 'Click para seleccionar favorita',
    },
    recipientLabel: 'Destinatario',
    recipientPlaceholder: 'Seleccione una favorita',
    emptyMessage: {
      noFavorites: 'No tienes favoritas SINPE Móvil. Puedes agregar una desde el menú de Cuentas Favoritas.',
      noResults: 'No se encontraron favoritas SINPE Móvil que coincidan con tu búsqueda.',
    },
  },
  destinationManual: {
    label: 'Número de teléfono destino:',
    placeholder: '88888888',
    recipientLabel: 'Destinatario',
    recipientPlaceholder: 'Complete el número para validar',
    validating: 'Validando número...',
    completeNumber: 'Complete el número (8 dígitos) para validar',
  },
  amount: {
    label: 'Monto',
    placeholder: '0.00',
    exceedsBalance: 'El monto excede el saldo disponible',
    currencyNote: 'SINPE Móvil solo permite transferencias en colones',
  },
  email: {
    label: 'Email del destinatario',
    placeholder: 'correo@ejemplo.com',
    helperText: 'Se enviará una notificación al destinatario',
  },
  description: {
    label: 'Descripción',
    placeholder: 'Ingrese una descripción (máximo 20 caracteres)',
  },
  submit: {
    sending: 'Enviando...',
    send: 'Enviar SINPE Móvil',
  },
} as const;

