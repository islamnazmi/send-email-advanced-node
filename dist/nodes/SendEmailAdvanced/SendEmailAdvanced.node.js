"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailAdvanced = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class SendEmailAdvanced {
    constructor() {
        this.description = {
            displayName: 'Send Email Advanced',
            name: 'sendEmailAdvanced',
            group: ['output'],
            version: 1,
            description: 'Send Email with Headers, Draft, and Reply',
            defaults: {
                name: 'Send Email Advanced',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Action',
                    name: 'action',
                    type: 'options',
                    options: [
                        { name: 'Send', value: 'send' },
                        { name: 'Draft', value: 'draft' },
                        { name: 'Reply', value: 'reply' },
                    ],
                    default: 'send',
                    description: 'Choose the action type',
                },
                {
                    displayName: 'To Email',
                    name: 'toEmail',
                    type: 'string',
                    default: '',
                    description: 'Recipient email address',
                },
                {
                    displayName: 'Subject',
                    name: 'subject',
                    type: 'string',
                    default: '',
                    description: 'Email subject',
                },
                {
                    displayName: 'Email Text',
                    name: 'emailText',
                    type: 'string',
                    typeOptions: { rows: 5 },
                    default: '',
                    description: 'Plain text content of the email',
                },
                {
                    displayName: 'Email HTML',
                    name: 'emailHtml',
                    type: 'string',
                    typeOptions: { rows: 5 },
                    default: '',
                    description: 'HTML content of the email',
                },
                {
                    displayName: 'SMTP Host',
                    name: 'smtpHost',
                    type: 'string',
                    default: '',
                    description: 'SMTP server host',
                },
                {
                    displayName: 'SMTP Port',
                    name: 'smtpPort',
                    type: 'number',
                    default: 587,
                    description: 'SMTP server port',
                },
                {
                    displayName: 'User',
                    name: 'user',
                    type: 'string',
                    default: '',
                    description: 'SMTP username',
                },
                {
                    displayName: 'Password',
                    name: 'password',
                    type: 'string',
                    typeOptions: { password: true },
                    default: '',
                    description: 'SMTP password',
                },
                {
                    displayName: 'Thread ID',
                    name: 'threadId',
                    type: 'string',
                    default: '',
                    displayOptions: {
                        show: {
                            action: ['reply'],
                        },
                    },
                    description: 'Message-ID to use for In-Reply-To and References headers',
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            const action = this.getNodeParameter('action', i);
            const toEmail = this.getNodeParameter('toEmail', i);
            const subject = this.getNodeParameter('subject', i);
            const emailText = this.getNodeParameter('emailText', i);
            const emailHtml = this.getNodeParameter('emailHtml', i);
            const smtpHost = this.getNodeParameter('smtpHost', i);
            const smtpPort = this.getNodeParameter('smtpPort', i);
            const user = this.getNodeParameter('user', i);
            const password = this.getNodeParameter('password', i);
            const threadId = this.getNodeParameter('threadId', i, '');
            const transporter = nodemailer_1.default.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user,
                    pass: password,
                },
            });
            const mailOptions = {
                from: user,
                to: toEmail,
                subject: action === 'reply' ? `Re: ${subject}` : subject,
                text: emailText,
                html: emailHtml || undefined,
            };
            if (action === 'reply' && threadId) {
                mailOptions.headers = {
                    'In-Reply-To': threadId,
                    'References': threadId,
                };
            }
            if (action !== 'draft') {
                await transporter.sendMail(mailOptions);
            }
            returnData.push({
                json: {
                    success: true,
                    action,
                    toEmail,
                    subject: mailOptions.subject,
                    sent: action !== 'draft',
                },
            });
        }
        return [returnData];
    }
}
exports.SendEmailAdvanced = SendEmailAdvanced;
