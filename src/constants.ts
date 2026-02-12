export const BASE_URLS = {
  gov: {
    sens: 'https://sens.apigw.gov-ntruss.com',
    mail: 'https://mail.apigw.gov-ntruss.com',
  },
  standard: {
    sens: 'https://sens.apigw.ntruss.com',
    mail: 'https://mail.apigw.ntruss.com',
  },
} as const;

export const PATH_PREFIX = {
  sms: '/sms/v2',
  alimtalk: '/alimtalk/v2',
  mail: '/api/v1',
} as const;
