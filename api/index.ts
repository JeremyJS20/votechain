export default async function handler(req: any, res: any) {
   const { default: app } = await import('../apps/backend/dist/Presentation/server.js');
  return app(req, res);
}
