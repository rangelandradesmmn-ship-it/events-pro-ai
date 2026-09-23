'use server';

import { createClient } from '@/utils/supabase/server';
import { GoogleGenAI } from '@google/genai';

export async function generateContractAction(clientId: string) {
  if (!clientId) {
    throw new Error('ID do cliente é obrigatório.');
  }

  const supabase = await createClient();

  // 1. Fetch Client Details
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (clientErr || !client) {
    throw new Error('Erro ao buscar dados do cliente.');
  }

  // 2. Fetch the most recent Event for this client to get some context (if exists)
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // 3. Prepare the AI Prompt
  let prompt = `Escreva um Contrato formal de Prestação de Serviços de Organização de Eventos e Cerimonial.
Você é a LUXE EVENTS, a empresa contratada.

### Dados do Contratante (Cliente):
Nome: ${client.full_name}
CPF: ${client.cpf || '[CPF A PREENCHER]'}
Email: ${client.email || '[EMAIL]'}
Telefone/WhatsApp: ${client.phone || '[TELEFONE]'}
Endereço: ${client.address || '[ENDEREÇO DO CLIENTE]'}
`;

  if (event) {
    prompt += `
### Dados do Evento (Objeto do Contrato):
Nome do Evento: ${event.title}
Tipo: ${event.type}
Data Prevista: ${event.date ? new Date(event.date + 'T12:00:00Z').toLocaleDateString('pt-BR') : '[DATA A DEFINIR]'}
Local: ${event.location_name || '[LOCAL A DEFINIR]'}
Orçamento / Valor do Serviço: R$ ${event.budget || '[VALOR A PREENCHER]'}
Número estimado de convidados: ${event.guest_count || '[QTD]'}
`;
  } else {
    prompt += `
### Dados do Evento (Objeto do Contrato):
[O cliente ainda não possui um evento cadastrado detalhado, deixe as cláusulas do objeto de forma genérica para preenchimento manual ou indique campos em colchetes].
`;
  }

  prompt += `
### Diretrizes para a redação do Contrato:
1. Use uma linguagem jurídica moderna e clara (Plain Law).
2. Inclua as cláusulas essenciais: Objeto do Contrato, Obrigações da Contratada (Luxe Events), Obrigações do Contratante, Valores e Formas de Pagamento, Rescisão e Multas, e Foro.
3. Não use marcações markdown como ** ou # no texto, escreva como um texto corrido plain-text estruturado para uma Textarea, apenas usando quebras de linha duplas para separar parágrafos e numeração (1., 2., 3.).
4. Não inclua a data de assinatura no final, coloque espaços em branco para assinatura.
5. Foco em luxo e exclusividade, mantendo o tom profissional.

Retorne apenas o texto do contrato, sem introduções do tipo "Aqui está o contrato:".
`;

  // 4. Initialize Gemini
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('A chave da API do Gemini (GEMINI_API_KEY) não está configurada no servidor.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // 5. Retry loop for 503 Overloaded
  let retries = 3;
  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      if (!response.text) {
        throw new Error("A IA retornou uma resposta vazia.");
      }

      return { text: response.text };

    } catch (error: any) {
      console.error("Gemini erro:", error);
      const errorStr = String(error.message || error);
      const is503 = error?.status === 503 || errorStr.includes('503') || errorStr.includes('UNAVAILABLE') || errorStr.includes('high demand');
      
      if (is503 && retries > 1) {
        retries--;
        console.log(`Erro 503 detectado no Gemini. Tentando novamente... Restam ${retries} tentativas.`);
        await new Promise(res => setTimeout(res, 2500));
        continue;
      }
      throw new Error('Falha na geração com IA: ' + errorStr);
    }
  }
  
  throw new Error('Falha na geração com IA após múltiplas tentativas.');
}
