
import { GoogleGenAI } from "@google/genai";
import { ProjectData, CalculationResults, ReportContent } from "../types";

export const generateReport = async (
  projectData: ProjectData,
  results: CalculationResults
): Promise<ReportContent> => {
  // Verificação de segurança para evitar crash em navegadores onde 'process' não existe
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Verifique a configuração da variável de ambiente process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const {
    systemType, integrador, cliente, cidade, estado,
    usaraZeroGrid, horasBackup, custoKwh
  } = projectData;

  const {
    potenciaInversorKw, 
    energiaBessKwh, potenciaPvKwP, numModulos,
    economiaMensalEstimada
  } = results;

  const systemDefinition = systemType === 'ONG' ? 
      `Sistema On-Grid Puro.` :
      systemType === 'HIB' ? 
      `Sistema Híbrido Inteligente (Solar + BESS).` :
      `Sistema Off-Grid (Autônomo) com Alta Disponibilidade.`;
      
  const systemPrompt = `
    Você é um Engenheiro de Vendas Sênior e Consultor de Energia especializado em sistemas de armazenamento (BESS).
    Seu objetivo é escrever o TEXTO EXECUTIVO de uma Proposta Comercial Premium.
    
    Público Alvo: Cliente Final (${cliente}) que precisa ser convencido financeiramente e tecnicamente.
    Tom de Voz: Profissional, Persuasivo, Seguro e Focado em Benefícios (Não apenas características).
    
    Estrutura Obrigatória da Resposta (Use Markdown limpo, sem títulos grandes # ou ##, use negrito ** para destaque):
    
    1. **Resumo Executivo:** Uma introdução poderosa parabenizando o cliente pela inovação e resumindo a solução (${systemDefinition} em ${cidade}).
    2. **Por que Baterias? (Argumentos de Venda):** 
       - Liste 3 argumentos imbatíveis sobre por que essa solução com baterias é superior (Ex: Segurança contra apagões, Independência energética, Proteção de equipamentos sensíveis, ROI superior ao Diesel).
       - Fale sobre a tecnologia Lithium/BESS ser silenciosa e livre de manutenção (O&M zero vs Geradores).
    3. **Análise de Retorno (ROI):**
       - Mencione a economia estimada de R$ ${economiaMensalEstimada} / mês.
       - Destaque a valorização do imóvel e a proteção contra a inflação energética (Aumento da tarifa em ${estado}).
    4. **Parecer Técnico:**
       - Valide a escolha do inversor de ${potenciaInversorKw}kW e os ${numModulos} módulos.
       - Se for Zero Grid: Enfatize a segurança jurídica de não injetar na rede.
       - Se for Híbrido: Enfatize o "Peak Shaving" (Economia na ponta).
    
    NÃO coloque cabeçalhos de "Proposta", "Data", ou placeholders. Apenas o texto do corpo da proposta.
  `;
  
  const userQuery = `
  Dados do Projeto para o Cliente: ${cliente}. Integrador: ${integrador}. Local: ${cidade}, ${estado}.
  Sistema: ${systemType}. Consumo: ${projectData.consumoMensalKWh} kWh.
  Potência PV: ${potenciaPvKwP} kWp. Bateria: ${energiaBessKwh} kWh.
  Inversor: ${potenciaInversorKw} kW.
  Custo Energia Local: R$ ${custoKwh}/kWh.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }]
      }
    });

    let sources: { uri: string; title: string }[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    if (groundingMetadata?.groundingChunks) {
      sources = groundingMetadata.groundingChunks
        .map((chunk) => ({
          uri: chunk.web?.uri || '',
          title: chunk.web?.title || '',
        }))
        .filter((s) => s.uri && s.title);
    }

    return {
      text: response.text || "Sem resposta do modelo.",
      sources
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
