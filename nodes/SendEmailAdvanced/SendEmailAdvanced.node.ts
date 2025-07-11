import { INodeExecutionData, INodeType, INodeTypeDescription, IExecuteFunctions } from 'n8n-workflow';
import nodemailer from 'nodemailer';

export class SendEmailAdvanced implements INodeType {
	description: INodeTypeDescription = {
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const action = this.getNodeParameter('action', i) as string;
			const toEmail = this.getNodeParameter('toEmail', i) as string;
			const subject = this.getNodeParameter('subject', i) as string;
			const emailText = this.getNodeParameter('emailText', i) as string;
			const emailHtml = this.getNodeParameter('emailHtml', i) as string;
			const smtpHost = this.getNodeParameter('smtpHost', i) as string;
			const smtpPort = this.getNodeParameter('smtpPort', i) as number;
			const user = this.getNodeParameter('user', i) as string;
			const password = this.getNodeParameter('password', i) as string;
			const threadId = this.getNodeParameter('threadId', i, '') as string;

			const transporter = nodemailer.createTransport({
				host: smtpHost,
				port: smtpPort,
				secure: smtpPort === 465,
				auth: {
					user,
					pass: password,
				},
			});

			const mailOptions: any = {
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
