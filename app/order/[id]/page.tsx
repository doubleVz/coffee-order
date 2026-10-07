import OrderTrackingClient from './OrderTrackingClient'

export function generateStaticParams() {
  return [{ id: 'demo' }]
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params
  return <OrderTrackingClient orderId={resolved.id} />
}
