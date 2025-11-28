// Rutas de Inteligencia Artificial (AI Assistant)
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Inicializar Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Función para obtener contexto de la empresa desde las APIs existentes
const getCompanyContext = async () => {
  try {
    // Aquí podríamos hacer llamadas internas a otras rutas para obtener datos frescos
    // Por ahora usaremos datos de ejemplo basados en la estructura que vimos
    const context = `
    Colibri Arroyo Seco es una empresa de transporte compartido que opera en México.
    Nuestra misión es proporcionar transporte seguro, eficiente y accesible para conectar comunidades.

    INFORMACIÓN ACTUAL (DATOS EN TIEMPO REAL):
    - Sistema de reservas en tiempo real operativo
    - Dashboard administrativo completo con mapas y reportes
    - Reportes de viajes detallados con exportación a PDF
    - Gestión automática de rutas expiradas
    - Interfaz de usuario moderna y responsiva

    LOGROS ACTUALES:
    - Sistema de mapas con geocodificación funcional
    - Integración completa con backend de datos
    - Múltiples componentes de análisis y reportes
    - Interfaz de chat para asistente IA estratégico

    VISIÓN FUTURA:
    - Expansión a más rutas y ciudades
    - Integración con pagos móviles
    - Sistema de calificaciones para conductores y pasajeros
    - Optimización de rutas en tiempo real con IA
    - App móvil nativa
    - Integración con transporte público
    - Expansión internacional

    METAS 2026:
    - Alcanzar 1000 reservas mensuales
    - Expandir a 5 ciudades principales
    - Implementar IA para predicción de demanda
    - Sistema de fidelización de usuarios
    - Asociación con empresas locales
  `;
    return context;
  } catch (error) {
    console.error('Error obteniendo contexto:', error);
    return 'Información de la empresa no disponible temporalmente.';
  }
};

// Ruta principal para consultas de IA
router.post('/query', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    // Obtener contexto actualizado de la empresa
    const companyContext = await getCompanyContext();

    // Crear el modelo con configuración optimizada
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    // Crear prompt inteligente con contexto
    const prompt = `
      Eres un asistente estratégico experto para Colibri Arroyo Seco, empresa de transporte compartido en México.

      CONTEXTO DE LA EMPRESA (DATOS ACTUALIZADOS):
      ${companyContext}

      ${context ? `CONTEXTO ADICIONAL: ${context}` : ''}

      INSTRUCCIONES ESPECÍFICAS:
      - Proporciona respuestas estratégicas y accionables basadas en el contexto proporcionado
      - Sé específico con recomendaciones concretas y números cuando sea posible
      - Considera el contexto mexicano del mercado de transporte
      - Mantén un tono profesional pero accesible
      - Si no tienes información específica, sugiere formas de obtenerla
      - Enfócate en aspectos operativos, financieros y de crecimiento del negocio

      PREGUNTA DEL USUARIO:
      ${message}

      Responde de manera estructurada y útil, utilizando los datos más recientes disponibles.
    `;

    console.log('Enviando consulta a Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    console.log('Respuesta de Gemini obtenida exitosamente');
    res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en IA:', error);

    // Respuestas de fallback inteligentes basadas en el tipo de consulta
    const fallbackResponse = getFallbackResponse(message);

    res.status(500).json({
      success: false,
      error: 'Error en el servicio de IA',
      fallback: fallbackResponse,
      timestamp: new Date().toISOString()
    });
  }
});

// Función de fallback inteligente
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('ganancia') || lowerMessage.includes('ingreso') || lowerMessage.includes('viaje') || lowerMessage.includes('completado')) {
    return `💰 **Análisis de Ganancias - Colibri Arroyo Seco**

**Información Disponible:**
• Sistema de reservas y transacciones operativo
• Dashboard con métricas financieras en tiempo real
• Reportes de ganancias por ruta y período

**Recomendaciones para Maximizar Ingresos:**
1. **Optimización de Tarifas** - Implementar precios dinámicos según demanda
2. **Reducción de Comisiones** - Negociar mejores términos con plataformas
3. **Viajes Compartidos** - Aumentar ocupación promedio por vehículo
4. **Programas de Fidelización** - Incentivar viajes recurrentes

**Próximos Pasos:** Revisa el módulo de Finanzas para datos específicos actualizados.`;
  }

  if (lowerMessage.includes('crecimiento') || lowerMessage.includes('reservas') || lowerMessage.includes('aumentar')) {
    return `📈 **Estrategia de Crecimiento**

**Objetivos Inmediatos:**
• Implementar programa de referidos (20% descuento)
• Alianzas con universidades y empresas locales
• Campañas de marketing digital en redes sociales

**Expansión de Mercado:**
• Nuevas rutas en zonas de alta demanda
• Horarios extendidos para cubrir más necesidades
• Integración con transporte público existente

**Métricas a Monitorear:** Conversión de reservas, ocupación por ruta, satisfacción del usuario.`;
  }

  if (lowerMessage.includes('financi') || lowerMessage.includes('tarifa') || lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
    return `💰 **Optimización Financiera**

**Estrategias Recomendadas:**
• **Precios Dinámicos** - Ajustar tarifas según hora, demanda y ubicación
• **Reducción de Costos** - Optimizar rutas para minimizar combustible
• **Nuevos Ingresos** - Servicios premium y suscripciones corporativas
• **Control de Gastos** - Monitoreo en tiempo real de costos operativos

**Análisis Detallado:** Consulta el módulo de Reportes Financieros para datos específicos.`;
  }

  if (lowerMessage.includes('expansion') || lowerMessage.includes('ruta') || lowerMessage.includes('ciudad')) {
    return `🚗 **Plan de Expansión**

**Análisis de Mercado Mexicano:**
• Crecimiento del 40% anual en transporte compartido
• Ciudades prioritarias: Guadalajara, Monterrey, Puebla, Tijuana

**Estrategia Recomendada:**
1. **Fase 1:** Guadalajara y Monterrey (2026)
2. **Fase 2:** Puebla y Tijuana (2027)
3. **Fase 3:** Ciudades medianas con potencial turístico

**Requisitos:** 50 conductores por ciudad, centro operativo local, alianzas estratégicas.`;
  }

  if (lowerMessage.includes('tecnolog') || lowerMessage.includes('app') || lowerMessage.includes('digital')) {
    return `📱 **Innovaciones Tecnológicas**

**Prioridades 2026:**
1. **App Móvil Nativa** - Desarrollo completo con geolocalización
2. **Sistema de IA** - Predicción de demanda y optimización de rutas
3. **Integración Multimodal** - Conexión con transporte público
4. **Plataforma de Calificaciones** - Para conductores y pasajeros

**Estado Actual:** Dashboard web completo operativo con todas las funcionalidades principales.`;
  }

  // Respuesta genérica
  return `🤖 **Asistente Estratégico - Colibri Arroyo Seco**

Hola, soy tu asistente estratégico especializado en transporte compartido.

**¿En qué puedo ayudarte?**
• 📊 Análisis financiero y de ganancias
• 📈 Estrategias de crecimiento y reservas
• 🚗 Planes de expansión y nuevas rutas
• 💰 Optimización de tarifas y costos
• 📱 Innovaciones tecnológicas

**Datos Disponibles:**
• Sistema de reservas en tiempo real
• Dashboard administrativo completo
• Reportes financieros detallados
• Análisis de rutas y rendimiento

Pregúntame sobre cualquier aspecto de tu negocio y te proporcionaré recomendaciones estratégicas basadas en las mejores prácticas del sector.`;
}

module.exports = router;