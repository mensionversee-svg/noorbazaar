import { createServerFn } from '@tanstack/react-start'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'

export const draftWhatsAppReply = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string; concern: string }) => {
    if (!input?.orderId || typeof input.concern !== 'string') throw new Error('Invalid input')
    const concern = input.concern.trim()
    if (!concern || concern.length > 2000) throw new Error('Concern must be 1–2000 characters')
    return { orderId: String(input.orderId), concern }
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' })
    if (!isAdmin) throw new Error('Forbidden')
    const { data: order, error } = await context.supabase.from('orders').select('*').eq('id', data.orderId).maybeSingle()
    if (error || !order) throw new Error('Order not found')

    const items = (Array.isArray(order.items) ? order.items : []) as Array<{ name?: string; quantity?: number; price?: number }>
    const summary = [
      `Order #${order.order_number} (ref ${String(order.id).slice(0, 8).toUpperCase()})`,
      `Customer: ${order.customer_name}, ${order.city}`,
      `Status: ${order.status}`,
      `Placed: ${new Date(order.created_at).toDateString()}`,
      `Payment: ${order.payment_method}`,
      `Items: ${items.map((i) => `${i.name} x${i.quantity}`).join(', ')}`,
      `Total: Rs. ${order.total} (delivery Rs. ${order.shipping}, discount Rs. ${order.discount})`,
    ].join('\n')

    const { GatewayError, generateResponse } = await import('@lovable.dev/ai-gateway')
    try {
      const res = await generateResponse({
        model: 'openai/gpt-6-astra',
        reasoning: { effort: 'low' },
        instructions:
          'You are a friendly customer support agent for Noor Bazaar, a Pakistani online store (Cash on Delivery, nationwide delivery). Write a short WhatsApp reply to the customer about their concern using the order details. Reply in the same language/style the customer used (Roman Urdu, Urdu or English). Be warm, clear and helpful, 2–6 short lines, at most one emoji. Do not invent facts like tracking numbers, exact delivery dates or refunds that are not in the order details; if something must be checked, say the team will confirm shortly. Output only the message text.',
        input: `ORDER DETAILS:\n${summary}\n\nCUSTOMER CONCERN:\n${data.concern}`,
      })
      const text = (res.output ?? [])
        .flatMap((o: any) => (o.type === 'message' ? o.content ?? [] : []))
        .filter((c: any) => c.type === 'output_text')
        .map((c: any) => c.text)
        .join('')
        .trim()
      if (!text) return { reply: '', error: 'AI could not write a reply. Please try again.' }
      return { reply: text, error: null as string | null }
    } catch (e) {
      if (e instanceof GatewayError) {
        console.error('AI reply failed', e.code, e.httpStatus)
        const msg = e.httpStatus === 402 ? 'AI credits khatam ho gaye hain. Credits add karein.' : e.httpStatus === 429 ? 'Bohat zyada requests — thori der baad try karein.' : 'AI reply abhi nahi ban saka.'
        return { reply: '', error: msg }
      }
      throw e
    }
  })
