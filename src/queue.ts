import PQueue from "p-queue";

const apiQueue = new PQueue();
export const withApiQueue = <T>(task: () => Promise<T>): Promise<T> => {
  return apiQueue.add(task);
};
