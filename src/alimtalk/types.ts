export type AlimtalkButtonType = 'DS' | 'WL' | 'AL' | 'BK' | 'MD' | 'AC';

export interface AlimtalkButton {
  type: AlimtalkButtonType;
  name: string;
  linkMobile?: string;
  linkPc?: string;
  schemeIos?: string;
  schemeAndroid?: string;
}

export interface SendAlimtalkRequest {
  plusFriendId: string;
  templateCode: string;
  messages: AlimtalkMessage[];
  reserveTime?: string;
  reserveTimeZone?: string;
}

export interface AlimtalkMessage {
  countryCode?: string;
  to: string;
  title?: string;
  content: string;
  headerContent?: string;
  itemHighlight?: {
    title: string;
    description: string;
  };
  item?: {
    list: { title: string; description: string }[];
    summary?: { title: string; description: string };
  };
  buttons?: AlimtalkButton[];
  useSmsFailover?: boolean;
  failoverConfig?: {
    type?: 'SMS' | 'LMS';
    from?: string;
    subject?: string;
    content?: string;
  };
}

export interface SendAlimtalkResponse {
  requestId: string;
  requestTime: string;
  statusCode: string;
  statusName: string;
  messages: {
    messageId: string;
    countryCode?: string;
    to: string;
    content: string;
    requestStatusCode: string;
    requestStatusName: string;
    requestStatusDesc: string;
    useSmsFailover: boolean;
  }[];
}

export interface AlimtalkChannel {
  channelId: string;
  channelName: string;
  categoryCode: string;
  createTime: string;
  updateTime?: string;
}

export interface GetAlimtalkTemplatesParams {
  channelId: string;
  templateCode?: string;
}

export interface AlimtalkTemplate {
  templateCode: string;
  templateName: string;
  templateContent: string;
  templateTitle?: string;
  templateSubtitle?: string;
  templateExtra?: string;
  templateAd?: string;
  templateMessageType: string;
  templateEmphasizeType?: string;
  templateImageName?: string;
  templateImageUrl?: string;
  buttons?: AlimtalkButton[];
  comments?: { id: string; content: string; userName: string; createdAt: string }[];
  status: string;
  statusName: string;
  createTime: string;
  updateTime?: string;
}

export interface GetAlimtalkRequestParams {
  requestId: string;
}

export interface GetAlimtalkMessagesResponse {
  statusCode: string;
  statusName: string;
  messages: AlimtalkMessageResult[];
}

export interface AlimtalkMessageResult {
  requestId: string;
  messageId: string;
  serviceId: string;
  plusFriendId: string;
  templateCode: string;
  countryCode: string;
  to: string;
  content: string;
  requestTime: string;
  status: string;
  statusCode: string;
  statusName: string;
  statusMessage: string;
  completeTime?: string;
  useSmsFailover: boolean;
}

export type GetAlimtalkMessageResponse = AlimtalkMessageResult;

export interface AlimtalkReserveStatus {
  reserveId: string;
  reserveTime: string;
  reserveTimeZone: string;
  reserveStatus: string;
}
