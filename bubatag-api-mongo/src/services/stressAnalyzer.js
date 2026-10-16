class StressAnalyzer {
  avaliarEstresse(batimento, temperatura) {
    const bpm = Number(batimento);
    const temp = Number(temperatura);

    const LIMITE_BPM = 80;
    const LIMITE_TEMP = 39.2;

    const bpmAlto = bpm > LIMITE_BPM;
    const tempAlta = temp > LIMITE_TEMP;

    if (bpmAlto && tempAlta) {
      return {
        estado: 'Estresse Crítico',
        nivelAlerta: 'CRITICO',
        descricao: 'Batimentos e temperatura simultaneamente elevados.'
      };
    }

    if (tempAlta) {
      return {
        estado: 'Estresse Térmico',
        nivelAlerta: 'ALTO',
        descricao: 'Temperatura corporal elevada (acima de 39.2°C).'
      };
    }

    if (bpmAlto) {
      return {
        estado: 'Estressado',
        nivelAlerta: 'MEDIO',
        descricao: 'Batimentos cardíacos elevados (taquicardia acima de 80 bpm).'
      };
    }

    return {
      estado: 'Normal',
      nivelAlerta: 'NORMAL',
      descricao: 'Batimentos e temperatura dentro das faixas fisiológicas normais.'
    };
  }
}

module.exports = new StressAnalyzer();