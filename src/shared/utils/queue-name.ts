export enum QUEUE_TYPE {
  PURCHASE_PACKAGE = 'purchase_package',
}

export function buildQueueName(
  type: QUEUE_TYPE,
  payload: Record<string, string> = {},
) {
  switch (type) {
    case QUEUE_TYPE.PURCHASE_PACKAGE: {
      const { sasId } = payload;

      return `sas_id:${sasId}:purchase_package`;
    }

    default:
      throw new Error(`type ${type} not yet supported`);
  }
}
