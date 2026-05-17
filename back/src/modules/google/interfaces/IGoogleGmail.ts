type GoogleGmailMessageAddress = {
    name?: string;
    email: string;
}

type GoogleGmailAttachment = {
    id?: string;
    filename: string;
    mimeType: string;
    size: number;
}

type GoogleGmailMessageSummary = {
    id: string;
    threadId: string;
    labelIds: string[];
    snippet: string;
    historyId?: string;
    internalDate?: string;
    subject: string;
    from?: GoogleGmailMessageAddress;
    to: GoogleGmailMessageAddress[];
    date?: string;
    unread: boolean;
    starred: boolean;
    hasAttachments: boolean;
}

type GoogleGmailMessage = GoogleGmailMessageSummary & {
    cc: GoogleGmailMessageAddress[];
    bcc: GoogleGmailMessageAddress[];
    bodyText: string;
    bodyHtml: string;
    attachments: GoogleGmailAttachment[];
}

type GoogleGmailListOptions = {
    userId: string;
    connectionId?: string;
    limit?: number;
    pageToken?: string;
    search?: string;
    labelIds?: string[];
    from?: string;
    to?: string;
    subject?: string;
    after?: string;
    before?: string;
    unread?: boolean;
    hasAttachment?: boolean;
}

type GoogleGmailGetOptions = {
    userId: string;
    connectionId?: string;
    messageId: string;
}

type GoogleGmailSendOptions = {
    userId: string;
    connectionId?: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    bodyText?: string;
    bodyHtml?: string;
    replyTo?: string;
    threadId?: string;
}

type GoogleGmailSendResult = {
    id: string;
    threadId: string;
    labelIds?: string[];
}

type GoogleGmailModifyLabelsOptions = {
    userId: string;
    connectionId?: string;
    messageId: string;
    addLabelIds?: string[];
    removeLabelIds?: string[];
}

type GoogleGmailModifyLabelsResult = {
    id: string;
    threadId: string;
    labelIds: string[];
}

type GoogleGmailListResult = {
    items: GoogleGmailMessageSummary[];
    nextPageToken?: string;
    resultSizeEstimate: number;
}

export type {
    GoogleGmailAttachment,
    GoogleGmailGetOptions,
    GoogleGmailListOptions,
    GoogleGmailListResult,
    GoogleGmailMessage,
    GoogleGmailMessageAddress,
    GoogleGmailMessageSummary,
    GoogleGmailModifyLabelsOptions,
    GoogleGmailModifyLabelsResult,
    GoogleGmailSendOptions,
    GoogleGmailSendResult,
}
