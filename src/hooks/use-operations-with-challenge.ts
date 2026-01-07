import { useState, useEffect, useCallback } from 'react';
import { listarOperacionesConDesafio, type OperacionConDesafio } from '../services/api/secondFactor.api';
import { TipoOperacion } from '../constants/enums';

export function useOperationsWithChallenge() {
  const [operations, setOperations] = useState<OperacionConDesafio[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOperations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listarOperacionesConDesafio();
      setOperations(response.operaciones || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las operaciones con desafío';
      setError(errorMessage);
      setOperations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  const requiresChallenge = useCallback((tipoOperacion: TipoOperacion): boolean => {
    const operation = operations.find((op) => op.tipoOperacion === tipoOperacion);
    return operation?.tieneDesafio ?? false;
  }, [operations]);

  return {
    operations,
    isLoading,
    error,
    requiresChallenge,
    reload: loadOperations,
  };
}

