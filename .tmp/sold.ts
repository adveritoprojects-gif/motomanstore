import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const sold = await p.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true }, where: { order: { status: { notIn: ["cancelled","refunded"] } } } });
  console.log(sold);
  const orders = await p.order.findMany({ select: { status: true } });
  console.log(orders.reduce((m,o)=>{m[o.status]=(m[o.status]||0)+1; return m;}, {} as Record<string,number>));
}
main().finally(()=>p.$disconnect());
