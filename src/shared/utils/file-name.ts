export enum FILE_TYPE {
  INVOICE = 'invoice',
}

export interface InvoiceFileNamePayload {
  packageInvestorId: string;
  tvaValue: string;
}

export function buildFileName(
  type: FILE_TYPE,
  payload: Record<string, string>,
): string {
  switch (type) {
    case FILE_TYPE.INVOICE: {
      const { packageInvestorId, invoiceNumber } = payload;

      return `/assets/invoices/packageInvestorId/${invoiceNumber}_${packageInvestorId}.pdf`;
    }

    default:
      throw new Error(`type ${type} not yet supported`);
  }
}
