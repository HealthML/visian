declare module "worker-loader!*" {
  const worker: { new (): Worker };
  export default worker;
}
