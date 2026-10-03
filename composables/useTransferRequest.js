import { useState } from '#imports'
export function useTransferRequest() { return useState('transfer-requested', () => 0) }
