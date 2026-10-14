/**
 * Classificador fisiológico de estresse para bubalinos (Bubalus bubalis).
 */
exports.avaliarEstresse = (bpm, temperatura) => {
  const bpmNum = Number(bpm);
  const tempNum = Number(temperatura);

  const LIMIAR_BPM_ALERTA = 78.0;
  const LIMIAR_BPM_CRITICO = 88.0;
  const LIMIAR_TEMP_ALERTA = 39.3;
  const LIMIAR_TEMP_CRITICO = 39.8;

  // 1. Estresse Crítico: taquicardia severa + hipertermia acentuada
  if (bpmNum >= LIMIAR_BPM_CRITICO && tempNum >= LIMIAR_TEMP_CRITICO) {
    return {
      estado: 'Estresse Crítico',
      nivelAlerta: 'CRITICO'
    };
  }

  // 2. Estresse Térmico: elevação simultânea ou calor extremo
  if ((bpmNum >= LIMIAR_BPM_ALERTA && tempNum >= LIMIAR_TEMP_ALERTA) || tempNum >= 40.0) {
    return {
      estado: 'Estresse Térmico',
      nivelAlerta: 'ALTO'
    };
  }

  // 3. Alerta isolado: apenas um dos parâmetros fora do normal
  if (bpmNum >= LIMIAR_BPM_ALERTA || tempNum >= LIMIAR_TEMP_ALERTA) {
    return {
      estado: 'Alerta',
      nivelAlerta: 'MEDIO'
    };
  }

  // 4. Faixa normal
  return {
    estado: 'Ocioso',
    nivelAlerta: 'NORMAL'
  };
};