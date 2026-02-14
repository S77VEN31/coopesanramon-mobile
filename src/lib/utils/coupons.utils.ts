import { type DtoCupon } from '../../services/api/investments.api';
import { ESTADO_CUPON_LABELS } from '../../constants/coupons.constants';

export function filterCoupons(
  coupons: DtoCupon[],
  searchTerm: string
): DtoCupon[] {
  if (!searchTerm.trim()) {
    return coupons;
  }

  const searchLower = searchTerm.toLowerCase();

  return coupons.filter((coupon) => {
    const numeroCupon = coupon.numeroCupon || '';
    const estadoLabel = ESTADO_CUPON_LABELS[coupon.estado] || '';
    const fechaVencimiento = coupon.fechaVencimiento || '';
    const fechaPagado = coupon.fechaPagado || '';
    const interesNeto = coupon.interesNeto?.toString() || '';
    const montoNeto = coupon.montoNeto?.toString() || '';

    return (
      numeroCupon.toLowerCase().includes(searchLower) ||
      estadoLabel.toLowerCase().includes(searchLower) ||
      fechaVencimiento.toLowerCase().includes(searchLower) ||
      fechaPagado.toLowerCase().includes(searchLower) ||
      interesNeto.includes(searchLower) ||
      montoNeto.includes(searchLower)
    );
  });
}

export type CouponSortOrder = 'asc' | 'desc';

export function sortCouponsByDate(
  coupons: DtoCupon[],
  order: CouponSortOrder = 'desc'
): DtoCupon[] {
  return [...coupons].sort((a, b) => {
    const dateA = new Date(a.fechaVencimiento).getTime();
    const dateB = new Date(b.fechaVencimiento).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

export function getCouponIdentifier(coupon: DtoCupon): string {
  return coupon.numeroCupon || `coupon-${coupon.montoNeto || 'unknown'}`;
}
