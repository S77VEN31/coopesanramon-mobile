export enum TipoRelacion {
  Dueno = 1,
  Autorizado = 2,
}

export enum TipoCuenta {
  Corriente = 1,
  Ahorros = 2,
  Inversion = 3,
  Empresarial = 4,
  Nomina = 5,
  DepositoPlazo = 6,
}

export enum EstadoCuenta {
  NoExiste = 0,
  Activa = 1,
  Inactiva = 2,
  Bloqueada = 3,
  Cerrada = 4,
  ActivaSoloParaAcreditar = 5,
  ActivaSoloParaDebitar = 6,
}

export enum EstadoTarjetaDebito {
  NoExiste = 0,
  Activa = 1,
  Inactiva = 2,
  Bloqueada = 3,
  Cerrada = 4,
  ActivaSoloParaAcreditar = 5,
  ActivaSoloParaDebitar = 6,
}

export enum Franquicia {
  Visa = 1,
  MasterCard = 2,
  AmericanExpress = 3,
  DinnersClub = 4,
}

export enum TipoMovimiento {
  NoDefinido = 0,
  Credito = 1,
  Debito = 2,
  Reversion = 3,
  SaldoInicial = 4,
}

export type MovementType = "reversion" | "debito" | "credito";

export enum TipoProducto {
  NoDefinido = 0,
  Cuentas = 1,
  Prestamos = 2,
  Inversiones = 3,
  TarjetasCredito = 4,
  ServiciosElectricos = 5,
  Ahorro = 6,
}

export enum TipoPrestamo {
  NoDefinido = 0,
  Personal = 1,
  Hipotecario = 2,
  Vehiculo = 3,
  Empresarial = 4,
  Consumo = 5,
}

export enum EstadoCuota {
  NoDefinido = 0,
  Pendiente = 1,
  Pagada = 2,
  Vencida = 3,
  Parcial = 4,
  Cancelada = 5,
}

export enum TipoPagoPrestamo {
  NoDefinido = 0,
  CuentaLocal = 1,
  CuentaSinpe = 2,
}

export enum TipoInversion {
  CertificadoPlazoColones = 10,
  CertificadoDesmaterializadoColones = 12,
  CertificadoPlazoDolares = 15,
  CertificadoDesmaterializadoDolares = 16,
}

export enum TipoTasaInteres {
  Fijo = 1,
  Variable = 2,
}

export enum EstadoCupon {
  Activo = 1,
  Pagado = 2,
}

export enum TipoOperacion {
  TransferenciaInternaCuentaFavorita = 1,
  TransferenciaInternaCuentaDigitada = 2,
  CreacionCuentaFavoritaInterna = 3,
  EdicionCuentaFavoritaInterna = 4,
  TransferenciaInternaCuentaPropia = 5,
  TransferenciaPagosInmediatosCuentaDigitada = 6,
  TransferenciaPagosInmediatosCuentaFavorita = 7,
  CreacionCuentaFavoritaSinpe = 8,
  EdicionCuentaFavoritaSinpe = 9,
  TransferenciaSinpeMovil = 10,
  CreacionMonederoFavorito = 11,
  EdicionMonederoFavorito = 12,
  TransferenciaSinpeMovilMonederoFavorito = 13,
  TransferenciaSinpeMovilMonederoDigitado = 14,
  AfiliarMonederoSinpeMovil = 15,
  TransferenciaDebitoTiempoRealCuentaDigitada = 16,
  TransferenciaDebitoTiempoRealCuentaFavorita = 17,
  TransferenciaCreditosDirectosCuentaDigitada = 18,
  TransferenciaCreditosDirectosCuentaFavorita = 19,
  PagoServicios = 20,
}

export enum TipoDesafio {
  NoDefinido = 0,
  OTP = 1,
  Email = 2,
  Ambos = 3,
}

export enum EstadoDesafio {
  Creado = 1,
  Validado = 2,
  Confirmado = 3,
  Expirado = 4,
  Rechazado = 5,
  DoblementeConfirmado = 6,
}

export enum EstadoDispositivo {
  PendienteSincronizacion = 1,
  Activo = 2,
  Inactivo = 3,
  Cancelado = 4,
}

export enum TipoCuentaFavorita {
  CuentaInterna = 1,
  CuentaSinpe = 2,
  MonederoSinpeMovil = 3,
}

export enum TipoDestinoTransferencia {
  CuentaPropia = 1,
  CuentaFavorita = 2,
  CuentaDigitada = 3,
  MonederoFavorito = 4,
  MonederoDigitado = 5,
}

export enum TipoDestinoSinpeMovil {
  MonederoFavorito = 1,
  MonederoDigitado = 2,
}

export enum EstadoTransferencia {
  NoDefinido = 0,
  Registrada = 1,
  Enviada = 2,
  Rechazada = 4,
  ConErrores = 8,
  PorConfirmar = 16,
  PorLiquidar = 32,
}

